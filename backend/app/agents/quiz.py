from uagents import Agent, Context, Model
import os
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
ASI_ONE_API_KEY = os.getenv("ASI_ONE_API_KEY")

quiz_store = {}

# Define the shared models
class ContentRequest(Model):
    content: str
    grade_level: str

class ContentResponse(Model):
    key_ideas: list
    upload_id: str

# Create the second agent (quiz maker)
key_idea_handler = Agent(
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
        "temperature": 0.5,
        "stream": False,
        "max_tokens": 500
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
@key_idea_handler.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info(f"Quiz Maker Agent started at {key_idea_handler.address}")

# When a ContentResponse (key ideas) is received
@key_idea_handler.on_message(model=ContentResponse)
async def handle_response(ctx: Context, sender: str, msg: ContentResponse):
    ctx.logger.info(f"Received Key Ideas from {sender}:")
    for idea in msg.key_ideas:
        ctx.logger.info(f"- {idea}")

    # Build a new prompt based on the received key ideas
    ideas_text = "\n".join(f"- {idea}" for idea in msg.key_ideas)
    new_prompt = (
        f"Based on the following key ideas:\n\n"
        f"{ideas_text}\n\n"
        f"Create a quiz that includes a variety of question types:\n"
        f"- Single-answer multiple choice questions\n"
        f"- Free response questions\n"
        f"- Fill-in-the-blank questions\n"
        f"- Multi-select questions (select all that apply)\n\n"
        f"Clearly specify for each question:\n"
        f"- Question text\n"
        f"- Answer choices (if applicable)\n"
        f"- Correct answer(s)\n"
        f"- Question type (e.g., 'multiple_choice', 'free_response', 'fill_in_blank', 'multi_select')\n\n"
        f"Format the quiz in a structured JSON format."
        )

    # Call the LLM again to generate the quiz
    try:
        quiz_output = await call_asi_llm(new_prompt)
        ctx.logger.info(f"Generated Quiz Questions:\n{quiz_output}")
    except Exception as e:
        ctx.logger.error(f"Failed to generate quiz from LLM: {str(e)}")

if __name__ == "__main__":
    key_idea_handler.run()
