from sqlalchemy import ForeignKey, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from geoalchemy2.elements import WKBElement

from app.core.database import Base


class Nodes(Base):
	__tablename__ = "nodes"

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	name: Mapped[str] = mapped_column(String, nullable=False)
	node_kind: Mapped[str] = mapped_column(String(50), default="node", index=True)
	node_type: Mapped[str] = mapped_column(String(50), default="normal")
	is_accessible: Mapped[bool] = mapped_column(Boolean, default=True)
	floor: Mapped[int] = mapped_column(default=1)
	node_geometry: Mapped[WKBElement] = mapped_column(
		"geometry",
		Geometry("POINT", srid=4326)
	)
	building_id: Mapped[int | None] = mapped_column(
		ForeignKey("buildings.id", ondelete="CASCADE"),
		index=True,
		nullable=True
	)

	building = relationship(
		"Buildings",
		back_populates="nodes",
		overlaps="rooms,landmarks"
	)

	start_paths = relationship(
		"Paths",
		foreign_keys="Paths.start_node_id",
		back_populates="start_node",
		cascade="all, delete-orphan"
	)
	end_paths = relationship(
		"Paths",
		foreign_keys="Paths.end_node_id",
		back_populates="end_node",
		cascade="all, delete-orphan"
	)

	__mapper_args__ = {
		"polymorphic_on": "node_kind",
		"polymorphic_identity": "node",
	}
