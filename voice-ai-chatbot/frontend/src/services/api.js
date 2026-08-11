/**
 * Centralized backend API calls. Keeping fetch logic here (instead of
 * scattered inside components) means components stay focused on rendering,
 * and it's a single place to update if the base URL or auth scheme changes.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/**
 * Send a message + prior history to the backend, get the AI's reply back.
 * @param {string} message
 * @param {{role: 'user'|'assistant', content: string}[]} history
 */
export async function sendChatMessage(message, history) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });
  } catch (err) {
    throw new ApiError("Network error: could not reach the backend.", 0);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(body.detail || "The AI service failed to respond.", response.status);
  }

  return response.json(); // { reply, provider }
}

/**
 * Send a recorded audio blob to the backend for Whisper transcription.
 * @param {Blob} audioBlob
 */
export async function transcribeAudio(audioBlob) {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/transcribe`, {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    throw new ApiError("Network error: could not reach the backend.", 0);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(body.detail || "Transcription failed.", response.status);
  }

  return response.json(); // { text }
}

export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
