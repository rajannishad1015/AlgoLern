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
  | { type: 'search', value: number }
  | { type: 'inorder' }
  | { type: 'preorder' }
  | { type: 'postorder' };

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
    } else if (op.type === 'inorder' || op.type === 'preorder' || op.type === 'postorder') {
      const traversalType = op.type;
      const result: number[] = [];
      const traversalName = traversalType.charAt(0).toUpperCase() + traversalType.slice(1);

      if (!root) {
        steps.push({
          id: steps.length,
          type: 'highlight',
          nodeIds: [],
          values: { tree: cloneTree(root) },
          description: `Tree is empty. Cannot perform ${traversalName} traversal.`,
        });
        return;
      }

      steps.push({
        id: steps.length,
        type: 'highlight',
        nodeIds: [],
        values: { tree: cloneTree(root) },
        description: `Starting ${traversalName} Traversal.`,
      });

      const traverse = (node: TreeNode | null, parentId: string | null = null, dir: 'left' | 'right' | null = null) => {
        if (!node) return;

        // Path coming into this node
        if (parentId && dir) {
           steps.push({
             id: steps.length,
             type: 'path',
             nodeIds: [parentId],
             edgeIds: [`${parentId}-${dir}`],
             values: { tree: cloneTree(root) },
             description: `Traversing to ${dir} child of ${parentId === root?.id ? 'Root' : 'Parent'}...`,
           });
        }

        // Action: Arrival at Node
        steps.push({
          id: steps.length,
          type: 'visit',
          nodeIds: [node.id],
          values: { tree: cloneTree(root) },
          description: `Visiting node ${node.value}.`,
        });

        if (traversalType === 'preorder') {
          result.push(node.value);
          steps.push({
             id: steps.length,
             type: 'done',
             nodeIds: [node.id],
             values: { tree: cloneTree(root) },
             description: `[PRE-ORDER] Processed Node: ${node.value} <br/><br/> <span class="text-indigo-400 font-mono text-xs font-bold bg-indigo-500/10 px-2 py-1 rounded">Result: [${result.join(', ')}]</span>`,
          });
        }

        traverse(node.left, node.id, 'left');

        if (traversalType === 'inorder') {
          result.push(node.value);
          steps.push({
             id: steps.length,
             type: 'done',
             nodeIds: [node.id],
             values: { tree: cloneTree(root) },
             description: `[IN-ORDER] Processed Node: ${node.value} <br/><br/> <span class="text-[#cbff5e] font-mono text-xs font-bold bg-[#cbff5e]/10 px-2 py-1 rounded">Result: [${result.join(', ')}]</span>`,
          });
        }

        traverse(node.right, node.id, 'right');

        if (traversalType === 'postorder') {
          result.push(node.value);
          steps.push({
             id: steps.length,
             type: 'done',
             nodeIds: [node.id],
             values: { tree: cloneTree(root) },
             description: `[POST-ORDER] Processed Node: ${node.value} <br/><br/> <span class="text-emerald-400 font-mono text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded">Result: [${result.join(', ')}]</span>`,
          });
        }
        
        // Path returning to parent (Visual backtracking)
        if (parentId && dir) {
           steps.push({
             id: steps.length,
             type: 'path',
             nodeIds: [node.id],
             edgeIds: [`${parentId}-${dir}`],
             values: { tree: cloneTree(root) },
             description: `Backtracking to parent from node ${node.value}...`,
           });
        }
      };

      traverse(root);

      steps.push({
        id: steps.length,
        type: 'highlight',
        nodeIds: [],
        values: { tree: cloneTree(root) },
        description: `✅ ${traversalName} Traversal Complete! <br/><br/> Final Output: <span class="text-white font-mono font-bold bg-white/10 px-2 py-1 rounded ml-1">[${result.join(', ')}]</span>`,
      });
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
