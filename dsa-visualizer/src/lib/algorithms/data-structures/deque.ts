import { AlgorithmStep } from '@/lib/types/algorithm';

export function generateSingleDequeSteps(
  currentDeque: number[],
  op: 
    | { type: 'addFront'; value: number } 
    | { type: 'addRear'; value: number } 
    | { type: 'removeFront' } 
    | { type: 'removeRear' }
): { steps: AlgorithmStep[]; nextDeque: number[] } {
  const deque = [...currentDeque];
  const steps: AlgorithmStep[] = [];

  steps.push({
    id: 0, type: 'highlight', indices: [],
    values: { array: [...deque] },
    description: `Deque has ${deque.length} element${deque.length !== 1 ? 's' : ''}. FRONT is ${deque.length > 0 ? deque[0] : 'NULL'} and REAR is ${deque.length > 0 ? deque[deque.length - 1] : 'NULL'}.`,
  });

  if (op.type === 'addFront') {
    steps.push({
      id: 1, type: 'insert', indices: [0], // For animation purposes, we treat it as adding at front
      values: { array: [op.value, ...deque] },
      description: `Adding ${op.value} to the FRONT of the Deque.`,
    });
    deque.unshift(op.value);
    steps.push({
      id: 2, type: 'done', indices: [],
      values: { array: [...deque] },
      description: `Add Front complete. ${op.value} is now at the FRONT. Deque size: ${deque.length}.`,
    });
  } else if (op.type === 'addRear') {
    steps.push({
      id: 1, type: 'insert', indices: [deque.length], // Adding at rear
      values: { array: [...deque, op.value] },
      description: `Adding ${op.value} to the REAR of the Deque.`,
    });
    deque.push(op.value);
    steps.push({
      id: 2, type: 'done', indices: [],
      values: { array: [...deque] },
      description: `Add Rear complete. ${op.value} is now at the REAR. Deque size: ${deque.length}.`,
    });
  } else if (op.type === 'removeFront') {
    if (deque.length === 0) {
      steps.push({
        id: 1, type: 'highlight', indices: [],
        values: { array: [] },
        description: `Deque is EMPTY — cannot remove from Front (Underflow Error).`,
      });
    } else {
      const removed = deque[0];
      steps.push({
        id: 1, type: 'delete', indices: [0], // Highlighting front element
        values: { array: [...deque] },
        description: `Removing FRONT element: ${removed}.`,
      });
      deque.shift();
      steps.push({
        id: 2, type: 'done', indices: [],
        values: { array: [...deque] },
        description: `Remove Front complete. ${removed} removed. New FRONT: ${deque.length > 0 ? deque[0] : 'NULL'}.`,
      });
    }
  } else if (op.type === 'removeRear') {
    if (deque.length === 0) {
      steps.push({
        id: 1, type: 'highlight', indices: [],
        values: { array: [] },
        description: `Deque is EMPTY — cannot remove from Rear (Underflow Error).`,
      });
    } else {
      const removed = deque[deque.length - 1];
      steps.push({
        id: 1, type: 'delete', indices: [deque.length - 1], // Highlighting rear element
        values: { array: [...deque] },
        description: `Removing REAR element: ${removed}.`,
      });
      deque.pop();
      steps.push({
        id: 2, type: 'done', indices: [],
        values: { array: [...deque] },
        description: `Remove Rear complete. ${removed} removed. New REAR: ${deque.length > 0 ? deque[deque.length - 1] : 'NULL'}.`,
      });
    }
  }

  return { steps, nextDeque: deque };
}
