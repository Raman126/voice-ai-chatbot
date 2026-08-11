"""Transcription endpoint: accepts a recorded audio blob, returns text via Whisper."""
from fastapi import APIRouter, HTTPException, UploadFile, File

from models.schemas import TranscriptionResponse
from services.whisper_service import TranscriptionError, transcribe_audio

router = APIRouter()


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe(audio: UploadFile = File(...)):
    file_bytes = await audio.read()

    try:
        text = await transcribe_audio(
            file_bytes=file_bytes,
            filename=audio.filename or "recording.webm",
            content_type=audio.content_type or "audio/webm",
        )
    except TranscriptionError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return TranscriptionResponse(text=text)
