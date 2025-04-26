
from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
# from app.services.send_to_agents import send_to_content_parser
from app.agents.backend_agent_queue import backend_agent_task_queue
import pdfplumber
import io
import uuid
from fastapi.responses import JSONResponse
from app.agents.quiz import quiz_store

router = APIRouter()

class ContentRequest(BaseModel):
    content: str

CONTENT_PARSER_AGENT_ADDRESS = "agent1qf80v4k92z2tu7pl4smc9pwgq8kdg9m67u42tas5u4xu64vgf9nt6fxu3k9"

key_ideas_store = {}

@router.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...), grade_level: str = Form()):
    if not file.filename.endswith(".pdf"):
        return {"error": "Only PDF files are supported."}
    
    # Save uploaded file temporarily
    contents = await file.read()

    # Use pdfplumber to extract text
    with pdfplumber.open(io.BytesIO(contents)) as pdf:
        full_text = ""
        for page in pdf.pages:
            full_text += page.extract_text() + "\n"

    if not full_text.strip():
        return {"error": "No text found in PDF."}
    
    upload_id = str(uuid.uuid4())

    # Send the extracted text to backend agent queue
    await backend_agent_task_queue.put({
        "type": "send_content",
        "to": CONTENT_PARSER_AGENT_ADDRESS,
        "content": full_text,
        "grade_level": grade_level,
        "upload_id": upload_id,
    })

    return {"message": "PDF uploaded, text extracted, and sent to backend agent.", "upload_id": upload_id}


@router.get("/get-key-ideas/{upload_id}")
async def get_key_ideas(upload_id: str):
    if upload_id in key_ideas_store:
        return {"key_ideas": key_ideas_store[upload_id]}
    return JSONResponse(status_code=202, content={"message": "Still processing..."})

@router.get("/get-quiz/{upload_id}")
async def get_quiz(upload_id: str):
    if upload_id in quiz_store:
        return {"quiz": quiz_store[upload_id]}
    return JSONResponse(status_code=202, content={"message": "Quiz still being generated..."})
