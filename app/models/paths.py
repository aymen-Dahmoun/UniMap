from sqlalchemy import ForeignKey, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from app.core.database import Base
from app.models.rooms import Rooms
from geoalchemy2.elements import WKBElement

class Paths(Base):
    __tablename__ = "paths"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    start_room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"))
    end_room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"))
    distance: Mapped[float] = mapped_column(Float)
    geometry: Mapped[WKBElement] = mapped_column(Geometry('LINESTRING', srid=4326))
    
    start_room: Mapped["Rooms"] = relationship("Rooms", foreign_keys=[start_room_id])
    end_room: Mapped["Rooms"] = relationship("Rooms", foreign_keys=[end_room_id])