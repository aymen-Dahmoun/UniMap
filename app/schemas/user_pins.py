from pydantic import BaseModel
from typing import Optional

class UserPinBase(BaseModel):
    user_id: int
    type: str
    message: Optional[str] = None
    coords: str

class UserPinCreate(UserPinBase):
    pass

class UserPinUpdate(BaseModel):
    user_id: Optional[int] = None
    type: Optional[str] = None
    message: Optional[str] = None
    coords: Optional[str] = None

class UserPinResponse(UserPinBase):
    id: int

    class Config:
        from_attributes = True
