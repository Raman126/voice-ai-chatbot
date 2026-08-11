"""
Speech-to-text service using OpenAI's Whisper.

Uses the hosted OpenAI Whisper API by default (no local GPU needed, which
keeps setup simple for a student laptop). If you have a beefy machine and
want $0 marginal cost, swap this for the local `openai-whisper` pip package
by rewriting `transcribe_audio` to run the model in-process instead of
calling the API.
"""
import os

import httpx

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Basic guardrails so someone can't upload a huge or bogus file.
MAX_AUDIO_BYTES = 25 * 1024 * 1024  # 25 MB, matches OpenAI's Whisper API limit
ALLOWED_CONTENT_TYPES = {"audio/webm", "audio/wav", "audio/mpeg", "audio/mp4", "audio/ogg"}


class TranscriptionError(Exception):
    """Raised when transcription fails or input is invalid."""


async def transcribe_audio(file_bytes: bytes, filename: str, content_type: str) -> str:
    if not OPENAI_API_KEY:
        raise TranscriptionError("OPENAI_API_KEY is not set in the backend .env file")

    if not file_bytes:
        raise TranscriptionError("Received empty audio file")

    if len(file_bytes) > MAX_AUDIO_BYTES:
        raise TranscriptionError("Audio file is too large (max 25MB)")

    if content_type not in ALLOWED_CONTENT_TYPES:
        raise TranscriptionError(f"Unsupported audio type: {content_type}")

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            resp = await client.post(
                "https://api.openai.com/v1/audio/transcriptions",
                headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
                files={"file": (filename, file_bytes, content_type)},
                data={"model": "whisper-1"},
            )
            resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise TranscriptionError(f"Whisper API error: {exc.response.text}") from exc
        except httpx.RequestError as exc:
            raise TranscriptionError(f"Could not reach Whisper API: {exc}") from exc

    data = resp.json()
    text = data.get("text", "").strip()
    if not text:
        raise TranscriptionError("Whisper returned no speech in the audio")
    return text
