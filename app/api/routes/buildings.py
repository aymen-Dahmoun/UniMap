from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Union
from app.core.database import get_db
from app.schemas.buildings import BuildingsCreate, BuildingsResponse
from app.models.buildings import Buildings
from app.services.to_geojson import building_to_geojson
from app.crud.buildings import create_buildings, get_buildings, get_building_by_id

router = APIRouter(prefix="/buildings", tags=["Buildings"])

@router.get("/", response_model=List[BuildingsResponse])
def list_buildingss(db: Session = Depends(get_db)):
    return get_buildings(db)

@router.get("/{id}", response_model=BuildingsResponse)
def get_building(id: int, db: Session = Depends(get_db)):
    obj = get_building_by_id(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Building not found")
    return obj


@router.post("/", response_model=BuildingsResponse)
def create_list_buildings(data: Union[BuildingsCreate, List[BuildingsCreate]], db: Session = Depends(get_db)):
    return create_buildings(data, db)