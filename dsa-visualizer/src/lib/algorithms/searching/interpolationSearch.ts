import { AlgorithmStep } from '@/lib/types/algorithm';

export function generateInterpolationSearchSteps(arr: number[], target: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const n = arr.length;

  steps.push({
    id: steps.length,
    type: 'highlight',
    indices: [],
    values: { array: [...arr] },
    description: `Starting Interpolation Search for target ${target}. Works best on uniformly distributed sorted arrays.`,
  });

  let lo = 0, hi = n - 1;

  while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
    if (lo === hi) {
      steps.push({
        id: steps.length,
        type: 'compare',
        indices: [lo],
        values: { array: [...arr] },
        description: `Only one element left at index ${lo} (value ${arr[lo]}).`,
      });
      if (arr[lo] === target) {
        steps.push({ id: steps.length, type: 'done', indices: [lo], values: { array: [...arr] }, description: `Target ${target} found at index ${lo}!` });
      } else {
        steps.push({ id: steps.length, type: 'not_found', indices: [], values: { array: [...arr] }, description: `Target ${target} not found.` });
      }
      return steps;
    }

    // Interpolation formula
    const pos = lo + Math.floor(((target - arr[lo]) / (arr[hi] - arr[lo])) * (hi - lo));

    steps.push({
      id: steps.length,
      type: 'compare',
      indices: [pos],
      values: { array: [...arr] },
      description: `Interpolated probe at index ${pos} (value ${arr[pos]}). Formula: lo + ((target - arr[lo]) / (arr[hi] - arr[lo])) × (hi - lo) = ${pos}.`,
      auxiliaryState: { stateInfo: `lo=${lo}, hi=${hi}, pos=${pos}` },
    });

    if (arr[pos] === target) {
      steps.push({ id: steps.length, type: 'done', indices: [pos], values: { array: [...arr] }, description: `Target ${target} found at index ${pos}!` });
      return steps;
    }

    if (arr[pos] < target) {
      steps.push({
        id: steps.length,
        type: 'visit',
        indices: [pos],
        values: { array: [...arr] },
        description: `arr[${pos}] = ${arr[pos]} < ${target}. Moving lo to ${pos + 1}.`,
        auxiliaryState: { stateInfo: `lo=${pos + 1}, hi=${hi}` },
      });
      lo = pos + 1;
    } else {
      steps.push({
        id: steps.length,
        type: 'visit',
        indices: [pos],
        values: { array: [...arr] },
        description: `arr[${pos}] = ${arr[pos]} > ${target}. Moving hi to ${pos - 1}.`,
        auxiliaryState: { stateInfo: `lo=${lo}, hi=${pos - 1}` },
      });
      hi = pos - 1;
    }
  }

  steps.push({ id: steps.length, type: 'not_found', indices: [], values: { array: [...arr] }, description: `Target ${target} not found in the array.` });
  return steps;
}
