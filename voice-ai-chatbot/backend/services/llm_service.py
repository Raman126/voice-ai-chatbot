"""
LLM provider abstraction.

The rest of the app only calls `generate_reply()`. Which provider actually
handles the request is controlled by the LLM_PROVIDER env var, so swapping
Gemini -> Groq -> OpenAI later is a config change, not a code rewrite.
"""
import os
from typing import List

import httpx

from models.schemas import ChatMessage

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "groq").lower()  # "groq" or "gemini"

SYSTEM_PROMPT = (
    "You are a helpful, friendly voice assistant. Keep answers conversational "
    "and reasonably concise since they may be read aloud via text-to-speech."
)


class LLMServiceError(Exception):
    """Raised when the configured LLM provider fails or is misconfigured."""


async def generate_reply(message: str, history: List[ChatMessage]) -> str:
    """Route to the configured provider and return the assistant's reply text."""
    if LLM_PROVIDER == "groq":
        return await _call_groq(message, history)
    if LLM_PROVIDER == "gemini":
        return await _call_gemini(message, history)
    raise LLMServiceError(f"Unknown LLM_PROVIDER '{LLM_PROVIDER}'")


async def _call_groq(message: str, history: List[ChatMessage]) -> str:
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise LLMServiceError("GROQ_API_KEY is not set in the backend .env file")

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages += [{"role": h.role, "content": h.content} for h in history]
    messages.append({"role": "user", "content": message})

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {groq_api_key}"},
                json={
                    "model": "llama-3.1-8b-instant",
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 800,
                },
            )
            resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise LLMServiceError(f"Groq API error: {exc.response.text}") from exc
        except httpx.RequestError as exc:
            raise LLMServiceError(f"Could not reach Groq API: {exc}") from exc

    data = resp.json()
    return data["choices"][0]["message"]["content"]


async def _call_gemini(message: str, history: List[ChatMessage]) -> str:
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        raise LLMServiceError("GEMINI_API_KEY is not set in the backend .env file")

    contents = [
        {"role": "user" if h.role == "user" else "model", "parts": [{"text": h.content}]}
        for h in history
    ]
    contents.append({"role": "user", "parts": [{"text": message}]})

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-1.5-flash:generateContent?key={gemini_api_key}"
    )

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(
                url,
                json={
                    "contents": contents,
                    "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
                    "generationConfig": {"temperature": 0.7, "maxOutputTokens": 800},
                },
            )
            resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise LLMServiceError(f"Gemini API error: {exc.response.text}") from exc
        except httpx.RequestError as exc:
            raise LLMServiceError(f"Could not reach Gemini API: {exc}") from exc

    data = resp.json()
    try:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError) as exc:
        raise LLMServiceError(f"Unexpected Gemini response shape: {data}") from exc
