from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Union
from app.core.database import get_db
from app.schemas.buildings import BuildingsCreate, BuildingsResponse
from app.models.buildings import Buildings
from app.services.to_geojson import building_to_geojson

router = APIRouter(prefix="/buildings", tags=["Buildings"])

@router.get("/", response_model=List[BuildingsResponse])
def list_buildingss(db: Session = Depends(get_db)):
    buildings = db.query(Buildings).all()
    return [building_to_geojson(b) for b in buildings]


@router.post("/", response_model=BuildingsResponse)
def create_buildings(data: Union[BuildingsCreate, List[BuildingsCreate]], db: Session = Depends(get_db)):

    building_data = data if isinstance(data, list) else [data]
    result = []
    for b in building_data:
        obj = Buildings(**b.model_dump())
        db.add(obj)
        db.commit()
        db.refresh(obj)
        result.append(building_to_geojson(obj))
    return result