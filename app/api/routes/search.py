from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List

from app.core.database import get_db
from app.models.maps import Maps
from app.models.user import User
from app.models.nodes import Nodes
from app.models.buildings import Buildings
from app.models.rooms import Rooms
from geoalchemy2.shape import to_shape

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("/maps")
def search_maps(q: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Maps).join(User, Maps.user_id == User.id, isouter=True)
    
    if q:
        query = query.filter(
            or_(
                Maps.name.ilike(f"%{q}%"),
                User.email.ilike(f"%{q}%")
            )
        )
    
    maps = query.all()
    result = []
    for m in maps:
        result.append({
            "id": m.id,
            "name": m.name,
            "user_email": m.user.email if m.user else None
        })
    return result

@router.get("/maps/{map_id}/nodes")
def search_map_nodes(
    map_id: int, 
    q: Optional[str] = None, 
    floor: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Nodes).filter(
        or_(
            Nodes.map_id == map_id,
            Nodes.building_id.in_(
                db.query(Buildings.id).filter(Buildings.map_id == map_id)
            )
        )
    )
    
    if q:
        query = query.filter(Nodes.name.ilike(f"%{q}%"))
    
    if floor is not None:
        query = query.filter(Nodes.floor == floor)
        
    nodes = query.all()
    result = []
    for n in nodes:
        node_data = {
            "id": n.id,
            "name": n.name,
            "floor": n.floor,
            "node_kind": n.node_kind,
            "node_type": getattr(n, "node_type", "normal"),
            "geometry": to_shape(n.node_geometry).__geo_interface__ if n.node_kind != "room" else to_shape(n.geometry).__geo_interface__ if hasattr(n, "geometry") else None
        }
        # Rooms inherit from Nodes but their polygon data is in n.geometry 
        # whereas node_geometry holds point. Let's return both if applicable or just the point for highlighting
        
        # We need the node point for highlighting on map
        center_geometry = to_shape(n.node_geometry).__geo_interface__
        node_data["center"] = center_geometry
        
        result.append(node_data)
        
    return result
