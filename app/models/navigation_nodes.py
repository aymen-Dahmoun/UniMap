from app.core.database import Base
from sqlalchemy.orm import Mapped, mapped_column
from geoalchemy2 import  Geometry

class NavigationNode(Base):
    __tablename__ = "navigation_nodes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    geometry = mapped_column(Geometry("POINT", srid=4326))
    floor: Mapped[int] = mapped_column(nullable=False)
    node_type: Mapped[str] = mapped_column(default="normal")
    is_accessible: Mapped[bool] = mapped_column(default=True)