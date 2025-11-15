from pydantic import BaseModel

class PointsBase(BaseModel):
    type: str = 'room' or 'node'
    ref_id: int

class PointsCreate(PointsBase):
    pass

class PointsResponse(PointsBase):
    id: int

    class Config:
        orm_mode = True