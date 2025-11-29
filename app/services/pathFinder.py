import networkx as nx
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.models.paths import Paths
from app.models.points import Points
import logging

logger = logging.getLogger(__name__)

class PathFinder:
    def __init__(self):
        self.graph = nx.Graph()
        logger.info('hello')

    def build_graph_from_db(self, db: Session):
        self.graph.clear()

        points = db.query(Points).all()
        for point in points:
            self.graph.add_node(
                point.id,
                type=point.type,
                ref_id=point.ref_id,
                floor=point.floor,
            )

        paths = db.query(Paths).all()
        for path in paths:
            self.graph.add_edge(
                path.start_point_id,
                path.end_point_id,
                weight=path.distance,
                path_id=path.id,
                geometry=path.geometry,
                floor=path.floor
            )

        return len(paths)

    def resolve_point(self, db: Session, ref: Dict[str, Any]) -> int:
        point = db.query(Points).filter_by(
            type=ref["type"],
            ref_id=ref["ref_id"]
        ).first()

        if not point:
            raise ValueError(f"No point found for {ref}")

        return point.id


    def get_point_details(self, db: Session, point_id: int) -> Dict[str, Any]:
        point = db.query(Points).filter_by(id=point_id).first()
        if not point:
            raise ValueError(f"Point {point_id} not found")
        logger.info(f'node : {point.__dict__}')

        data = {
            "id": point.id,
            "type": point.type,
            "ref_id": point.ref_id,
            "floor": point.floor,
        }

        if point.type == "room" and point.room:
            data.update({
                "name": point.room.name,
                "geometry": db.scalar(point.room.geometry.ST_AsGeoJSON())
            })

        if point.type == "node" and point.node:
            logger.info(f'node : {point.__dict__}')
            data.update({
                "name": point.node.name,
                "geometry": db.scalar(point.node.geometry.ST_AsGeoJSON()),
                "node_type": point.node.node_type,
                "is_accessible": point.node.is_accessible
            })

        return data

    def find_shortest_path(self, db: Session, start_ref: Dict[str, Any], end_ref: Dict[str, Any]) -> Dict[str, Any]:
        try:
            logger.info('helloooo')
            start_id = self.resolve_point(db, start_ref)
            end_id = self.resolve_point(db, end_ref)

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
                    "start_point_id": start,
                    "end_point_id": end,
                    "distance": edge["weight"],
                    "geometry": db.scalar(edge["geometry"].ST_AsGeoJSON()),
                    "floor": edge["floor"]
                })

            path_points = [
                self.get_point_details(db, pid) for pid in path_point_ids
            ]

            return {
                "success": True,
                "path_points": path_points,
                "path_segments": path_segments,
                "total_distance": total_distance
            }

        except nx.NetworkXNoPath:
            return {"success": False, "error": "No path found between the specified points"}

        except nx.NodeNotFound:
            return {"success": False, "error": "One or both points not found in the graph"}

        except ValueError as e:
            return {"success": False, "error": str(e)}
