import { AlgorithmStep } from '@/lib/types/algorithm';

export function generateRadixSortSteps(initialArray: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const array = [...initialArray];
  
  if (array.length === 0) return steps;

  steps.push({
    id: steps.length,
    type: 'highlight',
    indices: [],
    values: { array: [...array] },
    description: "Starting Radix Sort. Finding the maximum number to determine digit length."
  });

  let max = array[0];
  for (let i = 1; i < array.length; i++) {
    if (array[i] > max) max = array[i];
  }

  steps.push({
    id: steps.length,
    type: 'highlight',
    indices: [],
    values: { array: [...array] },
    description: `Maximum value is ${max}. Sorting iteratively starting from the least significant digit.`
  });

  // Helper function for stable sorting by a specific digit
  const countingSortByDigit = (arr: number[], exp: number) => {
    const output = new Array(arr.length).fill(0);
    const count = new Array(10).fill(0);

    // Count frequencies of the current digit
    for (let i = 0; i < arr.length; i++) {
      const digit = Math.floor(arr[i] / exp) % 10;
      count[digit]++;
      steps.push({
        id: steps.length,
        type: 'highlight',
        indices: [i],
        values: { array: [...arr] },
        description: `Analyzing element ${arr[i]}. Current mapped digit at base ${exp} is ${digit}.`,
        auxiliaryState: {
          exp: exp,
          currentDigit: digit
        }
      });
    }

    // Cumulative sum
    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
    }

    // Build the output array from back to front to maintain stable ordering
    for (let i = arr.length - 1; i >= 0; i--) {
      const digit = Math.floor(arr[i] / exp) % 10;
      const targetIndex = count[digit] - 1;
      output[targetIndex] = arr[i];
      count[digit]--;
      
      steps.push({
        id: steps.length,
        type: 'insert',
        indices: [i],
        values: { array: [...arr] }, // visualizing off original
        description: `Placing value ${arr[i]} into auxiliary array based on digit ${digit}.`,
        auxiliaryState: {
           exp: exp,
           targetIndex
        }
      });
    }

    // Copy built output back to original array
    for (let i = 0; i < arr.length; i++) {
      arr[i] = output[i];
    }
    
    steps.push({
      id: steps.length,
      type: 'update',
      indices: [],
      values: { array: [...arr] },
      description: `Completed sorting pass for digit multiplier ${exp}. Array re-ordered!`
    });
  };

  // Perform counting sort for every digit.
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    countingSortByDigit(array, exp);
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
    description: "Radix Sort complete! Elements sorted through their positional digits."
  });

  return steps;
}
