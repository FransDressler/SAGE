import { memo } from "react";
import type { NodeProps } from "@xyflow/react";

const CATEGORY_HEX: Record<string, string> = {
  theory: "#3b82f6",
  person: "#f59e0b",
  event: "#f43f5e",
  term: "#78716c",
  process: "#22c55e",
  principle: "#a855f7",
  method: "#06b6d4",
};

function ClusterBackground({ data }: NodeProps) {
  const d = data as any;
  const color = CATEGORY_HEX[d.category] || CATEGORY_HEX.term;

  return (
    <div
      style={{
        width: d.width,
        height: d.height,
        backgroundColor: `${color}0D`,
        border: `1px solid ${color}28`,
        borderRadius: 16,
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 8,
          left: 12,
          fontSize: 10,
          fontFamily: "'Courier Prime', monospace",
          color: `${color}80`,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 700,
        }}
      >
        {d.category}
      </span>
    </div>
  );
}

export default memo(ClusterBackground);
