import { AlgorithmStep } from '@/lib/types/algorithm';

export function generateBinarySearchSteps(arr: number[], target: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const currentArray = [...arr];

  // Helper to get visually formatted state
  const getPointers = (left: number, mid: number, right: number) => {
    return `Left: ${left}, Mid: ${mid}, Right: ${right}`;
  };

  steps.push({
    id: 0,
    type: 'highlight',
    nodeIds: [],
    edgeIds: [],
    values: { array: [...currentArray] },
    description: `Starting Binary Search for target ${target}. (Array must be sorted)`
  });

  let left = 0;
  let right = currentArray.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    steps.push({
      id: steps.length,
      type: 'visit',
      nodeIds: [left.toString(), right.toString()],
      edgeIds: [],
      values: { array: [...currentArray] },
      description: `Current search space is between indices [${left}, ${right}].`,
      auxiliaryState: { pointerInfo: getPointers(left, mid, right) }
    });

    steps.push({
      id: steps.length,
      type: 'compare',
      nodeIds: [mid.toString()],
      edgeIds: [],
      values: { array: [...currentArray] },
      description: `Checking middle element at index ${mid} (${currentArray[mid]}) against target ${target}.`,
      auxiliaryState: { pointerInfo: getPointers(left, mid, right) }
    });

    if (currentArray[mid] === target) {
      steps.push({
        id: steps.length,
        type: 'done',
        nodeIds: [mid.toString()],
        edgeIds: [],
        values: { array: [...currentArray] },
        description: `Target ${target} found at index ${mid}!`,
        auxiliaryState: { pointerInfo: getPointers(left, mid, right) }
      });
      return steps;
    }

    if (currentArray[mid] < target) {
      steps.push({
        id: steps.length,
        type: 'highlight',
        nodeIds: [mid.toString()],
        edgeIds: [],
        values: { array: [...currentArray] },
        description: `${currentArray[mid]} is less than target ${target}. Discarding left half.`,
        auxiliaryState: { pointerInfo: getPointers(left, mid, right) }
      });
      left = mid + 1;
    } else {
      steps.push({
        id: steps.length,
        type: 'highlight',
        nodeIds: [mid.toString()],
        edgeIds: [],
        values: { array: [...currentArray] },
        description: `${currentArray[mid]} is greater than target ${target}. Discarding right half.`,
        auxiliaryState: { pointerInfo: getPointers(left, mid, right) }
      });
      right = mid - 1;
    }
  }

  steps.push({
    id: steps.length,
    type: 'done',
    nodeIds: [],
    edgeIds: [],
    values: { array: [...currentArray] },
    description: `Search space exhausted (Left > Right). Target ${target} not found.`
  });

  return steps;
}
