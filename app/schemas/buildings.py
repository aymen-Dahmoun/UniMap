from pydantic import BaseModel
from typing import Optional, Any

class BuildingsBase(BaseModel):
    name: str
    geometry: str
    floor: int

class BuildingsCreate(BuildingsBase):
    name: str
    geometry: str
    floor: int

class BuildingsUpdate(BaseModel):
    name: Optional[str] = None
    geometry: Optional[str] = None

class BuildingsResponse(BuildingsBase):
    id: int
    geometry: Any
    floor: int

    class Config:
        from_attributes = True
