import { AlgorithmStep, GraphNode, GraphEdge } from '@/lib/types/algorithm';

export function generatePrimSteps(nodes: GraphNode[], edges: GraphEdge[], startNodeId: string): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const ids = nodes.map(n => n.id);

  // Build adjacency list
  const adj: Record<string, { to: string; weight: number; edgeId: string }[]> = {};
  ids.forEach(id => (adj[id] = []));
  for (const e of edges) {
    const w = e.weight ?? 1;
    adj[e.source].push({ to: e.target, weight: w, edgeId: e.id });
    if (!e.isDirected) adj[e.target].push({ to: e.source, weight: w, edgeId: e.id });
  }

  const inMST = new Set<string>();
  const key: Record<string, number> = {};
  const parent: Record<string, string | null> = {};
  const mstEdges: string[] = [];

  ids.forEach(id => { key[id] = Infinity; parent[id] = null; });
  key[startNodeId] = 0;

  const snap = () => ({ inMST: Array.from(inMST), key: { ...key }, parent: { ...parent }, mstEdges: [...mstEdges] });

  steps.push({
    id: steps.length, type: 'highlight',
    nodeIds: [startNodeId],
    values: snap(),
    description: `Prim's MST starting from "${startNodeId}". All key values set to ∞ except start (0).`
  });

  for (let iter = 0; iter < ids.length; iter++) {
    // Pick minimum key vertex not in MST
    let u: string | null = null;
    for (const id of ids) {
      if (!inMST.has(id) && (u === null || key[id] < key[u!])) u = id;
    }

    if (u === null || key[u] === Infinity) break;

    inMST.add(u);

    if (parent[u]) {
      const edge = edges.find(e =>
        (e.source === parent[u] && e.target === u) ||
        (!e.isDirected && e.source === u && e.target === parent[u])
      );
      if (edge) mstEdges.push(edge.id);
    }

    steps.push({
      id: steps.length, type: 'visit',
      nodeIds: [u],
      values: snap(),
      description: `Adding "${u}" to MST (key=${key[u]}). Examining its adjacent edges to update keys.`
    });

    for (const { to, weight, edgeId } of adj[u]) {
      if (!inMST.has(to)) {
        steps.push({
          id: steps.length, type: 'compare',
          nodeIds: [u, to], edgeIds: [edgeId],
          values: snap(),
          description: `Edge (${u} — ${to}, w=${weight}): key[${to}]=${key[to] === Infinity ? '∞' : key[to]} vs weight=${weight}.`
        });

        if (weight < key[to]) {
          key[to] = weight;
          parent[to] = u;
          steps.push({
            id: steps.length, type: 'update',
            nodeIds: [to], edgeIds: [edgeId],
            values: snap(),
            description: `Updated key[${to}] = ${weight}, parent[${to}] = "${u}".`
          });
        }
      }
    }
  }

  steps.push({
    id: steps.length, type: 'done',
    nodeIds: Array.from(inMST),
    values: snap(),
    description: `Prim's MST complete! ${mstEdges.length} edges selected with minimum total weight.`
  });

  return steps;
}
