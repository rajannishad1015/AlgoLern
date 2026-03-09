import { AlgorithmStep } from '@/lib/types/algorithm';

export function generateBubbleSortSteps(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const a = [...arr];
  const n = a.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        id: steps.length,
        type: 'compare',
        indices: [j, j + 1],
        values: { array: [...a] },
        description: `Comparing ${a[j]} and ${a[j + 1]}`,
        codeLine: 4,
      });

      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({
          id: steps.length,
          type: 'swap',
          indices: [j, j + 1],
          values: { array: [...a] },
          description: `Swapped ${a[j + 1]} and ${a[j]} since ${a[j + 1]} > ${a[j]}`,
          codeLine: 6,
        });
      }
    }
    steps.push({
      id: steps.length,
      type: 'sorted',
      indices: [n - i - 1],
      values: { array: [...a] },
      description: `Element ${a[n - i - 1]} is now in its correct sorted position`,
    });
  }
  
  // The first element is always sorted after the loops complete
  steps.push({
    id: steps.length,
    type: 'sorted',
    indices: [0],
    values: { array: [...a] },
    description: `Array is fully sorted!`,
  });

  return steps;
}
