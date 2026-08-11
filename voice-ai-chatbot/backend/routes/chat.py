"""Chat endpoint: takes a message + history, returns the AI's reply."""
from fastapi import APIRouter, HTTPException

from models.schemas import ChatRequest, ChatResponse
from services.llm_service import LLM_PROVIDER, LLMServiceError, generate_reply

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        reply = await generate_reply(request.message, request.history)
    except LLMServiceError as exc:
        # 502: the failure is on the upstream provider, not the client's request.
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return ChatResponse(reply=reply, provider=LLM_PROVIDER)
