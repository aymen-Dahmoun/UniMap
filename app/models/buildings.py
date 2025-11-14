from sqlalchemy.orm import Mapped, mapped_column
# from app.models.rooms import Rooms
from app.core.database import Base
from geoalchemy2 import Geometry
from sqlalchemy.orm import relationship
from geoalchemy2.elements import WKBElement

class Buildings(Base):
    __tablename__ = "buildings"

    id : Mapped[int] = mapped_column(primary_key=True, index=True)
    name  : Mapped[str] = mapped_column(unique=True, nullable=True)
    geometry: Mapped[WKBElement] = mapped_column(Geometry("POLYGON", srid=4326))
    floor: Mapped[int] = mapped_column(default=1)

    rooms = relationship("Rooms", back_populates="building", cascade="all, delete-orphan")
