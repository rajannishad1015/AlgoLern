import { AlgorithmStep } from '@/lib/types/algorithm';

// Simple hash function
function hash(key: string, size: number): number {
  let hashVal = 0;
  for (let i = 0; i < key.length; i++) {
    hashVal = (hashVal + key.charCodeAt(i)) % size;
  }
  return hashVal;
}

export type HashTableState = { key: string; value: string }[][];

export function generateHashTableSteps(
  size: number,
  operations: { type: 'insert' | 'search' | 'delete'; key: string; value?: string }[]
): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const table: HashTableState = Array.from({ length: size }, () => []);

  const snapshot = (): HashTableState => table.map(bucket => [...bucket.map(e => ({ ...e }))]);

  steps.push({
    id: steps.length,
    type: 'highlight',
    indices: [],
    values: { table: snapshot(), size },
    description: `Hash Table initialized with ${size} buckets. We use chaining to handle collisions.`
  });

  for (const op of operations) {
    const bucketIndex = hash(op.key, size);

    steps.push({
      id: steps.length,
      type: 'highlight',
      indices: [bucketIndex],
      values: { table: snapshot(), size },
      description: `Computing hash for key "${op.key}": hash("${op.key}") = ${bucketIndex}. Targeting bucket ${bucketIndex}.`
    });

    if (op.type === 'insert') {
      const existingIdx = table[bucketIndex].findIndex(e => e.key === op.key);

      if (existingIdx >= 0) {
        steps.push({
          id: steps.length,
          type: 'compare',
          indices: [bucketIndex],
          values: { table: snapshot(), size },
          description: `Key "${op.key}" already exists in bucket ${bucketIndex}. Updating value to "${op.value}".`
        });
        table[bucketIndex][existingIdx].value = op.value!;
      } else {
        if (table[bucketIndex].length > 0) {
          steps.push({
            id: steps.length,
            type: 'compare',
            indices: [bucketIndex],
            values: { table: snapshot(), size },
            description: `Collision detected at bucket ${bucketIndex}! Using chaining — appending to the existing chain.`
          });
        }
        table[bucketIndex].push({ key: op.key, value: op.value! });
      }

      steps.push({
        id: steps.length,
        type: 'insert',
        indices: [bucketIndex],
        values: { table: snapshot(), size },
        description: `Inserted key="${op.key}", value="${op.value}" into bucket ${bucketIndex}.`
      });
    }

    if (op.type === 'search') {
      const chain = table[bucketIndex];
      let found = false;
      for (let i = 0; i < chain.length; i++) {
        steps.push({
          id: steps.length,
          type: 'compare',
          indices: [bucketIndex],
          values: { table: snapshot(), size, searchKey: op.key, chainIndex: i },
          description: `Scanning bucket ${bucketIndex} chain: checking entry "${chain[i].key}"...`
        });
        if (chain[i].key === op.key) {
          steps.push({
            id: steps.length,
            type: 'highlight',
            indices: [bucketIndex],
            values: { table: snapshot(), size, foundValue: chain[i].value },
            description: `Found! Key="${op.key}" → Value="${chain[i].value}" at bucket ${bucketIndex}.`
          });
          found = true;
          break;
        }
      }
      if (!found) {
        steps.push({
          id: steps.length,
          type: 'highlight',
          indices: [bucketIndex],
          values: { table: snapshot(), size },
          description: `Key "${op.key}" not found in bucket ${bucketIndex}.`
        });
      }
    }

    if (op.type === 'delete') {
      const idx = table[bucketIndex].findIndex(e => e.key === op.key);
      if (idx >= 0) {
        steps.push({
          id: steps.length,
          type: 'delete',
          indices: [bucketIndex],
          values: { table: snapshot(), size },
          description: `Found key "${op.key}" at bucket ${bucketIndex}. Removing it.`
        });
        table[bucketIndex].splice(idx, 1);
        steps.push({
          id: steps.length,
          type: 'update',
          indices: [bucketIndex],
          values: { table: snapshot(), size },
          description: `Key "${op.key}" deleted from bucket ${bucketIndex}.`
        });
      } else {
        steps.push({
          id: steps.length,
          type: 'highlight',
          indices: [bucketIndex],
          values: { table: snapshot(), size },
          description: `Key "${op.key}" not found in table. Nothing to delete.`
        });
      }
    }
  }

  steps.push({
    id: steps.length,
    type: 'done',
    indices: [],
    values: { table: snapshot(), size },
    description: 'All Hash Table operations complete.'
  });

  return steps;
}
