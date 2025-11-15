from sqlalchemy.orm import Session
from app.models.buildings import Buildings
from app.schemas.buildings import BuildingsCreate, BuildingsUpdate, BuildingsBase
from geoalchemy2.shape import from_shape
from app.schemas.map import BuildingSchema
from shapely import wkt

def create_building(db: Session, data: BuildingsCreate):
    db_obj = Buildings(name=data.name, geometry=f"SRID=4326;{data.geometry}")
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def create_building_flush(db: Session, b: BuildingSchema):
    building = Buildings(
        name=b.name,
        floor=b.floor,
        geometry=from_shape(wkt.loads(b.geometry), srid=4326)
    )
    db.add(building)
    db.flush()
    return building

def get_buildings(db: Session):
    return db.query(Buildings).all()


def get_building(db: Session, id: int):
    return db.query(Buildings).filter(Buildings.id == id).first()


def update_building(db: Session, id: int, data: BuildingsUpdate):
    obj = db.query(Buildings).filter(Buildings.id == id).first()
    if not obj:
        return None

    if data.name is not None:
        obj.name = data.name
    if data.geometry is not None:
        obj.geometry = f"SRID=4326;{data.geometry}"

    db.commit()
    db.refresh(obj)
    return obj


def delete_building(db: Session, id: int):
    obj = db.query(Buildings).filter(Buildings.id == id).first()
    if not obj:
        return None

    db.delete(obj)
    db.commit()
    return obj
