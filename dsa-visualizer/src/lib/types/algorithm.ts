export type StepType =
  | 'compare'
  | 'swap'
  | 'highlight'
  | 'insert'
  | 'delete'
  | 'visit'
  | 'path'
  | 'sorted'
  | 'update'
  | 'done';

export interface AlgorithmStep {
  id: number;
  type: StepType;
  indices?: number[];           // For array-based
  nodeIds?: string[];           // For tree/graph
  edgeIds?: string[];           // For graph edges
  values?: Record<string, any>; // Any additional state
  description: string;          // Human-readable explanation
  codeLine?: number;            // Which pseudocode line is active
  auxiliaryState?: any;         // Queue, stack, table state snapshot
}

export interface TreeNode {
  id: string; // Unique id, required for D3 object constancy
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

export interface GraphNode {
  id: string;
  label: string;
  x?: number; // Optional static coordinates for predictable rendering
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string; // GraphNode id
  target: string; // GraphNode id
  weight?: number; // Optional weight, crucial for Dijkstra
  isDirected?: boolean;
}

export interface VisualizerState {
  steps: AlgorithmStep[];
  currentStep: number;
  isPlaying: boolean;
  speed: number; // ms per step
  inputData: any;
}
