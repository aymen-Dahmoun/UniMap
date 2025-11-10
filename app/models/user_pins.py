from sqlalchemy import Column, Integer, String
from core.database import Base
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry

class UserPin(Base):
    __tablename__ = "user_pins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    coords = Column(Geometry("POINT", srid=4326))    
    type = Column(String(50), nullable=False)
    message = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="pins")
