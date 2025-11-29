from pydantic import BaseModel
from typing import Optional, Any
from app.schemas.room_metadata import RoomMetadataResponse

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
    floor: int

class RoomsResponse(RoomsBase):
    id: int
    geometry: Any
    building_id: int
    floor: int
    room_metadata: Optional[RoomMetadataResponse] = None

    class Config:
        from_attributes = True
