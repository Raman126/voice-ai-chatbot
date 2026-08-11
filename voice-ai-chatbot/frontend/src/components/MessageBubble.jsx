import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, RotateCcw, User, Sparkles } from "lucide-react";
import VoicePlayer from "./VoicePlayer.jsx";

function formatTimestamp(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessageBubble({ message, speech, isLast, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`flex gap-3 px-4 py-4 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5
        ${isUser ? "bg-signal/20" : "bg-voice/20"}`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-signal-soft" />
        ) : (
          <Sparkles className="w-4 h-4 text-voice-soft" />
        )}
      </div>

      <div className={`flex flex-col max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${
            isUser
              ? "bg-signal text-white rounded-tr-sm"
              : "bg-base-800 border border-base-700 rounded-tl-sm"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-pre:my-2">
              <ReactMarkdown
                components={{
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ borderRadius: "0.75rem", fontSize: "0.8rem" }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-base-700 px-1.5 py-0.5 rounded text-xs" {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 px-1">
          <span className="text-[11px] text-white/30">{formatTimestamp(message.timestamp)}</span>

          {!isUser && (
            <>
              <button
                onClick={handleCopy}
                className="p-1 rounded hover:bg-base-700 text-white/40 hover:text-white/80 transition-colors"
                aria-label="Copy response"
                title="Copy"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-voice" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>

              {isLast && (
                <button
                  onClick={onRegenerate}
                  className="p-1 rounded hover:bg-base-700 text-white/40 hover:text-white/80 transition-colors"
                  aria-label="Regenerate response"
                  title="Regenerate"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}

              <VoicePlayer messageId={message.id} text={message.content} speech={speech} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
