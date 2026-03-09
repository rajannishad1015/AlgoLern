import { AlgorithmStep, GraphNode, GraphEdge } from '@/lib/types/algorithm';

export function generateFloydWarshallSteps(
  nodes: GraphNode[],
  edges: GraphEdge[]
): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const ids = nodes.map(n => n.id);
  const n = ids.length;

  // Initialize distance matrix
  const dist: Record<string, Record<string, number>> = {};
  const next: Record<string, Record<string, string | null>> = {};

  for (const u of ids) {
    dist[u] = {};
    next[u] = {};
    for (const v of ids) {
      dist[u][v] = u === v ? 0 : Infinity;
      next[u][v] = null;
    }
  }

  for (const edge of edges) {
    const w = edge.weight ?? 1;
    if (w < dist[edge.source][edge.target]) {
      dist[edge.source][edge.target] = w;
      next[edge.source][edge.target] = edge.target;
    }
    if (!edge.isDirected) {
      if (w < dist[edge.target][edge.source]) {
        dist[edge.target][edge.source] = w;
        next[edge.target][edge.source] = edge.source;
      }
    }
  }

  const snap = () => {
    const d: Record<string, Record<string, number | string>> = {};
    for (const u of ids) {
      d[u] = {};
      for (const v of ids) {
        d[u][v] = dist[u][v] === Infinity ? '∞' : dist[u][v];
      }
    }
    return d;
  };

  steps.push({
    id: steps.length, type: 'highlight', nodeIds: [],
    values: { matrix: snap(), ids },
    description: `Floyd-Warshall initialized. Distance matrix built from ${edges.length} edges. Computing all-pairs shortest paths.`
  });

  // Main DP loop
  for (const k of ids) {
    steps.push({
      id: steps.length, type: 'visit', nodeIds: [k],
      values: { matrix: snap(), ids, k },
      description: `Using node "${k}" as an intermediate vertex. Checking if routing through "${k}" shortens any path.`
    });

    for (const u of ids) {
      for (const v of ids) {
        if (dist[u][k] === Infinity || dist[k][v] === Infinity) continue;
        const candidate = dist[u][k] + dist[k][v];

        if (candidate < dist[u][v]) {
          steps.push({
            id: steps.length, type: 'compare',
            nodeIds: [u, k, v],
            values: { matrix: snap(), ids, k, u, v },
            description: `Relaxation: dist[${u}][${v}] (${dist[u][v] === Infinity ? '∞' : dist[u][v]}) > dist[${u}][${k}] + dist[${k}][${v}] (${candidate}). Updating!`
          });
          dist[u][v] = candidate;
          next[u][v] = next[u][k];
          steps.push({
            id: steps.length, type: 'update',
            nodeIds: [u, v],
            values: { matrix: snap(), ids, k, u, v },
            description: `Updated dist[${u}][${v}] = ${candidate} via intermediate "${k}".`
          });
        }
      }
    }
  }

  steps.push({
    id: steps.length, type: 'done', nodeIds: [],
    values: { matrix: snap(), ids },
    description: `Floyd-Warshall complete! All-pairs shortest paths computed for ${n} nodes.`
  });

  return steps;
}
