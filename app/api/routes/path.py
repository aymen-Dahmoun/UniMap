from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Union
from app.core.database import get_db
from app.schemas.path import PathCreate, PathResponse
from app.schemas.path import NavigationResponse
from app.models.paths import Paths
from app.services.to_geojson import path_to_geojson
from app.services.pathFinder import path_finder
from app.models.navigation_nodes import NavigationNode

router = APIRouter(prefix="/path", tags=["Path"])


@router.get("/", response_model=list[PathResponse])
def list_paths(db: Session = Depends(get_db)):
    return db.query(Paths).all()

@router.post("/", response_model=list[PathResponse])
def create_paths(
    data: Union[PathCreate, list[PathCreate]],
    db: Session = Depends(get_db)
):
    paths_data = data if isinstance(data, list) else [data]

    created = []

    for item in paths_data:
        obj = Paths(**item.model_dump())
        db.add(obj)
        created.append(obj)

    db.commit()

    for obj in created:
        db.refresh(obj)

    return [path_to_geojson(obj) for obj in created]

@router.get("/shortest", response_model=NavigationResponse)
def get_shortest_path(
    start_room_id: int,
    end_room_id: int,
    db: Session = Depends(get_db)
):
    path_finder.build_graph_from_db(db)

    # nodes = db.query(NavigationNode).all()
    # print("All Nodes:")
    # for n in nodes:
    #     print(f"Node ID: {n.id}, Floor: {n.floor}, Geometry: {n.geometry}")

    # paths = db.query(Paths).all()
    # print("\nAll Paths:")
    # for p in paths:
    #     print(f"Path ID: {p.id}, {p.start_point_id} -> {p.end_point_id}, Distance: {p.distance}")

    result = path_finder.find_shortest_path(start_room_id, end_room_id)

    # print("\nPathfinder Result:")
    # print(result)

    return NavigationResponse(**result)
