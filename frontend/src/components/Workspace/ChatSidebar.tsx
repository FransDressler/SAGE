import { useState, useRef, useEffect } from "react";
import { useSubject } from "../../context/SubjectContext";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

type Props = {
  open: boolean;
  onClose: () => void;
  onNewChat: () => void;
};

export default function ChatSidebar({ open, onClose, onNewChat }: Props) {
  const { chats, activeChatId, setActiveChatId, renameChat, deleteChat } = useSubject();
  const [menuChatId, setMenuChatId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Focus rename input when entering rename mode
  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuChatId) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuChatId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuChatId]);

  const handleSelect = (chatId: string) => {
    setActiveChatId(chatId);
    onClose();
  };

  const handleRenameSubmit = async (chatId: string) => {
    const trimmed = renameValue.trim();
    setRenamingId(null);
    setRenameValue("");
    if (!trimmed) return;
    try {
      await renameChat(chatId, trimmed);
    } catch (e) {
      console.error("Failed to rename chat:", e);
    }
  };

  const handleDelete = async (chatId: string) => {
    const wasActive = activeChatId === chatId;
    setConfirmDeleteId(null);
    try {
      await deleteChat(chatId);
      if (wasActive) setActiveChatId(null);
    } catch (e) {
      console.error("Failed to delete chat:", e);
    }
  };

  const sorted = [...chats].sort((a, b) => (b.at ?? 0) - (a.at ?? 0));

  return (
    <div
      className={`absolute inset-y-0 left-0 z-30 flex transition-transform duration-200 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Sidebar panel */}
      <div className="w-72 h-full bg-stone-950 border-r border-stone-800 flex flex-col">
        {/* Header */}
        <div className="h-12 px-4 border-b border-stone-800 flex items-center justify-between shrink-0">
          <span className="text-sm font-medium text-bone">Chats</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { onNewChat(); onClose(); }}
              className="sunset-fill-btn border border-stone-500 text-[11px] text-stone-500 font-medium px-2.5 py-0.5"
            >
              + New
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-stone-800 text-stone-500 hover:text-stone-300 transition-colors"
              aria-label="Close sidebar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto custom-scroll">
          {sorted.length === 0 ? (
            <div className="px-4 py-8 text-center text-stone-600 text-sm">No chats yet</div>
          ) : (
            sorted.map((chat) => (
              <div
                key={chat.id}
                className={`group relative px-3 py-2.5 cursor-pointer border-b border-stone-900 transition-colors ${
                  chat.id === activeChatId
                    ? "bg-stone-800/60"
                    : "hover:bg-stone-900/80"
                }`}
                onClick={() => {
                  if (renamingId !== chat.id && confirmDeleteId !== chat.id) {
                    handleSelect(chat.id);
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setMenuChatId(menuChatId === chat.id ? null : chat.id);
                }}
              >
                {renamingId === chat.id ? (
                  <input
                    ref={renameInputRef}
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameSubmit(chat.id);
                      if (e.key === "Escape") { setRenamingId(null); setRenameValue(""); }
                    }}
                    onBlur={() => handleRenameSubmit(chat.id)}
                    onClick={(e) => e.stopPropagation()}
                    maxLength={60}
                    className="w-full bg-stone-900 border border-stone-600 rounded px-2 py-1 text-sm text-bone outline-none"
                  />
                ) : confirmDeleteId === chat.id ? (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs text-stone-400 flex-1">Delete this chat?</span>
                    <button
                      onClick={() => handleDelete(chat.id)}
                      className="text-xs px-2 py-0.5 bg-red-900/60 hover:bg-red-800/80 text-red-300 rounded transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-xs px-2 py-0.5 text-stone-500 hover:text-stone-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm text-bone truncate flex-1">
                        {chat.title || "Untitled"}
                      </span>
                      {/* 3-dot menu button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuChatId(menuChatId === chat.id ? null : chat.id);
                        }}
                        className="p-0.5 rounded text-stone-600 hover:text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="6" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="12" cy="18" r="1.5" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-xs text-stone-600 mt-0.5">
                      {chat.at ? timeAgo(chat.at) : ""}
                    </div>
                  </>
                )}

                {/* Context menu */}
                {menuChatId === chat.id && renamingId !== chat.id && confirmDeleteId !== chat.id && (
                  <div
                    ref={menuRef}
                    className="absolute right-2 top-8 z-40 bg-stone-800 border border-stone-700 rounded-lg shadow-lg py-1 min-w-[120px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setRenamingId(chat.id);
                        setRenameValue(chat.title || "");
                        setMenuChatId(null);
                      }}
                      className="w-full text-left px-3 py-1.5 text-sm text-stone-300 hover:bg-stone-700 transition-colors"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => {
                        setConfirmDeleteId(chat.id);
                        setMenuChatId(null);
                      }}
                      className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-stone-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Click-away backdrop */}
      <div className="flex-1 h-full" onClick={onClose} />
    </div>
  );
}
