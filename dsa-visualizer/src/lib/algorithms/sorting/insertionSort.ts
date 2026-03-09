import { AlgorithmStep } from '@/lib/types/algorithm';

export function generateInsertionSortSteps(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const a = [...arr];
  const n = a.length;

  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;

    steps.push({
      id: steps.length,
      type: 'highlight',
      indices: [i],
      values: { array: [...a] },
      description: `Selecting ${key} as key. We will find its correct position among the previous elements.`,
    });

    while (j >= 0 && a[j] > key) {
      steps.push({
        id: steps.length,
        type: 'compare',
        indices: [j, j + 1],
        values: { array: [...a] },
        description: `Comparing ${key} with ${a[j]}. Since ${a[j]} > ${key}, move ${a[j]} one position ahead.`,
      });

      a[j + 1] = a[j];
      
      steps.push({
        id: steps.length,
        type: 'update',
        indices: [j, j + 1],
        values: { array: [...a] },
        description: `Moved ${a[j]} to the right.`,
      });

      j--;
    }

    a[j + 1] = key;
    steps.push({
      id: steps.length,
      type: 'swap',
      indices: [j + 1],
      values: { array: [...a] },
      description: `Inserted key ${key} into its correct sorted position within the current window.`,
    });
  }

  steps.push({
    id: steps.length,
    type: 'sorted',
    indices: Array.from({ length: n }, (_, i) => i),
    values: { array: [...a] },
    description: `Array is fully sorted!`,
  });

  return steps;
}
