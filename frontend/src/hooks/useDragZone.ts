import { useCallback, useRef, useState } from "react";

type Options = {
  onDrop: (files: File[]) => void;
  /** Optional filter run during dragover. Return false to ignore the drag. */
  accept?: (e: DragEvent) => boolean;
};

export function useDragZone({ onDrop, accept }: Options) {
  const [dragActive, setDragActive] = useState(false);
  const counterRef = useRef(0);

  const onDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (accept && !accept(e.nativeEvent)) return;
      counterRef.current++;
      if (counterRef.current === 1) setDragActive(true);
    },
    [accept],
  );

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
    },
    [],
  );

  const onDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      counterRef.current = Math.max(0, counterRef.current - 1);
      if (counterRef.current === 0) setDragActive(false);
    },
    [],
  );

  const onDropHandler = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      counterRef.current = 0;
      setDragActive(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length) onDrop(files);
    },
    [onDrop],
  );

  return {
    dragActive,
    handlers: {
      onDragEnter,
      onDragOver,
      onDragLeave,
      onDrop: onDropHandler,
    },
  };
}
