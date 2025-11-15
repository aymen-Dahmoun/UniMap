from fastapi import APIRouter
from app.api.routes.user import router as users_router
from app.api.routes.buildings import router as buildings_router
from app.api.routes.rooms import router as rooms_router
from app.api.routes.path import router as path_router
from app.api.routes.test import router as test_router
from app.api.routes.map import router as map_route


api_router = APIRouter()
api_router.include_router(users_router, prefix="/api", tags=["Users"])
api_router.include_router(buildings_router, prefix="/api")
api_router.include_router(rooms_router, prefix="/api")
api_router.include_router(path_router, prefix="/api")
api_router.include_router(test_router, prefix="/api")
api_router.include_router(map_route, prefix="/api")