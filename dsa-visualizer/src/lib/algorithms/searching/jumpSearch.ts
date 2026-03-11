import { AlgorithmStep } from '@/lib/types/algorithm';

export function generateJumpSearchSteps(arr: number[], target: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const n = arr.length;
  let step = Math.floor(Math.sqrt(n));
  let prev = 0;

  // Formatting state
  const getState = (currStep: number, currPrev: number) => {
    return `Block Size: ${step}, Prev: ${currPrev}`;
  };

  steps.push({
    id: 0,
    type: 'highlight',
    nodeIds: [],
    edgeIds: [],
    values: { array: [...arr] },
    description: `Starting Jump Search for target ${target}. Block size is √${n} ≈ ${step}.`
  });

  // Jump phase
  while (arr[Math.min(step, n) - 1] < target) {
    steps.push({
      id: steps.length,
      type: 'compare',
      nodeIds: [(Math.min(step, n) - 1).toString()],
      edgeIds: [],
      values: { array: [...arr] },
      description: `Checking block end at index ${Math.min(step, n) - 1} (${arr[Math.min(step, n) - 1]}). It is smaller than target ${target}.`,
      auxiliaryState: { stateInfo: getState(step, prev) }
    });

    prev = step;
    step += Math.floor(Math.sqrt(n));

    steps.push({
      id: steps.length,
      type: 'visit',
      nodeIds: [prev.toString()],
      edgeIds: [],
      values: { array: [...arr] },
      description: `Jumping to next block. New previous index is ${prev}.`,
      auxiliaryState: { stateInfo: getState(step, prev) }
    });

    if (prev >= n) {
      steps.push({
        id: steps.length,
        type: 'not_found',
        nodeIds: [],
        edgeIds: [],
        values: { array: [...arr] },
        description: `Target ${target} not found.`,
        auxiliaryState: { stateInfo: getState(step, prev) }
      });
      return steps;
    }
  }

  // Linear Search phase
  steps.push({
      id: steps.length,
      type: 'highlight',
      nodeIds: [],
      edgeIds: [],
      values: { array: [...arr] },
      description: `Block found! Target ${target} must be between index ${prev} and ${Math.min(step, n) - 1}. Starting linear search.`,
      auxiliaryState: { stateInfo: getState(step, prev) }
  });

  while (arr[prev] < target) {
    steps.push({
      id: steps.length,
      type: 'compare',
      nodeIds: [prev.toString()],
      edgeIds: [],
      values: { array: [...arr] },
      description: `Checking index ${prev} (${arr[prev]}). It is smaller than target ${target}.`,
      auxiliaryState: { stateInfo: getState(step, prev) }
    });
    
    prev++;

    if (prev === Math.min(step, n)) {
      steps.push({
        id: steps.length,
        type: 'done',
        nodeIds: [],
        edgeIds: [],
        values: { array: [...arr] },
        description: `Reached end of block without finding target. Target ${target} not found.`,
        auxiliaryState: { stateInfo: getState(step, prev) }
      });
      return steps;
    }
  }

  steps.push({
      id: steps.length,
      type: 'compare',
      nodeIds: [prev.toString()],
      edgeIds: [],
      values: { array: [...arr] },
      description: `Final check at index ${prev} (${arr[prev]}).`,
      auxiliaryState: { stateInfo: getState(step, prev) }
  });

  if (arr[prev] === target) {
     steps.push({
        id: steps.length,
        type: 'done',
        nodeIds: [prev.toString()],
        edgeIds: [],
        values: { array: [...arr] },
        description: `Target ${target} found at index ${prev}!`,
        auxiliaryState: { stateInfo: getState(step, prev) }
      });
  } else {
     steps.push({
        id: steps.length,
        type: 'done',
        nodeIds: [],
        edgeIds: [],
        values: { array: [...arr] },
        description: `Element at index ${prev} is ${arr[prev]}, not ${target}. Target not found.`,
        auxiliaryState: { stateInfo: getState(step, prev) }
      });
  }

  return steps;
}
