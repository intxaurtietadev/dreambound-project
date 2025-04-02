from fastapi import FastAPI
from togetherai_service import ask_togetherai

app = FastAPI()

@app.get("/ask")
async def ask(question: str):
    response = ask_togetherai(question)
    return {"response": response}
