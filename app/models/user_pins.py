from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, ForeignKey
from geoalchemy2 import Geometry
from core.database import Base
from app.models.user import User

class UserPin(Base):
    __tablename__ = "user_pins"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    coords: Mapped[str] = mapped_column(Geometry("POINT", srid=4326))
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="pins")
