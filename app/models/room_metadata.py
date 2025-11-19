from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Boolean, Float, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from app.core.database import Base


class RoomMetadata(Base):
    __tablename__ = "room_metadatas"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    type: Mapped[Optional[str]] = mapped_column(String)  
    capacity: Mapped[Optional[int]] = mapped_column(Integer)
    is_accessible: Mapped[bool] = mapped_column(Boolean, default=True)
    opening_hours: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB)
    description: Mapped[Optional[str]] = mapped_column(String)
    department: Mapped[Optional[str]] = mapped_column(String)
    amenities: Mapped[Optional[List[str]]] = mapped_column(JSONB)  
    floor_plan_area: Mapped[Optional[float]] = mapped_column(Float)
    wifi_strength: Mapped[Optional[int]] = mapped_column(Integer)
    tags: Mapped[Optional[List[str]]] = mapped_column(JSONB)
    sensor_ids: Mapped[Optional[List[str]]] = mapped_column(JSONB)
    image_url: Mapped[Optional[str]] = mapped_column(String)
    qr_code: Mapped[Optional[str]] = mapped_column(String)
    security_level: Mapped[int] = mapped_column(Integer, default=0)
    emergency_exit_nearby: Mapped[bool] = mapped_column(Boolean, default=False)

    room: Mapped["Rooms"] = relationship(back_populates="room_metadata")
    room_id: Mapped[int] = mapped_column(
        ForeignKey("rooms.id", ondelete="CASCADE"),
        unique=True
    )
