from geoalchemy2.shape import to_shape
from app.models.buildings import Buildings
from app.models.rooms import Rooms

def building_to_geojson(building: Buildings):
    geo = to_shape(building.geometry)
    return {
        "id": building.id,
        "name": building.name,
        "geometry": geo.__geo_interface__
    }

def room_to_geojson(room: Rooms):
    geo = to_shape(room.geometry)
    return {
        "id": room.id,
        "name": room.name,
        "building_id": room.building_id,
        "geometry": geo.__geo_interface__,
    }