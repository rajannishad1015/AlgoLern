"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateSingleDequeSteps } from "@/lib/algorithms/data-structures/deque";
import { StackQueueViz } from "@/components/d3/StackQueueViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";

export default function DequePage() {
  const [dequeArr, setDequeArr] = useState<number[]>([10, 20, 30]);
  const [inputValue, setInputValue] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("deque");
    setSteps([{
      id: 0, type: 'highlight', indices: [],
      values: { array: [...dequeArr] },
      description: `Deque loaded with ${dequeArr.length} elements. FRONT is ${dequeArr[0]} and REAR is ${dequeArr[dequeArr.length - 1]}.`,
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
        if (currentStepIndex < steps.length - 1) stepForward();
        else { setIsPlaying(false); if (timerRef.current) clearInterval(timerRef.current); }
      }, speed);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, currentStepIndex, steps.length, speed, stepForward, setIsPlaying]);

  const runOperation = (op: { type: 'addFront'; value: number } | { type: 'addRear'; value: number } | { type: 'removeFront' } | { type: 'removeRear' }) => {
    const { steps: newSteps, nextDeque } = generateSingleDequeSteps(dequeArr, op);
    resetVisualizer();
    setSteps(newSteps);
    setDequeArr(nextDeque);
    setTimeout(() => setIsPlaying(true), 50);
  };

  const handleAddFront = () => {
    const val = parseInt(inputValue);
    if (isNaN(val) || val < 0 || val > 999) return;
    setInputValue("");
    runOperation({ type: 'addFront', value: val });
  };

  const handleAddRear = () => {
    const val = parseInt(inputValue);
    if (isNaN(val) || val < 0 || val > 999) return;
    setInputValue("");
    runOperation({ type: 'addRear', value: val });
  };

  const handleRemoveFront = () => {
    runOperation({ type: 'removeFront' });
  };

  const handleRemoveRear = () => {
    runOperation({ type: 'removeRear' });
  };

  const handleClear = () => {
    setDequeArr([]);
    resetVisualizer();
    setSteps([{
      id: 0, type: 'highlight', indices: [],
      values: { array: [] },
      description: `Deque cleared. Empty — FRONT and REAR are NULL.`,
    }]);
  };

  const currentStepData = steps[currentStepIndex];

  const formattedDescription = currentStepData?.description
    ? currentStepData.description
        .replace(/\b(\d+)\b/g, '<span class="text-[var(--lime-dark)] dark:text-lime font-bold">$1</span>')
        + `<span class="text-indigo-400 italic ml-2">(${
            currentStepData.type === 'insert' ? 'Inserting...' :
            currentStepData.type === 'delete' ? 'Removing...' :
            currentStepData.type === 'done'   ? '✓ Done' : 'Viewing'
          })</span>`
    : "Ready...";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Deque (Double-Ended Queue)"
        description="A Double-Ended Queue (Deque) is a linear data structure that supports inserting and removing elements from both ends (FRONT and REAR)."
        complexity={{ time: '1', space: 'n', difficulty: 'Medium' }}
        controls={
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col md:flex-row gap-3 items-center bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4">
              <div className="flex-1 w-full flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={999}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Value (0-999)"
                  className="w-32 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-lime-600 dark:text-lime outline-none focus:border-indigo-500 transition-all font-mono"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddFront}
                    className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors shadow-lg whitespace-nowrap"
                  >
                    + Front
                  </button>
                  <button
                    onClick={handleAddRear}
                    className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-lg whitespace-nowrap"
                  >
                    + Rear
                  </button>
                </div>
              </div>

              <div className="w-full md:w-auto flex gap-2">
                <button
                  onClick={handleRemoveFront}
                  className="flex-1 md:flex-none px-4 py-2.5 rounded-lg border border-red-500/50 hover:bg-red-500/10 text-red-600 dark:text-red-400 font-semibold transition-colors shadow-sm whitespace-nowrap"
                >
                  - Front
                </button>
                <button
                  onClick={handleRemoveRear}
                  className="flex-1 md:flex-none px-4 py-2.5 rounded-lg border border-amber-500/50 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold transition-colors shadow-sm whitespace-nowrap"
                >
                  - Rear
                </button>
                <button
                  onClick={handleClear}
                  className="flex-1 md:flex-none px-4 py-2.5 rounded-lg bg-slate-200 dark:bg-[#252840] hover:bg-slate-300 dark:hover:bg-[#2f3352] text-slate-700 dark:text-slate-300 font-semibold transition-colors"
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
            title="Deque"
            description="A Deque (Double-Ended Queue) is a generalized version of a Queue. It allows insertion and deletion from both ends (Front and Rear). It can function as both a Stack (LIFO) and a regular Queue (FIFO)."
            descriptionHi="Deque (Double-Ended Queue) ek Queue ka advance version hai. Isme aap dono taraf yani Front aur Rear, kahin se bhi element daal (insert) sakte hain aur nikaal (delete) sakte hain. Yeh Stack aur Queue dono ka kaam kar sakta hai."
            analogy={{
              icon: "🚇",
              title: "A Metro Train with Doors at Both Ends",
              titleHi: "Metro Train Jiske Dono Taraf Darwaze Hain",
              desc: "Picture a metro train carriage with open doors at both ends. Passengers can enter or exit from either the front door or the back door at any time. A Deque models this exact flexibility.",
              descHi: "Ek train ke dibbe ke baare mein sochiye jiske aage aur peeche, dono taraf darwaze khule hain. Log aage wale darwaze se bhi chad/utar sakte hain, aur peeche wale darwaze se bhi. Deque waise hi flexible hai."
            }}
            readingTip={{
              en: "Deques are incredibly versatile. If you restrict insertion and deletion to just one end, it behaves exactly like a Stack. If you insert at one end and delete at the other, it behaves like a Queue.",
              hi: "Deque waise bohot flexible hai. Agar aap ek hi taraf se operation karein, toh yeh Stack ban jayega. Agar aap ek taraf se insert aur doosri taraf se nikalein, toh yeh Queue ki tarah kaam karega."
            }}
            quote={{
              en: '"Why choose between LIFO and FIFO when you can have both?"',
              hi: '"Jab aapke paas LIFO aur FIFO dono ke maze lene ka option ho, toh kisi ek ko kyon chunein?"'
            }}
            complexities={[
              { case: "Add Front", time: "1", space: "1", note: "Depends on implementation (O(1) in linked list deque)." },
              { case: "Add Rear", time: "1", space: "1", note: "O(1) typical." },
              { case: "Remove Front", time: "1", space: "n", note: "O(1) typical." },
              { case: "Remove Rear", time: "1", space: "n", note: "O(1) typical." },
            ]}
            pseudocode={`class Deque:
  constructor():
    items = []
    
  addFront(item):
    items.unshift(item)  # Insert at index 0
    
  addRear(item):
    items.push(item)    # Insert at last index
    
  removeFront():
    if not isEmpty():
      return items.shift()
    else: return "Underflow"
      
  removeRear():
    if not isEmpty():
      return items.pop()
    else: return "Underflow"
      
  isEmpty():
    return items.length == 0`}
            useCases={[
              "Palindrome checking (match front to back).",
              "A-Steal job scheduling algorithm (workers pulling jobs from top vs bottom).",
              "Storing a web browser's history.",
              "Undo/Redo operations where older actions eventually get forgotten (buffer)."
            ]}
            useCasesHi={[
              "Palindrome strings check karne ke liye.",
              "Job scheduling algorithms mein jahan aage-peeche dono flexibility chahiye.",
              "Web browser ki limited history maintain karne mein.",
              "Undo/Redo buffers jahan purane action delete karne padte hain."
            ]}
            howItWorks={{
              en: [
                { icon: "🟢", text: "Add Front: Pushes the element to the very beginning. Current items shift right." },
                { icon: "🔵", text: "Add Rear: Pushes the element to the very end. The rest of the deque is unaffected." },
                { icon: "🔴", text: "Remove Front: Pulls the first element off the list. Leftmost item removed." },
                { icon: "🟠", text: "Remove Rear: Pulls the last available element off the list." }
              ],
              hi: [
                { icon: "🟢", text: "Add Front: Element ko sabse shuru (index 0) mein dalta hai." },
                { icon: "🔵", text: "Add Rear: Element ko line ke sabse end mein daal deta hai." },
                { icon: "🔴", text: "Remove Front: Pehla element (Front) nikaal deta hai." },
                { icon: "🟠", text: "Remove Rear: Aakhiri element (Rear) nikaal deta hai." }
              ]
            }}
            example={{
              array: [],
              steps: [
                { desc: "Deque is initially empty.", descHi: "Shuru mein Deque bilkul khali hai.", array: [], highlight: [] },
                { desc: "ADD REAR 10: 10 goes to the rear. FRONT=10, REAR=10.", descHi: "ADD REAR 10: 10 peeche add hua.", array: [10], highlight: [0] },
                { desc: "ADD REAR 20: 20 goes to the rear.", descHi: "ADD REAR 20: 20 peeche add hua.", array: [10, 20], highlight: [1] },
                { desc: "ADD FRONT 5: 5 goes to the FRONT! (New Front)", descHi: "ADD FRONT 5: 5 sabse aage(Front) pe laga!", array: [5, 10, 20], highlight: [0] },
                { desc: "REMOVE REAR: We pop 20 from the back.", descHi: "REMOVE REAR: Sabse peeche wala (20) nikal gaya.", array: [5, 10], highlight: [] },
                { desc: "REMOVE FRONT: We pop 5 from the front.", descHi: "REMOVE FRONT: Sabse aage wala (5) nikal gaya.", array: [10], highlight: [] },
              ]
            }}
            quiz={[
              {
                question: "Which data structure acts exclusively as a specialized Deque where elements can only be added to Rear and removed from Front?",
                options: ["Stack", "Queue", "Linked List", "Array"],
                correctIndex: 1,
                explanation: "A standard Queue restrict operations to Add-Rear (Enqueue) and Remove-Front (Dequeue). A Deque is just a Queue stripped of those restrictions."
              },
              {
                question: "If you want to use a Deque to perfectly mimic the behavior of a Stack, which two methods should you use?",
                options: ["addRear & removeFront", "addFront & removeRear", "addFront & removeFront", "removeFront & removeRear"],
                correctIndex: 2,
                explanation: "To act like a Stack (LIFO), you must add and remove from the same end. So `addFront` and `removeFront` works. (`addRear` and `removeRear` would also work!)."
              },
              {
                question: "What is typically the time complexity to 'Add Front' and 'Remove Rear' in a Deque implemented via a Doubly Linked List?",
                options: ["O(1) and O(1)", "O(1) and O(n)", "O(n) and O(1)", "O(n) and O(n)"],
                correctIndex: 0,
                explanation: "Using a Doubly Linked List with head and tail pointers, adding or removing nodes from either end takes constant O(1) time."
              }
            ]}
          />
        }
      >
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          <div className="absolute top-4 right-4 md:right-6 z-20 flex flex-col items-end gap-2 text-xs font-mono bg-white/80 dark:bg-[#0d0f1a]/80 backdrop-blur-sm p-2 rounded-lg border border-black/5 dark:border-white/5">
            <span className="text-black/40 dark:text-slate-500 uppercase tracking-[0.2em] font-bold text-[9px] md:text-[10px] mb-1">Deque Status</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Size: {dequeArr.length}</span>
            <div className="flex gap-4">
              <span className="text-lime-600 dark:text-lime font-bold">FRONT: {dequeArr.length > 0 ? dequeArr[0] : 'NULL'}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">REAR: {dequeArr.length > 0 ? dequeArr[dequeArr.length - 1] : 'NULL'}</span>
            </div>
          </div>
          <StackQueueViz currentStepData={currentStepData} layout="horizontal" />
        </div>
      </VisualizerFrame>
    </div>
  );
}
