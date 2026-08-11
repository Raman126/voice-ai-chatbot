import { useEffect, useRef } from "react";
import { Menu, Sparkles, Trash2 } from "lucide-react";
import MessageBubble from "./MessageBubble.jsx";
import LoadingIndicator from "./LoadingIndicator.jsx";

export default function ChatWindow({
  messages,
  isGenerating,
  speech,
  onRegenerate,
  onClearConversation,
  onOpenSidebar,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const lastAssistantIndex = [...messages].map((m) => m.role).lastIndexOf("assistant");

  return (
    <div className="flex flex-col h-full min-w-0">
      <header className="flex items-center justify-between px-4 py-3 border-b border-base-700 bg-base-900/80 glass">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-base-800"
            onClick={onOpenSidebar}
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-voice/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-voice-soft" />
            </div>
            <span className="font-display font-medium text-sm">AI Study Buddy</span>
          </div>
        </div>

        <button
          onClick={onClearConversation}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-red-400 transition-colors px-2 py-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear chat
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-signal/15 flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-signal-soft" />
            </div>
            <h2 className="font-display text-xl font-semibold mb-2">
              Talk to your AI assistant
            </h2>
            <p className="text-sm text-white/40 max-w-sm">
              Type a message or tap the microphone to speak. Your assistant remembers the
              conversation and can read its replies back to you.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto pb-4">
            {messages.map((message, idx) => (
              <MessageBubble
                key={message.id}
                message={message}
                speech={speech}
                isLast={message.role === "assistant" && idx === lastAssistantIndex}
                onRegenerate={onRegenerate}
              />
            ))}
            {isGenerating && <LoadingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}
