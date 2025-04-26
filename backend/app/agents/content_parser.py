from uagents import Agent, Context, Model

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

# log on startup
@content_parser.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info(f"Content Parser Agent started at {content_parser.address}")

# on message, do parsing
@content_parser.on_message(model=ContentRequest, replies=ContentResponse)
async def handle_content(ctx: Context, sender: str, msg: ContentRequest):
    ctx.logger.info(f"Received content to parse from {sender}")
    ctx.logger.info(f"Received content: {msg.content}")

    content = msg.content

    # dummy parsing logic
    sentences = content.split()
    key_ideas = [sentence.strip() for sentence in sentences if sentence.strip()][:5]

    ctx.logger.info(f"Parsed key ideas: {key_ideas}")

    await ctx.send(sender, ContentResponse(key_ideas=key_ideas))

if __name__ == "__main__":
    content_parser.run()


