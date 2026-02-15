import { useEffect } from "react";

export const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/** Display symbol for the platform modifier key */
export const modKey = isMac ? "⌘" : "Ctrl";

/** Map digit keys to their KeyboardEvent.code for layout-independent matching */
const digitCodes: Record<string, string> = {
  "0": "Digit0", "1": "Digit1", "2": "Digit2", "3": "Digit3", "4": "Digit4",
  "5": "Digit5", "6": "Digit6", "7": "Digit7", "8": "Digit8", "9": "Digit9",
};

export type Shortcut = {
  /** The key to match (e.g. "1", "k", "/", "Enter", "Escape") */
  key: string;
  /** Require Cmd (Mac) / Ctrl (Win/Linux) */
  mod?: boolean;
  /** Require Shift */
  shift?: boolean;
  /** Allow firing even when an input/textarea is focused */
  allowInInputs?: boolean;
  /** Handler */
  action: () => void;
};

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const inInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      for (const s of shortcuts) {
        const modPressed = isMac ? e.metaKey : e.ctrlKey;
        if (s.mod && !modPressed) continue;
        if (!s.mod && modPressed) continue;
        if (s.shift && !e.shiftKey) continue;
        if (!s.shift && e.shiftKey && s.mod) continue; // don't match Cmd+Shift+K when shortcut is Cmd+K
        const keyMatch =
          e.key.toLowerCase() === s.key.toLowerCase() ||
          e.key === s.key ||
          (digitCodes[s.key] != null && e.code === digitCodes[s.key]);
        if (!keyMatch) continue;
        if (inInput && !s.allowInInputs) continue;

        e.preventDefault();
        e.stopPropagation();
        s.action();
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts]);
}
