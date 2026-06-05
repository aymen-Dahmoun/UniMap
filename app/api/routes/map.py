from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.nodes import Nodes
from geoalchemy2.shape import to_shape
from shapely import wkt
from app.core.database import get_db
from app.models.buildings import Buildings
from app.models.maps import Maps
from app.models.paths import Paths
from app.models.user import User
from app.schemas.map import MapCreate
from app.crud.rooms import create_room_flush
from app.crud.buildings import create_building_flush
from app.crud.paths import create_path
from app.crud.nodes import create_node
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/maps", tags=["Map"])

@router.get("/")
def get_full_map(db: Session = Depends(get_db)):
    logger.info('map')

    buildings_data = []
    buildings = db.query(Buildings).all()

    for b in buildings:
        buildings_data.append({
            "id": b.id,
            "name": b.name,
            "floor": b.floor,
            "geometry": to_shape(b.geometry).__geo_interface__,
            "rooms": [
                {
                    "id": r.id,
                    "name": r.name,
                    "floor": r.floor,
                    "geometry": to_shape(r.geometry).__geo_interface__
                }
                for r in b.rooms
            ]
        })

    nodes = db.query(Nodes).all()
    nodes_data = [
        {
            "id": n.id,
            "name": n.name,
            "floor": n.floor,
            "node_kind": n.node_kind,
            "node_type": n.node_type,
            "geometry": to_shape(n.node_geometry).__geo_interface__
        }
        for n in nodes
    ]

    paths = db.query(Paths).all()
    paths_data = []
    for p in paths:
        start_node = db.query(Nodes).filter(Nodes.id == p.start_node_id).first()
        end_node = db.query(Nodes).filter(Nodes.id == p.end_node_id).first()

        if start_node and end_node:
            paths_data.append({
                "id": p.id,
                "start_type": start_node.node_kind,
                "start_ref": start_node.id,
                "end_type": end_node.node_kind,
                "end_ref": end_node.id,
                "distance": p.distance,
                "geometry": to_shape(p.geometry).__geo_interface__,
                "floor": p.floor
            })

    return {
        "buildings": buildings_data,
        "nodes": nodes_data,
        "paths": paths_data
    }

@router.get("/{map_id}")
def get_specific_map(map_id: int, db: Session = Depends(get_db)):
    logger.info(f"Fetching map {map_id}")

    buildings_data = []
    buildings = db.query(Buildings).filter(Buildings.map_id == map_id).all()
    building_ids = [b.id for b in buildings]

    for b in buildings:
        buildings_data.append({
            "id": b.id,
            "name": b.name,
            "floor": b.floor,
            "geometry": to_shape(b.geometry).__geo_interface__,
            "rooms": [
                {
                    "id": r.id,
                    "name": r.name,
                    "floor": r.floor,
                    "geometry": to_shape(r.geometry).__geo_interface__
                }
                for r in b.rooms
            ]
        })

    from sqlalchemy import or_
    nodes = db.query(Nodes).filter(
        or_(
            Nodes.building_id.in_(building_ids) if building_ids else False,
            Nodes.map_id == map_id
        )
    ).all()
    nodes_data = [
        {
            "id": n.id,
            "name": n.name,
            "floor": n.floor,
            "node_kind": n.node_kind,
            "node_type": n.node_type,
            "geometry": to_shape(n.node_geometry).__geo_interface__
        }
        for n in nodes
    ]

    paths = db.query(Paths).filter(Paths.map_id == map_id).all()

    paths_data = []
    for p in paths:
        start_node = db.query(Nodes).filter(Nodes.id == p.start_node_id).first()
        end_node = db.query(Nodes).filter(Nodes.id == p.end_node_id).first()

        if start_node and end_node:
            paths_data.append({
                "id": p.id,
                "start_type": start_node.node_kind,
                "start_ref": start_node.id,
                "end_type": end_node.node_kind,
                "end_ref": end_node.id,
                "distance": p.distance,
                "geometry": to_shape(p.geometry).__geo_interface__,
                "floor": p.floor
            })

    return {
        "buildings": buildings_data,
        "nodes": nodes_data,
        "paths": paths_data
    }

@router.post("/")
def create_map(payload: MapCreate, db: Session = Depends(get_db)):

    room_name_to_node = {}
    node_name_to_node = {}
    building_geometries = []

    user = db.query(User).filter(User.email == payload.user_email).first()
    if not user:
        raise HTTPException(status_code=400, detail="User email does not exist")

    map_obj = Maps(name=payload.name, user_id=user.id)
    db.add(map_obj)
    db.flush()

    for b in payload.buildings:
        building = create_building_flush(db, b, map_obj.id)
        try:
            building_geometry = wkt.loads(b.geometry)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Invalid building geometry for '{b.name}': {exc}") from exc
        building_geometries.append({
            "id": building.id,
            "floor": building.floor,
            "geometry": building_geometry,
        })

        for r in b.rooms:
            room = create_room_flush(db, r, building.id, map_id=map_obj.id)
            room_name_to_node[r.name] = room.id

    for n in payload.nodes:
        try:
            node_point = wkt.loads(n.geometry)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Invalid node geometry for '{n.name}': {exc}") from exc

        building_id = None
        for b in building_geometries:
            if b["floor"] == n.floor and b["geometry"].covers(node_point):
                building_id = b["id"]
                break

        node = create_node(db, n, building_id=building_id, map_id=map_obj.id)
        node_name_to_node[n.name] = node.id

    for p in payload.paths:

        start_node = (
            room_name_to_node.get(p.start_ref)
            if p.start_type == "room"
            else node_name_to_node.get(p.start_ref)
        )

        end_node = (
            room_name_to_node.get(p.end_ref)
            if p.end_type == "room"
            else node_name_to_node.get(p.end_ref)
        )

        if start_node and end_node:
            create_path(db, start_node, end_node, p, map_id=map_obj.id)

    db.commit()

    return {"status": "OK", "message": "Map created successfully"}
