from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Union
from app.core.database import get_db
from app.schemas.path import PathCreate, PathResponse, NavigationResponse
from app.services.pathFinder import PathFinder
from app.crud import paths as crud


router = APIRouter(prefix="/path", tags=["Path"])

@router.get("/", response_model=list[PathResponse])
def list_paths(db: Session = Depends(get_db)):
    return crud.list_paths(db)

@router.post("/", response_model=list[PathResponse])
def create_paths(
    data: Union[PathCreate, list[PathCreate]],
    db: Session = Depends(get_db)
):
    return crud.create_paths(data, db)

@router.get("/shortest", response_model=NavigationResponse)
def get_shortest_path(
    start_type: str = Query(..., description="Type of the start point: 'room' or 'node'"),
    start_id: int = Query(..., description="ID of the start room or navigation node"),
    end_type: str = Query(..., description="Type of the end point: 'room' or 'node'"),
    end_id: int = Query(..., description="ID of the end room or navigation node"),
    db: Session = Depends(get_db)
):
    """
    Compute the shortest path between two points (rooms or nav nodes)
    """
    path_finder = PathFinder()
    path_finder.build_graph_from_db(db)

    # Fetch all Points for debug if needed
    # points = db.query(Points).all()
    # print("All Points:")
    # for p in points:
    #     print(f"Point ID: {p.id}, Type: {p.type}, Ref ID: {p.ref_id}, Floor: {p.floor}")

    # Fetch all Paths for debug if needed
    # paths = db.query(Paths).all()
    # print("\nAll Paths:")
    # for p in paths:
    #     print(f"Path ID: {p.id}, {p.start_point_id} -> {p.end_point_id}, Distance: {p.distance}")

    # Prepare references in the format {"type": "room"/"node", "ref_id": int}
    start_ref = {"type": start_type, "ref_id": start_id}
    end_ref = {"type": end_type, "ref_id": end_id}

    # Find shortest path using Points
    result = path_finder.find_shortest_path(db, start_ref, end_ref)

    # Debug pathfinder result
    # print("\nPathfinder Result:")
    # print(result)

    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("error"))

    return NavigationResponse(**result)
