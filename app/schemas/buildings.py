from pydantic import BaseModel
from typing import Optional

class BuildingsBase(BaseModel):
    name: str

class BuildingsCreate(BuildingsBase):
    geometry: str

class BuildingsUpdate(BaseModel):
    name: Optional[str] = None
    geometry: Optional[str] = None

class BuildingsResponse(BuildingsBase):
    id: int
    geometry: str

    class Config:
        orm_mode = True
