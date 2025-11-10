from sqlalchemy.orm import Session
from app.models.rooms import Rooms
from app.schemas.rooms import RoomsCreate, RoomsUpdate

def create_room(db: Session, data: RoomsCreate):
    db_obj = Rooms(
        name=data.name,
        building_id=data.building_id,
        geometry=f"SRID=4326;{data.geometry}"
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_rooms(db: Session):
    return db.query(Rooms).all()


def get_room(db: Session, id: int):
    return db.query(Rooms).filter(Rooms.id == id).first()


def update_room(db: Session, id: int, data: RoomsUpdate):
    obj = db.query(Rooms).filter(Rooms.id == id).first()
    if not obj:
        return None

    if data.name is not None:
        obj.name = data.name
    if data.building_id is not None:
        obj.building_id = data.building_id
    if data.geometry is not None:
        obj.geometry = f"SRID=4326;{data.geometry}"

    db.commit()
    db.refresh(obj)
    return obj


def delete_room(db: Session, id: int):
    obj = db.query(Rooms).filter(Rooms.id == id).first()
    if not obj:
        return None

    db.delete(obj)
    db.commit()
    return obj
