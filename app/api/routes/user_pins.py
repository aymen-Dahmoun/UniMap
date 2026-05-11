from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.user_pins import UserPinCreate, UserPinUpdate, UserPinResponse
from app.crud import user_pins as crud


router = APIRouter(prefix="/user-pins", tags=["User Pins"])


@router.get("/", response_model=List[UserPinResponse])
def list_user_pins(db: Session = Depends(get_db)):
    return crud.get_user_pins(db)


@router.get("/{id}", response_model=UserPinResponse)
def get_user_pin(id: int, db: Session = Depends(get_db)):
    obj = crud.get_user_pin(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="User pin not found")
    return obj


@router.post("/", response_model=UserPinResponse)
def create_user_pin(data: UserPinCreate, db: Session = Depends(get_db)):
    return crud.create_user_pin(db, data)


@router.put("/{id}", response_model=UserPinResponse)
def update_user_pin(id: int, data: UserPinUpdate, db: Session = Depends(get_db)):
    obj = crud.update_user_pin(db, id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="User pin not found")
    return obj


@router.delete("/{id}", response_model=UserPinResponse)
def delete_user_pin(id: int, db: Session = Depends(get_db)):
    obj = crud.delete_user_pin(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="User pin not found")
    return obj
