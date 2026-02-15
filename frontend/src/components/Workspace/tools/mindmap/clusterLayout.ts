import dagre from "dagre";
import type { Node, Edge } from "@xyflow/react";

const NODE_WIDTH = 200;
const NODE_HEIGHT = 60;
const CLUSTER_PADDING = 40;
const CLUSTER_GAP = 350;
const MAX_NUDGE_PX = 40;

/**
 * Category-clustered layout:
 * 1. Group nodes by category
 * 2. Arrange clusters on a circle
 * 3. Run Dagre within each cluster for clean hierarchy
 * 4. Nudge cross-cluster boundary nodes toward connected clusters (capped)
 * 5. Compute cluster bounding boxes from final positions
 */
export function clusterLayoutGraph(
  nodes: Node[],
  edges: Edge[]
): { nodes: Node[]; edges: Edge[]; clusterBounds: ClusterBounds[] } {
  if (nodes.length === 0) return { nodes, edges, clusterBounds: [] };

  // 1. Partition nodes by category
  const clusters = new Map<string, Node[]>();
  for (const node of nodes) {
    const cat = (node.data as any)?.category || "term";
    if (!clusters.has(cat)) clusters.set(cat, []);
    clusters.get(cat)!.push(node);
  }

  const clusterKeys = Array.from(clusters.keys());
  const clusterCount = clusterKeys.length;

  // 2. Assign cluster center positions on a circle
  const avgClusterSize = nodes.length / Math.max(1, clusterCount);
  const radius = Math.max(
    CLUSTER_GAP,
    CLUSTER_GAP * clusterCount / (2 * Math.PI) + avgClusterSize * 15
  );

  const clusterCenters = new Map<string, { x: number; y: number }>();
  if (clusterCount === 1) {
    clusterCenters.set(clusterKeys[0], { x: 0, y: 0 });
  } else {
    for (let i = 0; i < clusterCount; i++) {
      const angle = (2 * Math.PI * i) / clusterCount - Math.PI / 2;
      clusterCenters.set(clusterKeys[i], {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      });
    }
  }

  // 3. Build category lookup
  const nodeCategory = new Map<string, string>();
  for (const node of nodes) {
    nodeCategory.set(node.id, (node.data as any)?.category || "term");
  }

  // 4. Run Dagre within each cluster and position nodes
  const posMap = new Map<string, { x: number; y: number }>();
  const nodeById = new Map<string, Node>();

  for (const [cat, clusterNodes] of clusters) {
    const center = clusterCenters.get(cat)!;
    const clusterNodeIds = new Set(clusterNodes.map((n) => n.id));

    const intraEdges = edges.filter(
      (e) => clusterNodeIds.has(e.source) && clusterNodeIds.has(e.target)
    );

    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: "TB", nodesep: 60, ranksep: 80 });

    for (const node of clusterNodes) {
      g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    }
    for (const edge of intraEdges) {
      g.setEdge(edge.source, edge.target);
    }

    dagre.layout(g);

    // Compute local bounding box from Dagre center-based positions
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const node of clusterNodes) {
      const pos = g.node(node.id);
      if (pos) {
        minX = Math.min(minX, pos.x - NODE_WIDTH / 2);
        minY = Math.min(minY, pos.y - NODE_HEIGHT / 2);
        maxX = Math.max(maxX, pos.x + NODE_WIDTH / 2);
        maxY = Math.max(maxY, pos.y + NODE_HEIGHT / 2);
      }
    }

    // Guard against degenerate case (all nodes fell through to fallback)
    if (minX === Infinity) {
      minX = -NODE_WIDTH / 2;
      maxX = NODE_WIDTH / 2;
      minY = -NODE_HEIGHT / 2;
      maxY = NODE_HEIGHT / 2;
    }

    const localCenterX = (minX + maxX) / 2;
    const localCenterY = (minY + maxY) / 2;

    for (const node of clusterNodes) {
      const pos = g.node(node.id);
      const finalPos = pos
        ? {
            x: pos.x - localCenterX + center.x - NODE_WIDTH / 2,
            y: pos.y - localCenterY + center.y - NODE_HEIGHT / 2,
          }
        : { x: center.x, y: center.y };

      posMap.set(node.id, finalPos);
      nodeById.set(node.id, node);
    }
  }

  // 5. Nudge cross-cluster boundary nodes (capped per node)
  const nudgeAccum = new Map<string, { dx: number; dy: number }>();

  for (const edge of edges) {
    const srcCat = nodeCategory.get(edge.source);
    const tgtCat = nodeCategory.get(edge.target);
    if (!srcCat || !tgtCat || srcCat === tgtCat) continue;

    const srcPos = posMap.get(edge.source);
    const tgtPos = posMap.get(edge.target);
    if (!srcPos || !tgtPos) continue;

    const dx = tgtPos.x - srcPos.x;
    const dy = tgtPos.y - srcPos.y;
    const nudgeFactor = 0.08;

    const srcNudge = nudgeAccum.get(edge.source) || { dx: 0, dy: 0 };
    srcNudge.dx += dx * nudgeFactor;
    srcNudge.dy += dy * nudgeFactor;
    nudgeAccum.set(edge.source, srcNudge);

    const tgtNudge = nudgeAccum.get(edge.target) || { dx: 0, dy: 0 };
    tgtNudge.dx -= dx * nudgeFactor;
    tgtNudge.dy -= dy * nudgeFactor;
    nudgeAccum.set(edge.target, tgtNudge);
  }

  // Apply capped nudge
  for (const [id, nudge] of nudgeAccum) {
    const mag = Math.sqrt(nudge.dx ** 2 + nudge.dy ** 2);
    if (mag > MAX_NUDGE_PX) {
      nudge.dx *= MAX_NUDGE_PX / mag;
      nudge.dy *= MAX_NUDGE_PX / mag;
    }
    const pos = posMap.get(id);
    if (pos) {
      pos.x += nudge.dx;
      pos.y += nudge.dy;
    }
  }

  // 6. Build final nodes and compute cluster bounding boxes from FINAL positions
  const finalNodes: Node[] = [];
  const clusterBounds: ClusterBounds[] = [];

  for (const [cat, clusterNodes] of clusters) {
    let bMinX = Infinity, bMinY = Infinity, bMaxX = -Infinity, bMaxY = -Infinity;

    for (const node of clusterNodes) {
      const pos = posMap.get(node.id)!;
      finalNodes.push({
        ...node,
        position: { x: pos.x, y: pos.y },
      });

      bMinX = Math.min(bMinX, pos.x);
      bMinY = Math.min(bMinY, pos.y);
      bMaxX = Math.max(bMaxX, pos.x + NODE_WIDTH);
      bMaxY = Math.max(bMaxY, pos.y + NODE_HEIGHT);
    }

    if (bMinX !== Infinity) {
      clusterBounds.push({
        category: cat,
        x: bMinX - CLUSTER_PADDING,
        y: bMinY - CLUSTER_PADDING,
        width: bMaxX - bMinX + CLUSTER_PADDING * 2,
        height: bMaxY - bMinY + CLUSTER_PADDING * 2,
      });
    }
  }

  return { nodes: finalNodes, edges, clusterBounds };
}

export type ClusterBounds = {
  category: string;
  x: number;
  y: number;
  width: number;
  height: number;
};
