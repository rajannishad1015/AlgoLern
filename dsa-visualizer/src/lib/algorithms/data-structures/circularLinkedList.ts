import { AlgorithmStep } from "@/lib/types/algorithm";

export interface CircularLinkedListOp {
  type: "insertHead" | "insertTail" | "deleteHead" | "deleteTail";
  value?: number;
}

export function generateSingleCircularLinkedListSteps(
  currentList: number[],
  op: CircularLinkedListOp
): { steps: AlgorithmStep[]; nextList: number[] } {
  const list = [...currentList];
  const steps: AlgorithmStep[] = [];

  // Opening state
  steps.push({
    id: 0, type: "highlight", indices: [],
    values: { list: [...list] },
    description: `List has ${list.length} node${list.length !== 1 ? "s" : ""}. HEAD → ${list.length > 0 ? list[0] : "NULL"}, TAIL → ${list.length > 0 ? list[list.length - 1] : "NULL"}. TAIL.next points to HEAD.`,
  });

  if (op.type === "insertHead") {
    const val = op.value!;
    steps.push({
      id: 1, type: "highlight", indices: [],
      values: { list: [...list], newNode: val },
      description: `Creating new node [${val}]. Needs to point NEXT to current HEAD → ${list.length > 0 ? list[0] : "NULL"}.`,
    });
    if (list.length > 0) {
      steps.push({
        id: 2, type: "visit", indices: [list.length - 1],
        values: { list: [...list], newNode: val },
        description: `Visiting TAIL node [${list[list.length - 1]}]. Its NEXT must be updated to point to the new HEAD [${val}].`,
      });
    }
    list.unshift(val);
    steps.push({
      id: 3, type: "insert", indices: [0],
      values: { list: [...list] },
      description: `Node [${val}] is now the HEAD. TAIL → HEAD.`,
    });
    steps.push({
      id: 4, type: "done", indices: [],
      values: { list: [...list] },
      description: `Insert Head complete. New HEAD = [${val}].`,
    });

  } else if (op.type === "insertTail") {
    const val = op.value!;
    if (list.length === 0) {
      list.push(val);
      steps.push({
        id: 1, type: "insert", indices: [0],
        values: { list: [...list] },
        description: `List was empty. Node [${val}] becomes HEAD and TAIL. It points to itself.`,
      });
    } else {
      steps.push({
        id: 1, type: "visit", indices: [list.length - 1],
        values: { list: [...list], newNode: val },
        description: `Visiting current TAIL node [${list[list.length - 1]}]. Will link its NEXT → [${val}].`,
      });
      steps.push({
        id: 2, type: "highlight", indices: [list.length - 1],
        values: { list: [...list], newNode: val },
        description: `New TAIL [${val}] will point its NEXT back to HEAD [${list[0]}].`,
      });
      list.push(val);
      steps.push({
        id: 3, type: "insert", indices: [list.length - 1],
        values: { list: [...list] },
        description: `New TAIL is [${val}]. [${val}].NEXT → HEAD.`,
      });
    }
    steps.push({
      id: steps.length, type: "done", indices: [],
      values: { list: [...list] },
      description: `Insert Tail complete. New TAIL = [${val}].`,
    });

  } else if (op.type === "deleteHead") {
    if (list.length === 0) {
      steps.push({
        id: 1, type: "highlight", indices: [],
        values: { list: [] },
        description: `List is EMPTY — nothing to delete.`,
      });
    } else if (list.length === 1) {
      const deleted = list[0];
      steps.push({
        id: 1, type: "delete", indices: [0],
        values: { list: [...list] },
        description: `Deleting the only node [${deleted}]. List becomes empty.`,
      });
      list.pop();
      steps.push({
        id: 2, type: "done", indices: [],
        values: { list: [] },
        description: `List is now empty.`,
      });
    } else {
      const deleted = list[0];
      steps.push({
        id: 1, type: "visit", indices: [list.length - 1],
        values: { list: [...list] },
        description: `Visiting TAIL node [${list[list.length - 1]}]. It must update its NEXT pointer to the new HEAD [${list[1]}].`,
      });
      steps.push({
        id: 2, type: "delete", indices: [0],
        values: { list: [...list] },
        description: `Deleting old HEAD [${deleted}].`,
      });
      list.shift();
      steps.push({
        id: 3, type: "done", indices: [],
        values: { list: [...list] },
        description: `Delete Head complete. New HEAD = [${list[0]}]. TAIL → HEAD.`,
      });
    }

  } else if (op.type === "deleteTail") {
    if (list.length === 0) {
      steps.push({
        id: 1, type: "highlight", indices: [],
        values: { list: [] },
        description: `List is EMPTY — nothing to delete.`,
      });
    } else if (list.length === 1) {
      const deleted = list[0];
      steps.push({
        id: 1, type: "delete", indices: [0],
        values: { list: [...list] },
        description: `Deleting the only node [${deleted}].`,
      });
      list.pop();
      steps.push({
        id: 2, type: "done", indices: [],
        values: { list: [] },
        description: `List is now empty.`,
      });
    } else {
      const deleted = list[list.length - 1];
      steps.push({
        id: 1, type: "visit", indices: [list.length - 2],
        values: { list: [...list] },
        description: `Visiting second-to-last node [${list[list.length - 2]}]. Setting its NEXT → HEAD [${list[0]}].`,
      });
      steps.push({
        id: 2, type: "delete", indices: [list.length - 1],
        values: { list: [...list] },
        description: `Deleting old TAIL [${deleted}].`,
      });
      list.pop();
      steps.push({
        id: 3, type: "done", indices: [],
        values: { list: [...list] },
        description: `Delete Tail complete. New TAIL = [${list[list.length - 1]}].`,
      });
    }
  }

  return { steps, nextList: list };
}
