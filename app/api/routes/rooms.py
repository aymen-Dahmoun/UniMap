from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Union
from app.core.database import get_db
from app.schemas.rooms import RoomsCreate, RoomsResponse
from app.schemas.room_metadata import RoomMetadataResponse
from app.crud import rooms as crud_rooms

router = APIRouter(prefix="/rooms", tags=["Rooms"])

@router.get("/", response_model=List[RoomsResponse])
def list_rooms(db: Session = Depends(get_db)):
    return crud_rooms.get_all_rooms(db)

@router.post("/", response_model=List[RoomsResponse])
def create_rooms(data: Union[RoomsCreate, List[RoomsCreate]], db: Session = Depends(get_db)):
    return crud_rooms.create_rooms(db, data)

@router.get("/{room_id}/metadata", response_model=RoomMetadataResponse)
def get_room_metadata(room_id: int, db: Session = Depends(get_db)):
    metadata = crud_rooms.get_room_metadata(db, room_id)
    if not metadata:
        raise HTTPException(status_code=404, detail="Metadata not found")
    return metadata
