import { useRef, useState } from "react";
import { Send, Square } from "lucide-react";
import VoiceRecorder from "./VoiceRecorder.jsx";

export default function ChatInput({ onSend, onStopGenerating, isGenerating, disabled }) {
  const [value, setValue] = useState("");
  const [notice, setNotice] = useState(null);
  const textareaRef = useRef(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isGenerating) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  return (
    <div className="border-t border-base-700 bg-base-900 px-4 py-4">
      {notice && (
        <div className="max-w-3xl mx-auto mb-2 text-xs text-amber bg-amber/10 border border-amber/30 rounded-lg px-3 py-2">
          {notice}
        </div>
      )}

      <div className="max-w-3xl mx-auto flex items-end gap-2">
        <VoiceRecorder
          disabled={disabled || isGenerating}
          onTranscribed={(text) => {
            setValue((prev) => (prev ? `${prev} ${text}` : text));
            setNotice(null);
          }}
          onError={(msg) => setNotice(msg)}
        />

        <div className="flex-1 bg-base-800 border border-base-700 rounded-2xl px-4 py-2.5 focus-within:border-signal/60 transition-colors">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Message VoiceChat, or click the mic to speak..."
            disabled={disabled}
            className="w-full bg-transparent resize-none outline-none text-sm placeholder:text-white/30 max-h-40"
          />
        </div>

        {isGenerating ? (
          <button
            onClick={onStopGenerating}
            className="w-11 h-11 rounded-full bg-red-500/90 hover:bg-red-500 flex items-center justify-center transition-colors shrink-0"
            aria-label="Stop generating"
            title="Stop generating"
          >
            <Square className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={disabled || !value.trim()}
            className="w-11 h-11 rounded-full bg-signal hover:bg-signal-soft disabled:opacity-30 disabled:cursor-not-allowed
            flex items-center justify-center transition-colors shrink-0"
            aria-label="Send message"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </div>
      <p className="max-w-3xl mx-auto text-[11px] text-white/25 mt-2 px-1">
        Press Enter to send, Shift+Enter for a new line.
      </p>
    </div>
  );
}
