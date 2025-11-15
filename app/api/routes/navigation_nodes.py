from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Union
from app.core.database import get_db
from app.schemas.navigation_nodes import NavigationNodeResponse, NavigationNodeCreate
from app.models.navigation_nodes import NavigationNode
from app.services.to_geojson import node_to_geojson
from app.models.points import Points

router = APIRouter(prefix="/nodes", tags=["nodes"])


@router.get("/", response_model=List[NavigationNodeResponse])
def list_nodes(db: Session = Depends(get_db)):
    nodes = db.query(NavigationNode).all()
    return [node_to_geojson(n) for n in nodes]

@router.post("/", response_model=List[NavigationNodeResponse])
def create_nodes(
    data: Union[NavigationNodeCreate, List[NavigationNodeCreate]],
    db: Session = Depends(get_db)
):
    nodes_data = data if isinstance(data, list) else [data]
    results = []

    for node in nodes_data:
        obj = NavigationNode(**node.model_dump())
        db.add(obj)
        db.commit()
        db.refresh(obj)

        point = Points(
            type="node",
            ref_id=obj.id,
            floor=obj.floor
        )
        db.add(point)
        db.commit()
        db.refresh(point)

        results.append(node_to_geojson(obj))

    return results