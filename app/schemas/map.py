from pydantic import BaseModel
from typing import List


class RoomSchema(BaseModel):
    name: str
    floor: int
    geometry: str


class BuildingSchema(BaseModel):
    name: str
    floor: int
    geometry: str
    rooms: List[RoomSchema]


class NodeMap(BaseModel):
    name: str
    floor: int
    node_type: str
    geometry: str


class PathMap(BaseModel):
    start_type: str
    start_ref: str
    end_type: str
    end_ref: str
    distance: float
    geometry: str


class MapCreate(BaseModel):
    buildings: List[BuildingSchema]
    nodes: List[NodeMap]
    paths: List[PathMap]
