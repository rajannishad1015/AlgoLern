import { AlgorithmStep } from '@/lib/types/algorithm';

type LinkedListOperation = 
  | { type: 'insertTail', value: number }
  | { type: 'insertHead', value: number }
  | { type: 'deleteTail' }
  | { type: 'deleteHead' };

export function generateLinkedListSteps(operations: LinkedListOperation[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const list: number[] = [];
  
  // Initial empty state
  steps.push({
    id: steps.length,
    type: 'highlight',
    indices: [],
    values: { list: [] },
    description: `Initial state: Linked List is empty. Head is NULL.`,
  });

  operations.forEach((op) => {
    if (op.type === 'insertTail') {
      const newNodeVal = op.value;
      
      // Step: Create new node
      steps.push({
        id: steps.length,
        type: 'highlight',
        indices: [],
        values: { list: [...list], newNode: newNodeVal },
        description: `Creating new node with value ${newNodeVal}.`,
      });

      if (list.length === 0) {
        list.push(newNodeVal);
        steps.push({
          id: steps.length,
          type: 'insert',
          indices: [0],
          values: { list: [...list] },
          description: `List was empty. New node becomes the Head.`,
        });
      } else {
        // Step: Traverse to tail (simulated)
        steps.push({
          id: steps.length,
          type: 'visit',
          indices: [list.length - 1], // Highlight the current tail
          values: { list: [...list], newNode: newNodeVal },
          description: `Traversing to current tail node (${list[list.length - 1]}) to append.`,
        });

        list.push(newNodeVal);
        steps.push({
          id: steps.length,
          type: 'insert',
          indices: [list.length - 1],
          values: { list: [...list] },
          description: `Linking previous tail's NEXT pointer to the new node.`,
        });
      }
    } 
    else if (op.type === 'insertHead') {
        const newNodeVal = op.value;
        steps.push({
            id: steps.length,
            type: 'highlight',
            indices: [],
            values: { list: [...list], newNode: newNodeVal },
            description: `Creating new node with value ${newNodeVal}.`,
        });
  
        list.unshift(newNodeVal);
        steps.push({
            id: steps.length,
            type: 'insert',
            indices: [0],
            values: { list: [...list] },
            description: `Pointing new node's NEXT to old Head, and updating Head pointer.`,
        });
    }
    else if (op.type === 'deleteHead') {
      if (list.length > 0) {
        const deleted = list[0];
        steps.push({
          id: steps.length,
          type: 'delete',
          indices: [0],
          values: { list: [...list] },
          description: `Deleting Head node (${deleted}). Moving Head pointer to the next node.`,
        });
        
        list.shift();
        steps.push({
          id: steps.length,
          type: 'update',
          indices: [],
          values: { list: [...list] },
          description: `${deleted} removed. List size is now ${list.length}.`,
        });
      } else {
        steps.push({
          id: steps.length,
          type: 'highlight',
          indices: [],
          values: { list: [...list] },
          description: `Cannot delete from empty list.`,
        });
      }
    }
    else if (op.type === 'deleteTail') {
        if (list.length > 1) {
          const deleted = list[list.length - 1];
          steps.push({
            id: steps.length,
            type: 'visit',
            indices: [list.length - 2],
            values: { list: [...list] },
            description: `Traversing to second-to-last node (${list[list.length - 2]}).`,
          });

          steps.push({
            id: steps.length,
            type: 'delete',
            indices: [list.length - 1],
            values: { list: [...list] },
            description: `Setting NEXT pointer of second-to-last node to NULL. Node (${deleted}) is removed.`,
          });
          
          list.pop();
          steps.push({
            id: steps.length,
            type: 'update',
            indices: [],
            values: { list: [...list] },
            description: `${deleted} removed. List size is now ${list.length}.`,
          });
        } else if (list.length === 1) {
            const deleted = list[0];
            steps.push({
                id: steps.length,
                type: 'delete',
                indices: [0],
                values: { list: [...list] },
                description: `Deleting the only node (${deleted}). Head becomes NULL.`,
            });
            list.pop();
            steps.push({
                id: steps.length,
                type: 'update',
                indices: [],
                values: { list: [...list] },
                description: `List is now empty.`,
            });
        }
    }
  });

  steps.push({
    id: steps.length,
    type: 'done',
    indices: [],
    values: { list: [...list] },
    description: `All operations completed.`,
  });

  return steps;
}
