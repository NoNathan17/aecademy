import asyncio

# global queue
# fastapi puts stuff in this queue, backend agent gets them and send them out
backend_agent_task_queue = asyncio.Queue()
