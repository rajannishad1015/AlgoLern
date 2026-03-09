import { AlgorithmStep } from '@/lib/types/algorithm';

export function generateSelectionSortSteps(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const a = [...arr];
  const n = a.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    
    steps.push({
      id: steps.length,
      type: 'highlight',
      indices: [minIdx],
      values: { array: [...a] },
      description: `Assuming element at index ${i} (${a[minIdx]}) is the minimum.`,
    });

    for (let j = i + 1; j < n; j++) {
      steps.push({
        id: steps.length,
        type: 'compare',
        indices: [minIdx, j],
        values: { array: [...a] },
        description: `Comparing assumed minimum ${a[minIdx]} with ${a[j]}.`,
      });

      if (a[j] < a[minIdx]) {
        minIdx = j;
        steps.push({
          id: steps.length,
          type: 'highlight',
          indices: [minIdx],
          values: { array: [...a] },
          description: `Found a new minimum: ${a[minIdx]} at index ${j}.`,
        });
      }
    }

    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      steps.push({
        id: steps.length,
        type: 'swap',
        indices: [i, minIdx],
        values: { array: [...a] },
        description: `Swapped the minimum value ${a[i]} with the first unsorted element ${a[minIdx]}.`,
      });
    }

    steps.push({
      id: steps.length,
      type: 'sorted',
      indices: [i],
      values: { array: [...a] },
      description: `Element ${a[i]} is now securely in its correct sorted position.`,
    });
  }

  // The last element is naturally sorted.
  steps.push({
    id: steps.length,
    type: 'sorted',
    indices: [n - 1],
    values: { array: [...a] },
    description: `Array is fully sorted!`,
  });

  return steps;
}
