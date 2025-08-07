from fastapi import FastAPI
from app.api.v1.endpoints import router as match_router

app = FastAPI()

app.include_router(match_router, prefix="/api/v1") 