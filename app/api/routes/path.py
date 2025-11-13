from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.path import PathCreate, PathResponse
from app.models.paths import Paths
from app.services.to_geojson import path_to_geojson

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