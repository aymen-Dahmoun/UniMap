import networkx as nx
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.models.paths import Paths
from app.models.nodes import Nodes
from app.models.rooms import Rooms
import logging

logger = logging.getLogger(__name__)

class PathFinder:
    def __init__(self):
        self.graph = nx.Graph()
        logger.info('hello')

    def build_graph_from_db(self, db: Session):
        self.graph.clear()

        nodes = db.query(Nodes).all()
        for node in nodes:
            self.graph.add_node(
                node.id,
                node_kind=node.node_kind,
                floor=node.floor,
                building_id=node.building_id,
            )

        paths = db.query(Paths).all()
        for path in paths:
            self.graph.add_edge(
                path.start_node_id,
                path.end_node_id,
                weight=path.distance,
                path_id=path.id,
                geometry=path.geometry,
                floor=path.floor
            )

        return len(paths)

    def resolve_node(self, db: Session, ref: Dict[str, Any]) -> int:
        node = db.query(Nodes).filter(Nodes.id == ref["ref_id"]).first()

        if not node:
            raise ValueError(f"No node found for {ref}")

        if ref.get("type") and node.node_kind != ref["type"]:
            raise ValueError(f"Node type mismatch: expected {ref['type']}, got {node.node_kind}")

        return node.id


    def get_node_details(self, db: Session, node_id: int) -> Dict[str, Any]:
        node = db.query(Nodes).filter_by(id=node_id).first()
        if not node:
            raise ValueError(f"Node {node_id} not found")

        data = {
            "id": node.id,
            "type": node.node_kind,
            "floor": node.floor,
        }

        if isinstance(node, Rooms):
            data.update({
                "name": node.name,
                "geometry": db.scalar(node.geometry.ST_AsGeoJSON())
            })
        else:
            data.update({
                "name": node.name,
                "geometry": db.scalar(node.node_geometry.ST_AsGeoJSON()),
                "node_type": node.node_type,
                "is_accessible": node.is_accessible
            })

        return data

    def find_shortest_path(self, db: Session, start_ref: Dict[str, Any], end_ref: Dict[str, Any]) -> Dict[str, Any]:
        try:
            logger.info('helloooo')
            start_id = self.resolve_node(db, start_ref)
            end_id = self.resolve_node(db, end_ref)

            path_point_ids = nx.shortest_path(
                self.graph,
                source=start_id,
                target=end_id,
                weight="weight"
            )

            total_distance = nx.shortest_path_length(
                self.graph,
                source=start_id,
                target=end_id,
                weight="weight"
            )

            path_segments = []
            for i in range(len(path_point_ids) - 1):
                start = path_point_ids[i]
                end = path_point_ids[i + 1]

                edge = self.graph.get_edge_data(start, end)
                path_segments.append({
                    "start_node_id": start,
                    "end_node_id": end,
                    "distance": edge["weight"],
                    "geometry": db.scalar(edge["geometry"].ST_AsGeoJSON()),
                    "floor": edge["floor"]
                })

            path_points = [
                self.get_node_details(db, pid) for pid in path_point_ids
            ]

            return {
                "success": True,
                "path_points": path_points,
                "path_segments": path_segments,
                "total_distance": total_distance
            }

        except nx.NetworkXNoPath:
            return {"success": False, "error": "No path found between the specified nodes"}

        except nx.NodeNotFound:
            return {"success": False, "error": "One or both nodes not found in the graph"}

        except ValueError as e:
            return {"success": False, "error": str(e)}
