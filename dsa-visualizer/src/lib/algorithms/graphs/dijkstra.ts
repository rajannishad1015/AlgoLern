import { AlgorithmStep, GraphNode, GraphEdge } from '@/lib/types/algorithm';

export function generateDijkstraSteps(
  nodes: GraphNode[], 
  edges: GraphEdge[], 
  startNodeId: string
): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  
  // Build adjacency list with weights
  const adj: Record<string, { to: string, weight: number, edgeId: string }[]> = {};
  nodes.forEach(n => adj[n.id] = []);
  edges.forEach(e => {
    const weight = e.weight || 1;
    adj[e.source].push({ to: e.target, weight, edgeId: e.id });
    if (!e.isDirected) {
        adj[e.target].push({ to: e.source, weight, edgeId: e.id });
    }
  });

  // State
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  // Initialization
  nodes.forEach(n => {
      distances[n.id] = Infinity;
      previous[n.id] = null;
      unvisited.add(n.id);
  });
  distances[startNodeId] = 0;

  // Helper to clone state for visualizer
  const getTableState = () => ({
      distances: { ...distances },
      previous: { ...previous },
      unvisited: Array.from(unvisited)
  });

  steps.push({
    id: steps.length,
    type: 'highlight',
    nodeIds: [],
    edgeIds: [],
    values: { nodes, edges },
    description: `Initialize distances. Set start node ${startNodeId} distance to 0, all others to Infinity.`,
    auxiliaryState: getTableState()
  });

  while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let currentId: string | null = null;
      let minDistance = Infinity;

      unvisited.forEach(nodeId => {
          const d = distances[nodeId];
          if (typeof d === 'number' && d < minDistance) {
              minDistance = d;
              currentId = nodeId;
          }
      });

      // If we couldn't find a reachable unvisited node, we're done (remaining nodes are disconnected)
      if (currentId === null || minDistance === Infinity) {
         steps.push({
             id: steps.length,
             type: 'done',
             nodeIds: [],
             edgeIds: [],
             values: { nodes, edges },
             description: `No remaining reachable unvisited nodes. Algorithm complete.`,
             auxiliaryState: getTableState()
         });
         break;
      }

      const cId = currentId as string;
      unvisited.delete(cId);

      steps.push({
          id: steps.length,
          type: 'visit',
          nodeIds: [cId],
          edgeIds: previous[cId] ? [edges.find(e => (e.source===previous[cId] && e.target===cId) || (!e.isDirected && e.source===cId && e.target===previous[cId]))?.id || ''] : [],
          values: { nodes, edges },
          description: `Selected node ${cId} with minimum distance ${distances[cId]}. Removing from unvisited set.`,
          auxiliaryState: getTableState()
      });

      const neighbors = adj[cId] || [];

      if (neighbors.length > 0) {
         steps.push({
             id: steps.length,
             type: 'highlight',
             nodeIds: [cId],
             edgeIds: [],
             values: { nodes, edges },
             description: `Evaluating unvisited neighbors of ${cId}.`,
             auxiliaryState: getTableState()
         });
      }

      for (const neighbor of neighbors) {
          if (!unvisited.has(neighbor.to)) continue;

          steps.push({
              id: steps.length,
              type: 'highlight',
              nodeIds: [neighbor.to],
              edgeIds: [neighbor.edgeId],
              values: { nodes, edges },
              description: `Checking edge to ${neighbor.to} (Weight: ${neighbor.weight}).`,
              auxiliaryState: getTableState()
          });

          const altDistance = distances[cId] + neighbor.weight;

          if (altDistance < distances[neighbor.to]) {
              steps.push({
                 id: steps.length,
                 type: 'update',
                 nodeIds: [neighbor.to],
                 edgeIds: [neighbor.edgeId],
                 values: { nodes, edges },
                 description: `New path to ${neighbor.to} is shorter (${altDistance} < ${distances[neighbor.to]}). Updating distance.`,
                 auxiliaryState: getTableState()
              });
              
              distances[neighbor.to] = altDistance;
              previous[neighbor.to] = cId;

              steps.push({
                 id: steps.length,
                 type: 'insert',
                 nodeIds: [neighbor.to],
                 edgeIds: [neighbor.edgeId],
                 values: { nodes, edges },
                 description: `Distance to ${neighbor.to} updated to ${altDistance}. Previous node set to ${cId}.`,
                 auxiliaryState: getTableState()
              });
          } else {
             steps.push({
                 id: steps.length,
                 type: 'highlight',
                 nodeIds: [neighbor.to],
                 edgeIds: [neighbor.edgeId],
                 values: { nodes, edges },
                 description: `Current path to ${neighbor.to} (${distances[neighbor.to]}) is already shorter than or equal to alternative (${altDistance}). No update.`,
                 auxiliaryState: getTableState()
              });
          }
      }

      // Re-highlight the confirmed shortest path tree we've built so far functionally
      const currentShortestPathTreeEdgeIds: string[] = [];
      Object.keys(previous).forEach(nodeId => {
          if (previous[nodeId]) {
             const e = edges.find(e => (e.source === previous[nodeId] && e.target === nodeId) || (!e.isDirected && e.source === nodeId && e.target === previous[nodeId]));
             if (e) currentShortestPathTreeEdgeIds.push(e.id);
          }
      });
      
      steps.push({
          id: steps.length,
          type: 'done',
          nodeIds: [cId],
          edgeIds: currentShortestPathTreeEdgeIds,
          values: { nodes, edges },
          description: `Finished evaluating neighbors for ${currentId}. Node is fully explored.`,
          auxiliaryState: getTableState()
      });
  }

  // Final confirmation
  const finalShortestPathTreeEdgeIds: string[] = [];
  Object.keys(previous).forEach(nodeId => {
      if (previous[nodeId]) {
         const e = edges.find(e => (e.source === previous[nodeId] && e.target === nodeId) || (!e.isDirected && e.source === nodeId && e.target === previous[nodeId]));
         if (e) finalShortestPathTreeEdgeIds.push(e.id);
      }
  });

  steps.push({
     id: steps.length,
     type: 'done',
     nodeIds: nodes.filter(n => distances[n.id] !== Infinity).map(n => n.id),
     edgeIds: finalShortestPathTreeEdgeIds,
     values: { nodes, edges },
     description: `Dijkstra's Algorithm complete! Shortest paths from ${startNodeId} found.`,
     auxiliaryState: getTableState()
  });

  return steps;
}
