from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.points import Points
from geoalchemy2.shape import to_shape
from app.core.database import get_db
from app.models.buildings import Buildings
from app.models.navigation_nodes import NavigationNode
from app.models.paths import Paths
from app.schemas.map import MapCreate
from app.crud.rooms import create_room_flush
from app.crud.buildings import create_building_flush
from app.crud.points import create_point
from app.crud.paths import create_path
from app.crud.nodes import create_node
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/map", tags=["map"])

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

    nodes = db.query(NavigationNode).all()
    nodes_data = [
        {
            "id": n.id,
            "name": n.name,
            "floor": n.floor,
            "node_type": n.node_type,
            "geometry": to_shape(n.geometry).wkt
        }
        for n in nodes
    ]

    paths = db.query(Paths).all()
    paths_data = []
    for p in paths:
        start_point = db.query(Points).filter(Points.id == p.start_point_id).first()
        end_point = db.query(Points).filter(Points.id == p.end_point_id).first()

        if start_point and end_point:
            paths_data.append({
                "id": p.id,
                "start_type": "room" if start_point.type == "room" else "node",
                "start_ref": start_point.ref_id,
                "end_type": "room" if end_point.type == "room" else "node",
                "end_ref": end_point.ref_id,
                "distance": p.distance,
                "geometry": to_shape(p.geometry).wkt
            })

    return {
        "buildings": buildings_data,
        "nodes": nodes_data,
        "paths": paths_data
    }

@router.post("/maps")
def create_map(payload: MapCreate, db: Session = Depends(get_db)):

    room_name_to_point = {}
    node_name_to_point = {}

    for b in payload.buildings:
        building = create_building_flush(db, b)

        for r in b.rooms:
            room = create_room_flush(db, r, building.id)
            point = create_point(db, room.id, "room", room.floor)
            room_name_to_point[r.name] = point.id

    for n in payload.nodes:
        node = create_node(db, n)
        point = create_point(db, node.id, "node", node.floor)
        node_name_to_point[n.name] = point.id

    for p in payload.paths:

        start_point = (
            room_name_to_point[p.start_ref]
            if p.start_type == "room"
            else node_name_to_point[p.start_ref]
        )

        end_point = (
            room_name_to_point[p.end_ref]
            if p.end_type == "room"
            else node_name_to_point[p.end_ref]
        )

        create_path(db, start_point, end_point, p)

    db.commit()

    return {"status": "OK", "message": "Map created successfully"}
