# app/services/pathfinder.py
import networkx as nx
from sqlalchemy.orm import Session
from app.models.paths import Paths
from app.models.rooms import Rooms
from typing import List, Dict, Any
import networkx as nx
import matplotlib.pyplot as plt

# def draw_graph(G, filename="graph.png"):
#     pos = nx.spring_layout(G, seed=42)
#     nx.draw(G, pos, with_labels=True, node_color="lightblue", node_size=800, font_size=10)
#     labels = nx.get_edge_attributes(G, "weight")
#     nx.draw_networkx_edge_labels(G, pos, edge_labels=labels)
#     plt.savefig(filename)
#     plt.close()

class PathFinder:
    def __init__(self):
        self.graph = nx.Graph()
        
    def build_graph_from_db(self, db: Session):
        """Build NetworkX graph from paths in database"""
        self.graph.clear()
        
        paths = db.query(Paths).all()
        
        for path in paths:
            self.graph.add_edge(
                path.start_point_id,
                path.end_point_id,
                weight=path.distance,
                path_id=path.id,
                geometry=path.geometry
            )
        # draw_graph(G=self.graph)
        
        return len(paths)
    
    def find_shortest_path(self, start_point_id: int, end_point_id: int) -> Dict[str, Any]:
        """Find shortest path between two rooms"""
        try:
            path_room_ids = nx.shortest_path(
                self.graph, 
                start_point_id, 
                end_point_id, 
                weight='weight'
            )
            
            total_distance = nx.shortest_path_length(
                self.graph, 
                start_point_id, 
                end_point_id, 
                weight='weight'
            )
            
            path_segments = []
            for i in range(len(path_room_ids) - 1):
                start_id = path_room_ids[i]
                end_id = path_room_ids[i + 1]
                
                edge_data = self.graph.get_edge_data(start_id, end_id)
                path_segments.append({
                    'start_point_id': start_id,
                    'end_point_id': end_id,
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

path_finder = PathFinder()