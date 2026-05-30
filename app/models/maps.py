from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Maps(Base):
    __tablename__ = "maps"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(unique=True, nullable=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True
    )

    user = relationship("User", back_populates="maps")
    buildings = relationship(
        "Buildings",
        back_populates="map",
        cascade="all, delete-orphan"
    )
