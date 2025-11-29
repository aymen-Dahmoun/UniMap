from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Union
from app.core.database import get_db
from app.schemas.navigation_nodes import NavigationNodeResponse, NavigationNodeCreate
from app.crud import nodes as crud

router = APIRouter(prefix="/nodes", tags=["nodes"])


@router.get("/", response_model=List[NavigationNodeResponse])
def list_nodes(db: Session = Depends(get_db)):
    return crud.get_all_nodes(db)

@router.post("/", response_model=List[NavigationNodeResponse])
def create_nodes(
    data: Union[NavigationNodeCreate, List[NavigationNodeCreate]],
    db: Session = Depends(get_db)
):
    
    return crud.create_nodes(data, db)