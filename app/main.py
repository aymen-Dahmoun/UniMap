from fastapi import FastAPI
from app.core.database import Base, engine
from app.api.router import api_router
from app.models import user, user_pins, buildings, rooms, paths
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s"
)


# Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="UniMap")

app.include_router(api_router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}