import { MessageSquarePlus, MessageSquare, Trash2, Mic } from "lucide-react";

/**
 * Left-hand sidebar: new chat button + list of past conversations.
 * Conversations are lifted state from App.jsx (kept in memory for this demo;
 * see README "Future Improvements" for persisting them to a database).
 */
export default function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  isOpen,
  onClose,
}) {
  return (
    <>
      {/* Mobile overlay so the sidebar can sit above content on small screens */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:static z-30 md:z-auto top-0 left-0 h-full w-72 shrink-0
        bg-base-900 border-r border-base-700 flex flex-col transition-transform duration-200
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex items-center gap-2 px-4 py-5">
          <div className="w-8 h-8 rounded-lg bg-signal/20 flex items-center justify-center">
            <Mic className="w-4 h-4 text-signal-soft" />
          </div>
          <span className="font-display font-semibold text-lg">VoiceChat</span>
        </div>

        <div className="px-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-base-800
            hover:bg-base-700 border border-base-700 text-sm font-medium transition-colors"
          >
            <MessageSquarePlus className="w-4 h-4" />
            New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 mt-4 space-y-1">
          <p className="text-xs uppercase tracking-wider text-white/40 px-2 mb-2">
            Conversations
          </p>
          {conversations.length === 0 && (
            <p className="text-sm text-white/30 px-2">No conversations yet.</p>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm
              ${
                conv.id === activeConversationId
                  ? "bg-signal/15 text-white"
                  : "text-white/70 hover:bg-base-800"
              }`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
              <span className="truncate flex-1">{conv.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 transition-opacity"
                aria-label="Delete conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-base-700 text-xs text-white/30">
          Voice AI Chatbot &middot; built with FastAPI + React
        </div>
      </aside>
    </>
  );
}
