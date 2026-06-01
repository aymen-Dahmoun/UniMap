from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.models import user, buildings, rooms, paths, maps, nodes, landmarks
import logging
from app.core.database import Base, engine
from sqlalchemy import text, inspect

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s"
)

# Base.metadata.drop_all(bind=engine)
app = FastAPI(title="UniMap")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


# @app.on_event("startup")
# def create_tables() -> None:
#     with engine.begin() as connection:
#         has_geometry = connection.execute(
#             text("SELECT 1 FROM pg_type WHERE typname = 'geometry' LIMIT 1")
#         ).scalar()
#         if not has_geometry:
#             raise RuntimeError(
#                 "PostGIS extension is not available for this database. "
#                 "Ask a database admin to enable it before creating tables."
#             )
#         inspector = inspect(connection)
#         tables = inspector.get_table_names(schema="public")
#         protected_tables = {"spatial_ref_sys", "geography_columns", "geometry_columns"}
#         for table in tables:
#             if table in protected_tables:
#                 continue
#             connection.execute(text(f'DROP TABLE IF EXISTS "{table}" CASCADE'))
#     Base.metadata.create_all(bind=engine)


@app.get("/health")
async def health_check():
    return {"status": "ok"}