from pydantic import BaseModel
from typing import List, Optional, Any

class PathBase(BaseModel):
    start_room_id: int
    end_room_id: int
    distance: float
    geometry: str

class PathCreate(PathBase):
    pass

class PathResponse(PathBase):
    id: int
    start_room_id: int
    end_room_id: int
    distance: float
    geometry: Any

class NavigationResponse:
    sucess: bool
    total_distance: float
    path_rooms: Optional[List[PathBase]] = None
    path_room_ids: Optional[List[int]] = None
    
    class Config:
        from_attributes = True