from sqlalchemy import Column, Integer, String, Float
from core.database import Base
from geoalchemy2 import Geometry

class Paths(Base):
    __tablename__ = "paths"

    id = Column(Integer, primary_key=True, index=True)
    start_room_id = Column(String, nullable=False)
    end_room_id = Column(String, nullable=False)
    distance = Column(Float)
    geometry = Column(Geometry('LINESTRING', srid=4326))
    
