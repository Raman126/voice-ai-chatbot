import { useState } from "react";
import { Volume2, Pause, Play, Square, Settings2 } from "lucide-react";

/**
 * Per-message speaker control: play/pause/resume/stop this message's text,
 * plus a small popover for picking a voice and playback speed.
 */
export default function VoicePlayer({ messageId, text, speech }) {
  const [showSettings, setShowSettings] = useState(false);
  const isThisMessageSpeaking = speech.speakingMessageId === messageId;

  if (!speech.isSupported) return null;

  const handlePlayPause = () => {
    if (!isThisMessageSpeaking) {
      speech.speak(text, messageId);
    } else if (speech.isPaused) {
      speech.resume();
    } else {
      speech.pause();
    }
  };

  return (
    <div className="relative inline-flex items-center gap-1">
      <button
        onClick={handlePlayPause}
        className="p-1.5 rounded-md hover:bg-base-700 text-white/50 hover:text-voice transition-colors"
        aria-label={isThisMessageSpeaking && !speech.isPaused ? "Pause" : "Play response"}
        title={isThisMessageSpeaking && !speech.isPaused ? "Pause" : "Listen to response"}
      >
        {isThisMessageSpeaking && !speech.isPaused ? (
          <Pause className="w-3.5 h-3.5" />
        ) : isThisMessageSpeaking ? (
          <Play className="w-3.5 h-3.5" />
        ) : (
          <Volume2 className="w-3.5 h-3.5" />
        )}
      </button>

      {isThisMessageSpeaking && (
        <button
          onClick={speech.stop}
          className="p-1.5 rounded-md hover:bg-base-700 text-white/50 hover:text-red-400 transition-colors"
          aria-label="Stop"
          title="Stop"
        >
          <Square className="w-3 h-3" />
        </button>
      )}

      <button
        onClick={() => setShowSettings((s) => !s)}
        className="p-1.5 rounded-md hover:bg-base-700 text-white/40 hover:text-white/70 transition-colors"
        aria-label="Voice settings"
        title="Voice settings"
      >
        <Settings2 className="w-3.5 h-3.5" />
      </button>

      {showSettings && (
        <div className="absolute bottom-full left-0 mb-2 w-56 glass border border-base-700 rounded-xl p-3 z-10 shadow-xl">
          <label className="block text-xs text-white/50 mb-1">Voice</label>
          <select
            value={speech.selectedVoiceURI || ""}
            onChange={(e) => speech.setSelectedVoiceURI(e.target.value)}
            className="w-full bg-base-800 border border-base-600 rounded-lg text-xs px-2 py-1.5 mb-3"
          >
            {speech.voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name}
              </option>
            ))}
          </select>

          <label className="block text-xs text-white/50 mb-1">
            Speed: {speech.rate.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speech.rate}
            onChange={(e) => speech.setRate(parseFloat(e.target.value))}
            className="w-full accent-voice"
          />
        </div>
      )}
    </div>
  );
}
