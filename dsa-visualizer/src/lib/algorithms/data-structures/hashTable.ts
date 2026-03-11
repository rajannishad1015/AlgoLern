import { AlgorithmStep } from '@/lib/types/algorithm';

export type HashEntry = { key: string; value: string };
export type HashTableState = HashEntry[][];

export const HASH_TABLE_SIZE = 7;

export function hashFunction(key: string, size: number = HASH_TABLE_SIZE): number {
  let total = 0;
  for (let index = 0; index < key.length; index += 1) {
    total += key.charCodeAt(index);
  }
  return total % size;
}

export function cloneHashTable(table: HashTableState): HashTableState {
  return table.map((bucket) => bucket.map((entry) => ({ ...entry })));
}

export function createInitialHashTableState(): HashTableState {
  const table = Array.from({ length: HASH_TABLE_SIZE }, () => [] as HashEntry[]);
  table[2] = [{ key: 'Alice', value: '25' }, { key: 'Bob', value: '30' }];
  table[0] = [{ key: 'Caleb', value: '22' }];
  return table;
}

export function createEmptyHashTableState(): HashTableState {
  return Array.from({ length: HASH_TABLE_SIZE }, () => [] as HashEntry[]);
}

export function generateSingleHashTableSteps(
  currentTable: HashTableState,
  op:
    | { type: 'insert'; key: string; value: string }
    | { type: 'search'; key: string }
    | { type: 'delete'; key: string },
  tableSize: number = HASH_TABLE_SIZE
): { steps: AlgorithmStep[]; nextTable: HashTableState } {
  const table = cloneHashTable(currentTable);
  const steps: AlgorithmStep[] = [];
  const targetKey = op.key.trim();
  const hashIndex = hashFunction(targetKey, tableSize);

  const snapshot = (extraValues?: Record<string, unknown>) => ({
    table: cloneHashTable(table),
    hash: hashIndex,
    pendingKey: targetKey,
    ...(extraValues ?? {}),
  });

  const visitChain = (bucketIndex: number, messagePrefix: string): number => {
    for (let chainIndex = 0; chainIndex < table[bucketIndex].length; chainIndex += 1) {
      const node = table[bucketIndex][chainIndex];
      steps.push({
        id: steps.length,
        type: 'visit',
        indices: [bucketIndex],
        values: snapshot({ currentChainIndex: chainIndex }),
        description: `${messagePrefix} Checking node [${node.key}: ${node.value}].`,
      });

      if (node.key === targetKey) {
        return chainIndex;
      }
    }

    return -1;
  };

  if (op.type === 'insert') {
    const targetValue = op.value.trim();

    steps.push({
      id: 0,
      type: 'highlight',
      indices: [],
      values: snapshot({ pendingValue: targetValue }),
      description: `Insert [${targetKey}: ${targetValue}] requested. Calculating hash index...`,
    });
    steps.push({
      id: 1,
      type: 'highlight',
      indices: [hashIndex],
      values: snapshot({ pendingValue: targetValue }),
      description: `hash("${targetKey}") % ${tableSize} = [${hashIndex}]. Moving to bucket [${hashIndex}].`,
    });

    const existingIndex = visitChain(hashIndex, `Collision chain in bucket [${hashIndex}].`);

    if (existingIndex >= 0) {
      table[hashIndex][existingIndex].value = targetValue;
      steps.push({
        id: steps.length,
        type: 'insert',
        indices: [hashIndex],
        values: snapshot({ currentChainIndex: existingIndex, pendingValue: targetValue }),
        description: `Key already exists. Updated [${targetKey}] to new value [${targetValue}].`,
      });
    } else {
      steps.push({
        id: steps.length,
        type: 'highlight',
        indices: [hashIndex],
        values: snapshot({ pendingValue: targetValue }),
        description:
          table[hashIndex].length === 0
            ? `Bucket [${hashIndex}] is empty. Creating first node [${targetKey}: ${targetValue}].`
            : `Collision handled by chaining. Appending [${targetKey}: ${targetValue}] to bucket [${hashIndex}].`,
      });
      table[hashIndex].push({ key: targetKey, value: targetValue });
      steps.push({
        id: steps.length,
        type: 'insert',
        indices: [hashIndex],
        values: snapshot({ currentChainIndex: table[hashIndex].length - 1, pendingValue: targetValue }),
        description: `Insert complete. [${targetKey}: ${targetValue}] stored in bucket [${hashIndex}].`,
      });
    }
  }

  if (op.type === 'search') {
    steps.push({
      id: 0,
      type: 'highlight',
      indices: [],
      values: snapshot(),
      description: `Search for key [${targetKey}] started. Calculating hash index...`,
    });
    steps.push({
      id: 1,
      type: 'highlight',
      indices: [hashIndex],
      values: snapshot(),
      description: `hash("${targetKey}") % ${tableSize} = [${hashIndex}]. Searching bucket [${hashIndex}].`,
    });

    const foundIndex = visitChain(hashIndex, `Walking chain in bucket [${hashIndex}].`);

    if (foundIndex >= 0) {
      steps.push({
        id: steps.length,
        type: 'done',
        indices: [hashIndex],
        values: snapshot({ currentChainIndex: foundIndex }),
        description: `Search success. Value for [${targetKey}] is [${table[hashIndex][foundIndex].value}].`,
      });
    } else {
      steps.push({
        id: steps.length,
        type: 'done',
        indices: [hashIndex],
        values: snapshot(),
        description: `Search complete. Key [${targetKey}] was not found in bucket [${hashIndex}].`,
      });
    }
  }

  if (op.type === 'delete') {
    steps.push({
      id: 0,
      type: 'highlight',
      indices: [],
      values: snapshot(),
      description: `Delete key [${targetKey}] requested. Calculating hash index...`,
    });
    steps.push({
      id: 1,
      type: 'highlight',
      indices: [hashIndex],
      values: snapshot(),
      description: `hash("${targetKey}") % ${tableSize} = [${hashIndex}]. Inspecting bucket [${hashIndex}].`,
    });

    const foundIndex = visitChain(hashIndex, `Walking chain in bucket [${hashIndex}].`);

    if (foundIndex >= 0) {
      const removed = table[hashIndex][foundIndex];
      steps.push({
        id: steps.length,
        type: 'delete',
        indices: [hashIndex],
        values: snapshot({ currentChainIndex: foundIndex }),
        description: `Match found. Removing [${removed.key}: ${removed.value}] from bucket [${hashIndex}].`,
      });
      table[hashIndex].splice(foundIndex, 1);
      steps.push({
        id: steps.length,
        type: 'done',
        indices: [hashIndex],
        values: snapshot(),
        description: `Delete complete. Key [${targetKey}] removed successfully.`,
      });
    } else {
      steps.push({
        id: steps.length,
        type: 'done',
        indices: [hashIndex],
        values: snapshot(),
        description: `Delete skipped. Key [${targetKey}] does not exist.`,
      });
    }
  }

  return { steps, nextTable: table };
}
