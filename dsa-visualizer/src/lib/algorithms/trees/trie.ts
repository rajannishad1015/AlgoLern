import { AlgorithmStep } from '@/lib/types/algorithm';

interface TrieNode {
  id: string;
  char: string;
  children: Record<string, string>; // char -> nodeId
  isEnd: boolean;
  parent: string | null;
}

type TrieMap = Record<string, TrieNode>;

let trieIdCounter = 0;

function snapTrie(root: string, nodes: TrieMap) {
  return { root, nodes: JSON.parse(JSON.stringify(nodes)) };
}

export function generateTrieSteps(
  operations: { type: 'insert' | 'search' | 'delete'; word: string }[]
): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const nodes: TrieMap = {};
  trieIdCounter = 0;

  // Create root
  const rootId = `trie-${trieIdCounter++}`;
  nodes[rootId] = { id: rootId, char: '', children: {}, isEnd: false, parent: null };

  steps.push({
    id: steps.length, type: 'highlight', nodeIds: [rootId],
    values: snapTrie(rootId, nodes),
    description: 'Trie (Prefix Tree) initialized with empty root. Each path from root to a leaf represents a word.'
  });

  for (const op of operations) {
    const word = op.word.toLowerCase();

    if (op.type === 'insert') {
      steps.push({
        id: steps.length, type: 'highlight', nodeIds: [rootId],
        values: snapTrie(rootId, nodes),
        description: `Inserting word "${word}" into the Trie character by character.`
      });

      let current = rootId;
      for (let i = 0; i < word.length; i++) {
        const ch = word[i];
        const currentNode = nodes[current];

        if (currentNode.children[ch]) {
          current = currentNode.children[ch];
          steps.push({
            id: steps.length, type: 'visit', nodeIds: [current],
            values: snapTrie(rootId, nodes),
            description: `Character '${ch}' already exists. Traversing to it.`
          });
        } else {
          const newId = `trie-${trieIdCounter++}`;
          nodes[newId] = { id: newId, char: ch, children: {}, isEnd: false, parent: current };
          currentNode.children[ch] = newId;
          current = newId;
          steps.push({
            id: steps.length, type: 'insert', nodeIds: [newId],
            values: snapTrie(rootId, nodes),
            description: `Creating new node for character '${ch}'.`
          });
        }
      }

      nodes[current].isEnd = true;
      steps.push({
        id: steps.length, type: 'sorted', nodeIds: [current],
        values: snapTrie(rootId, nodes),
        description: `Marked end of word "${word}" at node '${nodes[current].char}'. Word successfully inserted!`
      });
    }

    if (op.type === 'search') {
      steps.push({
        id: steps.length, type: 'highlight', nodeIds: [rootId],
        values: snapTrie(rootId, nodes),
        description: `Searching for word "${word}" in the Trie.`
      });

      let current = rootId;
      let found = true;

      for (let i = 0; i < word.length; i++) {
        const ch = word[i];
        const currentNode = nodes[current];

        steps.push({
          id: steps.length, type: 'compare', nodeIds: [current],
          values: snapTrie(rootId, nodes),
          description: `Looking for character '${ch}' among children of '${currentNode.char || 'root'}'.`
        });

        if (currentNode.children[ch]) {
          current = currentNode.children[ch];
          steps.push({
            id: steps.length, type: 'visit', nodeIds: [current],
            values: snapTrie(rootId, nodes),
            description: `Found '${ch}'. Continuing...`
          });
        } else {
          found = false;
          steps.push({
            id: steps.length, type: 'highlight', nodeIds: [current],
            values: snapTrie(rootId, nodes),
            description: `Character '${ch}' not found! Word "${word}" does NOT exist in the Trie.`
          });
          break;
        }
      }

      if (found) {
        const isWord = nodes[current].isEnd;
        steps.push({
          id: steps.length, type: isWord ? 'sorted' : 'highlight', nodeIds: [current],
          values: snapTrie(rootId, nodes),
          description: isWord
            ? `✓ Word "${word}" FOUND in the Trie!`
            : `Prefix "${word}" exists but is not a complete word (no end marker).`
        });
      }
    }

    if (op.type === 'delete') {
      // For simplicity, just unmark the end if word exists
      steps.push({
        id: steps.length, type: 'highlight', nodeIds: [rootId],
        values: snapTrie(rootId, nodes),
        description: `Deleting word "${word}" from the Trie.`
      });

      let current = rootId;
      let found = true;
      const path: string[] = [rootId];

      for (const ch of word) {
        const currentNode = nodes[current];
        if (currentNode.children[ch]) {
          current = currentNode.children[ch];
          path.push(current);
        } else {
          found = false;
          break;
        }
      }

      if (found && nodes[current].isEnd) {
        nodes[current].isEnd = false;
        steps.push({
          id: steps.length, type: 'delete', nodeIds: [current],
          values: snapTrie(rootId, nodes),
          description: `Removed end-of-word marker from "${word}". Word deleted.`
        });

        // Prune childless paths
        for (let i = path.length - 1; i >= 1; i--) {
          const nId = path[i];
          const node = nodes[nId];
          if (Object.keys(node.children).length === 0 && !node.isEnd) {
            const parentNode = nodes[node.parent!];
            delete parentNode.children[node.char];
            delete nodes[nId];
            steps.push({
              id: steps.length, type: 'delete', nodeIds: [],
              values: snapTrie(rootId, nodes),
              description: `Pruned leaf node '${node.char}' (no children, not end of any word).`
            });
          } else {
            break;
          }
        }
      } else {
        steps.push({
          id: steps.length, type: 'highlight', nodeIds: [],
          values: snapTrie(rootId, nodes),
          description: `Word "${word}" not found. Nothing deleted.`
        });
      }
    }
  }

  steps.push({
    id: steps.length, type: 'done', nodeIds: [],
    values: snapTrie(rootId, nodes),
    description: 'All Trie operations complete.'
  });

  return steps;
}
