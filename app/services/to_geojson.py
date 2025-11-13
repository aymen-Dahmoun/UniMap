from geoalchemy2.shape import to_shape
from app.models.buildings import Buildings

def to_geojson(building: Buildings):
    geom = to_shape(building.geometry)
    return {
        "id": building.id,
        "name": building.name,
        # Just use the dict directly, no json.loads
        "geometry": geom.__geo_interface__
    }
