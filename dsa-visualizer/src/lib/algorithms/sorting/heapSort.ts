import { AlgorithmStep } from '@/lib/types/algorithm';

export function generateHeapSortSteps(initialArray: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const array = [...initialArray];
  const n = array.length;

  steps.push({
    id: steps.length,
    type: 'highlight',
    indices: [],
    values: { array: [...array] },
    description: "Starting Heap Sort. First, we need to build a max heap from the array."
  });

  const heapify = (arr: number[], length: number, i: number) => {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    steps.push({
      id: steps.length,
      type: 'highlight',
      indices: [i, left, right].filter(idx => idx < length),
      values: { array: [...arr] },
      description: `Targeting node at index ${i} to ensure max heap property.`
    });

    if (left < length && arr[left] > arr[largest]) {
      largest = left;
    }

    if (right < length && arr[right] > arr[largest]) {
      largest = right;
    }

    if (largest !== i) {
      steps.push({
        id: steps.length,
        type: 'compare',
        indices: [i, largest],
        values: { array: [...arr] },
        description: `Found a larger child at index ${largest}. Swapping with parent at index ${i}.`
      });

      // Swap
      [arr[i], arr[largest]] = [arr[largest], arr[i]];

      steps.push({
        id: steps.length,
        type: 'swap',
        indices: [i, largest],
        values: { array: [...arr] },
        description: `Swapped! Recursively heapifying the affected sub-tree.`
      });

      heapify(arr, length, largest);
    } else {
      steps.push({
        id: steps.length,
        type: 'highlight',
        indices: [i],
        values: { array: [...arr] },
        description: `Node at index ${i} satisfies max heap property.`
      });
    }
  };

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(array, n, i);
  }

  steps.push({
    id: steps.length,
    type: 'highlight',
    indices: [],
    values: { array: [...array] },
    description: "Max heap generated! The largest element is now at the root (index 0). We will repeatedly extract the root."
  });

  // Extract elements from heap one by one
  for (let i = n - 1; i > 0; i--) {
    steps.push({
      id: steps.length,
      type: 'highlight',
      indices: [0, i],
      values: { array: [...array] },
      description: `Swapping root (largest element) with the last unplaced element at index ${i}.`
    });

    // Move current root to end
    [array[0], array[i]] = [array[i], array[0]];

    steps.push({
      id: steps.length,
      type: 'swap',
      indices: [0, i],
      values: { array: [...array] },
      description: `Swapped root to position ${i}.`
    });

    steps.push({
      id: steps.length,
      type: 'sorted',
      indices: [i],
      values: { array: [...array] },
      description: `Element ${array[i]} is now in its correctly sorted position.`
    });

    // call max heapify on the reduced heap
    heapify(array, i, 0);
  }

  steps.push({
    id: steps.length,
    type: 'sorted',
    indices: [0],
    values: { array: [...array] },
    description: "Heap Sort complete! The array is fully sorted."
  });

  return steps;
}
