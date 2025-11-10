from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from core.database import Base
from app.models.buildings import Buildings

class Rooms(Base):
    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(nullable=False, unique=True)
    geometry: Mapped[str] = mapped_column(Geometry("POINT", srid=4326))
    building_id: Mapped[int] = mapped_column(ForeignKey("buildings.id", ondelete="CASCADE"))

    building: Mapped["Buildings"] = relationship("Buildings", back_populates="rooms")
