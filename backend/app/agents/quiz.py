from uagents import Agent, Context, Model
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))
import httpx
from dotenv import load_dotenv
from app.storage import quiz_store

# Load environment variables
load_dotenv()
ASI_ONE_API_KEY = os.getenv("ASI_ONE_API_KEY")
BACKEND_AGENT_ADDRESS = "agent1q0puphn280p39urqlmsh3hjdg446cyr90f39uqtdwemfs46uh53c7a9vxne"

# Define the shared models
class ContentRequest(Model):
    content: str
    grade_level: str

class ContentResponse(Model):
    key_ideas: list
    upload_id: str

class QuizResponse(Model):
    quiz: str
    upload_id: str

# Create the second agent (quiz maker)
quiz_maker = Agent(
    name="quiz_maker",
    seed="quiz_maker_secret",
    port=8003, 
    endpoint=["http://localhost:8003/submit"]
)

# Async function to call ASI-One LLM
async def call_asi_llm(prompt: str) -> str:
    url = "https://api.asi1.ai/v1/chat/completions"

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer {ASI_ONE_API_KEY}"
    }

    payload = {
        "model": "asi1-mini",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
        "stream": False,
        "max_tokens": 400
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()

    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError):
        return "Failed to parse LLM output."

# When this agent starts up
@quiz_maker.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info(f"Quiz Maker Agent started at {quiz_maker.address}")

# When a ContentResponse (key ideas) is received
@quiz_maker.on_message(model=ContentResponse)
async def handle_response(ctx: Context, sender: str, msg: ContentResponse):
    ctx.logger.info(f"Received Key Ideas from {sender}:")
    for idea in msg.key_ideas:
        ctx.logger.info(f"- {idea}")

    # Build a new prompt based on the received key ideas
    ideas_text = "\n".join(f"- {idea}" for idea in msg.key_ideas)
    prompt = (
        f"Create a quiz based on the following key ideas:\n\n"
        f"{ideas_text}\n\n"
        f"Requirements:\n"
        f"- 5 questions total.\n"
        f"- Use a mix of question types: multiple choice, free response, fill-in-the-blank, multi-select.\n"
        f"- Include correct answers"
    )

    # Call the LLM again to generate the quiz
    try:
        quiz_output = await call_asi_llm(prompt)
        quiz_store[msg.upload_id] = quiz_output
        ctx.logger.info("Saved generated quiz to quiz_store")
        ctx.logger.info(f"Generated Quiz Questions:\n{quiz_output}")
        await ctx.send(
            BACKEND_AGENT_ADDRESS,
            QuizResponse(quiz=quiz_output, upload_id=msg.upload_id)
        )
    except Exception as e:
        ctx.logger.error(f"Failed to generate quiz from LLM: {str(e)}")

if __name__ == "__main__":
    quiz_maker.run()
