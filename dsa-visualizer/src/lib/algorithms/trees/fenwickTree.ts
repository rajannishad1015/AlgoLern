import { AlgorithmStep } from '@/lib/types/algorithm';

// Fenwick Tree (Binary Indexed Tree)
// 1-indexed internally

export function generateFenwickTreeSteps(
  initialArr: number[],
  queries: { type: 'query'; left: number; right: number }[],
  updates: { idx: number; delta: number }[] = []
): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const n = initialArr.length;
  const bit = new Array(n + 1).fill(0);

  const snap = () => ({
    bit: [...bit],
    arr: [...initialArr]
  });

  // Helper: compute prefix sum up to i (1-indexed)
  const prefixSum = (i: number): number => {
    let s = 0;
    while (i > 0) { s += bit[i]; i -= i & (-i); }
    return s;
  };

  // Helper: point update
  const bitUpdate = (i: number, delta: number, tree: number[]) => {
    while (i <= n) { tree[i] += delta; i += i & (-i); }
  };

  steps.push({
    id: steps.length, type: 'highlight', indices: [],
    values: snap(),
    description: `Fenwick Tree (Binary Indexed Tree) initialized. Array: [${initialArr.join(', ')}]. 1-indexed internally.`
  });

  // Build by inserting each element
  for (let i = 0; i < n; i++) {
    const idx = i + 1; // 1-indexed
    const val = initialArr[i];

    steps.push({
      id: steps.length, type: 'highlight', indices: [i],
      values: snap(),
      description: `Inserting arr[${i}]=${val} into BIT at 1-indexed position ${idx}.`
    });

    let pos = idx;
    while (pos <= n) {
      bit[pos] += val;
      steps.push({
        id: steps.length, type: 'insert', indices: [pos - 1],
        values: snap(),
        description: `BIT[${pos}] += ${val}. Next: ${pos + (pos & -pos)}.`
      });
      pos += pos & (-pos);
    }
  }

  steps.push({
    id: steps.length, type: 'sorted', indices: [],
    values: snap(),
    description: `BIT built! Each index stores a partial sum based on its lowest set bit (LSB) range.`
  });

  // Process queries
  for (const q of queries) {
    const ql = q.left + 1; // convert to 1-indexed
    const qr = q.right + 1;

    steps.push({
      id: steps.length, type: 'highlight', indices: [],
      values: snap(),
      description: `Range Sum Query: sum(arr[${q.left}..${q.right}]) = prefix(${qr}) - prefix(${ql - 1}).`
    });

    let pos = qr;
    let rightSum = 0;
    while (pos > 0) {
      rightSum += bit[pos];
      steps.push({
        id: steps.length, type: 'compare', indices: [pos - 1],
        values: snap(),
        description: `Computing prefix(${qr}): adding BIT[${pos}]=${bit[pos]}, running sum=${rightSum}. Next: ${pos - (pos & -pos)}.`
      });
      pos -= pos & (-pos);
    }

    let leftSum = 0;
    pos = ql - 1;
    while (pos > 0) {
      leftSum += bit[pos];
      steps.push({
        id: steps.length, type: 'compare', indices: [pos - 1],
        values: snap(),
        description: `Computing prefix(${ql - 1}): adding BIT[${pos}]=${bit[pos]}, running sum=${leftSum}. Next: ${pos - (pos & -pos)}.`
      });
      pos -= pos & (-pos);
    }

    const result = rightSum - leftSum;
    steps.push({
      id: steps.length, type: 'done', indices: [],
      values: { ...snap(), queryResult: result, queryRange: [q.left, q.right] },
      description: `Query result: sum(arr[${q.left}..${q.right}]) = ${rightSum} - ${leftSum} = ${result}.`
    });
  }

  // Process updates
  for (const upd of updates) {
    const idx = upd.idx + 1; // 1-indexed
    const delta = upd.delta;

    steps.push({
      id: steps.length, type: 'highlight', indices: [upd.idx],
      values: snap(),
      description: `Point Update: arr[${upd.idx}] += ${delta}. Propagating through BIT via LSB jumps.`
    });

    let pos = idx;
    while (pos <= n) {
      bit[pos] += delta;
      steps.push({
        id: steps.length, type: 'update', indices: [pos - 1],
        values: snap(),
        description: `BIT[${pos}] updated. Next: ${pos + (pos & -pos)}.`
      });
      pos += pos & (-pos);
    }

    initialArr[upd.idx] += delta;
    steps.push({
      id: steps.length, type: 'sorted', indices: [],
      values: snap(),
      description: `Update complete. arr[${upd.idx}] is now ${initialArr[upd.idx]}.`
    });
  }

  steps.push({
    id: steps.length, type: 'done', indices: [],
    values: snap(),
    description: 'All Fenwick Tree operations complete. O(log n) per query and update!'
  });

  return steps;
}
