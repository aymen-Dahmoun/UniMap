from pydantic import BaseModel
from typing import List, Optional, Any
from app.schemas.points import PointsBase

class PathBase(BaseModel):
    start_point_id: Any
    end_point_id: Any
    distance: float
    geometry: str

class PathCreate(BaseModel):
    start_point_id: PointsBase
    end_point_id: PointsBase
    distance: float
    floor: Optional[int]

class PathResponse(PathBase):
    id: int
    start_point_id: Any
    end_point_id: Any
    distance: float
    geometry: Any

class NavigationResponse(BaseModel):
    success: bool
    total_distance: float
    path_points: Optional[List[Any]] = None
    path_room_ids: Optional[List[int]] = None
    
    class Config:
        from_attributes = True