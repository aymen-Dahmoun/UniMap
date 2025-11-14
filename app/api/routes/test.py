# this file is made by chat gpt to be honest

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from geoalchemy2 import WKTElement
from app.core.database import get_db
from app.models.buildings import Buildings
from app.models.rooms import Rooms
from app.models.navigation_nodes import NavigationNode
from app.models.paths import Paths

router = APIRouter(prefix="/test", tags=["Testing"])

@router.post("/seed_two_buildings", response_model=dict)
def seed_two_buildings_map(db: Session = Depends(get_db)):
    """
    Seed two buildings with rooms, navigation nodes, and paths for pathfinding tests.
    """
    # --- Building 1 ---
    b1 = Buildings(
        name="Building A",
        geometry=WKTElement("POLYGON((0 0,0 100,100 100,100 0,0 0))", srid=4326),
        floor=1
    )
    db.add(b1)
    db.commit()
    db.refresh(b1)

    # Rooms in Building 1
    rooms_b1 = [
        {"name": "A_Room1", "building_id": b1.id, "floor": 1, "geometry": WKTElement("POINT(10 90)", srid=4326)},
        {"name": "A_Room2", "building_id": b1.id, "floor": 1, "geometry": WKTElement("POINT(50 90)", srid=4326)},
    ]
    room_objs_b1 = [Rooms(**r) for r in rooms_b1]
    db.add_all(room_objs_b1)
    db.commit()
    for r in room_objs_b1: db.refresh(r)

    # Navigation nodes Building 1
    nodes_b1 = [
        {"floor": 1, "geometry": WKTElement("POINT(10 90)", srid=4326)},  # 0
        {"floor": 1, "geometry": WKTElement("POINT(50 90)", srid=4326)},  # 1
    ]
    node_objs_b1 = [NavigationNode(**n) for n in nodes_b1]
    db.add_all(node_objs_b1)
    db.commit()
    for n in node_objs_b1: db.refresh(n)

    # Paths in Building 1
    paths_b1 = [
        {"start_point_id": node_objs_b1[0].id, "end_point_id": node_objs_b1[1].id, "distance": 40,
         "floor": 1, "geometry": WKTElement("LINESTRING(10 90,50 90)", srid=4326)}
    ]
    path_objs_b1 = [Paths(**p) for p in paths_b1]
    db.add_all(path_objs_b1)
    db.commit()
    for p in path_objs_b1: db.refresh(p)

    # --- Building 2 ---
    b2 = Buildings(
        name="Building B",
        geometry=WKTElement("POLYGON((200 0,200 100,300 100,300 0,200 0))", srid=4326),
        floor=1
    )
    db.add(b2)
    db.commit()
    db.refresh(b2)

    # Rooms in Building 2
    rooms_b2 = [
        {"name": "B_Room1", "building_id": b2.id, "floor": 1, "geometry": WKTElement("POINT(210 90)", srid=4326)},
        {"name": "B_Room2", "building_id": b2.id, "floor": 1, "geometry": WKTElement("POINT(250 90)", srid=4326)},
    ]
    room_objs_b2 = [Rooms(**r) for r in rooms_b2]
    db.add_all(room_objs_b2)
    db.commit()
    for r in room_objs_b2: db.refresh(r)

    # Navigation nodes Building 2
    nodes_b2 = [
        {"floor": 1, "geometry": WKTElement("POINT(210 90)", srid=4326)},  # 2
        {"floor": 1, "geometry": WKTElement("POINT(250 90)", srid=4326)},  # 3
    ]
    node_objs_b2 = [NavigationNode(**n) for n in nodes_b2]
    db.add_all(node_objs_b2)
    db.commit()
    for n in node_objs_b2: db.refresh(n)

    # Paths in Building 2
    paths_b2 = [
        {"start_point_id": node_objs_b2[0].id, "end_point_id": node_objs_b2[1].id, "distance": 40,
         "floor": 1, "geometry": WKTElement("LINESTRING(210 90,250 90)", srid=4326)}
    ]
    path_objs_b2 = [Paths(**p) for p in paths_b2]
    db.add_all(path_objs_b2)
    db.commit()
    for p in path_objs_b2: db.refresh(p)

    # --- Inter-building path ---
    inter_path = Paths(
        start_point_id=node_objs_b1[1].id,
        end_point_id=node_objs_b2[0].id,
        distance=150,
        floor=1,
        geometry=WKTElement(f"LINESTRING(50 90,210 90)", srid=4326)
    )
    db.add(inter_path)
    db.commit()
    db.refresh(inter_path)

    return {
        "buildings": [{"id": b1.id, "name": b1.name}, {"id": b2.id, "name": b2.name}],
        "rooms": [r.name for r in room_objs_b1 + room_objs_b2],
        "nodes": [n.id for n in node_objs_b1 + node_objs_b2],
        "paths": [p.id for p in path_objs_b1 + path_objs_b2] + [inter_path.id],
    }
