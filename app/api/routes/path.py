from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.path_schema import PathCreate, PathResponse
from app.models.path import Path

router = APIRouter(prefix="/path", tags=["Path"])

@router.get("/", response_model=list[PathResponse])
def list_paths(db: Session = Depends(get_db)):
    return db.query(Path).all()

@router.post("/", response_model=PathResponse)
def create_path(data: PathCreate, db: Session = Depends(get_db)):
    obj = Path(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj