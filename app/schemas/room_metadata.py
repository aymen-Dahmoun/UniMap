from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class RoomMetadataBase(BaseModel):
    type: Optional[str] = None
    capacity: Optional[int] = None
    is_accessible: Optional[bool] = True
    opening_hours: Optional[Dict[str, Any]] = None
    description: Optional[str] = None
    department: Optional[str] = None
    amenities: Optional[List[str]] = None
    floor_plan_area: Optional[float] = None
    wifi_strength: Optional[int] = None
    tags: Optional[List[str]] = None
    sensor_ids: Optional[List[str]] = None
    image_url: Optional[str] = None
    qr_code: Optional[str] = None
    security_level: Optional[int] = 0
    emergency_exit_nearby: Optional[bool] = False


class RoomMetadataCreate(RoomMetadataBase):
    pass


class RoomMetadataResponse(RoomMetadataBase):
    id: int
    room_id: int

    class Config:
        from_attributes = True
