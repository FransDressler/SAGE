import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Subject } from "../../lib/api";

type Props = {
  subject: Subject;
  onClick: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
};

export default function SubjectCard({ subject, onClick, onDelete, onRename }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(subject.name);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      if (btnRef.current?.contains(e.target as Node)) return;
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const handleRename = () => {
    if (name.trim() && name.trim() !== subject.name) {
      onRename(name.trim());
    }
    setRenaming(false);
  };

  return (
    <div
      className="subject-row relative py-4 px-2 cursor-pointer group hover:bg-stone-800/30 transition-colors"
      onClick={renaming ? undefined : onClick}
    >
      <div className="flex items-start justify-between mb-3">
        {renaming ? (
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") { setName(subject.name); setRenaming(false); } }}
            onClick={e => e.stopPropagation()}
            className="bg-stone-800 border border-stone-700 rounded px-2 py-1 text-bone-light text-lg font-medium w-full outline-none focus:border-stone-600"
          />
        ) : (
          <h3 className="sunset-text font-medium text-lg truncate pr-2 text-bone-light">{subject.name}</h3>
        )}
        <button
          ref={btnRef}
          onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className="text-stone-500 hover:text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity p-1 -mr-1"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-3 text-sm text-stone-500">
        <span>{subject.sourceCount} source{subject.sourceCount !== 1 ? "s" : ""}</span>
        <span className="text-stone-700">|</span>
        <span>{timeAgo(subject.updatedAt)}</span>
      </div>

      {menuOpen && btnRef.current && createPortal(
        <div
          ref={menuRef}
          className="fixed bg-stone-800 border border-stone-700 shadow-xl py-1 min-w-[120px]"
          style={{
            zIndex: 9999,
            top: btnRef.current.getBoundingClientRect().bottom + 4,
            right: window.innerWidth - btnRef.current.getBoundingClientRect().right,
          }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => { setMenuOpen(false); setRenaming(true); }}
            className="w-full text-left px-3 py-2 text-sm text-stone-300 hover:bg-stone-700 transition-colors"
          >
            Rename
          </button>
          <button
            onClick={() => { setMenuOpen(false); onDelete(); }}
            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-stone-700 transition-colors"
          >
            Delete
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
