import { AlgorithmStep } from '@/lib/types/algorithm';

type StackOperation = 
  | { type: 'push', value: number }
  | { type: 'pop' };

export function generateStackSteps(operations: StackOperation[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const stack: number[] = [];
  
  // Initial empty state
  steps.push({
    id: steps.length,
    type: 'highlight',
    indices: [],
    values: { array: [] },
    description: `Initial state: Stack is empty.`,
  });

  operations.forEach((op) => {
    if (op.type === 'push') {
      stack.push(op.value);
      steps.push({
        id: steps.length,
        type: 'insert',
        indices: [stack.length - 1], // The top of the stack
        values: { array: [...stack] },
        description: `Pushing ${op.value} onto the stack.`,
      });
    } else if (op.type === 'pop') {
      if (stack.length > 0) {
        const popped = stack[stack.length - 1];
        steps.push({
          id: steps.length,
          type: 'delete',
          indices: [stack.length - 1],
          values: { array: [...stack] }, // Array before popping to highlight the element being removed
          description: `Popping ${popped} from the top of the stack.`,
        });
        
        stack.pop();
        steps.push({
          id: steps.length,
          type: 'update',
          indices: [],
          values: { array: [...stack] },
          description: `${popped} removed. Stack size is now ${stack.length}.`,
        });
      } else {
        steps.push({
          id: steps.length,
          type: 'highlight',
          indices: [],
          values: { array: [...stack] },
          description: `Cannot pop from an empty stack (Stack Underflow).`,
        });
      }
    }
  });

  steps.push({
    id: steps.length,
    type: 'done',
    indices: [],
    values: { array: [...stack] },
    description: `All operations completed.`,
  });

  return steps;
}
