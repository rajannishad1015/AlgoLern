import { AlgorithmStep, GraphNode, GraphEdge } from '@/lib/types/algorithm';

// Union-Find helpers
function makeUF(ids: string[]): Record<string, string> {
  return Object.fromEntries(ids.map(id => [id, id]));
}

function find(parent: Record<string, string>, x: string): string {
  if (parent[x] !== x) parent[x] = find(parent, parent[x]);
  return parent[x];
}

function union(parent: Record<string, string>, rank: Record<string, number>, x: string, y: string): boolean {
  const rx = find(parent, x);
  const ry = find(parent, y);
  if (rx === ry) return false;
  if ((rank[rx] ?? 0) < (rank[ry] ?? 0)) parent[rx] = ry;
  else if ((rank[rx] ?? 0) > (rank[ry] ?? 0)) parent[ry] = rx;
  else { parent[ry] = rx; rank[rx] = (rank[rx] ?? 0) + 1; }
  return true;
}

export function generateKruskalSteps(nodes: GraphNode[], edges: GraphEdge[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const ids = nodes.map(n => n.id);
  const parent = makeUF(ids);
  const rank: Record<string, number> = {};
  const mst: string[] = []; // Edge IDs in MST

  // Sort edges by weight ascending
  const sorted = [...edges].sort((a, b) => (a.weight ?? 1) - (b.weight ?? 1));

  steps.push({
    id: steps.length, type: 'highlight', nodeIds: [], edgeIds: [],
    values: { mstEdges: [], totalWeight: 0 },
    description: `Kruskal's MST: Sorted ${edges.length} edges by weight. Adding edges greedily while avoiding cycles (Union-Find).`
  });

  let totalWeight = 0;

  for (const edge of sorted) {
    const w = edge.weight ?? 1;
    steps.push({
      id: steps.length, type: 'compare',
      nodeIds: [edge.source, edge.target], edgeIds: [edge.id],
      values: { mstEdges: [...mst], totalWeight },
      description: `Considering edge (${edge.source} — ${edge.target}, w=${w}). Checking if it creates a cycle...`
    });

    const accepted = union(parent, rank, edge.source, edge.target);
    if (accepted) {
      mst.push(edge.id);
      totalWeight += w;
      steps.push({
        id: steps.length, type: 'path',
        nodeIds: [edge.source, edge.target], edgeIds: [edge.id],
        values: { mstEdges: [...mst], totalWeight },
        description: `✓ Accepted! Edge (${edge.source} — ${edge.target}, w=${w}) added to MST. Total weight: ${totalWeight}.`
      });
    } else {
      steps.push({
        id: steps.length, type: 'highlight',
        nodeIds: [edge.source, edge.target], edgeIds: [edge.id],
        values: { mstEdges: [...mst], totalWeight },
        description: `✗ Rejected! Edge (${edge.source} — ${edge.target}) would create a cycle. Skipped.`
      });
    }

    if (mst.length === ids.length - 1) break;
  }

  steps.push({
    id: steps.length, type: 'done', nodeIds: [], edgeIds: mst,
    values: { mstEdges: mst, totalWeight },
    description: `Kruskal's complete! MST has ${mst.length} edges with total weight ${totalWeight}.`
  });

  return steps;
}
