from sqlalchemy.orm import Session
from shapely import wkt
from geoalchemy2.shape import from_shape
from app.models.paths import Paths
from app.schemas.map import PathMap


def create_path(db: Session, start_id: int, end_id: int, p: PathMap):
    path = Paths(
        start_point_id=start_id,
        end_point_id=end_id,
        distance=p.distance,
        floor=1,
        geometry=from_shape(wkt.loads(p.geometry), srid=4326)
    )
    db.add(path)
    db.flush()
    return path
