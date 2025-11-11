from sqlalchemy.orm import Mapped, mapped_column
from app.models.rooms import Rooms
from core.database import Base
from geoalchemy2 import Geometry
from sqlalchemy.orm import relationship

class Buildings(Base):
    __tablename__ = "buildings"

    id : Mapped[int] = mapped_column(primary_key=True, index=True)
    name  : Mapped[str] = mapped_column(unique=True, nullable=True)
    geometry: Mapped[str] = mapped_column(Geometry("POLYGON", srid=4326))

    rooms: Mapped[list["Rooms"]] = relationship("Rooms", back_populates="building", cascade="all, delete-orphan")
