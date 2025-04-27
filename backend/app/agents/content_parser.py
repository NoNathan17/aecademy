from uagents import Agent, Context, Model
import os
import httpx
from dotenv import load_dotenv

load_dotenv()
ASI_ONE_API_KEY = os.getenv("ASI_ONE_API_KEY") 

QUIZ_AGENT_ADDRESS = "agent1q0np6mpz2ue7g30lzgue4ep26ht0xga34agczpr0sw5y540fukakk5ftndy"
QUIZ_AGENT_HTTP_ENDPOINT = "http://localhost:8003/submit"

# what the agent receives
class ContentRequest(Model):
    content: str
    grade_level: str
    upload_id: str

class ContentResponse(Model):
    key_ideas: list
    upload_id: str

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
        "temperature": 0.5, # how random the llm is
        "stream": False, # generates everything at once (better for us)
        "max_tokens": 300
    }

    async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
                print(f"🔥 Full ASI-One raw response: {data}")  # Log full response for debug
                return data["choices"][0]["message"]["content"]
            except httpx.HTTPStatusError as e:
                print(f"🔥 HTTP error when calling ASI-One API: {e.response.status_code} {e.response.text}")
            except Exception as e:
                print(f"🔥 Unexpected error when calling ASI-One: {str(e)}")

# helper to chunk long pdfs
def chunk_text(text, max_chars=100):
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

# helper for picking prompt for grade level
def generate_prompt(content: str, grade_level: str):
    return (
        f"Summarize the following text into numbered bullet points ranked by importance. Focus mainly on course content."
        f"Explain each idea for a {grade_level} student in 2-3 sentences:\n\n"
        f"{content}\n\n"
        f"Respond ONLY with a numbered list. No extra commentary."
    )

# log on startup
@content_parser.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info(f"Content Parser Agent started at {content_parser.address}")

# on message, do parsing
@content_parser.on_message(model=ContentRequest, replies=ContentResponse)
async def handle_content(ctx: Context, sender: str, msg: ContentRequest):
    ctx.logger.info(f"Received content to parse from {sender}")
    ctx.logger.info(f"Grade Level requested: {msg.grade_level}")
    ctx.logger.info(f"Upload ID: {msg.upload_id}")

    if not msg.content.strip() or len(msg.content.strip()) < 50:
        ctx.logger.error("⚠️ Uploaded content is too small or empty. Skipping.")
        return

    chunks = chunk_text(msg.content)
    all_key_ideas = []

    try:
        for chunk in chunks:
            prompt = generate_prompt(chunk, msg.grade_level)
            llm_output = await call_asi_llm(prompt)

            if not llm_output:
                raise Exception("No valid output from LLM")
            
            key_ideas = [idea.strip() for idea in llm_output.split("\n") if idea.strip()]
            all_key_ideas.extend(key_ideas)

        ctx.logger.info(f"Parsed Important Topics: {key_ideas}")

        # send to backend agent
        await ctx.send(sender, ContentResponse(key_ideas=all_key_ideas, upload_id=msg.upload_id))

        # send to quiz agent
        await ctx.send(QUIZ_AGENT_ADDRESS, ContentResponse(key_ideas=all_key_ideas, upload_id=msg.upload_id))

    except Exception as e:
        ctx.logger.error(f"Failed to parse content via LLM: {str(e)}")

if __name__ == "__main__":
    content_parser.run()
