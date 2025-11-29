from typing import List, Union, Dict, Any
from sqlalchemy.orm import Session, joinedload
from app.models.rooms import Rooms
from app.models.room_metadata import RoomMetadata
from app.models.points import Points
from app.schemas.rooms import RoomsCreate
from app.services.to_geojson import room_to_geojson

def get_all_rooms(db: Session) -> List[Dict[str, Any]]:
    rooms = db.query(Rooms).options(joinedload(Rooms.metadata)).all()
    return [room_to_geojson(r) for r in rooms]

def create_rooms(db: Session, data: Union[RoomsCreate, List[RoomsCreate]]):
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

def get_room_metadata(db: Session, room_id: int):
    return db.query(RoomMetadata).filter(RoomMetadata.room_id == room_id).first()
