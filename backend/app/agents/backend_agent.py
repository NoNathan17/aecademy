from uagents import Agent, Context, Model
from app.agents.backend_agent_queue import backend_agent_task_queue
from app.storage import key_ideas_store
from app.storage import quiz_store
import asyncio

backend_agent = Agent(
    name="Backend Agent",
    seed="backend_agent_secret",  
    port=8002,  
    endpoint=["http://localhost:8002/submit"]
)

class ContentRequest(Model):
    content: str
    grade_level: str
    upload_id: str

class ContentResponse(Model):
    key_ideas: list
    upload_id: str

class QuizResponse(Model):
    quiz: str
    upload_id: str

# When backend agent starts
@backend_agent.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info(f"Backend Agent started! Address: {backend_agent.address}")
    asyncio.create_task(process_queue(ctx))

async def process_queue(ctx: Context):
    while True:
        ctx.logger.info("💥 process_queue is alive and spinning")
        task = await backend_agent_task_queue.get()
        ctx.logger.info(f"✅ Picked up task from backend_agent_task_queue: {task}")

        if task["type"] == "send_content":
            to_address = task["to"]
            content = task["content"]
            grade_level = task.get("grade_level")
            upload_id = task.get("upload_id")


            message = ContentRequest(content=content, grade_level=grade_level, upload_id=upload_id)

            await ctx.send(to_address, message)
            ctx.logger.info(f"Sent ContentRequest to {to_address}")

@backend_agent.on_message(model=ContentResponse)
async def handle_content_response(ctx: Context, sender: str, response: ContentResponse):
    ctx.logger.info(f"Received parsed key ideas from ContentParserAgent: {response.key_ideas}")

    upload_id = response.upload_id

    if upload_id:
        key_ideas_store[upload_id] = response.key_ideas
        ctx.logger.info(f"Saved key ideas for upload_id {upload_id}")
    else:
        ctx.logger.error("No upload_id found! Cannot save key ideas.")

@backend_agent.on_message(model=QuizResponse)
async def handle_quiz_response(ctx: Context, sender: str, response: QuizResponse):
    ctx.logger.info(f"Received quiz from QuizMakerAgent")

    upload_id = response.upload_id

    if upload_id:
        quiz_store[upload_id] = response.quiz
        ctx.logger.info(f"Saved quiz for upload_id {upload_id}")
    else:
        ctx.logger.error("No upload_id found, cannot save quiz")

if __name__ == "__main__":
    backend_agent.run()
