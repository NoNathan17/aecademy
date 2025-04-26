import httpx

# constants
CONTENT_PARSER_ENDPOINT = "http://localhost:8001/submit"
FASTAPI_AGENT_ADDRESS = "agent1testbackendaddress" 


async def send_to_content_parser(content: str):
    payload = {
        "type": "ContentRequest",
        "sender": FASTAPI_AGENT_ADDRESS,
        "data": {
            "content": content
        }
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(CONTENT_PARSER_ENDPOINT, json=payload)
        response.raise_for_status()
        return response.json()