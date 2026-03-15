"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { AlgorithmStep } from "@/lib/types/algorithm";
import { CircularLinkedListViz } from "@/components/d3/CircularLinkedListViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";

import { generateSingleCircularLinkedListSteps, CircularLinkedListOp } from "@/lib/algorithms/data-structures/circularLinkedList";

const MAX_NODES = 8; // Max nodes allowed visually

export default function CircularLinkedListPage() {
  const [listArr, setListArr] = useState<number[]>([10, 20, 30]);
  const [inputValue, setInputValue] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("circular-linked-list");
    setSteps([{
      id: 0, type: "highlight", indices: [],
      values: { list: [...listArr] },
      description: `Circular Linked List loaded with ${listArr.length} nodes. HEAD = [${listArr[0]}]. Pointers form a ring.`,
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

  const runOperation = (op: CircularLinkedListOp) => {
    const { steps: newSteps, nextList } = generateSingleCircularLinkedListSteps(listArr, op);
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
      description: `List cleared. Ring is broken.`,
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
        title="Circular Linked List"
        description="A linked list where the last node points back to the first node instead of NULL, forming a continuous circle or ring."
        complexity={{ time: "O(n)", space: "O(1)", difficulty: "Medium" }}
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
                  title="Insert at HEAD (O(n) due to tail update)"
                >
                  + Head
                </button>
                <button
                  onClick={handleInsertTail}
                  className="px-4 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-colors shadow-lg whitespace-nowrap text-sm"
                  title="Insert at TAIL (O(n) or O(1) with tail ptr)"
                >
                  + Tail
                </button>
              </div>

              <div className="w-full xl:w-auto flex gap-2">
                <button
                  onClick={handleDeleteHead}
                  className="flex-1 xl:flex-none px-4 py-2.5 rounded-lg border border-orange-500/50 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold transition-colors shadow-sm whitespace-nowrap text-sm"
                  title="Remove HEAD (O(n))"
                >
                  − Head
                </button>
                <button
                  onClick={handleDeleteTail}
                  className="flex-1 xl:flex-none px-4 py-2.5 rounded-lg border border-orange-500/50 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold transition-colors shadow-sm whitespace-nowrap text-sm"
                  title="Remove TAIL (O(n))"
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
            title="Circular Linked List"
            description="Unlike a Singly Linked List that ends with NULL, a Circular Linked List is a continuous loop. The last node (Tail) connects back to the first node (Head). There is no specific beginning or end!"
            descriptionHi="Singly Linked List jahan NULL pe khtam ho jati hai, Circular Linked List ek gol chakkar (loop) banati hai. Aakhiri node wapas pehle node ko point karta hai, isliye iska koi end nahi hota!"
            analogy={{
              icon: "⭕",
              title: "Musical Chairs",
              titleHi: "Musical Chairs ka Khel",
              desc: "Think of people sitting in a circle playing musical chairs. Every person looks at the person sitting to their right. The last person automatically looks at the first person forming a closed circle. Nobody looks at 'nobody' (NULL).",
              descHi: "Sochiye log ek gol ghere mein baithe hain. Har koi apne right wale ko dekh raha hai. Aakhiri insaan wapas pehle insaan ko dekhta hai jisse ek circle ban jata hai. Koi bhi hawa mein (NULL) nahi dekhta."
            }}
            readingTip={{
              en: "Because the tail points to the head, any insertions or deletions at the Head REQUIRE updating the Tail's pointer too! This makes operations slightly more complex than a standard list.",
              hi: "Kyunki Tail wapas Head ko point karta hai, Head par kuch bhi naya jodne ya hatane par hume Tail ko bhi update karna padta hai! Isliye ye thoda complex hota hai."
            }}
            quote={{
              en: '"What goes around, comes around... literally, through the tail pointer!"',
              hi: '"Duniya gol hai, aur is list ka pointer bhi!"'
            }}
            complexities={[
              { case: "Insert Head", time: "n", space: "1", note: "Must traverse to Tail to update its pointer to new Head." },
              { case: "Insert Tail", time: "n", space: "1", note: "Must traverse to Tail, point new Tail to Head." },
              { case: "Delete Tail", time: "n", space: "1", note: "Must traverse to second-to-last node." },
              { case: "Traversal",   time: "n", space: "1", note: "Careful: must track starting node to prevent infinite loops." },
            ]}
            pseudocode={`class Node:
  constructor(data):
    data = data
    next = null

class CircularLinkedList:
  constructor():
    head = null

  insertTail(val):
    newNode = Node(val)
    if head == null:
      head = newNode
      newNode.next = head
    else:
      curr = head
      while curr.next != head:
        curr = curr.next
      curr.next = newNode
      newNode.next = head`}
            useCases={[
              "Multiplayer board games (taking turns in a ring).",
              "Operating System Round Robin scheduling.",
              "Image carousels that loop continuously.",
              "Advanced data structures like Fibonacci Heaps.",
            ]}
            useCasesHi={[
              "Multiplayer games mein sabki baari (turn) aane ke liye.",
              "OS mein programs ko equal time dene (Round Robin) ke liye.",
              "Website ke slider/carousels jo repeat hote rehte hain.",
              "Advanced algorithms banane mein."
            ]}
            howItWorks={{
              en: [
                { icon: "🟢", text: "Insert: Link the new node, and if adding to head/tail, ensure the circle remains unbroken." },
                { icon: "🟠", text: "Delete: Connect the previous node completely over the deleted node. If deleting Head, Tail must update!" },
                { icon: "🔄", text: "Endless: To traverse, we stop when curr.next == head, otherwise we would loop forever." }
              ],
              hi: [
                { icon: "🟢", text: "Insert: Naya node jodo. Agar shuru/end mein joda toh circle tutne nahi dena." },
                { icon: "🟠", text: "Delete: Piche wale ko uske agle se jodo. Agar Head hataya toh Tail ko naye Head pe set karo!" },
                { icon: "🔄", text: "Endless: Print karte waqt loop rokne ke liye yaad rakhna padta hai ki shuru kahan se kiya tha." }
              ]
            }}
            example={{
              array: [],
              steps: [
                { desc: "Empty List: HEAD → NULL.", descHi: "Khali list.", array: [], highlight: [] },
                { desc: "INSERT 10: 10 points to itself. [10] → [10].", descHi: "INSERT 10: 10 khud ko hi point kar raha hai.", array: [10], highlight: [0] },
                { desc: "INSERT 20 at Tail: 10 points to 20, 20 points back to 10.", descHi: "INSERT 20 (Tail): 10 → 20, aur 20 wapas 10 ko dekhta hai.", array: [10, 20], highlight: [1] },
              ]
            }}
          />
        }
      >
        <div className="w-full h-full flex flex-col items-center justify-center relative min-h-[440px]">
          {/* Status Badge */}
          <div className="absolute top-4 right-4 md:right-6 z-20 flex flex-col items-end gap-2 text-xs font-mono bg-white/80 dark:bg-[#0d0f1a]/80 backdrop-blur-sm p-2 rounded-lg border border-black/5 dark:border-white/5">
            <span className="text-black/40 dark:text-slate-500 uppercase tracking-[0.2em] font-bold text-[9px] md:text-[10px] mb-1">CLL Status</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Nodes: {listArr.length}/{MAX_NODES}</span>
            <span className="text-lime-600 dark:text-lime font-bold">HEAD: {listArr.length > 0 ? listArr[0] : "NULL"}</span>
            <span className="text-orange-500 dark:text-orange-400 font-bold">TAIL: {listArr.length > 0 ? listArr[listArr.length - 1] : "NULL"}</span>
            <span className="text-purple-500 dark:text-purple-400 font-bold italic text-[9px]">TAIL.next → HEAD</span>
          </div>
          <CircularLinkedListViz currentStepData={currentStepData} />
        </div>
      </VisualizerFrame>
    </div>
  );
}
