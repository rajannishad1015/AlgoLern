import { AlgorithmStep } from '@/lib/types/algorithm';

export function generateCountingSortSteps(initialArray: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const array = [...initialArray];
  
  if (array.length === 0) return steps;

  steps.push({
    id: steps.length,
    type: 'highlight',
    indices: [],
    values: { array: [...array] },
    description: "Starting Counting Sort. First we find the maximum value to size our frequency array."
  });

  let max = array[0];
  let min = array[0];
  for (let i = 1; i < array.length; i++) {
    steps.push({
      id: steps.length,
      type: 'compare',
      indices: [i],
      values: { array: [...array] },
      description: `Scanning minimum and maximum values: min=${min}, max=${max}. Checking ${array[i]}.`
    });
    if (array[i] > max) max = array[i];
    if (array[i] < min) min = array[i];
  }

  // Determine array offset in case of negative numbers
  const range = max - min + 1;
  const count = new Array(range).fill(0);
  const output = new Array(array.length).fill(0);

  steps.push({
    id: steps.length,
    type: 'highlight',
    indices: [],
    values: { array: [...array] },
    description: `Array range is ${min} to ${max}. Counting frequencies of each element.`
  });

  // Calculate frequencies
  for (let i = 0; i < array.length; i++) {
    count[array[i] - min]++;
    steps.push({
      id: steps.length,
      type: 'highlight',
      indices: [i],
      values: { array: [...array] },
      description: `Found value ${array[i]}. Frequency mapping updated.`,
      auxiliaryState: {
        frequencyMap: JSON.stringify(count)
      }
    });
  }

  steps.push({
    id: steps.length,
    type: 'highlight',
    indices: [],
    values: { array: [...array] },
    description: `Frequency counting completed. Calculating cumulative running sums to determine absolute positions.`,
    auxiliaryState: {
      frequencyMap: JSON.stringify(count)
    }
  });

  // Calculate cumulative count
  for (let i = 1; i < count.length; i++) {
    count[i] += count[i - 1];
  }

  steps.push({
    id: steps.length,
    type: 'highlight',
    indices: [],
    values: { array: [...array] },
    description: `Cumulative sums resolved! Now writing elements into exactly the correct sorted output position.`,
    auxiliaryState: {
      cumulativeSums: JSON.stringify(count)
    }
  });

  // Reconstruct sorted output from cumulative counts traversing backwards
  for (let i = array.length - 1; i >= 0; i--) {
    const value = array[i];
    const indexInCount = value - min;
    const outputIndex = count[indexInCount] - 1;
    
    output[outputIndex] = value;
    count[indexInCount]--;

    steps.push({
      id: steps.length,
      type: 'insert',
      indices: [outputIndex],
      values: { array: [...output] },
      description: `Placing value ${value} at final position index ${outputIndex}.`,
    });
  }

  for (let i = 0; i < output.length; i++) {
      steps.push({
      id: steps.length,
      type: 'sorted',
      indices: [i],
      values: { array: [...output] },
      description: `Element confirmed sorted at index ${i}`
    });
  }

  steps.push({
    id: steps.length,
    type: 'done',
    indices: [],
    values: { array: [...output] },
    description: "Counting Sort complete! The array is fully sorted in roughly linear time."
  });

  return steps;
}
