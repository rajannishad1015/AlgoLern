import { AlgorithmStep, GraphNode, GraphEdge } from '@/lib/types/algorithm';

export function generateGraphTraversalSteps(
  nodes: GraphNode[], 
  edges: GraphEdge[], 
  startNodeId: string, 
  type: 'BFS' | 'DFS'
): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  
  // Build adjacency list for efficient traversal
  const adj: Record<string, string[]> = {};
  nodes.forEach(n => adj[n.id] = []);
  edges.forEach(e => {
    adj[e.source].push(e.target);
    if (!e.isDirected) {
        adj[e.target].push(e.source);
    }
  });

  const visited = new Set<string>();
  const activeNodes: string[] = []; // Queue for BFS, Stack for DFS
  const result: string[] = [];

  steps.push({
    id: steps.length,
    type: 'highlight',
    nodeIds: [],
    edgeIds: [],
    values: { nodes, edges, result: [] },
    description: `Starting ${type} traversal from node ${startNodeId}.`,
    auxiliaryState: { active: [], visited: Array.from(visited) }
  });

  activeNodes.push(startNodeId);
  visited.add(startNodeId);

  steps.push({
      id: steps.length,
      type: 'insert',
      nodeIds: [startNodeId],
      edgeIds: [],
      values: { nodes, edges, result: [...result] },
      description: `Added start node ${startNodeId} to the ${type === 'BFS' ? 'Queue' : 'Stack'}. Visited set updated.`,
      auxiliaryState: { active: [...activeNodes], visited: Array.from(visited) }
  });

  while (activeNodes.length > 0) {
    // Determine which node to process next
    const currentId = type === 'BFS' ? activeNodes.shift()! : activeNodes.pop()!;
    
    steps.push({
        id: steps.length,
        type: 'visit',
        nodeIds: [currentId],
        edgeIds: [],
        values: { nodes, edges, result: [...result] },
        description: `Processing node ${currentId} from the ${type === 'BFS' ? 'front of Queue' : 'top of Stack'}.`,
        auxiliaryState: { active: [...activeNodes], visited: Array.from(visited) }
    });

    result.push(currentId);

    steps.push({
        id: steps.length,
        type: 'done',
        nodeIds: [currentId],
        edgeIds: [],
        values: { nodes, edges, result: [...result] },
        description: `Appended ${currentId} to the Result array.`,
        auxiliaryState: { active: [...activeNodes], visited: Array.from(visited) }
    });

    // Get neighbors
    const neighbors = adj[currentId] || [];
    
    if (neighbors.length > 0) {
        steps.push({
            id: steps.length,
            type: 'highlight',
            nodeIds: [currentId],
            edgeIds: [],
            values: { nodes, edges, result: [...result] },
            description: `Checking neighbors of ${currentId}: [${neighbors.join(', ')}].`,
            auxiliaryState: { active: [...activeNodes], visited: Array.from(visited) }
        });
    }

    // To process correctly for DFS to match typical visually appealing left-to-right order, 
    // we often reverse neighbors before pushing to stack. 
    // But for a generic graph, normal iteration is fine. 
    // We will do normal iteration for BFS, reverse for DFS to visit "first" neighbors first visually.
    const neighborsToProcess = type === 'DFS' ? [...neighbors].reverse() : neighbors;

    for (const neighborId of neighborsToProcess) {
       // Find the specific edge ID connecting currentId and neighborId
       const connectingEdge = edges.find(
           e => (e.source === currentId && e.target === neighborId) || 
                (!e.isDirected && e.source === neighborId && e.target === currentId)
       );

       steps.push({
           id: steps.length,
           type: 'highlight',
           nodeIds: [neighborId],
           edgeIds: connectingEdge ? [connectingEdge.id] : [],
           values: { nodes, edges, result: [...result] },
           description: `Checking neighbor ${neighborId}.`,
           auxiliaryState: { active: [...activeNodes], visited: Array.from(visited) }
       });

       if (!visited.has(neighborId)) {
           visited.add(neighborId);
           activeNodes.push(neighborId);
           
           steps.push({
               id: steps.length,
               type: 'insert',
               nodeIds: [neighborId],
               edgeIds: connectingEdge ? [connectingEdge.id] : [],
               values: { nodes, edges, result: [...result] },
               description: `Neighbor ${neighborId} has not been visited. Adding to ${type === 'BFS' ? 'Queue' : 'Stack'}.`,
               auxiliaryState: { active: [...activeNodes], visited: Array.from(visited) }
           });
       } else {
           steps.push({
               id: steps.length,
               type: 'highlight',
               nodeIds: [neighborId],
               edgeIds: connectingEdge ? [connectingEdge.id] : [],
               values: { nodes, edges, result: [...result] },
               description: `Neighbor ${neighborId} was already visited. Skipping.`,
               auxiliaryState: { active: [...activeNodes], visited: Array.from(visited) }
           });
       }
    }
  }

  steps.push({
    id: steps.length,
    type: 'done',
    nodeIds: [],
    edgeIds: [],
    values: { nodes, edges, result: [...result] },
    description: `${type} traversal complete! Formed Result: [${result.join(', ')}].`,
    auxiliaryState: { active: [...activeNodes], visited: Array.from(visited) }
  });

  return steps;
}
