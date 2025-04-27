import os
import uvicorn
from dotenv import load_dotenv
from pymongo import MongoClient
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
load_dotenv()
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # <-- Allow ALL origins (easiest for now)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)

db = client["test"]
queries_collection = db["queries"]
#get names of previous que
@app.post("/api/queries")
async def get_queries(request: Request):
    body = await request.json()
    user_email = body.get("email")

    if not user_email:
        return JSONResponse(content={"error": "No email provided"}, status_code=400)

    # Find documents matching user email
    user_queries = queries_collection.find({"userId": user_email})
    queries_list = [doc.get("question") for doc in user_queries]

    return queries_list

#code for getting info from clicking on previous queries
@app.get("/api/query/{query_name}")
async def get_query(query_name: str):
    query = queries_collection.find_one({"question": query_name})

    # Convert the _id to a string so it's JSON safe
    query["_id"] = str(query["_id"])
    return query
def get_queries_by_user_id(user_id: str):
    """
    Fetches all documents from the 'queries' collection where 'userId' matches the provided user_id.
    """
    try:
        results = list(queries_collection.find(
            {"userId": user_id},
            {"_id": 0, "question": 1}
        ).sort("_id", -1)
    )
        return results
    except Exception as e:
        print(f"Failed to retrieve documents: {str(e)}")
        return []

def add_query(user_id: str, question: str, answer: str, timestamp: str):
    try:

        query_document = {
            "userId": user_id,
            "question": question,
            "summary": answer,
            "quiz": timestamp
        }

        result = queries_collection.insert_one(query_document)
        print(f"Inserted document with _id: {result.inserted_id}")
        return str(result.inserted_id)

    except Exception as e:
        print(f"Failed to insert document: {str(e)}")
        return None

# POST endpoint to receive the data
@app.post("/api/submit")
async def receive_data(request: Request):
    data = await request.json()

    print("📥 Received data at backend:")
    print("Filename:", data.get('filename'))
    print("Email:", data.get('email'))
    print("Ideas:", data.get('ideas'))
    print("Quiz:", data.get('quiz'))
    add_query(data.get('email'),data.get('filename'),data.get('ideas'),data.get('quiz'))
    return {"message": "Data received successfully!"}

if __name__ == "__main__":
    add_query("ningyl1@uci.edu", "lorem.pdf", "asdasdasdajdsadsasdasdajasdasdajsdisdpkofdbo[pkdrokweopgdjdhdnbndfhfddfgsdfdhuiasdfhusuaaaaaaaaaaaaaaaofsodfhaosidaiodhaoshdioasdaodasdhaosdhaosd", "aaaaaaaaaaaaaaaaaasdasdasdasdasdaksdasdjasdasdasdjadsjajsdjasdjajsdjasdddddddddddddddddddddddasdjasdjaksdjajsdndjcjvnajsdkajsdnansjdkajsdnjskajsaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    uvicorn.run("database:app", host="0.0.0.0", port=9000, reload=True)