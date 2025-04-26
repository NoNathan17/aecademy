from fastapi import FastAPI
from app.routes import upload 
from app.agents.backend_agent import backend_agent
import threading
import os
import asyncio

app = FastAPI()

app.include_router(upload.router, prefix="", tags=["Upload"])

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(backend_agent.run_async())

@app.get("/")
async def root():
    return {"message": "Backend is running!"}

if os.environ.get("RUN_MAIN") == "true" or not os.environ.get("RUN_MAIN"):
    t = threading.Thread(target=backend_agent.run_async(), daemon=True)
    t.start()
