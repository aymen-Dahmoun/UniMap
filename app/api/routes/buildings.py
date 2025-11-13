from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.buildings import BuildingsCreate, BuildingsResponse
from app.models.buildings import Buildings
from app.services.to_geojson import to_geojson

router = APIRouter(prefix="/buildings", tags=["Buildings"])

@router.get("/")
def list_buildingss(db: Session = Depends(get_db)):
    buildings = db.query(Buildings).all()
    return [to_geojson(b) for b in buildings]

@router.post("/", response_model=BuildingsResponse)
def create_buildings(data: BuildingsCreate, db: Session = Depends(get_db)):
    obj = Buildings(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return to_geojson(obj)