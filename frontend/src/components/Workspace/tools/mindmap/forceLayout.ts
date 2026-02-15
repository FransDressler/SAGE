import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, forceX, forceY } from "d3-force";
import type { Node, Edge } from "@xyflow/react";

const NODE_BASE_WIDTH = 180;
const NODE_BASE_HEIGHT = 50;

interface SimNode {
  id: string;
  x: number;
  y: number;
  degree: number;
  radius: number;
}

interface SimLink {
  source: string;
  target: string;
  weight: number;
}

function nodeScale(degree: number, maxDegree: number): number {
  if (maxDegree <= 1) return 1;
  const ratio = degree / maxDegree;
  // Scale from 0.85 (leaf) to 1.6 (hub)
  return 0.85 + ratio * 0.75;
}

export function forceLayoutGraph(
  nodes: Node[],
  edges: Edge[]
): { nodes: Node[]; edges: Edge[] } {
  if (nodes.length === 0) return { nodes, edges };

  // Build degree map
  const degree = new Map<string, number>();
  for (const n of nodes) degree.set(n.id, 0);
  for (const e of edges) {
    degree.set(e.source, (degree.get(e.source) || 0) + 1);
    degree.set(e.target, (degree.get(e.target) || 0) + 1);
  }

  // Find the most-connected node to center on
  let maxDegree = 0;
  let centerId = nodes[0].id;
  for (const [id, d] of degree) {
    if (d > maxDegree) {
      maxDegree = d;
      centerId = id;
    }
  }

  const simNodes: SimNode[] = nodes.map((n) => {
    const deg = degree.get(n.id) || 0;
    const scale = nodeScale(deg, maxDegree);
    return {
      id: n.id,
      x: n.id === centerId ? 0 : (Math.random() - 0.5) * 500,
      y: n.id === centerId ? 0 : (Math.random() - 0.5) * 500,
      degree: deg,
      radius: (NODE_BASE_WIDTH * scale) / 2,
    };
  });

  const simLinks: SimLink[] = edges.map((e) => ({
    source: e.source,
    target: e.target,
    weight: (e.data as any)?.weight ?? 0.5,
  }));

  const nodeCount = simNodes.length;
  // Scale forces based on graph size — increased spacing
  const chargeStrength = nodeCount > 80 ? -1000 : nodeCount > 30 ? -750 : -550;
  const linkDistance = nodeCount > 80 ? 260 : nodeCount > 30 ? 220 : 180;

  const sim = forceSimulation(simNodes as any)
    .force(
      "link",
      forceLink(simLinks as any)
        .id((d: any) => d.id)
        .distance((d: any) => linkDistance / Math.max(0.3, d.weight))
        .strength((d: any) => 0.3 + d.weight * 0.5)
    )
    .force("charge", forceManyBody().strength(chargeStrength))
    .force("center", forceCenter(0, 0).strength(0.05))
    // Collision radius based on actual node size
    .force("collide", forceCollide((d: any) => d.radius + 20).strength(0.8))
    // Pull high-degree nodes toward center, push low-degree out
    .force(
      "radial-x",
      forceX(0).strength((d: any) => {
        const ratio = d.degree / Math.max(1, maxDegree);
        return 0.02 + ratio * 0.06;
      })
    )
    .force(
      "radial-y",
      forceY(0).strength((d: any) => {
        const ratio = d.degree / Math.max(1, maxDegree);
        return 0.02 + ratio * 0.06;
      })
    )
    .stop();

  // Run simulation synchronously
  const ticks = Math.min(300, 100 + nodeCount * 2);
  for (let i = 0; i < ticks; i++) sim.tick();

  const posMap = new Map<string, { x: number; y: number }>();
  for (const sn of simNodes) {
    posMap.set(sn.id, { x: (sn as any).x, y: (sn as any).y });
  }

  const positioned = nodes.map((node) => {
    const pos = posMap.get(node.id) || { x: 0, y: 0 };
    const deg = degree.get(node.id) || 0;
    const scale = nodeScale(deg, maxDegree);
    const w = NODE_BASE_WIDTH * scale;
    const h = NODE_BASE_HEIGHT * scale;
    return {
      ...node,
      data: { ...node.data, degree: deg, maxDegree },
      position: {
        x: pos.x - w / 2,
        y: pos.y - h / 2,
      },
    };
  });

  return { nodes: positioned, edges };
}
