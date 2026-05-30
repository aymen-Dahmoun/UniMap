from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.nodes import Nodes


class Landmarks(Nodes):
    __tablename__ = "landmarks"

    id: Mapped[int] = mapped_column(
        ForeignKey("nodes.id", ondelete="CASCADE"),
        primary_key=True,
        index=True
    )

    building = relationship(
        "Buildings",
        back_populates="landmarks",
        overlaps="nodes,building"
    )

    __mapper_args__ = {
        "polymorphic_identity": "landmark",
    }