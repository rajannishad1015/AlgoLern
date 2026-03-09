import { AlgorithmStep } from '@/lib/types/algorithm';

export function generateQuickSortSteps(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const a = [...arr];

  function quickSort(low: number, high: number) {
    if (low < high) {
      const pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    } else if (low === high) {
      steps.push({
        id: steps.length,
        type: 'sorted',
        indices: [low],
        values: { array: [...a] },
        description: `Base case reached. Element ${a[low]} is sorted.`,
      });
    }
  }

  function partition(low: number, high: number): number {
    const pivot = a[high];
    steps.push({
      id: steps.length,
      type: 'highlight',
      indices: [high],
      values: { array: [...a] },
      description: `Choosing pivot: ${pivot} at index ${high}. Partitioning subarray from index ${low} to ${high}.`,
    });

    let i = low - 1;

    for (let j = low; j < high; j++) {
      steps.push({
        id: steps.length,
        type: 'compare',
        indices: [j, high],
        values: { array: [...a] },
        description: `Comparing ${a[j]} with pivot ${pivot}.`,
      });

      if (a[j] < pivot) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
        
        if (i !== j) {
          steps.push({
            id: steps.length,
            type: 'swap',
            indices: [i, j],
            values: { array: [...a] },
            description: `${a[j]} < ${pivot}. Swapping ${a[i]} and ${a[j]} to move smaller element to left partition.`,
          });
        }
      }
    }

    [a[i + 1], a[high]] = [a[high], a[i + 1]];
    steps.push({
      id: steps.length,
      type: 'swap',
      indices: [i + 1, high],
      values: { array: [...a] },
      description: `Partition loop done. Placing pivot ${pivot} into its correct sorted position at index ${i + 1}.`,
    });

    steps.push({
      id: steps.length,
      type: 'sorted',
      indices: [i + 1],
      values: { array: [...a] },
      description: `Pivot ${pivot} is now correctly sorted. LHS (< ${pivot}) and RHS (> ${pivot}) partitions created.`,
    });

    return i + 1;
  }

  quickSort(0, a.length - 1);

  steps.push({
    id: steps.length,
    type: 'sorted',
    indices: Array.from({ length: a.length }, (_, i) => i),
    values: { array: [...a] },
    description: `Array is fully sorted!`,
  });

  return steps;
}
