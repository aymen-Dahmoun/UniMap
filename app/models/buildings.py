from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
# from app.models.rooms import Rooms
from app.core.database import Base
from geoalchemy2 import Geometry
from geoalchemy2.elements import WKBElement

class Buildings(Base):
    __tablename__ = "buildings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(unique=True, nullable=True)
    geometry: Mapped[WKBElement] = mapped_column(Geometry("POLYGON", srid=4326))
    floor: Mapped[int] = mapped_column(default=1)
    map_id: Mapped[int] = mapped_column(
        ForeignKey("maps.id", ondelete="CASCADE"),
        index=True
    )

    map = relationship("Maps", back_populates="buildings")

    rooms = relationship(
        "Rooms",
        back_populates="building",
        cascade="all, delete-orphan",
        overlaps="building,nodes"
    )
    landmarks = relationship(
        "Landmarks",
        back_populates="building",
        cascade="all, delete-orphan",
        overlaps="building,nodes"
    )
    nodes = relationship(
        "Nodes",
        back_populates="building",
        cascade="all, delete-orphan",
        overlaps="building,rooms,landmarks"
    )
    paths = relationship("Paths", back_populates="building", cascade="all, delete-orphan")
