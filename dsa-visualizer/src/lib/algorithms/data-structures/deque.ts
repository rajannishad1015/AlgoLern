import { AlgorithmStep } from '@/lib/types/algorithm';

export type DequeItem = { value: number; id: string };

export function generateDequeSteps(
  operations: ({ type: 'addFront' | 'addRear' | 'removeFront' | 'removeRear'; value?: number })[]
): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const deque: DequeItem[] = [];
  let idCnt = 0;

  const snap = () => deque.map(d => ({ ...d }));

  steps.push({
    id: steps.length, type: 'highlight', indices: [],
    values: { deque: snap() },
    description: 'Deque (Double-Ended Queue) initialized. Items can be added/removed from both ends.'
  });

  for (const op of operations) {
    if (op.type === 'addFront') {
      const item: DequeItem = { value: op.value!, id: `d${idCnt++}` };
      steps.push({
        id: steps.length, type: 'highlight', indices: [],
        values: { deque: snap() },
        description: `addFront(${op.value}): Inserting ${op.value} at the FRONT of the deque.`
      });
      deque.unshift(item);
      steps.push({
        id: steps.length, type: 'insert', indices: [0],
        values: { deque: snap() },
        description: `${op.value} added to front. Deque size: ${deque.length}.`
      });
    }

    if (op.type === 'addRear') {
      const item: DequeItem = { value: op.value!, id: `d${idCnt++}` };
      steps.push({
        id: steps.length, type: 'highlight', indices: [],
        values: { deque: snap() },
        description: `addRear(${op.value}): Inserting ${op.value} at the REAR of the deque.`
      });
      deque.push(item);
      steps.push({
        id: steps.length, type: 'insert', indices: [deque.length - 1],
        values: { deque: snap() },
        description: `${op.value} added to rear. Deque size: ${deque.length}.`
      });
    }

    if (op.type === 'removeFront') {
      if (deque.length === 0) {
        steps.push({ id: steps.length, type: 'highlight', indices: [], values: { deque: snap() }, description: 'removeFront: Deque is empty!' });
        continue;
      }
      const removed = deque[0];
      steps.push({
        id: steps.length, type: 'delete', indices: [0],
        values: { deque: snap() },
        description: `removeFront(): Removing ${removed.value} from the front.`
      });
      deque.shift();
      steps.push({
        id: steps.length, type: 'update', indices: [],
        values: { deque: snap() },
        description: `${removed.value} removed from front. Deque size: ${deque.length}.`
      });
    }

    if (op.type === 'removeRear') {
      if (deque.length === 0) {
        steps.push({ id: steps.length, type: 'highlight', indices: [], values: { deque: snap() }, description: 'removeRear: Deque is empty!' });
        continue;
      }
      const removed = deque[deque.length - 1];
      steps.push({
        id: steps.length, type: 'delete', indices: [deque.length - 1],
        values: { deque: snap() },
        description: `removeRear(): Removing ${removed.value} from the rear.`
      });
      deque.pop();
      steps.push({
        id: steps.length, type: 'update', indices: [],
        values: { deque: snap() },
        description: `${removed.value} removed from rear. Deque size: ${deque.length}.`
      });
    }
  }

  steps.push({
    id: steps.length, type: 'done', indices: [],
    values: { deque: snap() },
    description: 'All Deque operations complete.'
  });

  return steps;
}
