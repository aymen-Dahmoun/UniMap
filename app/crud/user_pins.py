from sqlalchemy.orm import Session
from app.models.user_pins import 
from app.schemas.user_pins import Create
from passlib.hash import bcrypt


def create_user_pins(db: Session, data: Create):
    hashed_password = None
    if hasattr(data, "password"):
        hashed_password = bcrypt.hash(data.password)

    db_obj = (
        **data.dict(exclude={"password"}),
        hashed_password=hashed_password if hashed_password else None
    )

    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_user_pinss(db: Session):
    return db.query().all()


def get_user_pins(db: Session, id: int):
    return db.query().filter(.id == id).first()


def update_user_pins(db: Session, id: int, data):
    obj = db.query().filter(.id == id).first()
    if not obj:
        return None

    for key, value in data.dict(exclude_unset=True).items():
        setattr(obj, key, value)

    db.commit()
    db.refresh(obj)
    return obj


def delete_user_pins(db: Session, id: int):
    obj = db.query().filter(.id == id).first()
    if not obj:
        return None

    db.delete(obj)
    db.commit()
    return obj