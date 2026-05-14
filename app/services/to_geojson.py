from geoalchemy2.shape import to_shape
from app.models.buildings import Buildings
from app.models.rooms import Rooms
from app.models.paths import Paths
from app.models.navigation_nodes import NavigationNode
from app.schemas.room_metadata import RoomMetadataResponse


def building_to_geojson(building: Buildings):
    geo = to_shape(building.geometry)
    return {
        "id": building.id,
        "name": building.name,
        "floor": building.floor,
        "geometry": geo.__geo_interface__
    }

def room_to_geojson(room: Rooms):
    geo = to_shape(room.geometry)
    return {
        "id": room.id,
        "name": room.name,
        "building_id": room.building_id,
        "floor": room.floor,
        "geometry": geo.__geo_interface__,
        "room_metadata": RoomMetadataResponse.model_validate(room.room_metadata) if room.room_metadata else None
    }

def path_to_geojson(path: Paths):
    geo = to_shape(path.geometry)
    return {
        "id": path.id,
        "start_point_id": path.start_point_id,
        "end_point_id": path.end_point_id,
        "geometry": geo.__geo_interface__,
        "distance": path.distance,
        "floor": path.floor
    }

def node_to_geojson(node: NavigationNode):
    geo = to_shape(node.geometry)
    return {
        "id": node.id,
        "name": node.name,
        "node_type": node.node_type,
        "geometry": geo.__geo_interface__,
        "is_accessible": node.is_accessible,
        "floor": node.floor
    }