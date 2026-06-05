from sqlalchemy import ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from app.core.database import Base
from geoalchemy2.elements import WKBElement

class Paths(Base):
    __tablename__ = "paths"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    start_node_id: Mapped[int] = mapped_column(ForeignKey("nodes.id", ondelete="CASCADE"))
    end_node_id: Mapped[int] = mapped_column(ForeignKey("nodes.id", ondelete="CASCADE"))
    distance: Mapped[float] = mapped_column(Float)
    geometry: Mapped[WKBElement] = mapped_column(Geometry("LINESTRING", srid=4326))
    floor: Mapped[int] = mapped_column(default=1)
    building_id: Mapped[int | None] = mapped_column(ForeignKey("buildings.id", ondelete="CASCADE"), nullable=True)
    map_id: Mapped[int | None] = mapped_column(ForeignKey("maps.id", ondelete="CASCADE"), index=True, nullable=True)
    building = relationship("Buildings", back_populates="paths")

    start_node = relationship(
        "Nodes",
        foreign_keys=[start_node_id],
        back_populates="start_paths"
    )
    end_node = relationship(
        "Nodes",
        foreign_keys=[end_node_id],
        back_populates="end_paths"
    )