import { useCallback, useEffect, useRef, useState } from "react";

// Chrome/Edge expose this as the vendor-prefixed webkitSpeechRecognition;
// only a handful of browsers implement either name at all (no Firefox
// support as of writing), so we detect once and expose `isSupported`.
const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

const UNSUPPORTED_MESSAGE =
  "Voice input isn't supported in this browser. Try Chrome or Edge on desktop/Android, or just type your message instead.";

/**
 * Wraps the browser's native SpeechRecognition API for one-shot voice input:
 * click to start listening, speak, and the final transcript comes back via
 * the onResult callback passed to startListening(). No network call, no
 * backend involvement, no API key — everything happens on-device/in-browser.
 */
export function useSpeechRecognition() {
  const isSupported = Boolean(SpeechRecognitionAPI);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  // Create one recognition instance for the component's lifetime rather
  // than recreating it on every start, and clean it up on unmount.
  useEffect(() => {
    if (!isSupported) return undefined;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false; // stop automatically after one utterance
    recognition.interimResults = false; // only fire onresult with the final transcript
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    return () => {
      recognition.onstart = null;
      recognition.onend = null;
      recognition.onerror = null;
      recognition.onresult = null;
      try {
        recognition.stop();
      } catch {
        // Already stopped — nothing to clean up.
      }
    };
  }, [isSupported]);

  const startListening = useCallback(
    (onResult) => {
      setError(null);

      if (!isSupported || !recognitionRef.current) {
        setError(UNSUPPORTED_MESSAGE);
        return;
      }

      const recognition = recognitionRef.current;

      recognition.onstart = () => setIsListening(true);

      recognition.onend = () => setIsListening(false);

      recognition.onerror = (event) => {
        setIsListening(false);
        switch (event.error) {
          case "not-allowed":
          case "permission-denied":
            setError("Microphone permission was denied. Please allow access and try again.");
            break;
          case "no-speech":
            setError("No speech detected. Try again and speak right after tapping the mic.");
            break;
          case "audio-capture":
            setError("No microphone was found. Check your device's mic settings.");
            break;
          case "network":
            setError("A network error interrupted speech recognition. Try again.");
            break;
          default:
            setError(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript?.trim();
        if (transcript) onResult(transcript);
      };

      try {
        recognition.start();
      } catch {
        // start() throws if a recognition session is already active for
        // this instance — treat it as already listening rather than erroring.
        setIsListening(true);
      }
    },
    [isSupported]
  );

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // No-op: nothing to stop.
    }
  }, []);

  return { isSupported, isListening, error, startListening, stopListening };
}
