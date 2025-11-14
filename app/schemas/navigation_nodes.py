from pydantic import BaseModel
from typing import Any


class NavigationNodeBase(BaseModel):
    floor: int
    node_type: str = "normal"
    is_accessible: bool = True


class NavigationNodeCreate(NavigationNodeBase):
    geometry: Any


class NavigationNodeResponse(NavigationNodeBase):
    id: int
    geometry: Any
    floor: int

    class Config:
        orm_mode = True
        from_attributes = True
