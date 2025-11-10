from sqlalchemy import Column, Integer, String, ForeignKey
from core.database import Base
from geoalchemy2 import Geometry
from sqlalchemy.orm import relationship

class Rooms(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    geometry = Column(Geometry("POINT", srid=4326))
    building_id = Column(Integer, ForeignKey("buildingss.id", ondelete="CASCADE"))

    building = relationship("Buildings", back_populates="rooms")
