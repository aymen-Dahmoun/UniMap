from sqlalchemy.orm import Session
from shapely import wkt
from geoalchemy2.shape import from_shape
from app.models.paths import Paths
from app.schemas.map import PathMap
from sqlalchemy.orm import Session
from typing import Union
from app.schemas.path import PathCreate
from app.models.paths import Paths
from app.services.to_geojson import path_to_geojson

def list_paths(db: Session):
    return db.query(Paths).all()

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


def create_paths(
    data: Union[PathCreate, list[PathCreate]],
    db: Session
):
    paths_data = data if isinstance(data, list) else [data]

    created = []

    for item in paths_data:
        obj = Paths(**item.model_dump())
        db.add(obj)
        created.append(obj)

    db.commit()

    for obj in created:
        db.refresh(obj)

    return [path_to_geojson(obj) for obj in created]
