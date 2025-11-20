from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Points(Base):
    __tablename__ = "points"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    type: Mapped[str] = mapped_column()
    ref_id: Mapped[int] = mapped_column()
    floor: Mapped[int] = mapped_column()
    
    room = relationship(
        "Rooms",
        primaryjoin="and_(foreign(Points.ref_id)==Rooms.id, Points.type=='room')",
        viewonly=True
    )
    
    node = relationship(
        "NavigationNode",
        primaryjoin="and_(foreign(Points.ref_id)==NavigationNode.id, Points.type=='node')",
        viewonly=True
    )
