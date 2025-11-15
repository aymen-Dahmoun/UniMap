from sqlalchemy import ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from app.core.database import Base
from geoalchemy2.elements import WKBElement

class Paths(Base):
    __tablename__ = "paths"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    start_point_id: Mapped[int] = mapped_column(ForeignKey("points.id"))
    end_point_id: Mapped[int] = mapped_column(ForeignKey("points.id"))
    distance: Mapped[float] = mapped_column(Float)
    geometry: Mapped[WKBElement] = mapped_column(Geometry("LINESTRING", srid=4326))
    floor: Mapped[int] = mapped_column(default=1)
    
    start_room: Mapped["Points"] = relationship("Points", foreign_keys=[start_point_id])
    end_room: Mapped["Points"] = relationship("Points", foreign_keys=[end_point_id])