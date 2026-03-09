import { AlgorithmStep, TreeNode } from '@/lib/types/algorithm';

// Helper to clone tree
function cloneTree(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return {
    id: node.id,
    value: node.value,
    left: cloneTree(node.left),
    right: cloneTree(node.right)
  };
}

export function generateTraversalSteps(root: TreeNode | null, type: 'inorder' | 'preorder' | 'postorder'): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const visitedOrder: number[] = [];

  if (!root) {
    steps.push({
        id: 0,
        type: 'done',
        description: `Tree is empty.`,
    });
    return steps;
  }

  const state = cloneTree(root);

  function traverse(node: TreeNode | null) {
    if (!node) return;

    // PREORDER
    if (type === 'preorder') {
        steps.push({
            id: steps.length,
            type: 'visit',
            nodeIds: [node.id],
            values: { tree: state, result: [...visitedOrder] },
            description: `Visiting node ${node.value} (Root).`,
        });
        visitedOrder.push(node.value);
        steps.push({
            id: steps.length,
            type: 'done', // Representing adding to array
            nodeIds: [node.id],
            values: { tree: state, result: [...visitedOrder] },
            description: `Added ${node.value} to Result Array.`,
        });
    } else {
        steps.push({
            id: steps.length,
            type: 'highlight',
            nodeIds: [node.id],
            values: { tree: state, result: [...visitedOrder] },
            description: `Entering node ${node.value}.`,
        });
    }

    // Traverse Left
    if (node.left) {
        steps.push({
            id: steps.length,
            type: 'path',
            nodeIds: [node.id],
            edgeIds: [`${node.id}-left`],
            values: { tree: state, result: [...visitedOrder] },
            description: `Traversing left child of ${node.value}.`,
        });
        traverse(node.left);
    }

    // INORDER
    if (type === 'inorder') {
        steps.push({
            id: steps.length,
            type: 'visit',
            nodeIds: [node.id],
            values: { tree: state, result: [...visitedOrder] },
            description: `Left subtree of ${node.value} done. Visiting node ${node.value}.`,
        });
        visitedOrder.push(node.value);
        steps.push({
            id: steps.length,
            type: 'done',
            nodeIds: [node.id],
            values: { tree: state, result: [...visitedOrder] },
            description: `Added ${node.value} to Result Array.`,
        });
    }

    // Traverse Right
    if (node.right) {
        steps.push({
            id: steps.length,
            type: 'path',
            nodeIds: [node.id],
            edgeIds: [`${node.id}-right`],
            values: { tree: state, result: [...visitedOrder] },
            description: `Traversing right child of ${node.value}.`,
        });
        traverse(node.right);
    }

    // POSTORDER
    if (type === 'postorder') {
        steps.push({
            id: steps.length,
            type: 'visit',
            nodeIds: [node.id],
            values: { tree: state, result: [...visitedOrder] },
            description: `Children of ${node.value} done. Visiting node ${node.value}.`,
        });
        visitedOrder.push(node.value);
        steps.push({
            id: steps.length,
            type: 'done',
            nodeIds: [node.id],
            values: { tree: state, result: [...visitedOrder] },
            description: `Added ${node.value} to Result Array.`,
        });
    }

    steps.push({
        id: steps.length,
        type: 'highlight',
        nodeIds: [node.id],
        values: { tree: state, result: [...visitedOrder] },
        description: `Finished processing subtree at node ${node.value}. Backtracking.`,
    });
  }

  steps.push({
    id: steps.length,
    type: 'highlight',
    nodeIds: [],
    values: { tree: state, result: [] },
    description: `Starting ${type} traversal.`,
  });

  traverse(root);

  steps.push({
    id: steps.length,
    type: 'done',
    nodeIds: [],
    values: { tree: state, result: [...visitedOrder] },
    description: `Traversal complete! Final order: [${visitedOrder.join(', ')}].`,
  });

  return steps;
}
