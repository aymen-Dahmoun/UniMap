from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.buildings import BuildingsCreate, BuildingsResponse
from app.models.buildings import Buildings

router = APIRouter(prefix="/buildings", tags=["Buildings"])

@router.get("/", response_model=list[BuildingsResponse])
def list_buildingss(db: Session = Depends(get_db)):
    return db.query(Buildings).all()

@router.post("/", response_model=BuildingsResponse)
def create_buildings(data: BuildingsCreate, db: Session = Depends(get_db)):
    obj = Buildings(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj