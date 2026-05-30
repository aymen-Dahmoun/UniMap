from pydantic import BaseModel
from typing import List, Optional, Any

class PathBase(BaseModel):
    start_point_id: int
    end_point_id: int
    distance: float
    geometry: Any
    floor: int

class PathCreate(BaseModel):
    start_point_id: int
    end_point_id: int
    distance: float
    geometry: str
    floor: int

class PathResponse(PathBase):
    id: int
    start_point_id: int
    end_point_id: int
    distance: float
    geometry: Any
    floor: int

class NavigationResponse(BaseModel):
    success: bool
    total_distance: float
    path_points: Optional[List[Any]] = None
    path_segments: Optional[List[Any]] = None
    path_room_ids: Optional[List[int]] = None
    
    class Config:
        from_attributes = True