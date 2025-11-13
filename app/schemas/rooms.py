from pydantic import BaseModel
from typing import Optional

class RoomsBase(BaseModel):
    name: str
    building_id: int
    geometry: str

class RoomsCreate(RoomsBase):
    pass

class RoomsUpdate(BaseModel):
    name: Optional[str] = None
    building_id: Optional[int] = None
    geometry: Optional[str] = None

class RoomsResponse(RoomsBase):
    id: int

    class Config:
        from_attributes = True
