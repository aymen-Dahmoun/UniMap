import networkx as nx
from sqlalchemy.orm import Session
from app.models.paths import Paths
from app.models.points import Points
from typing import List, Dict, Any

class PathFinder:
    def __init__(self):
        self.graph = nx.Graph()
        
    def build_graph_from_db(self, db: Session):
        """Build NetworkX graph from Paths and Points"""
        self.graph.clear()

        points = db.query(Points).all()
        for point in points:
            self.graph.add_node(
                point.id,
                type=point.type,
                ref_id=point.ref_id,
                floor=point.floor
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
        """
        Resolve a room/node reference to Points.id
        """
        point = db.query(Points).filter_by(type=ref["type"], ref_id=ref["ref_id"]).first()
        if not point:
            raise ValueError(f"No point found for {ref}")
        return point.id
    
    def find_shortest_path(self, db: Session, start_ref: Dict[str, Any], end_ref: Dict[str, Any]) -> Dict[str, Any]:
        """
        Find shortest path between two Points (can be room or nav node)
        """
        try:
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
            
            # Collect segment details
            path_segments = []
            for i in range(len(path_point_ids) - 1):
                start = path_point_ids[i]
                end = path_point_ids[i + 1]
                edge_data = self.graph.get_edge_data(start, end)
                path_segments.append({
                    "start_point_id": start,
                    "end_point_id": end,
                    "distance": edge_data["weight"],
                    "geometry": edge_data["geometry"]
                })
            
            return {
                "success": True,
                "path_points": path_point_ids,
                "total_distance": total_distance,
                "path_segments": path_segments
            }
        
        except nx.NetworkXNoPath:
            return {"success": False, "error": "No path found between the specified points"}
        except nx.NodeNotFound:
            return {"success": False, "error": "One or both points not found in the graph"}
        except ValueError as e:
            return {"success": False, "error": str(e)}

