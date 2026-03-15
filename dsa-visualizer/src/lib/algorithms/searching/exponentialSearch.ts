import { AlgorithmStep } from '@/lib/types/algorithm';

export function generateExponentialSearchSteps(arr: number[], target: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const n = arr.length;

  steps.push({
    id: steps.length,
    type: 'highlight',
    indices: [],
    values: { array: [...arr] },
    description: `Starting Exponential Search for target ${target} in sorted array of ${n} elements.`,
  });

  if (n === 0) {
    steps.push({ id: steps.length, type: 'not_found', indices: [], values: { array: [] }, description: 'Array is empty.' });
    return steps;
  }

  // Check first element
  steps.push({
    id: steps.length,
    type: 'compare',
    indices: [0],
    values: { array: [...arr] },
    description: `Checking index 0 (${arr[0]}) against target ${target}.`,
  });

  if (arr[0] === target) {
    steps.push({ id: steps.length, type: 'done', indices: [0], values: { array: [...arr] }, description: `Target ${target} found at index 0!` });
    return steps;
  }

  // Find range for binary search
  let i = 1;
  while (i < n && arr[i] <= target) {
    steps.push({
      id: steps.length,
      type: 'visit',
      indices: [i],
      values: { array: [...arr], bound: i },
      description: `Doubling bound: checking index ${i} (value ${arr[i]}). ${arr[i] <= target ? `${arr[i]} ≤ ${target}, keep doubling.` : `${arr[i]} > ${target}, stop here.`}`,
      auxiliaryState: { stateInfo: `Bound: ${i}` },
    });
    i *= 2;
  }

  // Binary search in found range
  const left = Math.floor(i / 2);
  const right = Math.min(i, n - 1);

  steps.push({
    id: steps.length,
    type: 'highlight',
    indices: [],
    values: { array: [...arr], bound: right },
    description: `Range found! Running Binary Search between index ${left} and ${right}.`,
    auxiliaryState: { stateInfo: `Binary Search: [${left}, ${right}]` },
  });

  let lo = left, hi = right;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    steps.push({
      id: steps.length,
      type: 'compare',
      indices: [mid],
      values: { array: [...arr], bound: i },
      description: `Binary Search: mid = ${mid} (value ${arr[mid]}). ${arr[mid] === target ? 'Match!' : arr[mid] < target ? `${arr[mid]} < ${target} → go right.` : `${arr[mid]} > ${target} → go left.`}`,
      auxiliaryState: { stateInfo: `lo=${lo}, hi=${hi}, mid=${mid}` },
    });

    if (arr[mid] === target) {
      steps.push({ id: steps.length, type: 'done', indices: [mid], values: { array: [...arr] }, description: `Target ${target} found at index ${mid}!` });
      return steps;
    } else if (arr[mid] < target) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  steps.push({ id: steps.length, type: 'not_found', indices: [], values: { array: [...arr] }, description: `Target ${target} not found in the array.` });
  return steps;
}
