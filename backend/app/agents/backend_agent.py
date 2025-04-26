from uagents import Agent, Context, Model
from app.agents.backend_agent_queue import backend_agent_task_queue
import asyncio

backend_agent = Agent(
    name="Backend Agent",
    seed="backend_agent_secret",  
    port=8002,  
    endpoint=["http://localhost:8002/submit"]
)

class ContentRequest(Model):
    content: str
    complexity: str

class ContentResponse(Model):
    key_ideas: list

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
            complexity = task.get("complexity", "intermediate")

            await ctx.send(to_address, ContentRequest(content=content, complexity=complexity))
            ctx.logger.info(f"Sent ContentRequest to {to_address}")

@backend_agent.on_message(model=ContentResponse)
async def handle_content_response(ctx: Context, sender: str, response: ContentResponse):
    ctx.logger.info(f"Received parsed key ideas from ContentParserAgent: {response.key_ideas}")

    # TODO: Save to MongoDB or do something cool here!

if __name__ == "__main__":
    backend_agent.run()
