import { useCallback, useRef, useState } from "react";

/**
 * Records microphone audio via MediaRecorder and hands back a Blob the
 * caller can send to the backend's /transcribe (Whisper) endpoint.
 *
 * We record actual audio (rather than relying on the browser's built-in
 * SpeechRecognition) so transcription quality comes from Whisper, and the
 * feature works the same way across browsers that support MediaRecorder.
 */
export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const startRecording = useCallback(async () => {
    setError(null);

    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setError("Your browser doesn't support audio recording.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setError("Microphone permission was denied. Please allow access and try again.");
      } else {
        setError("Could not access the microphone.");
      }
    }
  }, []);

  /** Stops recording and resolves with the recorded audio Blob (or null on failure). */
  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        streamRef.current?.getTracks().forEach((track) => track.stop());
        setIsRecording(false);

        if (blob.size === 0) {
          setError("No audio was captured. Try speaking closer to the mic.");
          resolve(null);
          return;
        }
        resolve(blob);
      };

      recorder.stop();
    });
  }, []);

  return { isRecording, error, startRecording, stopRecording };
}
