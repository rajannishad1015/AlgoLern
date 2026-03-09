import { AlgorithmStep } from '@/lib/types/algorithm';

export interface DLLNode {
  id: string;
  value: number;
  prev: string | null;
  next: string | null;
}

export type DLLState = DLLNode[];

export function generateDLLSteps(operations: { type: 'insertHead' | 'insertTail' | 'delete'; value?: number; nodeId?: string }[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const nodes: DLLNode[] = [];
  let idCounter = 0;

  const snapshot = () => nodes.map(n => ({ ...n }));

  const stateToValues = () => ({ nodes: snapshot() });

  steps.push({
    id: steps.length,
    type: 'highlight',
    indices: [],
    values: stateToValues(),
    description: 'Doubly Linked List initialized. Each node has a reference to both next and previous nodes.'
  });

  for (const op of operations) {
    if (op.type === 'insertHead') {
      const newId = `node-${idCounter++}`;
      const newNode: DLLNode = { id: newId, value: op.value!, prev: null, next: nodes.length > 0 ? nodes[0].id : null };
      
      steps.push({
        id: steps.length,
        type: 'highlight',
        indices: [],
        values: stateToValues(),
        description: `Inserting ${op.value} at the HEAD of the list.`
      });
      
      if (nodes.length > 0) {
        nodes[0].prev = newId;
        steps.push({
          id: steps.length,
          type: 'update',
          indices: [0],
          values: { nodes: snapshot(), newNodeId: newId },
          description: `Setting existing head node's 'prev' pointer to the new node.`
        });
      }
      
      nodes.unshift(newNode);
      steps.push({
        id: steps.length,
        type: 'insert',
        indices: [0],
        values: stateToValues(),
        description: `Node ${op.value} inserted at head. It is the new start of the list.`
      });
    }

    if (op.type === 'insertTail') {
      const newId = `node-${idCounter++}`;
      const prevId = nodes.length > 0 ? nodes[nodes.length - 1].id : null;
      const newNode: DLLNode = { id: newId, value: op.value!, prev: prevId, next: null };

      steps.push({
        id: steps.length,
        type: 'highlight',
        indices: [],
        values: stateToValues(),
        description: `Inserting ${op.value} at the TAIL of the list.`
      });

      if (nodes.length > 0) {
        nodes[nodes.length - 1].next = newId;
        steps.push({
          id: steps.length,
          type: 'update',
          indices: [nodes.length - 1],
          values: { nodes: snapshot(), newNodeId: newId },
          description: `Setting current tail node's 'next' pointer to the new node.`
        });
      }

      nodes.push(newNode);
      steps.push({
        id: steps.length,
        type: 'insert',
        indices: [nodes.length - 1],
        values: stateToValues(),
        description: `Node ${op.value} inserted at tail. It is the new end of the list.`
      });
    }

    if (op.type === 'delete' && op.nodeId) {
      const idx = nodes.findIndex(n => n.id === op.nodeId);
      if (idx === -1) continue;
      const target = nodes[idx];

      steps.push({
        id: steps.length,
        type: 'compare',
        indices: [idx],
        values: stateToValues(),
        description: `Deleting node with value ${target.value} at position ${idx}.`
      });

      // Re-link previous node
      if (target.prev) {
        const prevIdx = nodes.findIndex(n => n.id === target.prev);
        nodes[prevIdx].next = target.next;
        steps.push({
          id: steps.length,
          type: 'update',
          indices: [prevIdx],
          values: stateToValues(),
          description: `Updating previous node to skip over the deleted node.`
        });
      }

      // Re-link next node
      if (target.next) {
        const nextIdx = nodes.findIndex(n => n.id === target.next);
        nodes[nextIdx].prev = target.prev;
        steps.push({
          id: steps.length,
          type: 'update',
          indices: [nextIdx],
          values: stateToValues(),
          description: `Updating next node's 'prev' pointer to skip the deleted node.`
        });
      }

      nodes.splice(idx, 1);
      steps.push({
        id: steps.length,
        type: 'delete',
        indices: [idx],
        values: stateToValues(),
        description: `Node ${target.value} removed. Doubly linked list re-connected.`
      });
    }
  }

  steps.push({
    id: steps.length,
    type: 'done',
    indices: [],
    values: stateToValues(),
    description: 'All operations complete.'
  });

  return steps;
}
