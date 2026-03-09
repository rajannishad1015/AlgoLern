import { AlgorithmStep, TreeNode } from '@/lib/types/algorithm';
import { nanoid } from 'nanoid';

// Helper to clone tree for state snapshots
function cloneTree(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return {
    id: node.id,
    value: node.value,
    left: cloneTree(node.left),
    right: cloneTree(node.right)
  };
}

export type BSTOperation = 
  | { type: 'insert', value: number }
  | { type: 'search', value: number };

export function generateBSTSteps(operations: BSTOperation[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  let root: TreeNode | null = null;
  
  steps.push({
    id: steps.length,
    type: 'highlight',
    nodeIds: [],
    values: { tree: null },
    description: `Initial state: Tree is empty.`,
  });

  operations.forEach((op) => {
    if (op.type === 'insert') {
      const val = op.value;
      
      if (!root) {
        root = { id: nanoid(), value: val, left: null, right: null };
        steps.push({
          id: steps.length,
          type: 'insert',
          nodeIds: [root.id],
          values: { tree: cloneTree(root) },
          description: `Tree is empty. Inserted ${val} as the new Root.`,
        });
        return;
      }

      let curr: TreeNode | null = root;
      let parent: TreeNode | null = null;
      let isLeftChild = false;

      steps.push({
        id: steps.length,
        type: 'highlight',
        nodeIds: [],
        values: { tree: cloneTree(root) },
        description: `Starting insertion of ${val}.`,
      });

      while (curr !== null) {
        steps.push({
          id: steps.length,
          type: 'visit',
          nodeIds: [curr.id],
          values: { tree: cloneTree(root) },
          description: `Comparing ${val} with current node ${curr.value}.`,
        });

        parent = curr;
        if (val < curr.value) {
          isLeftChild = true;
          curr = curr.left;
          if (curr) {
              steps.push({
                id: steps.length,
                type: 'path',
                nodeIds: [parent.id],
                edgeIds: [`${parent.id}-left`], // Edge ids combine parent id and direction
                values: { tree: cloneTree(root) },
                description: `${val} < ${parent.value}, traversing left.`,
              });
          }
        } else if (val > curr.value) {
          isLeftChild = false;
          curr = curr.right;
          if (curr) {
              steps.push({
                id: steps.length,
                type: 'path',
                nodeIds: [parent.id],
                edgeIds: [`${parent.id}-right`],
                values: { tree: cloneTree(root) },
                description: `${val} > ${parent.value}, traversing right.`,
              });
          }
        } else {
          // Value exists, usually ignore or handle based on BST rules
          steps.push({
            id: steps.length,
            type: 'highlight',
            nodeIds: [curr.id],
            values: { tree: cloneTree(root) },
            description: `Value ${val} already exists in the tree. Ignoring insert.`,
          });
          return;
        }
      }

      const newNode: TreeNode = { id: nanoid(), value: val, left: null, right: null };
      if (isLeftChild && parent) {
        parent.left = newNode;
      } else if (parent) {
        parent.right = newNode;
      }

      steps.push({
        id: steps.length,
        type: 'insert',
        nodeIds: [newNode.id],
        values: { tree: cloneTree(root) },
        description: `Found empty spot. Inserted ${val} as a new node.`,
      });
    } 
    else if (op.type === 'search') {
      const val = op.value;
      let curr = root;
      let found = false;

      steps.push({
        id: steps.length,
        type: 'highlight',
        nodeIds: [],
        values: { tree: cloneTree(root) },
        description: `Searching for ${val}.`,
      });

      while (curr !== null) {
        steps.push({
          id: steps.length,
          type: 'visit',
          nodeIds: [curr.id],
          values: { tree: cloneTree(root) },
          description: `Comparing ${val} with current node ${curr.value}.`,
        });

        if (val === curr.value) {
          found = true;
          steps.push({
            id: steps.length,
            type: 'done',
            nodeIds: [curr.id],
            values: { tree: cloneTree(root) },
            description: `Found ${val}! Search successful.`,
          });
          break;
        } else if (val < curr.value) {
          const parent = curr;
          curr = curr.left;
          steps.push({
              id: steps.length,
              type: 'path',
              nodeIds: [parent.id],
              edgeIds: [`${parent.id}-left`],
              values: { tree: cloneTree(root) },
              description: `${val} < ${parent.value}, going to left child.`,
          });
        } else {
          const parent = curr;
          curr = curr.right;
          steps.push({
              id: steps.length,
              type: 'path',
              nodeIds: [parent.id],
              edgeIds: [`${parent.id}-right`],
              values: { tree: cloneTree(root) },
              description: `${val} > ${parent.value}, going to right child.`,
          });
        }
      }

      if (!found) {
        steps.push({
          id: steps.length,
          type: 'highlight',
          nodeIds: [],
          values: { tree: cloneTree(root) },
          description: `Reached a leaf. Value ${val} not found in the tree.`,
        });
      }
    }
  });

  steps.push({
    id: steps.length,
    type: 'done',
    nodeIds: [],
    values: { tree: cloneTree(root) },
    description: `All operations completed.`,
  });

  return steps;
}
