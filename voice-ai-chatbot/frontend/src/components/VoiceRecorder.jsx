import { useEffect } from "react";
import { Mic } from "lucide-react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition.js";

/**
 * Large mic button using the browser's native SpeechRecognition API.
 * Click to start listening, speak, and recognition ends automatically once
 * you pause — the final transcript is handed to the parent (ChatInput) to
 * prefill the text box so the user can review/edit before sending.
 *
 * No backend call, no OpenAI Whisper dependency, no API key: everything
 * happens on-device in the browser.
 */
export default function VoiceRecorder({ onTranscribed, onError, disabled }) {
  const { isSupported, isListening, error, startListening, stopListening } =
    useSpeechRecognition();

  // Surface hook errors (permission denied, no speech, unsupported browser,
  // etc.) through the same notice banner ChatInput already renders.
  useEffect(() => {
    if (error) onError?.(error);
  }, [error, onError]);

  const handleClick = () => {
    if (disabled) return;

    if (isListening) {
      stopListening();
      return;
    }

    startListening((transcript) => {
      onTranscribed(transcript);
    });
  };

  return (
    <div className="relative flex items-center justify-center">
      {isListening && (
        <>
          <span className="absolute inline-flex h-11 w-11 rounded-full bg-amber/40 animate-pulseRing" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-medium text-amber bg-base-800 border border-base-700 rounded-full px-2.5 py-1 shadow-lg">
            Listening...
          </span>
        </>
      )}

      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center transition-colors
        disabled:opacity-40 disabled:cursor-not-allowed
        ${isListening ? "bg-amber text-base-950" : "bg-base-800 border border-base-700 hover:bg-base-700 text-white/80"}
        ${!isSupported ? "opacity-60" : ""}`}
        aria-label={isListening ? "Stop listening" : "Start voice input"}
        title={
          !isSupported
            ? "Voice input isn't supported in this browser — try Chrome or Edge"
            : isListening
              ? "Stop listening"
              : "Start voice input"
        }
      >
        {isListening ? (
          <div className="flex items-end gap-0.5 h-4">
            <span className="w-0.5 bg-base-950 origin-bottom animate-wave1 h-full" />
            <span className="w-0.5 bg-base-950 origin-bottom animate-wave2 h-full" />
            <span className="w-0.5 bg-base-950 origin-bottom animate-wave3 h-full" />
            <span className="w-0.5 bg-base-950 origin-bottom animate-wave4 h-full" />
          </div>
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
