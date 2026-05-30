from sqlalchemy.orm import Session
from shapely import wkt
from geoalchemy2.shape import from_shape
from app.models.nodes import Nodes
from app.schemas.map import NodeMap
from typing import List, Union
from app.schemas.navigation_nodes import NavigationNodeCreate
from app.services.to_geojson import node_to_geojson


def get_all_nodes(db: Session):
    nodes = db.query(Nodes).all()
    return [node_to_geojson(n) for n in nodes]


def create_node(db: Session, n: NodeMap):
    geometry = wkt.loads(n.geometry)
    node = Nodes(
        name=n.name,
        node_type=n.node_type,
        floor=n.floor,
        node_geometry=from_shape(geometry, srid=4326)
    )
    db.add(node)
    db.flush()
    return node

def create_nodes(
    data: Union[NavigationNodeCreate, List[NavigationNodeCreate]],
    db: Session
):
    nodes_data = data if isinstance(data, list) else [data]
    results = []

    for node in nodes_data:
        payload = node.model_dump()
        geometry = wkt.loads(payload.pop("geometry"))
        payload["node_geometry"] = from_shape(geometry, srid=4326)
        obj = Nodes(**payload)
        db.add(obj)
        db.commit()
        db.refresh(obj)

        results.append(node_to_geojson(obj))

    return results