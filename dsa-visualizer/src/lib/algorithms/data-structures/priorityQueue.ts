import { AlgorithmStep } from '@/lib/types/algorithm';

export interface PQNode {
  value: number;
  priority: number;
}

// ─── Single-operation step generator (interactive mode) ─────────────────────
export function generateSinglePQSteps(
  currentHeap: PQNode[],
  op: { type: 'enqueue'; value: number; priority: number } | { type: 'dequeue' }
): { steps: AlgorithmStep[]; nextHeap: PQNode[] } {
  const heap = currentHeap.map(n => ({ ...n }));
  const steps: AlgorithmStep[] = [];
  const snapshot = () => heap.map(n => ({ ...n }));

  steps.push({
    id: 0, type: 'highlight', indices: [],
    values: { heap: snapshot() },
    description: `Priority Queue has ${heap.length} element${heap.length !== 1 ? 's' : ''}. ${heap.length > 0 ? `Root: value=${heap[0].value}, priority=${heap[0].priority}` : 'Empty heap'}.`,
  });

  if (op.type === 'enqueue') {
    heap.push({ value: op.value, priority: op.priority });
    steps.push({
      id: steps.length, type: 'insert', indices: [heap.length - 1],
      values: { heap: snapshot() },
      description: `Enqueue: Added value=${op.value} (priority=${op.priority}) at index ${heap.length - 1}. Now heapifying up...`,
    });

    // Heapify up
    let idx = heap.length - 1;
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      steps.push({
        id: steps.length, type: 'compare', indices: [parent, idx],
        values: { heap: snapshot() },
        description: `Heapify Up: Comparing priority ${heap[idx].priority} (idx ${idx}) with parent priority ${heap[parent].priority} (idx ${parent}).`,
      });
      if (heap[parent].priority > heap[idx].priority) {
        [heap[parent], heap[idx]] = [heap[idx], heap[parent]];
        steps.push({
          id: steps.length, type: 'swap', indices: [parent, idx],
          values: { heap: snapshot() },
          description: `Swapped! Element with priority ${heap[parent].priority} bubbled up to index ${parent}.`,
        });
        idx = parent;
      } else {
        steps.push({
          id: steps.length, type: 'highlight', indices: [idx],
          values: { heap: snapshot() },
          description: `Heap property satisfied at index ${idx}. No more swaps needed.`,
        });
        break;
      }
    }

    steps.push({
      id: steps.length, type: 'done', indices: [],
      values: { heap: snapshot() },
      description: `Enqueue complete. value=${op.value} (priority=${op.priority}) placed correctly. Heap size: ${heap.length}.`,
    });
  } else {
    if (heap.length === 0) {
      steps.push({
        id: steps.length, type: 'highlight', indices: [],
        values: { heap: [] },
        description: `Priority Queue is EMPTY — cannot dequeue (Underflow Error).`,
      });
    } else {
      const removed = { ...heap[0] };
      steps.push({
        id: steps.length, type: 'delete', indices: [0],
        values: { heap: snapshot() },
        description: `Dequeue: Removing root (value=${removed.value}, priority=${removed.priority}). Moving last element to root...`,
      });
      heap[0] = heap[heap.length - 1];
      heap.pop();

      if (heap.length > 0) {
        steps.push({
          id: steps.length, type: 'highlight', indices: [0],
          values: { heap: snapshot() },
          description: `Last element (value=${heap[0].value}) moved to root. Heapifying down...`,
        });

        // Heapify down
        let idx = 0;
        while (true) {
          let smallest = idx;
          const left = 2 * idx + 1;
          const right = 2 * idx + 2;

          steps.push({
            id: steps.length, type: 'compare',
            indices: [idx, left, right].filter(i => i < heap.length),
            values: { heap: snapshot() },
            description: `Heapify Down: Checking children of index ${idx} (priority=${heap[idx].priority}).`,
          });

          if (left < heap.length && heap[left].priority < heap[smallest].priority) smallest = left;
          if (right < heap.length && heap[right].priority < heap[smallest].priority) smallest = right;

          if (smallest !== idx) {
            [heap[idx], heap[smallest]] = [heap[smallest], heap[idx]];
            steps.push({
              id: steps.length, type: 'swap', indices: [idx, smallest],
              values: { heap: snapshot() },
              description: `Swapped index ${idx} with ${smallest}. Continuing heapify down...`,
            });
            idx = smallest;
          } else {
            steps.push({
              id: steps.length, type: 'highlight', indices: [idx],
              values: { heap: snapshot() },
              description: `Heap property satisfied at index ${idx}. Heapify down complete.`,
            });
            break;
          }
        }
      }

      steps.push({
        id: steps.length, type: 'done', indices: [],
        values: { heap: snapshot() },
        description: `Dequeue complete. Removed: value=${removed.value}, priority=${removed.priority}. Heap size: ${heap.length}.`,
      });
    }
  }

  return { steps, nextHeap: heap };
}

// ─── Batch operation step generator (legacy/demo mode) ──────────────────────
export function generatePriorityQueueSteps(
  operations: { type: 'enqueue' | 'dequeue'; value?: number; priority?: number }[]
): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const heap: PQNode[] = [];

  const snapshot = () => heap.map(n => ({ ...n }));

  const heapifyUp = (idx: number) => {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      steps.push({
        id: steps.length,
        type: 'compare',
        indices: [parent, idx],
        values: { heap: snapshot() },
        description: `Heapify Up: Comparing priority ${heap[idx].priority} (idx ${idx}) with parent ${heap[parent].priority} (idx ${parent}).`
      });
      if (heap[parent].priority > heap[idx].priority) {
        [heap[parent], heap[idx]] = [heap[idx], heap[parent]];
        steps.push({
          id: steps.length,
          type: 'swap',
          indices: [parent, idx],
          values: { heap: snapshot() },
          description: `Swapped: lower priority element bubbles up.`
        });
        idx = parent;
      } else {
        steps.push({
          id: steps.length,
          type: 'highlight',
          indices: [idx],
          values: { heap: snapshot() },
          description: `Heap property satisfied. Stop.`
        });
        break;
      }
    }
  };

  const heapifyDown = (idx: number) => {
    const n = heap.length;
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;

      steps.push({
        id: steps.length,
        type: 'highlight',
        indices: [idx, left, right].filter(i => i < n),
        values: { heap: snapshot() },
        description: `Heapify Down from index ${idx}.`
      });

      if (left < n && heap[left].priority < heap[smallest].priority) smallest = left;
      if (right < n && heap[right].priority < heap[smallest].priority) smallest = right;

      if (smallest !== idx) {
        steps.push({
          id: steps.length,
          type: 'compare',
          indices: [idx, smallest],
          values: { heap: snapshot() },
          description: `Swapping index ${idx} (priority ${heap[idx].priority}) with index ${smallest} (priority ${heap[smallest].priority}).`
        });
        [heap[idx], heap[smallest]] = [heap[smallest], heap[idx]];
        steps.push({
          id: steps.length,
          type: 'swap',
          indices: [idx, smallest],
          values: { heap: snapshot() },
          description: `Swap done.`
        });
        idx = smallest;
      } else {
        steps.push({
          id: steps.length,
          type: 'highlight',
          indices: [idx],
          values: { heap: snapshot() },
          description: `Heap property satisfied. Stop.`
        });
        break;
      }
    }
  };

  steps.push({
    id: steps.length,
    type: 'highlight',
    indices: [],
    values: { heap: snapshot() },
    description: 'Priority Queue (Min-Heap) initialized. Lowest priority number = highest priority.'
  });

  for (const op of operations) {
    if (op.type === 'enqueue') {
      steps.push({
        id: steps.length,
        type: 'insert',
        indices: [],
        values: { heap: snapshot() },
        description: `Enqueueing value=${op.value} with priority=${op.priority}. Appending at end then heapifying up.`
      });
      heap.push({ value: op.value!, priority: op.priority! });
      steps.push({
        id: steps.length,
        type: 'insert',
        indices: [heap.length - 1],
        values: { heap: snapshot() },
        description: `Added at index ${heap.length - 1}. Now heapifying up.`
      });
      heapifyUp(heap.length - 1);
    }

    if (op.type === 'dequeue') {
      if (heap.length === 0) {
        steps.push({
          id: steps.length,
          type: 'highlight',
          indices: [],
          values: { heap: snapshot() },
          description: 'Priority queue is empty. Nothing to dequeue.'
        });
        continue;
      }
      const removed = heap[0];
      steps.push({
        id: steps.length,
        type: 'delete',
        indices: [0],
        values: { heap: snapshot() },
        description: `Dequeuing root (highest priority): value=${removed.value}, priority=${removed.priority}. Moving last element to root.`
      });
      heap[0] = heap[heap.length - 1];
      heap.pop();
      if (heap.length > 0) {
        steps.push({
          id: steps.length,
          type: 'highlight',
          indices: [0],
          values: { heap: snapshot() },
          description: `Last element moved to root. Heapifying down to restore heap property.`
        });
        heapifyDown(0);
      }
      steps.push({
        id: steps.length,
        type: 'update',
        indices: [],
        values: { heap: snapshot() },
        description: `Dequeue complete. Removed: value=${removed.value}, priority=${removed.priority}.`
      });
    }
  }

  steps.push({
    id: steps.length,
    type: 'done',
    indices: [],
    values: { heap: snapshot() },
    description: 'All Priority Queue operations complete.'
  });

  return steps;
}
