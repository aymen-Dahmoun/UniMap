from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from typing import List, Union
from fastapi import HTTPException
from app.core.database import get_db
from app.schemas.rooms import RoomsCreate, RoomsResponse
from app.models.rooms import Rooms
from app.models.points import Points
from app.services.to_geojson import room_to_geojson
from app.models.room_metadata import RoomMetadata
from app.schemas.room_metadata import RoomMetadataResponse

router = APIRouter(prefix="/rooms", tags=["Rooms"])

@router.get("/", response_model=List[RoomsResponse])
def list_rooms(db: Session = Depends(get_db)):
    rooms = db.query(Rooms).options(joinedload(Rooms.metadata)).all()
    return [room_to_geojson(r) for r in rooms]


@router.post("/", response_model=List[RoomsResponse])
def create_rooms(
    data: Union[RoomsCreate, List[RoomsCreate]],
    db: Session = Depends(get_db),
):
    rooms_data = data if isinstance(data, list) else [data]
    results = []

    for room in rooms_data:
        room_data = room.model_dump(exclude={"metadata"})
        obj = Rooms(**room_data)
        db.add(obj)
        db.commit()
        db.refresh(obj)

        if room.room_metadata:
            metadata_obj = RoomMetadata(
                room_id=obj.id,
                **room.room_metadata.model_dump()
            )
            db.add(metadata_obj)
            db.commit()
            db.refresh(metadata_obj)

        point = Points(
            type="room",
            ref_id=obj.id,
            floor=obj.floor
        )
        db.add(point)
        db.commit()

        db.refresh(obj)
        results.append(room_to_geojson(obj))

    return results

@router.get("/{room_id}/metadata", response_model=RoomMetadataResponse)
def get_room_metadata(room_id: int, db: Session = Depends(get_db)):
    metadata = db.query(RoomMetadata).filter(RoomMetadata.room_id == room_id).first()
    if not metadata:
        raise HTTPException(status_code=404, detail="Metadata not found")

    return metadata
