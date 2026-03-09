import { AlgorithmStep } from '@/lib/types/algorithm';

type QueueOperation = 
  | { type: 'enqueue', value: number }
  | { type: 'dequeue' };

export function generateQueueSteps(operations: QueueOperation[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const queue: number[] = [];
  
  // Initial empty state
  steps.push({
    id: steps.length,
    type: 'highlight',
    indices: [],
    values: { array: [] },
    description: `Initial state: Queue is empty.`,
  });

  operations.forEach((op) => {
    if (op.type === 'enqueue') {
      queue.push(op.value);
      steps.push({
        id: steps.length,
        type: 'insert',
        indices: [queue.length - 1], // The back of the queue
        values: { array: [...queue] },
        description: `Enqueueing ${op.value} to the back of the queue.`,
      });
    } else if (op.type === 'dequeue') {
      if (queue.length > 0) {
        const dequeued = queue[0];
        steps.push({
          id: steps.length,
          type: 'delete',
          indices: [0], // The front of the queue
          values: { array: [...queue] }, // Array before popping to highlight the element
          description: `Dequeueing ${dequeued} from the front of the queue.`,
        });
        
        queue.shift();
        steps.push({
          id: steps.length,
          type: 'update',
          indices: [],
          values: { array: [...queue] },
          description: `${dequeued} removed. Queue size is now ${queue.length}.`,
        });
      } else {
        steps.push({
          id: steps.length,
          type: 'highlight',
          indices: [],
          values: { array: [...queue] },
          description: `Cannot dequeue from an empty queue.`,
        });
      }
    }
  });

  steps.push({
    id: steps.length,
    type: 'done',
    indices: [],
    values: { array: [...queue] },
    description: `All operations completed.`,
  });

  return steps;
}
