from pydantic import BaseModel
from typing import Any, Literal

NodeType = Literal[
    "normal",
    "stairs",
    "elevator",
    "entrance",
    "exit",
    "emergency_exit",
    "restroom",
    "accessible",
    "public_chair",
    "info",
    "desk",
    "tree",
    "bench",
]


class NavigationNodeBase(BaseModel):
    name: str
    floor: int
    node_type: NodeType = "normal"
    is_accessible: bool = True


class NavigationNodeCreate(NavigationNodeBase):
    geometry: Any
    name: str
    floor: int
    node_type: str = "normal"


class NavigationNodeResponse(NavigationNodeBase):
    id: int
    geometry: Any
    floor: int

    class Config:
        orm_mode = True
        from_attributes = True
