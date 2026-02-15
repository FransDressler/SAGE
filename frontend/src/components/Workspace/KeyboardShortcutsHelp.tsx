import { useEffect, useRef } from "react";
import { modKey } from "../../hooks/useKeyboardShortcuts";

const shortcuts = [
  { keys: [modKey, "Shift", "7"], label: "Toggle Sources panel" },
  { keys: [modKey, "Shift", "8"], label: "Toggle Chat panel" },
  { keys: [modKey, "Shift", "9"], label: "Toggle Tools panel" },
  { keys: [modKey, "Shift", "0"], label: "Toggle Graph panel" },
  { keys: [modKey, "Shift", "O"], label: "New chat" },
  { keys: [modKey, "K"], label: "Search" },
  { keys: [modKey, "Enter"], label: "Send message" },
  { keys: ["Esc"], label: "Stop generating / close viewer" },
  { keys: [modKey, "H"], label: "Show this help" },
];

export default function KeyboardShortcutsHelp({ onClose }: { onClose: () => void }) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800">
          <h2 className="text-bone-light font-semibold text-sm">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-stone-800 text-stone-500 hover:text-stone-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-3 space-y-2.5 max-h-[60vh] overflow-y-auto custom-scroll">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <span className="text-stone-400 text-sm">{s.label}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, j) => (
                  <kbd
                    key={j}
                    className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 bg-stone-800 border border-stone-700 rounded text-[11px] text-stone-300 font-mono"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-stone-800">
          <p className="text-stone-600 text-xs text-center">
            Press <kbd className="px-1 py-0.5 bg-stone-800 border border-stone-700 rounded text-[10px] text-stone-400 font-mono">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}
