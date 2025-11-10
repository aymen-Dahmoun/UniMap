from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserResponse
from app.crud.user import create_user, get_users
from app.core.database import get_db


router = APIRouter()


@router.post("/", response_model=UserResponse)
def create(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)

@router.get("/")
def list_users(db: Session = Depends(get_db)):
    return get_users(db)
