import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)

db = client["test"]
queries_collection = db["queries"]

def get_queries_by_user_id(user_id: str):
    """
    Fetches all documents from the 'queries' collection where 'userId' matches the provided user_id.
    """
    try:
        results = list(queries_collection.find(
            {"userId": user_id},
            {"_id": 0, "question": 1}
        )
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

if __name__ == "__main__":
    add_query("aiyeah", "How to get Huzz2.pdf", "stop trying", "it wont happen")
    print(get_queries_by_user_id("aiyeah").reverse())