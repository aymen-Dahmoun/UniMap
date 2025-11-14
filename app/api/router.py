from fastapi import APIRouter
from app.api.routes.user import router as users_router
from app.api.routes.buildings import router as buildings_router
from app.api.routes.rooms import router as rooms_router
from app.api.routes.path import router as path_router

api_router = APIRouter()
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(buildings_router, prefix="/buildings")
api_router.include_router(rooms_router, prefix="/rooms")
api_router.include_router(path_router, prefix="/path")