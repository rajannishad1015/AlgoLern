import { AlgorithmStep } from '@/lib/types/algorithm';

interface AVLNode {
  id: string;
  value: number;
  height: number;
  left: string | null;
  right: string | null;
  parent: string | null;
}

type NodeMap = Map<string, AVLNode>;

let nodeIdCounter = 0;

function createNode(value: number, parent: string | null, nodes: NodeMap): string {
  const id = `avl-${nodeIdCounter++}`;
  nodes.set(id, { id, value, height: 1, left: null, right: null, parent });
  return id;
}

function getHeight(id: string | null, nodes: NodeMap): number {
  if (!id) return 0;
  return nodes.get(id)?.height ?? 0;
}

function updateHeight(id: string, nodes: NodeMap) {
  const node = nodes.get(id)!;
  node.height = 1 + Math.max(getHeight(node.left, nodes), getHeight(node.right, nodes));
}

function getBalance(id: string, nodes: NodeMap): number {
  const node = nodes.get(id)!;
  return getHeight(node.left, nodes) - getHeight(node.right, nodes);
}

function snapTree(root: string | null, nodes: NodeMap) {
  const obj: Record<string, { value: number; height: number; left: string | null; right: string | null }> = {};
  nodes.forEach((node, id) => {
    obj[id] = { value: node.value, height: node.height, left: node.left, right: node.right };
  });
  return { root, nodes: obj };
}

// Right rotate around y
function rotateRight(y: string, nodes: NodeMap, steps: AlgorithmStep[], root: string): string {
  const yNode = nodes.get(y)!;
  const x = yNode.left!;
  const xNode = nodes.get(x)!;
  const T2 = xNode.right;

  steps.push({
    id: steps.length, type: 'update', nodeIds: [y, x],
    values: snapTree(root, nodes),
    description: `Right rotation at node ${yNode.value}: ${xNode.value} becomes the new root of this subtree.`
  });

  // Perform rotation
  xNode.right = y;
  yNode.left = T2;
  if (T2) nodes.get(T2)!.parent = y;
  xNode.parent = yNode.parent;
  yNode.parent = x;

  updateHeight(y, nodes);
  updateHeight(x, nodes);

  steps.push({
    id: steps.length, type: 'update', nodeIds: [y, x],
    values: snapTree(x, nodes),
    description: `Right rotation complete. Heights updated.`
  });

  return x;
}

// Left rotate around x
function rotateLeft(x: string, nodes: NodeMap, steps: AlgorithmStep[], root: string): string {
  const xNode = nodes.get(x)!;
  const y = xNode.right!;
  const yNode = nodes.get(y)!;
  const T2 = yNode.left;

  steps.push({
    id: steps.length, type: 'update', nodeIds: [x, y],
    values: snapTree(root, nodes),
    description: `Left rotation at node ${xNode.value}: ${yNode.value} becomes the new root of this subtree.`
  });

  yNode.left = x;
  xNode.right = T2;
  if (T2) nodes.get(T2)!.parent = x;
  yNode.parent = xNode.parent;
  xNode.parent = y;

  updateHeight(x, nodes);
  updateHeight(y, nodes);

  steps.push({
    id: steps.length, type: 'update', nodeIds: [x, y],
    values: snapTree(y, nodes),
    description: `Left rotation complete. Heights updated.`
  });

  return y;
}

function insert(
  rootId: string | null, value: number, parentId: string | null,
  nodes: NodeMap, steps: AlgorithmStep[]
): [string, string] {
  if (!rootId) {
    const newId = createNode(value, parentId, nodes);
    steps.push({
      id: steps.length, type: 'insert', nodeIds: [newId],
      values: snapTree(newId, nodes),
      description: `Inserted ${value} as a new leaf node.`
    });
    return [newId, newId];
  }

  const node = nodes.get(rootId)!;

  steps.push({
    id: steps.length, type: 'compare', nodeIds: [rootId],
    values: snapTree(rootId, nodes),
    description: `Comparing ${value} with node ${node.value}: going ${value < node.value ? 'LEFT' : 'RIGHT'}.`
  });

  let newNodeId = rootId;

  if (value < node.value) {
    const [newLeft, newNode] = insert(node.left, value, rootId, nodes, steps);
    node.left = newLeft;
    newNodeId = newNode;
  } else if (value > node.value) {
    const [newRight, newNode] = insert(node.right, value, rootId, nodes, steps);
    node.right = newRight;
    newNodeId = newNode;
  } else {
    // Duplicate
    return [rootId, rootId];
  }

  updateHeight(rootId, nodes);
  const balance = getBalance(rootId, nodes);

  steps.push({
    id: steps.length, type: 'highlight', nodeIds: [rootId],
    values: snapTree(rootId, nodes),
    description: `Checking balance at node ${node.value}: balance factor = ${balance}.`
  });

  // Left Left
  if (balance > 1 && node.left && value < nodes.get(node.left)!.value) {
    steps.push({
      id: steps.length, type: 'highlight', nodeIds: [rootId],
      values: snapTree(rootId, nodes),
      description: `Left-Left case at node ${node.value}. Performing single Right Rotation.`
    });
    return [rotateRight(rootId, nodes, steps, rootId), newNodeId];
  }

  // Right Right
  if (balance < -1 && node.right && value > nodes.get(node.right)!.value) {
    steps.push({
      id: steps.length, type: 'highlight', nodeIds: [rootId],
      values: snapTree(rootId, nodes),
      description: `Right-Right case at node ${node.value}. Performing single Left Rotation.`
    });
    return [rotateLeft(rootId, nodes, steps, rootId), newNodeId];
  }

  // Left Right
  if (balance > 1 && node.left) {
    steps.push({
      id: steps.length, type: 'highlight', nodeIds: [rootId, node.left],
      values: snapTree(rootId, nodes),
      description: `Left-Right case at node ${node.value}. First Left Rotate on left child, then Right Rotate.`
    });
    node.left = rotateLeft(node.left, nodes, steps, rootId);
    return [rotateRight(rootId, nodes, steps, rootId), newNodeId];
  }

  // Right Left
  if (balance < -1 && node.right) {
    steps.push({
      id: steps.length, type: 'highlight', nodeIds: [rootId, node.right],
      values: snapTree(rootId, nodes),
      description: `Right-Left case at node ${node.value}. First Right Rotate on right child, then Left Rotate.`
    });
    node.right = rotateRight(node.right, nodes, steps, rootId);
    return [rotateLeft(rootId, nodes, steps, rootId), newNodeId];
  }

  return [rootId, newNodeId];
}

export function generateAVLTreeSteps(values: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const nodes: NodeMap = new Map();
  nodeIdCounter = 0;
  let root: string | null = null;

  steps.push({
    id: steps.length, type: 'highlight', nodeIds: [],
    values: snapTree(null, nodes),
    description: 'AVL Tree initialized. Every insertion will self-balance to keep height O(log n).'
  });

  for (const val of values) {
    steps.push({
      id: steps.length, type: 'highlight', nodeIds: [],
      values: snapTree(root, nodes),
      description: `Inserting value ${val} into the AVL Tree.`
    });

    const [newRoot] = insert(root, val, null, nodes, steps);
    root = newRoot;

    steps.push({
      id: steps.length, type: 'sorted', nodeIds: [],
      values: snapTree(root, nodes),
      description: `Value ${val} inserted. Tree is balanced. Root: ${nodes.get(root)?.value}.`
    });
  }

  steps.push({
    id: steps.length, type: 'done', nodeIds: [],
    values: snapTree(root, nodes),
    description: `AVL Tree complete! ${values.length} nodes inserted, tree remains balanced.`
  });

  return steps;
}
