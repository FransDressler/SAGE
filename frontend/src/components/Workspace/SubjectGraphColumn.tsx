import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
  type NodeTypes,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useSubject } from "../../context/SubjectContext";
import CollapsedColumn from "./CollapsedColumn";
import ConceptNode from "./tools/mindmap/ConceptNode";
import { forceLayoutGraph } from "./tools/mindmap/forceLayout";
import MindmapEditPopup from "./tools/mindmap/MindmapEditPopup";
import {
  getSubjectGraph,
  rebuildSubjectGraph,
  aiEditSubjectGraph,
  connectSubjectGraphStream,
  type SubjectGraphEvent,
} from "../../lib/api";

type MindmapData = {
  nodes: Array<{
    id: string;
    label: string;
    description: string;
    category: string;
    importance: "high" | "medium" | "low";
    sources: { file: string; page?: number }[];
  }>;
  edges: Array<{
    source: string;
    target: string;
    label: string;
    weight: number;
  }>;
  generatedAt: number;
  sourceCount: number;
};

const CATEGORIES = ["theory", "person", "event", "term", "process", "principle", "method"] as const;
const CAT_COLORS: Record<string, string> = {
  theory: "#3b82f6",
  person: "#f59e0b",
  event: "#f43f5e",
  term: "#78716c",
  process: "#22c55e",
  principle: "#a855f7",
  method: "#06b6d4",
};

const nodeTypes: NodeTypes = { concept: ConceptNode };

function buildFlowGraph(data: MindmapData): { nodes: Node[]; edges: Edge[] } {
  const rawNodes: Node[] = data.nodes.map((n) => ({
    id: n.id,
    type: "concept",
    position: { x: 0, y: 0 },
    data: {
      label: n.label,
      description: n.description,
      category: n.category,
      importance: n.importance,
      sources: n.sources,
    },
  }));

  const nodeIds = new Set(rawNodes.map((n) => n.id));
  const rawEdges: Edge[] = data.edges
    .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
    .map((e, i) => ({
      id: `e-${e.source}-${e.target}-${i}`,
      source: e.source,
      target: e.target,
      label: e.label,
      data: { weight: e.weight },
      style: { stroke: "#57534e", strokeWidth: Math.max(1, e.weight * 3) },
      labelStyle: { fill: "#a8a29e", fontSize: 10, fontFamily: "'Courier Prime', monospace" },
      labelBgStyle: { fill: "#1c1917", fillOpacity: 0.8 },
      animated: e.weight > 0.7,
    }));

  return forceLayoutGraph(rawNodes, rawEdges);
}

type Props = {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onChatAbout?: (ctx: { tool: string; topic: string; content: string }) => void;
};

export default function SubjectGraphColumn({ collapsed, onToggleCollapse, onChatAbout }: Props) {
  const { subject, sources } = useSubject();
  const [graphData, setGraphData] = useState<MindmapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [aiEditOpen, setAiEditOpen] = useState(false);
  const [aiEditLoading, setAiEditLoading] = useState(false);
  const wsRef = useRef<{ close: () => void } | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Fetch graph on mount / subject change
  useEffect(() => {
    if (!subject) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getSubjectGraph(subject.id);
        if (cancelled) return;
        if (res.data) {
          setGraphData(res.data);
          const { nodes: n, edges: e } = buildFlowGraph(res.data);
          setNodes(n);
          setEdges(e);
        } else {
          setGraphData(null);
        }
      } catch {
        if (!cancelled) setGraphData(null);
      }
    })();
    return () => { cancelled = true; };
  }, [subject?.id]);

  // Listen for WS updates
  useEffect(() => {
    if (!subject) return;
    const conn = connectSubjectGraphStream(subject.id, (ev: SubjectGraphEvent) => {
      if (ev.type === "phase") {
        setPhase(ev.detail || ev.value);
        setLoading(true);
      } else if (ev.type === "graph") {
        setGraphData(ev.data);
        const { nodes: n, edges: e } = buildFlowGraph(ev.data);
        setNodes(n);
        setEdges(e);
      } else if (ev.type === "done") {
        setLoading(false);
        setPhase("");
      } else if (ev.type === "error") {
        setLoading(false);
        setPhase("");
        setError(ev.error);
        setTimeout(() => setError(null), 5000);
      }
    });
    wsRef.current = conn;
    return () => conn.close();
  }, [subject?.id]);

  const handleRebuild = useCallback(async () => {
    if (!subject || loading) return;
    setLoading(true);
    setPhase("Starting rebuild...");
    setError(null);
    try {
      await rebuildSubjectGraph(subject.id);
    } catch (e: any) {
      setError(e?.message || "Rebuild failed");
      setLoading(false);
      setPhase("");
    }
  }, [subject, loading]);

  const handleAiEdit = useCallback(async (instruction: string, model?: { provider?: string; model?: string }) => {
    if (!subject || !graphData) return;
    setAiEditLoading(true);
    try {
      const res = await aiEditSubjectGraph(subject.id, instruction, graphData, model);
      setGraphData(res.data);
      const { nodes: n, edges: e } = buildFlowGraph(res.data);
      setNodes(n);
      setEdges(e);
      setAiEditOpen(false);
    } catch (e: any) {
      setError(e?.message || "AI edit failed");
      setTimeout(() => setError(null), 5000);
    } finally {
      setAiEditLoading(false);
    }
  }, [subject, graphData]);

  const handleSearch = useCallback((term: string) => {
    setSearch(term);
    const lower = term.toLowerCase();
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        style: {
          ...n.style,
          opacity: !term || (n.data as any).label?.toLowerCase().includes(lower) ? 1 : 0.2,
        },
      }))
    );
  }, [setNodes]);

  const categories = useMemo(() => {
    if (!graphData) return [];
    const used = new Set(graphData.nodes.map((n) => n.category));
    return CATEGORIES.filter((c) => used.has(c));
  }, [graphData]);

  if (collapsed && onToggleCollapse) return <CollapsedColumn label="Graph" side="right" onExpand={onToggleCollapse} />;

  return (
    <div className="h-full min-h-0 min-w-0 overflow-hidden flex flex-col border-l border-stone-800 bg-stone-900/50">
      {/* Header — matches SourcesPanel / ToolsPanel pattern */}
      <div className="px-4 py-3 border-b border-stone-800 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {onToggleCollapse && (
            <button onClick={onToggleCollapse} className="p-1 rounded hover:bg-stone-800 text-stone-500 hover:text-stone-300 transition-colors" aria-label="Collapse Graph" title="Collapse Graph">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
            </button>
          )}
          <h2 className="text-sm font-medium text-stone-400 uppercase tracking-wider">Graph</h2>
          {graphData && (
            <span className="text-[10px] text-stone-600">{graphData.nodes.length}</span>
          )}
          {loading && (
            <div className="w-3 h-3 border-2 border-stone-600 border-t-stone-300 rounded-full animate-spin shrink-0" />
          )}
        </div>
        {graphData && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setAiEditOpen(true)}
              className="sunset-fill-btn border border-stone-500 text-[11px] text-stone-500 font-medium px-2.5 py-0.5"
            >
              AI Edit
            </button>
            <button
              onClick={handleRebuild}
              disabled={loading}
              className="sunset-fill-btn border border-stone-500 text-[11px] text-stone-500 font-medium px-2.5 py-0.5 disabled:opacity-50"
            >
              Rebuild
            </button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {loading && phase && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-stone-800 bg-stone-900/50">
          <div className="w-3 h-3 border-2 border-stone-600 border-t-stone-300 rounded-full animate-spin shrink-0" />
          <span className="text-xs text-stone-400">{phase}</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-3 mt-2 px-3 py-2 rounded-lg bg-red-900/30 border border-red-800/40 text-xs text-red-300">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-300">dismiss</button>
        </div>
      )}

      {/* Empty state — matches SourcesPanel empty state */}
      {!graphData && !loading && (
        <div className="flex flex-col items-center justify-center h-full text-stone-600 text-sm">
          <svg className="w-10 h-10 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
          <p>No knowledge graph yet</p>
          <p className="text-xs mt-1">
            {sources.length ? "Click below to build one" : "Add sources first"}
          </p>
          {sources.length > 0 && (
            <button
              onClick={handleRebuild}
              className="sunset-fill-btn mt-3 border border-stone-500 text-[11px] text-stone-500 font-medium px-2.5 py-0.5"
            >
              Build Graph
            </button>
          )}
        </div>
      )}

      {/* Graph view */}
      {graphData && (
        <>
          {/* Search bar */}
          <div className="px-3 py-2 border-b border-stone-800/50 shrink-0">
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Filter nodes..."
              className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-300 placeholder:text-stone-600 outline-none focus:border-stone-700"
            />
          </div>

          {/* ReactFlow graph */}
          <div className={`flex-1 relative ${loading ? "opacity-50 pointer-events-none" : ""}`}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.1}
              maxZoom={2}
              proOptions={{ hideAttribution: true }}
              className="bg-stone-900"
              nodesDraggable={!loading}
              nodesConnectable={false}
              elementsSelectable={!loading}
              panOnDrag
              zoomOnScroll
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#292524" />
              <Controls
                className="!bg-stone-900 !border-stone-800 !rounded-lg !shadow-lg [&>button]:!bg-stone-800 [&>button]:!border-stone-700 [&>button]:!text-stone-400 [&>button:hover]:!bg-stone-700"
                showInteractive={false}
              />
              <MiniMap
                nodeColor={(n) => CAT_COLORS[(n.data as any)?.category] || CAT_COLORS.term}
                className="!bg-stone-900/80 !border-stone-800 !rounded-lg"
                maskColor="rgba(0,0,0,0.6)"
              />
            </ReactFlow>

            {/* Legend */}
            {categories.length > 0 && (
              <div className="absolute bottom-4 left-4 flex flex-col gap-1 z-10 bg-stone-900/80 backdrop-blur-sm rounded-lg px-2.5 py-2 border border-stone-800/50">
                {categories.map((cat) => (
                  <div key={cat} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CAT_COLORS[cat] }} />
                    <span className="text-[10px] text-stone-400 capitalize">{cat}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* AI Edit popup */}
      {aiEditOpen && (
        <MindmapEditPopup
          onSubmit={handleAiEdit}
          onClose={() => setAiEditOpen(false)}
          loading={aiEditLoading}
        />
      )}
    </div>
  );
}
