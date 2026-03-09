import { AlgorithmStep } from '@/lib/types/algorithm';

export function generateMergeSortSteps(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const a = [...arr];

  function mergeSort(low: number, high: number) {
    if (low >= high) return;
    const mid = Math.floor((low + high) / 2);
    
    mergeSort(low, mid);
    mergeSort(mid + 1, high);
    merge(low, mid, high);
  }

  function merge(low: number, mid: number, high: number) {
    let left = low;
    let right = mid + 1;
    const temp: number[] = [];

    steps.push({
      id: steps.length,
      type: 'highlight',
      indices: Array.from({ length: high - low + 1 }, (_, i) => low + i),
      values: { array: [...a] },
      description: `Merging subarrays: [${low} to ${mid}] and [${mid + 1} to ${high}]`,
    });

    while (left <= mid && right <= high) {
      steps.push({
        id: steps.length,
        type: 'compare',
        indices: [left, right],
        values: { array: [...a] },
        description: `Comparing left half element ${a[left]} with right half element ${a[right]}`,
      });

      if (a[left] <= a[right]) {
        temp.push(a[left]);
        left++;
      } else {
        temp.push(a[right]);
        right++;
      }
    }

    while (left <= mid) {
      temp.push(a[left]);
      left++;
    }

    while (right <= high) {
      temp.push(a[right]);
      right++;
    }

    for (let i = low; i <= high; i++) {
      a[i] = temp[i - low];
      steps.push({
        id: steps.length,
        type: 'update',
        indices: [i],
        values: { array: [...a] },
        description: `Updating index ${i} with merged value ${a[i]}`,
      });
    }

    steps.push({
      id: steps.length,
      type: 'sorted',
      indices: Array.from({ length: high - low + 1 }, (_, i) => low + i),
      values: { array: [...a] },
      description: `Subarray from index ${low} to ${high} is now merged and sorted`,
    });
  }

  mergeSort(0, a.length - 1);

  steps.push({
    id: steps.length,
    type: 'sorted',
    indices: Array.from({ length: a.length }, (_, i) => i),
    values: { array: [...a] },
    description: `Array is fully sorted!`,
  });

  return steps;
}
