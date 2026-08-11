import { useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import ChatInput from "./components/ChatInput.jsx";
import { sendChatMessage, checkHealth, ApiError } from "./services/api.js";
import { useSpeechSynthesis } from "./hooks/useSpeechSynthesis.js";

function newId() {
  return crypto.randomUUID();
}

function createConversation() {
  return { id: newId(), title: "New chat", messages: [] };
}

export default function App() {
  const [conversations, setConversations] = useState(() => [createConversation()]);
  const [activeId, setActiveId] = useState(() => conversations[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);
  const abortRef = useRef(false);

  const speech = useSpeechSynthesis();

  useEffect(() => {
    checkHealth().then(setBackendOnline);
  }, []);

  const activeConversation =
    conversations.find((c) => c.id === activeId) ?? conversations[0];

  const updateActiveMessages = (updater) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? { ...c, messages: updater(c.messages) } : c))
    );
  };

  const setConversationTitle = (id, firstUserMessage) => {
    const title =
      firstUserMessage.length > 40 ? `${firstUserMessage.slice(0, 40)}...` : firstUserMessage;
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
  };

  async function requestAssistantReply(historyForApi) {
    setIsGenerating(true);
    abortRef.current = false;

    try {
      const lastUserMessage = historyForApi[historyForApi.length - 1];
      const priorHistory = historyForApi.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { reply } = await sendChatMessage(lastUserMessage.content, priorHistory);

      if (abortRef.current) return; // user hit "stop" before the response arrived

      updateActiveMessages((msgs) => [
        ...msgs,
        { id: newId(), role: "assistant", content: reply, timestamp: new Date().toISOString() },
      ]);
    } catch (err) {
      if (abortRef.current) return;
      const message =
        err instanceof ApiError ? err.message : "Something went wrong talking to the AI.";
      updateActiveMessages((msgs) => [
        ...msgs,
        {
          id: newId(),
          role: "assistant",
          content: `⚠️ ${message}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  }

  const handleSend = (text) => {
    const userMessage = { id: newId(), role: "user", content: text, timestamp: new Date().toISOString() };

    if (activeConversation.messages.length === 0) {
      setConversationTitle(activeConversation.id, text);
    }

    const nextMessages = [...activeConversation.messages, userMessage];
    updateActiveMessages(() => nextMessages);
    requestAssistantReply(nextMessages);
  };

  const handleRegenerate = () => {
    const msgs = activeConversation.messages;
    const lastUserIdx = [...msgs].map((m) => m.role).lastIndexOf("user");
    if (lastUserIdx === -1) return;

    const truncated = msgs.slice(0, lastUserIdx + 1);
    updateActiveMessages(() => truncated);
    requestAssistantReply(truncated);
  };

  const handleStopGenerating = () => {
    abortRef.current = true;
    setIsGenerating(false);
  };

  const handleNewChat = () => {
    const conv = createConversation();
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id) => {
    setActiveId(id);
    setSidebarOpen(false);
  };

  const handleDeleteConversation = (id) => {
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      if (remaining.length === 0) {
        const fresh = createConversation();
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) setActiveId(remaining[0].id);
      return remaining;
    });
  };

  const handleClearConversation = () => {
    updateActiveMessages(() => []);
  };

  return (
    <div className="flex h-screen bg-base-950 overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversation.id}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {!backendOnline && (
          <div className="bg-red-500/10 border-b border-red-500/30 text-red-300 text-xs text-center py-2">
            Can't reach the backend at the configured API URL. Make sure the FastAPI server is
            running.
          </div>
        )}

        <ChatWindow
          messages={activeConversation.messages}
          isGenerating={isGenerating}
          speech={speech}
          onRegenerate={handleRegenerate}
          onClearConversation={handleClearConversation}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <ChatInput
          onSend={handleSend}
          onStopGenerating={handleStopGenerating}
          isGenerating={isGenerating}
          disabled={!backendOnline}
        />
      </main>
    </div>
  );
}
