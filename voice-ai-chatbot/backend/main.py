"""
Voice AI Chatbot - FastAPI backend entry point.

Wires up CORS, routers, and a health check endpoint. All actual business
logic lives in routes/ (HTTP layer) and services/ (provider logic), so this
file stays small and easy to reason about.
"""
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import chat, transcription

app = FastAPI(
    title="Voice AI Chatbot API",
    description="Backend for a voice-enabled AI chatbot (chat + speech-to-text).",
    version="1.0.0",
)

# In dev, the React app runs on a different port (5173) than FastAPI (8000),
# so the browser needs explicit CORS permission to call this API.
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(transcription.router, prefix="/api", tags=["transcription"])


@app.get("/api/health")
async def health_check():
    """Simple liveness check used by the frontend to confirm the backend is up."""
    return {"status": "ok", "service": "voice-ai-chatbot-backend"}
