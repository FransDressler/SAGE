import { useMemo, useState, useCallback, useRef } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  addEdge,
  type Node,
  type Edge,
  type NodeTypes,
  type Connection,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ConceptNode from "./mindmap/ConceptNode";
import { layoutGraph } from "./mindmap/layout";
import MindmapEditPopup from "./mindmap/MindmapEditPopup";
import AddNodeForm from "./mindmap/AddNodeForm";
import NodeContextMenu from "./mindmap/NodeContextMenu";
import EdgeContextMenu from "./mindmap/EdgeContextMenu";
import { saveMindmap, aiEditMindmap } from "../../../lib/api";

type ConceptNodeData = {
  id: string;
  label: string;
  description: string;
  category: string;
  importance: "high" | "medium" | "low";
  sources: { file: string; page?: number }[];
};

type ConceptEdgeData = {
  source: string;
  target: string;
  label: string;
  weight: number;
};

type MindmapData = {
  nodes: ConceptNodeData[];
  edges: ConceptEdgeData[];
  generatedAt: number;
  sourceCount: number;
};

type Props = {
  data: MindmapData;
  topic: string;
  toolId?: string;
  subjectId?: string;
  onClose: () => void;
  onChatAbout?: () => void;
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

  return layoutGraph(rawNodes, rawEdges, "TB");
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const CATEGORIES = ["theory", "person", "event", "term", "process", "principle", "method"];
const CAT_COLORS: Record<string, string> = {
  theory: "bg-blue-500",
  person: "bg-amber-500",
  event: "bg-rose-500",
  term: "bg-stone-500",
  process: "bg-green-500",
  principle: "bg-purple-500",
  method: "bg-cyan-500",
};

type HistoryEntry = { nodes: Node[]; edges: Edge[] };
const MAX_HISTORY = 20;

export default function MindmapPlayer({ data, topic, toolId, subjectId, onClose, onChatAbout }: Props) {
  const [search, setSearch] = useState("");
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => buildFlowGraph(data), [data]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Editing state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiEditOpen, setAiEditOpen] = useState(false);
  const [aiEditLoading, setAiEditLoading] = useState(false);
  const [addNodeOpen, setAddNodeOpen] = useState(false);
  const [nodeMenu, setNodeMenu] = useState<{ nodeId: string; data: any; position: { x: number; y: number } } | null>(null);
  const [edgeMenu, setEdgeMenu] = useState<{ edgeId: string; label: string; weight: number; position: { x: number; y: number } } | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [aiEditError, setAiEditError] = useState<string | null>(null);

  // Undo/redo
  const historyRef = useRef<HistoryEntry[]>([{ nodes: initialNodes, edges: initialEdges }]);
  const historyIndexRef = useRef(0);

  const pushHistory = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    const idx = historyIndexRef.current;
    historyRef.current = historyRef.current.slice(0, idx + 1);
    historyRef.current.push({ nodes: newNodes, edges: newEdges });
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
    else historyIndexRef.current = historyRef.current.length - 1;
  }, []);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const entry = historyRef.current[historyIndexRef.current];
    setNodes(entry.nodes);
    setEdges(entry.edges);
    setHasUnsavedChanges(true);
  }, [setNodes, setEdges]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const entry = historyRef.current[historyIndexRef.current];
    setNodes(entry.nodes);
    setEdges(entry.edges);
    setHasUnsavedChanges(true);
  }, [setNodes, setEdges]);

  // Extract current MindmapData from React Flow state
  const getCurrentData = useCallback((): MindmapData => {
    return {
      nodes: nodes.map((n) => ({
        id: n.id,
        label: (n.data as any).label || "",
        description: (n.data as any).description || "",
        category: (n.data as any).category || "term",
        importance: (n.data as any).importance || "medium",
        sources: (n.data as any).sources || [],
      })),
      edges: edges.map((e) => ({
        source: e.source,
        target: e.target,
        label: typeof e.label === "string" ? e.label : "relates-to",
        weight: (e.data as any)?.weight ?? 0.5,
      })),
      generatedAt: data.generatedAt,
      sourceCount: data.sourceCount,
    };
  }, [nodes, edges, data.generatedAt, data.sourceCount]);

  const categories = useMemo(() => {
    const cats = new Set(data.nodes.map((n) => n.category));
    return CATEGORIES.filter((c) => cats.has(c));
  }, [data]);

  const handleSearch = useCallback(
    (term: string) => {
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
    },
    [setNodes]
  );

  // Edge creation
  const onConnect = useCallback(
    (connection: Connection) => {
      // Prevent duplicate edges
      const exists = edges.some(
        (e) => e.source === connection.source && e.target === connection.target
      );
      if (exists) return;

      setEdges((eds) => {
        const newEdges = addEdge(
          {
            ...connection,
            label: "relates-to",
            data: { weight: 0.5 },
            style: { stroke: "#57534e", strokeWidth: 2 },
            labelStyle: { fill: "#a8a29e", fontSize: 10, fontFamily: "'Courier Prime', monospace" },
            labelBgStyle: { fill: "#1c1917", fillOpacity: 0.8 },
          },
          eds
        );
        pushHistory(nodes, newEdges);
        return newEdges;
      });
      setHasUnsavedChanges(true);
    },
    [setEdges, edges, nodes, pushHistory]
  );

  // Add node
  const handleAddNode = useCallback(
    (nodeData: { label: string; description: string; category: string; importance: "high" | "medium" | "low" }) => {
      const id = slugify(nodeData.label) || `node-${Date.now()}`;
      const newNode: Node = {
        id,
        type: "concept",
        position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
        data: { ...nodeData, sources: [] },
      };
      setNodes((prev) => {
        const updated = [...prev, newNode];
        pushHistory(updated, edges);
        return updated;
      });
      setAddNodeOpen(false);
      setHasUnsavedChanges(true);
    },
    [setNodes, edges, pushHistory]
  );

  // Edit node
  const handleEditNode = useCallback(
    (nodeId: string, nodeData: { label: string; description: string; category: string; importance: "high" | "medium" | "low" }) => {
      setNodes((prev) => {
        const updated = prev.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, ...nodeData } }
            : n
        );
        pushHistory(updated, edges);
        return updated;
      });
      setHasUnsavedChanges(true);
    },
    [setNodes, edges, pushHistory]
  );

  // Delete node
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((prev) => {
        const updated = prev.filter((n) => n.id !== nodeId);
        const updatedEdges = edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
        setEdges(updatedEdges);
        pushHistory(updated, updatedEdges);
        return updated;
      });
      setHasUnsavedChanges(true);
    },
    [setNodes, setEdges, edges, pushHistory]
  );

  // Edit edge
  const handleEditEdge = useCallback(
    (edgeId: string, label: string, weight: number) => {
      setEdges((prev) => {
        const updated = prev.map((e) =>
          e.id === edgeId
            ? {
                ...e,
                label,
                data: { ...e.data, weight },
                style: { stroke: "#57534e", strokeWidth: Math.max(1, weight * 3) },
                animated: weight > 0.7,
              }
            : e
        );
        pushHistory(nodes, updated);
        return updated;
      });
      setHasUnsavedChanges(true);
    },
    [setEdges, nodes, pushHistory]
  );

  // Delete edge
  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((prev) => {
        const updated = prev.filter((e) => e.id !== edgeId);
        pushHistory(nodes, updated);
        return updated;
      });
      setHasUnsavedChanges(true);
    },
    [setEdges, nodes, pushHistory]
  );

  // Node context menu
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setEdgeMenu(null);
      setNodeMenu({
        nodeId: node.id,
        data: node.data,
        position: { x: event.clientX, y: event.clientY },
      });
    },
    []
  );

  // Edge context menu
  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      setNodeMenu(null);
      setEdgeMenu({
        edgeId: edge.id,
        label: typeof edge.label === "string" ? edge.label : "",
        weight: (edge.data as any)?.weight ?? 0.5,
        position: { x: event.clientX, y: event.clientY },
      });
    },
    []
  );

  // Save
  const handleSave = useCallback(async () => {
    if (!subjectId || !toolId || saving) return;
    setSaving(true);
    setSaveStatus("idle");
    try {
      const currentData = getCurrentData();
      await saveMindmap(subjectId, toolId, currentData);
      setHasUnsavedChanges(false);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (e) {
      console.error("[MindmapPlayer] save failed:", e);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setSaving(false);
    }
  }, [subjectId, toolId, saving, getCurrentData]);

  // AI Edit
  const handleAiEdit = useCallback(
    async (instruction: string, model?: { provider?: string; model?: string }) => {
      if (!subjectId) return;
      setAiEditLoading(true);
      try {
        const currentData = getCurrentData();
        const res = await aiEditMindmap(subjectId, toolId || "", instruction, currentData, model);
        const { nodes: newFlowNodes, edges: newFlowEdges } = buildFlowGraph(res.data);
        setNodes(newFlowNodes);
        setEdges(newFlowEdges);
        pushHistory(newFlowNodes, newFlowEdges);
        setHasUnsavedChanges(!toolId); // AI edit auto-saves if toolId provided
        setAiEditOpen(false);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "AI edit failed";
        setAiEditError(msg);
        setTimeout(() => setAiEditError(null), 5000);
      } finally {
        setAiEditLoading(false);
      }
    },
    [subjectId, toolId, getCurrentData, setNodes, setEdges, pushHistory]
  );

  // Close handler
  const handleClose = useCallback(() => {
    if (hasUnsavedChanges && subjectId && toolId) {
      const confirmed = window.confirm("You have unsaved changes. Save before closing?");
      if (confirmed) {
        handleSave().then(onClose);
        return;
      }
    }
    onClose();
  }, [hasUnsavedChanges, subjectId, toolId, handleSave, onClose]);

  const canSave = !!subjectId && !!toolId;

  return (
    <div className="relative h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-stone-800 shrink-0 bg-stone-900/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-bold text-cyan-400 shrink-0">M</span>
          <span className="text-sm text-stone-300 truncate">{topic}</span>
          <span className="text-[10px] text-stone-600 shrink-0">
            {nodes.length} nodes / {edges.length} edges
          </span>
          {hasUnsavedChanges && (
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
          )}
          {saveStatus === "saved" && (
            <span className="text-[10px] text-green-400 shrink-0">Saved</span>
          )}
          {saveStatus === "error" && (
            <span className="text-[10px] text-red-400 shrink-0">Save failed</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search..."
            className="w-36 bg-stone-900 border border-stone-800 rounded-lg px-2 py-1 text-xs text-stone-300 placeholder:text-stone-600 outline-none focus:border-stone-600"
          />
          {onChatAbout && (
            <button onClick={onChatAbout} className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors" title="Chat about this">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
            </button>
          )}
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1.5 px-4 py-1.5 border-b border-stone-800/50 bg-stone-900/60 shrink-0 z-10">
        <button
          onClick={() => setAddNodeOpen(true)}
          className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-stone-100 transition-colors"
        >
          + Node
        </button>
        <button
          onClick={() => setAiEditOpen(true)}
          className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-cyan-900/40 text-cyan-300 hover:bg-cyan-800/40 transition-colors"
        >
          AI Edit
        </button>
        {canSave && (
          <button
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-stone-800 text-stone-300 hover:bg-stone-700 transition-colors disabled:opacity-40 disabled:cursor-default"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        )}
        <button
          onClick={undo}
          disabled={!canUndo}
          className="px-2 py-1 rounded-md text-[11px] text-stone-400 hover:bg-stone-800 transition-colors disabled:opacity-30 disabled:cursor-default"
          title="Undo"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="px-2 py-1 rounded-md text-[11px] text-stone-400 hover:bg-stone-800 transition-colors disabled:opacity-30 disabled:cursor-default"
          title="Redo"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
          </svg>
        </button>
        <span className="text-[10px] text-stone-600 ml-auto">Right-click nodes/edges to edit</span>
      </div>

      {/* Error toast */}
      {aiEditError && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-red-900/90 text-red-100 px-4 py-2 rounded-lg text-xs z-50 border border-red-700">
          {aiEditError}
        </div>
      )}

      {/* Graph */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
          onPaneClick={() => { setNodeMenu(null); setEdgeMenu(null); }}
          nodeTypes={nodeTypes}
          connectionLineStyle={{ stroke: "#57534e", strokeWidth: 2 }}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          className="bg-stone-900"
          deleteKeyCode={["Backspace", "Delete"]}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#292524" />
          <Controls
            className="!bg-stone-900 !border-stone-800 !rounded-lg !shadow-lg [&>button]:!bg-stone-800 [&>button]:!border-stone-700 [&>button]:!text-stone-400 [&>button:hover]:!bg-stone-700"
            showInteractive={false}
          />
          <MiniMap
            nodeColor={(n) => {
              const cat = (n.data as any)?.category || "term";
              const map: Record<string, string> = {
                theory: "#3b82f6", person: "#f59e0b", event: "#f43f5e",
                term: "#78716c", process: "#22c55e", principle: "#a855f7", method: "#06b6d4",
              };
              return map[cat] || "#78716c";
            }}
            className="!bg-stone-900/80 !border-stone-800 !rounded-lg"
            maskColor="rgba(0,0,0,0.6)"
          />
        </ReactFlow>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5 z-10">
          {categories.map((cat) => (
            <span key={cat} className="flex items-center gap-1 text-[10px] text-stone-500">
              <span className={`w-2 h-2 rounded-full ${CAT_COLORS[cat] || "bg-stone-500"}`} />
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Popups / Menus */}
      {aiEditOpen && (
        <MindmapEditPopup
          onSubmit={handleAiEdit}
          onClose={() => setAiEditOpen(false)}
          loading={aiEditLoading}
        />
      )}
      {addNodeOpen && (
        <AddNodeForm
          onAdd={handleAddNode}
          onClose={() => setAddNodeOpen(false)}
        />
      )}
      {nodeMenu && (
        <NodeContextMenu
          nodeId={nodeMenu.nodeId}
          nodeData={nodeMenu.data}
          position={nodeMenu.position}
          onEdit={handleEditNode}
          onDelete={handleDeleteNode}
          onClose={() => setNodeMenu(null)}
        />
      )}
      {edgeMenu && (
        <EdgeContextMenu
          edgeId={edgeMenu.edgeId}
          edgeLabel={edgeMenu.label}
          edgeWeight={edgeMenu.weight}
          position={edgeMenu.position}
          onEdit={handleEditEdge}
          onDelete={handleDeleteEdge}
          onClose={() => setEdgeMenu(null)}
        />
      )}
    </div>
  );
}
