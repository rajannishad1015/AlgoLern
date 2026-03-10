"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { AlgorithmStep } from "@/lib/types/algorithm";
import { DoublyLinkedListViz } from "@/components/d3/DoublyLinkedListViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";

const MAX_NODES = 7; // Visual limit due to larger nodes (next+prev pointers)

// ─── Generate steps for ONE doubly linked list operation ────────────────────
function generateSingleDoublyLinkedListSteps(
  currentList: number[],
  op:
    | { type: "insertHead"; value: number }
    | { type: "insertTail"; value: number }
    | { type: "deleteHead" }
    | { type: "deleteTail" }
): { steps: AlgorithmStep[]; nextList: number[] } {
  const list = [...currentList];
  const steps: AlgorithmStep[] = [];

  // Opening state
  steps.push({
    id: 0, type: "highlight", indices: [],
    values: { list: [...list] },
    description: `List has ${list.length} node${list.length !== 1 ? "s" : ""}. HEAD → ${list.length > 0 ? list[0] : "NULL"}, TAIL → ${list.length > 0 ? list[list.length - 1] : "NULL"}.`,
  });

  if (op.type === "insertHead") {
    const val = op.value;
    steps.push({
      id: 1, type: "highlight", indices: [],
      values: { list: [...list], newNode: val },
      description: `Creating new node [${val}]. Needs to point NEXT to current HEAD → ${list.length > 0 ? list[0] : "NULL"}.`,
    });
    if (list.length > 0) {
        steps.push({
        id: 2, type: "visit", indices: [0],
        values: { list: [...list], newNode: val },
        description: `Updating old Head [${list[0]}].PREV to point back to the new node [${val}].`,
        });
    }
    list.unshift(val);
    steps.push({
      id: 3, type: "insert", indices: [0],
      values: { list: [...list] },
      description: `Node [${val}] is now the HEAD. [${val}].PREV → NULL, [${val}].NEXT → ${list.length > 1 ? list[1] : "NULL"}.`,
    });
    steps.push({
      id: 4, type: "done", indices: [],
      values: { list: [...list] },
      description: `Insert Head complete. New HEAD = [${val}].`,
    });

  } else if (op.type === "insertTail") {
    const val = op.value;
    if (list.length === 0) {
      list.push(val);
      steps.push({
        id: 1, type: "insert", indices: [0],
        values: { list: [...list] },
        description: `List was empty. Node [${val}] becomes both HEAD and TAIL. NEXT → NULL, PREV → NULL.`,
      });
    } else {
      steps.push({
        id: 1, type: "visit", indices: [list.length - 1],
        values: { list: [...list], newNode: val },
        description: `Visiting TAIL node [${list[list.length - 1]}]. Will link its NEXT → [${val}].`,
      });
      steps.push({
        id: 2, type: "highlight", indices: [list.length - 1],
        values: { list: [...list], newNode: val },
        description: `Linking new node [${val}].PREV → [${list[list.length - 1]}].`,
      });
      list.push(val);
      steps.push({
        id: 3, type: "insert", indices: [list.length - 1],
        values: { list: [...list] },
        description: `New TAIL is [${val}]. [${val}].NEXT → NULL.`,
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
        description: `Deleting the only node [${deleted}]. HEAD and TAIL → NULL.`,
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
        id: 1, type: "visit", indices: [1],
        values: { list: [...list] },
        description: `Moving HEAD to second node [${list[1]}]. Setting [${list[1]}].PREV → NULL.`,
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
        description: `Delete Head complete. New HEAD = [${list[0]}].`,
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
        description: `Visiting second-to-last node [${list[list.length - 2]}]. Setting its NEXT → NULL.`,
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

export default function DoublyLinkedListPage() {
  const [listArr, setListArr] = useState<number[]>([10, 20, 30]);
  const [inputValue, setInputValue] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("doubly-linked-list");
    setSteps([{
      id: 0, type: "highlight", indices: [],
      values: { list: [...listArr] },
      description: `Doubly Linked List loaded with ${listArr.length} nodes. HEAD = [${listArr[0]}].`,
    }]);
    return () => {
      resetVisualizer();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (currentStepIndex < steps.length - 1) {
          stepForward();
        } else {
          setIsPlaying(false);
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, speed);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, currentStepIndex, steps.length, speed, stepForward, setIsPlaying]);

  const runOperation = (
    op:
      | { type: "insertHead"; value: number }
      | { type: "insertTail"; value: number }
      | { type: "deleteHead" }
      | { type: "deleteTail" }
  ) => {
    const { steps: newSteps, nextList } = generateSingleDoublyLinkedListSteps(listArr, op);
    resetVisualizer();
    setSteps(newSteps);
    setListArr(nextList);
    setTimeout(() => setIsPlaying(true), 50);
  };

  const handleInsertHead = () => {
    const val = parseInt(inputValue);
    if (isNaN(val) || val < 0 || val > 999) return;
    if (listArr.length >= MAX_NODES) {
      setSteps([{
        id: 0, type: "highlight", indices: [],
        values: { list: [...listArr] },
        description: `List is full (${MAX_NODES} nodes max). Delete a node first.`,
      }]);
      setInputValue("");
      return;
    }
    setInputValue("");
    runOperation({ type: "insertHead", value: val });
  };

  const handleInsertTail = () => {
    const val = parseInt(inputValue);
    if (isNaN(val) || val < 0 || val > 999) return;
    if (listArr.length >= MAX_NODES) {
      setSteps([{
        id: 0, type: "highlight", indices: [],
        values: { list: [...listArr] },
        description: `List is full (${MAX_NODES} nodes max). Delete a node first.`,
      }]);
      setInputValue("");
      return;
    }
    setInputValue("");
    runOperation({ type: "insertTail", value: val });
  };

  const handleDeleteHead = () => runOperation({ type: "deleteHead" });
  const handleDeleteTail = () => runOperation({ type: "deleteTail" });

  const handleClear = () => {
    setListArr([]);
    resetVisualizer();
    setSteps([{
      id: 0, type: "highlight", indices: [],
      values: { list: [] },
      description: `List cleared. HEAD → NULL, TAIL → NULL.`,
    }]);
  };

  const currentStepData = steps[currentStepIndex];

  const formattedDescription = currentStepData?.description
    ? currentStepData.description
        .replace(/\[(\d+)\]/g, '<span class="text-[var(--lime-dark)] dark:text-lime font-bold">[$1]</span>')
        + `<span class="text-indigo-400 italic ml-2">(${
            currentStepData.type === "insert"    ? "→ Inserted" :
            currentStepData.type === "delete"    ? "✕ Deleted" :
            currentStepData.type === "visit"     ? "🔄 Updating Pointers" :
            currentStepData.type === "done"      ? "✓ Done" : "Viewing"
          })</span>`
    : "Ready...";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Doubly Linked List"
        description="A list where each node has TWO pointers: one pointing forward (NEXT) and one pointing backward (PREV). Allows navigation in both directions."
        complexity={{ time: "n", space: "n", difficulty: "Medium" }}
        controls={
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col xl:flex-row gap-3 items-center bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4">
              <div className="flex-1 w-full flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={999}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleInsertTail(); } }}
                  placeholder="Value (0–999)"
                  className="flex-1 min-w-[120px] bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-lime-600 dark:text-lime outline-none focus:border-indigo-500 transition-all font-mono"
                />
                <button
                  onClick={handleInsertHead}
                  className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-lg whitespace-nowrap text-sm"
                  title="Insert at HEAD (O(1))"
                >
                  + Head
                </button>
                <button
                  onClick={handleInsertTail}
                  className="px-4 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-colors shadow-lg whitespace-nowrap text-sm"
                  title="Insert at TAIL (O(1) with tail pointer)"
                >
                  + Tail
                </button>
              </div>

              <div className="w-full xl:w-auto flex gap-2">
                <button
                  onClick={handleDeleteHead}
                  className="flex-1 xl:flex-none px-4 py-2.5 rounded-lg border border-orange-500/50 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold transition-colors shadow-sm whitespace-nowrap text-sm"
                  title="Remove HEAD (O(1))"
                >
                  − Head
                </button>
                <button
                  onClick={handleDeleteTail}
                  className="flex-1 xl:flex-none px-4 py-2.5 rounded-lg border border-orange-500/50 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold transition-colors shadow-sm whitespace-nowrap text-sm"
                  title="Remove TAIL (O(1) with tail pointer)"
                >
                  − Tail
                </button>
                <button
                  onClick={handleClear}
                  className="flex-1 xl:flex-none px-4 py-2.5 rounded-lg bg-slate-200 dark:bg-[#252840] hover:bg-slate-300 dark:hover:bg-[#2f3352] text-slate-700 dark:text-slate-300 font-semibold transition-colors whitespace-nowrap text-sm"
                >
                  Clear
                </button>
              </div>
            </div>

            <ControlBar
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onStepForward={stepForward}
              onStepBackward={stepBackward}
              onReset={resetVisualizer}
              onSpeedChange={setSpeed}
              isPlaying={isPlaying}
              currentStep={currentStepIndex}
              totalSteps={steps.length}
              speed={speed}
              stepDescription={formattedDescription}
            />
          </div>
        }
        info={
          <TheoryCard
            title="Doubly Linked List"
            description="Unlike a Singly Linked List which only moves forward, a Doubly Linked List node holds its Data, a 'Next' pointer to the node ahead, AND a 'Prev' pointer to the node behind it. This makes it a two-way street!"
            descriptionHi="Singly Linked List sirf aage jaati hai, par Doubly Linked List ka har node apne aage wale (Next) aur apne piche wale (Prev) dono ka pata rakhta hai. Ye ek two-way street ki tarah hai!"
            analogy={{
              icon: "🤝",
              title: "People Holding Hands",
              titleHi: "Haath Pakadne waali Chain",
              desc: "Imagine a line of people holding hands. Your right hand holds the person in front of you (NEXT), and your left hand holds the person behind you (PREV). If someone new joins the line, 4 hands need to be readjusted to connect properly!",
              descHi: "Sochiye log ek dusre ka haath pakad ke khade hain. Aapka sidha haath aage wale ko pakda hai (NEXT) aur ulta haath piche wale ko (PREV). Agar koi naya aadmi line mein aaye, toh 4 haath chhod ke naye tarike se pakadne padenge!"
            }}
            readingTip={{
              en: "The extra PREV pointer uses more memory, but it makes operations like Reverse Traversal or 'Delete at Tail' blazingly fast — O(1) instead of O(n)!",
              hi: "Extra PREV pointer thodi zyada memory leta hai, par isse fayda bahut hai! Piche ki taraf travel karna ya Tail ko delete karna ab bahut fast O(1) ho jata hai (na ki O(n))."
            }}
            quote={{
              en: '"Why look only forward when history is just one pointer away?"',
              hi: '"Sirf aage kyu dekhna, jab history ka rasta sirf ek pointer piche hai?"'
            }}
            complexities={[
              { case: "Insert Head", time: "1", space: "1", note: "Update next of new node, prev of old head." },
              { case: "Insert Tail", time: "1", space: "1", note: "Direct access via Tail pointer." },
              { case: "Delete Tail", time: "1", space: "1", note: "Direct access via Tail.prev." },
              { case: "Traversal",   time: "n", space: "1", note: "Can traverse forwards OR backwards." },
            ]}
            pseudocode={`class Node:
  constructor(data):
    data = data
    next = null
    prev = null

class DoublyLinkedList:
  constructor():
    head = null
    tail = null
    
  insertTail(val):
    newNode = Node(val)
    if tail == null:
      head = tail = newNode
    else:
      tail.next = newNode
      newNode.prev = tail
      tail = newNode`}
            useCases={[
              "Browser Forward/Back navigation stack.",
              "Music playlists (Next/Previous track).",
              "Undo/Redo buffers in text editors.",
              "Complex Data structures like Lru Caches.",
            ]}
            useCasesHi={[
              "Browser mein Forward aur Back buttons.",
              "Music player jisme Next/Previous gaane chalte hain.",
              "Notepad/Word mein Undo/Redo features.",
              "LRU Cache memory management mein."
            ]}
            howItWorks={{
              en: [
                { icon: "🟢", text: "Insert: Link the new node's prev and next. Tell the neighbours to point back at the new node." },
                { icon: "🟠", text: "Delete: Tell the previous node to skip over this one, and the next node to reach back to the previous. Disconnect." },
                { icon: "↔️", text: "Pointer Setup: Every middle node requires exactly 4 pointer updates to stitch into the list correctly." }
              ],
              hi: [
                { icon: "🟢", text: "Insert: Naye node ke aage aur piche ke pointers set karo. Apne padosiyon ko bolo ki tumhe point karein." },
                { icon: "🟠", text: "Delete: Piche wale node ko aage wale se jod do. Or aage wale ko piche wale se. Fir beech wale ko hata do." },
                { icon: "↔️", text: "Pointers: Har naya node dalte waqt 4 pointers ko sahi jagah point karwana zaroori hai." }
              ]
            }}
            example={{
              array: [],
              steps: [
                { desc: "Empty List: HEAD → NULL, TAIL → NULL.", descHi: "Khali list. HEAD aur TAIL Null hain.", array: [], highlight: [] },
                { desc: "INSERT 10: 10 is HEAD and TAIL. Its PREV and NEXT are NULL.", descHi: "INSERT 10: 10 akela aa gaya. Yahi Head hai yahi Tail.", array: [10], highlight: [0] },
                { desc: "INSERT 20 at Tail: 10's NEXT points to 20. 20's PREV points to 10.", descHi: "INSERT 20 (Tail): 10 ke aage 20 joda. 20 ka PREV 10 ko point karta hai.", array: [10, 20], highlight: [1] },
                { desc: "DELETE Head (10): 20 becomes new Head. 20's PREV becomes NULL.", descHi: "DELETE Head (10): Head ko 20 pe kiya. 20 ka PREV tooti hui link chhodkar NULL ban gaya.", array: [20], highlight: [0] },
              ]
            }}
          />
        }
      >
        <div className="w-full h-full flex flex-col items-center justify-center relative min-h-[440px]">
          {/* Status Badge */}
          <div className="absolute top-4 right-4 md:right-6 z-20 flex flex-col items-end gap-2 text-xs font-mono bg-white/80 dark:bg-[#0d0f1a]/80 backdrop-blur-sm p-2 rounded-lg border border-black/5 dark:border-white/5">
            <span className="text-black/40 dark:text-slate-500 uppercase tracking-[0.2em] font-bold text-[9px] md:text-[10px] mb-1">DLL Status</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Nodes: {listArr.length}/{MAX_NODES}</span>
            <span className="text-lime-600 dark:text-lime font-bold">HEAD: {listArr.length > 0 ? listArr[0] : "NULL"}</span>
            <span className="text-orange-500 dark:text-orange-400 font-bold">TAIL: {listArr.length > 0 ? listArr[listArr.length - 1] : "NULL"}</span>
          </div>
          <DoublyLinkedListViz currentStepData={currentStepData} />
        </div>
      </VisualizerFrame>
    </div>
  );
}
