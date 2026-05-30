from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.nodes import Nodes
from geoalchemy2.shape import to_shape
from app.core.database import get_db
from app.models.buildings import Buildings
from app.models.maps import Maps
from app.models.paths import Paths
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
            "geometry": to_shape(b.geometry).wkt,
            "rooms": [
                {
                    "id": r.id,
                    "name": r.name,
                    "floor": r.floor,
                    "geometry": to_shape(r.geometry).wkt
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
            "geometry": to_shape(n.node_geometry).wkt
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
                "geometry": to_shape(p.geometry).wkt,
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

    map_obj = Maps(name=payload.name, user_id=payload.user_id)
    db.add(map_obj)
    db.flush()

    for b in payload.buildings:
        building = create_building_flush(db, b, map_obj.id)

        for r in b.rooms:
            room = create_room_flush(db, r, building.id)
            room_name_to_node[r.name] = room.id

    for n in payload.nodes:
        node = create_node(db, n)
        node_name_to_node[n.name] = node.id

    for p in payload.paths:

        start_node = (
            room_name_to_node[p.start_ref]
            if p.start_type == "room"
            else node_name_to_node[p.start_ref]
        )

        end_node = (
            room_name_to_node[p.end_ref]
            if p.end_type == "room"
            else node_name_to_node[p.end_ref]
        )

        create_path(db, start_node, end_node, p)

    db.commit()

    return {"status": "OK", "message": "Map created successfully"}
