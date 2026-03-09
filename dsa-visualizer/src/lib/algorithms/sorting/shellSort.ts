import { AlgorithmStep } from '@/lib/types/algorithm';

export function generateShellSortSteps(initialArray: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const array = [...initialArray];
  const n = array.length;

  steps.push({
    id: steps.length,
    type: 'highlight',
    indices: [],
    values: { array: [...array] },
    description: "Starting Shell Sort. This is an optimization of insertion sort measuring array elements divided by a scaling gap."
  });

  // Start with a large gap, then reduce the gap
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    steps.push({
      id: steps.length,
      type: 'highlight',
      indices: [],
      values: { array: [...array] },
      description: `Current gap distance configured to ${gap}. Comparing elements separated by distance ${gap}.`
    });

    // Do a gapped insertion sort for this gap size.
    for (let i = gap; i < n; i++) {
      const temp = array[i];
      let j;
      
      steps.push({
        id: steps.length,
        type: 'highlight',
        indices: [i],
        values: { array: [...array] },
        description: `Storing value ${temp} at index ${i} to perform gapped insertion shifting.`
      });

      for (j = i; j >= gap && array[j - gap] > temp; j -= gap) {
        steps.push({
          id: steps.length,
          type: 'compare',
          indices: [j, j - gap],
          values: { array: [...array] },
          description: `Array element at ${j - gap} is larger! Shifting it right across the gap.`
        });

        // Shift larger elements across the gap
        array[j] = array[j - gap];
        
        steps.push({
          id: steps.length,
          type: 'swap',
          indices: [j, j - gap],
          values: { array: [...array] },
          description: `Value shifted. Searching previous gap.`
        });
      }

      // Put temp in its correct location
      array[j] = temp;
      steps.push({
        id: steps.length,
        type: 'insert',
        indices: [j],
        values: { array: [...array] },
        description: `Inserting the stored value ${temp} at its found sorted gap position ${j}.`
      });
    }
  }

  for (let i = 0; i < array.length; i++) {
      steps.push({
        id: steps.length,
        type: 'sorted',
        indices: [i],
        values: { array: [...array] },
        description: `Element confirmed fully sorted.`
      });
  }

  steps.push({
    id: steps.length,
    type: 'done',
    indices: [],
    values: { array: [...array] },
    description: "Shell Sort complete! The array gap reached 1 (insertion sort) and elements are fully sorted."
  });

  return steps;
}
