from fastapi import FastAPI
from app.routes import api 
from app.agents.backend_agent import backend_agent
import asyncio
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api.router, prefix="", tags=["Upload"])

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(backend_agent.run_async())

@app.get("/")
async def root():
    return {"message": "Backend is running!"}

