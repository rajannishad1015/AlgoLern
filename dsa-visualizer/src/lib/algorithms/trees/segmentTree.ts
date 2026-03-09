import { AlgorithmStep } from '@/lib/types/algorithm';

interface SegNode {
  id: string;
  start: number;
  end: number;
  sum: number;
  leftChild: string | null;
  rightChild: string | null;
}

type SegTree = Record<string, SegNode>;

let segIdCnt = 0;

function buildSegTree(
  arr: number[], start: number, end: number,
  tree: SegTree, steps: AlgorithmStep[], parentId: string | null = null
): string {
  const id = `seg-${segIdCnt++}`;
  const node: SegNode = { id, start, end, sum: 0, leftChild: null, rightChild: null };
  tree[id] = node;

  if (start === end) {
    node.sum = arr[start];
    steps.push({
      id: steps.length, type: 'insert', nodeIds: [id],
      values: { tree: JSON.parse(JSON.stringify(tree)), arr },
      description: `Leaf node [${start}]: value = ${arr[start]}.`
    });
    return id;
  }

  const mid = Math.floor((start + end) / 2);
  steps.push({
    id: steps.length, type: 'highlight', nodeIds: [id],
    values: { tree: JSON.parse(JSON.stringify(tree)), arr },
    description: `Building node for range [${start}, ${end}]. Splitting at mid=${mid}.`
  });

  node.leftChild = buildSegTree(arr, start, mid, tree, steps, id);
  node.rightChild = buildSegTree(arr, mid + 1, end, tree, steps, id);
  node.sum = tree[node.leftChild].sum + tree[node.rightChild].sum;

  steps.push({
    id: steps.length, type: 'update', nodeIds: [id],
    values: { tree: JSON.parse(JSON.stringify(tree)), arr },
    description: `Node [${start}, ${end}] = ${tree[node.leftChild].sum} + ${tree[node.rightChild].sum} = ${node.sum}.`
  });

  return id;
}

function querySegTree(
  nodeId: string, ql: number, qr: number,
  tree: SegTree, steps: AlgorithmStep[]
): number {
  const node = tree[nodeId];

  steps.push({
    id: steps.length, type: 'compare', nodeIds: [nodeId],
    values: { tree: JSON.parse(JSON.stringify(tree)), ql, qr },
    description: `Visiting [${node.start}, ${node.end}]. Query range [${ql}, ${qr}].`
  });

  if (qr < node.start || node.end < ql) {
    steps.push({
      id: steps.length, type: 'highlight', nodeIds: [nodeId],
      values: { tree: JSON.parse(JSON.stringify(tree)) },
      description: `[${node.start}, ${node.end}] is completely OUTSIDE query [${ql}, ${qr}]. Return 0.`
    });
    return 0;
  }

  if (ql <= node.start && node.end <= qr) {
    steps.push({
      id: steps.length, type: 'sorted', nodeIds: [nodeId],
      values: { tree: JSON.parse(JSON.stringify(tree)) },
      description: `[${node.start}, ${node.end}] is completely INSIDE query [${ql}, ${qr}]. Return ${node.sum}.`
    });
    return node.sum;
  }

  const leftSum = node.leftChild ? querySegTree(node.leftChild, ql, qr, tree, steps) : 0;
  const rightSum = node.rightChild ? querySegTree(node.rightChild, ql, qr, tree, steps) : 0;

  steps.push({
    id: steps.length, type: 'update', nodeIds: [nodeId],
    values: { tree: JSON.parse(JSON.stringify(tree)) },
    description: `Partial overlap at [${node.start}, ${node.end}]. Combining children: ${leftSum} + ${rightSum} = ${leftSum + rightSum}.`
  });

  return leftSum + rightSum;
}

function updateSegTree(
  nodeId: string, idx: number, newVal: number,
  tree: SegTree, steps: AlgorithmStep[]
) {
  const node = tree[nodeId];

  steps.push({
    id: steps.length, type: 'compare', nodeIds: [nodeId],
    values: { tree: JSON.parse(JSON.stringify(tree)) },
    description: `Update index ${idx}: visiting [${node.start}, ${node.end}].`
  });

  if (node.start === node.end) {
    node.sum = newVal;
    steps.push({
      id: steps.length, type: 'update', nodeIds: [nodeId],
      values: { tree: JSON.parse(JSON.stringify(tree)) },
      description: `Found leaf at index ${idx}. Setting value to ${newVal}.`
    });
    return;
  }

  const mid = Math.floor((node.start + node.end) / 2);
  if (idx <= mid && node.leftChild) {
    updateSegTree(node.leftChild, idx, newVal, tree, steps);
  } else if (node.rightChild) {
    updateSegTree(node.rightChild, idx, newVal, tree, steps);
  }

  const leftSum = node.leftChild ? tree[node.leftChild].sum : 0;
  const rightSum = node.rightChild ? tree[node.rightChild].sum : 0;
  node.sum = leftSum + rightSum;

  steps.push({
    id: steps.length, type: 'update', nodeIds: [nodeId],
    values: { tree: JSON.parse(JSON.stringify(tree)) },
    description: `Recalculating [${node.start}, ${node.end}]: ${leftSum} + ${rightSum} = ${node.sum}.`
  });
}

export function generateSegmentTreeSteps(
  initialArr: number[],
  queries: { type: 'query'; ql: number; qr: number }[],
  updates: { idx: number; value: number }[] = []
): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const tree: SegTree = {};
  segIdCnt = 0;

  steps.push({
    id: steps.length, type: 'highlight', nodeIds: [],
    values: { tree: {}, arr: initialArr },
    description: `Building Segment Tree for array [${initialArr.join(', ')}]. This supports O(log n) range sum queries.`
  });

  const rootId = buildSegTree(initialArr, 0, initialArr.length - 1, tree, steps);

  steps.push({
    id: steps.length, type: 'sorted', nodeIds: [rootId],
    values: { tree: JSON.parse(JSON.stringify(tree)), arr: initialArr },
    description: `Segment Tree built! Root sum = ${tree[rootId].sum}. Ready for queries and updates.`
  });

  for (const q of queries) {
    steps.push({
      id: steps.length, type: 'highlight', nodeIds: [rootId],
      values: { tree: JSON.parse(JSON.stringify(tree)), arr: initialArr, queryRange: [q.ql, q.qr] },
      description: `Range Sum Query: sum(arr[${q.ql}..${q.qr}])?`
    });
    const result = querySegTree(rootId, q.ql, q.qr, tree, steps);
    steps.push({
      id: steps.length, type: 'done', nodeIds: [],
      values: { tree: JSON.parse(JSON.stringify(tree)), arr: initialArr, queryResult: result, queryRange: [q.ql, q.qr] },
      description: `Query result: sum(arr[${q.ql}..${q.qr}]) = ${result}.`
    });
  }

  for (const upd of updates) {
    steps.push({
      id: steps.length, type: 'highlight', nodeIds: [],
      values: { tree: JSON.parse(JSON.stringify(tree)), arr: initialArr },
      description: `Point Update: arr[${upd.idx}] = ${upd.value}. Propagating upward through tree.`
    });
    updateSegTree(rootId, upd.idx, upd.value, tree, steps);
    initialArr[upd.idx] = upd.value;
    steps.push({
      id: steps.length, type: 'sorted', nodeIds: [],
      values: { tree: JSON.parse(JSON.stringify(tree)), arr: [...initialArr] },
      description: `Update complete. Array[${upd.idx}] is now ${upd.value}.`
    });
  }

  return steps;
}
