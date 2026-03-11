import { AlgorithmStep } from '@/lib/types/algorithm';

export function generateLinearSearchSteps(arr: number[], target: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const currentArray = [...arr];

  steps.push({
    id: 0,
    type: 'highlight',
    nodeIds: [],
    edgeIds: [],
    values: { array: [...currentArray] },
    description: `Starting Linear Search for target ${target}.`
  });

  for (let i = 0; i < currentArray.length; i++) {
    steps.push({
      id: steps.length,
      type: 'compare',
      nodeIds: [i.toString()],
      edgeIds: [],
      values: { array: [...currentArray] },
      description: `Comparing element at index ${i} (${currentArray[i]}) with target ${target}.`
    });

    if (currentArray[i] === target) {
      steps.push({
        id: steps.length,
        type: 'done',
        nodeIds: [i.toString()],
        edgeIds: [],
        values: { array: [...currentArray] },
        description: `Target ${target} found at index ${i}! Search complete.`
      });
      return steps;
    } else {
      steps.push({
         id: steps.length,
         type: 'visit',
         nodeIds: [i.toString()],
         edgeIds: [],
         values: { array: [...currentArray] },
         description: `${currentArray[i]} is not the target. Moving to next index.`
      });
    }
  }

  steps.push({
    id: steps.length,
    type: 'not_found',
    nodeIds: [],
    edgeIds: [],
    values: { array: [...currentArray] },
    description: `Target ${target} not found in the array.`
  });

  return steps;
}
