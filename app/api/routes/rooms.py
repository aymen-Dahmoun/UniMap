from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.rooms import RoomsCreate, RoomsResponse
from app.models.rooms import Rooms

router = APIRouter(prefix="/rooms", tags=["Rooms"])

@router.get("/", response_model=list[RoomsResponse])
def list_roomss(db: Session = Depends(get_db)):
    return db.query(Rooms).all()

@router.post("/", response_model=RoomsResponse)
def create_rooms(data: RoomsCreate, db: Session = Depends(get_db)):
    obj = Rooms(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj