from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.rooms import RoomsCreate, RoomsResponse
from app.models.rooms import Rooms
from app.services.to_geojson import room_to_geojson

router = APIRouter(prefix="/rooms", tags=["Rooms"])

@router.get("/", response_model=List[RoomsResponse])
def list_roomss(db: Session = Depends(get_db)):
    rooms = db.query(Rooms).all()
    return [room_to_geojson(r) for r in rooms]

@router.post("/", response_model=RoomsResponse)
def create_rooms(data: RoomsCreate, db: Session = Depends(get_db)):
    obj = Rooms(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return room_to_geojson(obj)