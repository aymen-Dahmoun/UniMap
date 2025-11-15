from sqlalchemy.orm import Session
from shapely import wkt
from geoalchemy2.shape import from_shape
from app.models.navigation_nodes import NavigationNode
from app.schemas.map import NodeMap


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
