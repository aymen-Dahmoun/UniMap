from fastapi import FastAPI
from .core.database import Base, engine
from .api.router import api_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="UniMap")

app.include_router(api_router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}