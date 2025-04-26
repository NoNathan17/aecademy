
from fastapi import APIRouter
from pydantic import BaseModel
# from app.services.send_to_agents import send_to_content_parser
from app.agents.backend_agent_queue import backend_agent_task_queue

router = APIRouter()

class ContentRequest(BaseModel):
    content: str

CONTENT_PARSER_AGENT_ADDRESS = "agent1qf80v4k92z2tu7pl4smc9pwgq8kdg9m67u42tas5u4xu64vgf9nt6fxu3k9"

@router.post("/test-content-parser")
async def test_content_parser(request: ContentRequest):
    await backend_agent_task_queue.put({
        "type": "send_content",
        "to": CONTENT_PARSER_AGENT_ADDRESS,
        "content": request.content
    })

    print("Added task to backend_agent_task_queue")
     
    return {"message": "Content sent to ContentParserAgent via BackendAgent!"}
