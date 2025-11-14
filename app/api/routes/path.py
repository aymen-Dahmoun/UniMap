from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.path import PathCreate, PathResponse
from app.schemas.path import NavigationResponse
from app.models.paths import Paths
from app.services.to_geojson import path_to_geojson
from app.services.pathFinder import path_finder

router = APIRouter(prefix="/path", tags=["Path"])


@router.get("/", response_model=list[PathResponse])
def list_paths(db: Session = Depends(get_db)):
    return db.query(Paths).all()


@router.post("/", response_model=PathResponse)
def create_path(data: PathCreate, db: Session = Depends(get_db)):
    obj = Paths(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return path_to_geojson(obj)


@router.get("/shortest", response_model=NavigationResponse)
def get_shortest_path(
    start_room_id: int,
    end_room_id: int,
    db: Session = Depends(get_db)
):
    # rebuild the graph from database
    path_finder.build_graph_from_db(db)

    # get the path
    result = path_finder.find_shortest_path(start_room_id, end_room_id)

    return NavigationResponse(**result)
