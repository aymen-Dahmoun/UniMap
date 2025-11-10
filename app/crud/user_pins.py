from sqlalchemy.orm import Session
from app.models.user_pins import UserPin
from app.schemas.user_pins import UserPinCreate, UserPinUpdate


def create_user_pin(db: Session, data: UserPinCreate):
    db_obj = UserPin(
        user_id=data.user_id,
        type=data.type,
        message=data.message,
        coords=f"SRID=4326;{data.coords}",
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_user_pins(db: Session):
    return db.query(UserPin).all()


def get_user_pin(db: Session, id: int):
    return db.query(UserPin).filter(UserPin.id == id).first()


def update_user_pin(db: Session, id: int, data: UserPinUpdate):
    obj = db.query(UserPin).filter(UserPin.id == id).first()
    if not obj:
        return None

    if data.user_id is not None:
        obj.user_id = data.user_id
    if data.type is not None:
        obj.type = data.type
    if data.message is not None:
        obj.message = data.message
    if data.coords is not None:
        obj.coords = f"SRID=4326;{data.coords}"

    db.commit()
    db.refresh(obj)
    return obj


def delete_user_pin(db: Session, id: int):
    obj = db.query(UserPin).filter(UserPin.id == id).first()
    if not obj:
        return None

    db.delete(obj)
    db.commit()
    return obj
