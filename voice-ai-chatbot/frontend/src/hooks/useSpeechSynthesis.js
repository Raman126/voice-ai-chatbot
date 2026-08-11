import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Wraps the browser's built-in speechSynthesis API so components can just
 * call speak/pause/resume/stop without touching the raw Web Speech API.
 *
 * Structured so ElevenLabs (or any other TTS provider) can be swapped in
 * later: a future implementation would keep this same interface
 * (speak/pause/resume/stop/isSpeaking) but stream audio from the backend
 * instead of using window.speechSynthesis directly.
 */
export function useSpeechSynthesis() {
  const [voices, setVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState(null);
  const [rate, setRate] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const utteranceRef = useRef(null);

  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
      if (available.length && !selectedVoiceURI) {
        setSelectedVoiceURI(available[0].voiceURI);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported]);

  const speak = useCallback(
    (text, messageId) => {
      if (!isSupported || !text) return;

      window.speechSynthesis.cancel(); // stop anything currently playing

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = voices.find((v) => v.voiceURI === selectedVoiceURI);
      if (voice) utterance.voice = voice;
      utterance.rate = rate;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        setSpeakingMessageId(messageId);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setSpeakingMessageId(null);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setSpeakingMessageId(null);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, voices, selectedVoiceURI, rate]
  );

  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setSpeakingMessageId(null);
  }, [isSupported]);

  return {
    isSupported,
    voices,
    selectedVoiceURI,
    setSelectedVoiceURI,
    rate,
    setRate,
    isSpeaking,
    isPaused,
    speakingMessageId,
    speak,
    pause,
    resume,
    stop,
  };
}
