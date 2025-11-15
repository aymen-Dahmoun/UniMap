from sqlalchemy.orm import Session
from sqlalchemy.orm import Session
from app.models.points import Points


def create_point(db: Session, ref_id: int, type_: str, floor: int):
    point = Points(
        ref_id=ref_id,
        type=type_,
        floor=floor
    )
    db.add(point)
    db.flush()
    return point


