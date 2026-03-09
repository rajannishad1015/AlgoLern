import { AlgorithmStep, GraphNode, GraphEdge } from '@/lib/types/algorithm';

export function generateBellmanFordSteps(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startNodeId: string
): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};

  nodes.forEach(n => {
    dist[n.id] = n.id === startNodeId ? 0 : Infinity;
    prev[n.id] = null;
  });

  const snap = () => ({ distances: { ...dist }, previous: { ...prev } });

  steps.push({
    id: steps.length, type: 'highlight', nodeIds: [startNodeId],
    values: snap(),
    description: `Bellman-Ford initialized. Source: "${startNodeId}". Distance to all nodes set to ∞ except source (0).`
  });

  const n = nodes.length;

  // Relax all edges N-1 times
  for (let i = 0; i < n - 1; i++) {
    steps.push({
      id: steps.length, type: 'highlight', nodeIds: [],
      values: snap(),
      description: `Iteration ${i + 1} of ${n - 1}: Relaxing all ${edges.length} edges.`
    });

    let updated = false;
    for (const edge of edges) {
      const { source, target, weight = 1 } = edge;

      // For undirected, check both directions
      const pairs: [string, string][] = [[source, target]];
      if (!edge.isDirected) pairs.push([target, source]);

      for (const [u, v] of pairs) {
        steps.push({
          id: steps.length, type: 'compare',
          nodeIds: [u, v], edgeIds: [edge.id],
          values: snap(),
          description: `Checking edge (${u} → ${v}, w=${weight}). dist[${u}]=${dist[u] === Infinity ? '∞' : dist[u]}, candidate=${dist[u] === Infinity ? '∞' : dist[u] + weight}, dist[${v}]=${dist[v] === Infinity ? '∞' : dist[v]}.`
        });

        if (dist[u] !== Infinity && dist[u] + weight < dist[v]) {
          dist[v] = dist[u] + weight;
          prev[v] = u;
          updated = true;
          steps.push({
            id: steps.length, type: 'update',
            nodeIds: [v], edgeIds: [edge.id],
            values: snap(),
            description: `Relaxed! dist[${v}] updated to ${dist[v]} via ${u}.`
          });
        }
      }
    }

    if (!updated) {
      steps.push({
        id: steps.length, type: 'highlight', nodeIds: [],
        values: snap(),
        description: `No updates in iteration ${i + 1}. Early termination — graph is settled.`
      });
      break;
    }
  }

  // Check for negative cycles
  let hasNegCycle = false;
  for (const edge of edges) {
    const { source, target, weight = 1 } = edge;
    const pairs: [string, string][] = [[source, target]];
    if (!edge.isDirected) pairs.push([target, source]);
    for (const [u, v] of pairs) {
      if (dist[u] !== Infinity && dist[u] + weight < dist[v]) {
        hasNegCycle = true;
      }
    }
  }

  steps.push({
    id: steps.length,
    type: hasNegCycle ? 'highlight' : 'done',
    nodeIds: [],
    values: { ...snap(), negCycle: hasNegCycle },
    description: hasNegCycle
      ? `⚠ Negative weight cycle detected! Shortest paths are undefined.`
      : `Bellman-Ford complete! All shortest distances from "${startNodeId}" computed.`
  });

  return steps;
}
