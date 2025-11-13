# app/services/pathfinder.py
import networkx as nx
from sqlalchemy.orm import Session
from app.models.paths import Paths
from app.models.rooms import Rooms
from typing import List, Dict, Any

class PathFinder:
    def __init__(self):
        self.graph = nx.Graph()
        
    def build_graph_from_db(self, db: Session):
        """Build NetworkX graph from paths in database"""
        self.graph.clear()
        
        # Get all paths from database
        paths = db.query(Paths).all()
        
        # Add edges to graph
        for path in paths:
            self.graph.add_edge(
                path.start_room_id,
                path.end_room_id,
                weight=path.distance,
                path_id=path.id,
                geometry=path.geometry
            )
        
        return len(paths)
    
    def find_shortest_path(self, start_room_id: int, end_room_id: int) -> Dict[str, Any]:
        """Find shortest path between two rooms"""
        try:
            # Find the path using Dijkstra's algorithm
            path_room_ids = nx.shortest_path(
                self.graph, 
                start_room_id, 
                end_room_id, 
                weight='weight'
            )
            
            # Calculate total distance
            total_distance = nx.shortest_path_length(
                self.graph, 
                start_room_id, 
                end_room_id, 
                weight='weight'
            )
            
            # Get the actual path segments (edges)
            path_segments = []
            for i in range(len(path_room_ids) - 1):
                start_id = path_room_ids[i]
                end_id = path_room_ids[i + 1]
                
                edge_data = self.graph.get_edge_data(start_id, end_id)
                path_segments.append({
                    'start_room_id': start_id,
                    'end_room_id': end_id,
                    'distance': edge_data['weight'],
                    'geometry': edge_data['geometry']
                })
            
            return {
                'path_room_ids': path_room_ids,
                'total_distance': total_distance,
                'path_segments': path_segments,
                'success': True
            }
            
        except nx.NetworkXNoPath:
            return {'success': False, 'error': 'No path found between the specified rooms'}
        except nx.NodeNotFound:
            return {'success': False, 'error': 'One or both rooms not found in path network'}

# Global pathfinder instance
path_finder = PathFinder()