from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Union
from app.core.database import get_db
from app.schemas.rooms import RoomsCreate, RoomsResponse
from app.models.rooms import Rooms
from app.models.points import Points
from app.services.to_geojson import room_to_geojson

router = APIRouter(prefix="/rooms", tags=["Rooms"])

@router.get("/", response_model=List[RoomsResponse])
def list_roomss(db: Session = Depends(get_db)):
    rooms = db.query(Rooms).all()
    return [room_to_geojson(r) for r in rooms]



@router.post("/", response_model=List[RoomsResponse])
def create_rooms(
    data: Union[RoomsCreate, List[RoomsCreate]],
    db: Session = Depends(get_db)
):
    rooms_data = data if isinstance(data, list) else [data]

    results = []

    for room in rooms_data:
        obj = Rooms(**room.model_dump())
        db.add(obj)
        db.commit()
        db.refresh(obj)
        results.append(room_to_geojson(obj))

        point = Points(
            type="room",
            ref_id=obj.id,
            floor=obj.floor
        )
        db.add(point)
        db.commit()
        db.refresh(point)

    return results
