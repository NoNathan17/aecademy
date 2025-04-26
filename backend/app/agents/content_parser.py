from uagents import Agent, Context, Model
import os
import httpx
from dotenv import load_dotenv

load_dotenv()
ASI_ONE_API_KEY = os.getenv("ASI_ONE_API_KEY") 

# what the agent receives
class ContentRequest(Model):
    content: str

class ContentResponse(Model):
    key_ideas: list

# create agent
content_parser = Agent(
    name="content_parser",
    seed="content_parser_secret",
    port=8001,
    endpoint=["http://localhost:8001/submit"]
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
        "temperature": 0.7,
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

# helper to chunk long pdfs
def chunk_text(text, max_chars=2000):
    # Split the text into chunks no larger than max_chars
    chunks = []
    while len(text) > max_chars:
        split_idx = text[:max_chars].rfind('. ') + 1  # Find last sentence end
        if split_idx == 0:
            split_idx = max_chars  # Just hard cut if no sentence found
        chunks.append(text[:split_idx])
        text = text[split_idx:]
    chunks.append(text)
    return chunks

# log on startup
@content_parser.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info(f"Content Parser Agent started at {content_parser.address}")

# on message, do parsing
@content_parser.on_message(model=ContentRequest, replies=ContentResponse)
async def handle_content(ctx: Context, sender: str, msg: ContentRequest):
    ctx.logger.info(f"Received content to parse from {sender}")

    chunks = chunk_text(msg.content)
    all_key_ideas = []

    try:
        for chunk in chunks:
            prompt = f"From the following text, give me the 5 most important topics to focus on, each starting with a number 1. to 5., followed by a brief explanation:\n\n{chunk}"
            llm_output = await call_asi_llm(prompt)
            key_ideas = [idea.strip() for idea in llm_output.split("\n") if idea.strip()]
            all_key_ideas.extend(key_ideas)

        ctx.logger.info(f"Parsed Key Ideas: {key_ideas}")

        await ctx.send(sender, ContentResponse(key_ideas=key_ideas))

    except Exception as e:
        ctx.logger.error(f"Failed to parse content via LLM: {str(e)}")

if __name__ == "__main__":
    content_parser.run()


