"""Pydantic models shared across routes for request/response validation."""
from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=8000)
    # Prior turns in the conversation, oldest first. Sent by the frontend on
    # every request since the backend itself is stateless (no session store).
    history: List[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    provider: str


class TranscriptionResponse(BaseModel):
    text: str


class ErrorResponse(BaseModel):
    detail: str
