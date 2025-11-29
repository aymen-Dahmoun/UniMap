from sqlalchemy.orm import Session
from shapely import wkt
from geoalchemy2.shape import from_shape
from app.models.navigation_nodes import NavigationNode
from app.schemas.map import NodeMap
from typing import List, Union
from app.schemas.navigation_nodes import NavigationNodeCreate
from app.models.navigation_nodes import NavigationNode
from app.services.to_geojson import node_to_geojson
from app.models.points import Points


def get_all_nodes(db: Session):
    nodes = db.query(NavigationNode).all()
    return [node_to_geojson(n) for n in nodes]


def create_node(db: Session, n: NodeMap):
    node = NavigationNode(
        name=n.name,
        node_type=n.node_type,
        floor=n.floor,
        geometry=from_shape(wkt.loads(n.geometry), srid=4326)
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
        obj = NavigationNode(**node.model_dump())
        db.add(obj)
        db.commit()
        db.refresh(obj)

        point = Points(
            type="node",
            ref_id=obj.id,
            floor=obj.floor
        )
        db.add(point)
        db.commit()
        db.refresh(point)

        results.append(node_to_geojson(obj))

    return results