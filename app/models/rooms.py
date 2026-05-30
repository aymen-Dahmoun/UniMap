from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from geoalchemy2.elements import WKBElement

from app.models.nodes import Nodes
from app.models.room_metadata import RoomMetadata

class Rooms(Nodes):
    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(
        ForeignKey("nodes.id", ondelete="CASCADE"),
        primary_key=True,
        index=True
    )
    geometry: Mapped[WKBElement] = mapped_column(Geometry("POLYGON", srid=4326))

    building = relationship(
        "Buildings",
        back_populates="rooms",
        overlaps="nodes,building"
    )

    room_metadata: Mapped["RoomMetadata"] = relationship(
        back_populates="room",
        uselist=False
    )

    __mapper_args__ = {
        "polymorphic_identity": "room",
    }


