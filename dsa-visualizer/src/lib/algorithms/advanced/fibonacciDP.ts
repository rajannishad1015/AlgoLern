import { AlgorithmStep } from '@/lib/types/algorithm';

export function generateFibonacciDPSteps(n: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const memo: Record<number, number> = {};
  const maxN = Math.max(n, 2); 
  
  // Initialize the visual DP array (1D grid)
  const dpArray = Array(n + 1).fill(null);

  steps.push({
    id: steps.length,
    type: 'highlight',
    nodeIds: [],
    values: { dpArray: [...dpArray], currentN: null },
    description: `Starting Top-Down Dynamic Programming (Memoization) to calculate Fibonacci(${n}). Initializing empty cache.`,
  });

  function fib(currentN: number): number {
    steps.push({
      id: steps.length,
      type: 'visit',
      nodeIds: [String(currentN)], // Treat indices as nodeIds for the grid
      values: { dpArray: [...dpArray], currentN },
      description: `Called fib(${currentN}). Checking cache...`,
    });

    if (memo[currentN] !== undefined) {
      steps.push({
        id: steps.length,
        type: 'done',
        nodeIds: [String(currentN)],
        values: { dpArray: [...dpArray], currentN },
        description: `CACHE HIT! fib(${currentN}) is already computed as ${memo[currentN]}. Returning immediately.`,
      });
      return memo[currentN];
    }

    steps.push({
        id: steps.length,
        type: 'highlight',
        nodeIds: [String(currentN)],
        values: { dpArray: [...dpArray], currentN },
        description: `Cache miss for fib(${currentN}). Computing...`,
    });

    let result: number;
    if (currentN <= 1) {
      result = currentN;
      
      steps.push({
        id: steps.length,
        type: 'highlight',
        nodeIds: [String(currentN)],
        values: { dpArray: [...dpArray], currentN },
        description: `Base case reached: fib(${currentN}) = ${result}.`,
      });

    } else {
      steps.push({
        id: steps.length,
        type: 'path',
        nodeIds: [String(currentN)],
        values: { dpArray: [...dpArray], currentN },
        description: `Need to compute fib(${currentN - 1}) and fib(${currentN - 2}). Branching left to fib(${currentN - 1}).`,
      });
      
      const left = fib(currentN - 1);

      steps.push({
        id: steps.length,
        type: 'path',
        nodeIds: [String(currentN)],
        values: { dpArray: [...dpArray], currentN },
        description: `fib(${currentN - 1}) returned ${left}. Now branching right to fib(${currentN - 2}).`,
      });

      const right = fib(currentN - 2);
      result = left + right;

      steps.push({
        id: steps.length,
        type: 'highlight',
        nodeIds: [String(currentN)],
        values: { dpArray: [...dpArray], currentN },
        description: `Both children returned. fib(${currentN}) = ${left} + ${right} = ${result}.`,
      });
    }

    memo[currentN] = result;
    dpArray[currentN] = result;

    steps.push({
      id: steps.length,
      type: 'update',
      nodeIds: [String(currentN)],
      values: { dpArray: [...dpArray], currentN },
      description: `Storing fib(${currentN}) = ${result} into the Memoization Cache.`,
    });

    return result;
  }

  const finalAns = fib(n);

  steps.push({
    id: steps.length,
    type: 'done',
    nodeIds: [],
    values: { dpArray: [...dpArray], currentN: null },
    description: `Fibonacci computation complete! fib(${n}) = ${finalAns}. Note how many recursive calls were skipped due to caching.`,
  });

  return steps;
}
