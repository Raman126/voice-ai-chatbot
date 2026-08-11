export default function LoadingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3" aria-label="AI is typing">
      <span className="w-1.5 h-1.5 rounded-full bg-voice animate-bounce [animation-delay:-0.3s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-voice animate-bounce [animation-delay:-0.15s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-voice animate-bounce" />
    </div>
  );
}
