from sqlalchemy import Column, Integer, String
from app.core.database import Base

class Room_metadata(Base):
    __tablename__ = "room_metadatas"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)