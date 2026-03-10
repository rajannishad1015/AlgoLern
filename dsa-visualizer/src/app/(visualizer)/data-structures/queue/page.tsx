"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { AlgorithmStep } from "@/lib/types/algorithm";
import { StackQueueViz } from "@/components/d3/StackQueueViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";

// ─── Generate steps for ONE queue operation at a time ─────────────────────────
function generateSingleQueueSteps(
  currentQueue: number[],
  op: { type: 'enqueue'; value: number } | { type: 'dequeue' }
): { steps: AlgorithmStep[]; nextQueue: number[] } {
  const queue = [...currentQueue];
  const steps: AlgorithmStep[] = [];

  steps.push({
    id: 0, type: 'highlight', indices: [],
    values: { array: [...queue] },
    description: `Queue has ${queue.length} element${queue.length !== 1 ? 's' : ''}. FRONT is ${queue.length > 0 ? queue[0] : 'NULL'}.`,
  });

  if (op.type === 'enqueue') {
    steps.push({
      id: 1, type: 'insert', indices: [queue.length],
      values: { array: [...queue, op.value] },
      description: `Enqueueing ${op.value} at the REAR of the queue. (FIFO — New arrivals join the back of the line.)`,
    });
    queue.push(op.value);
    steps.push({
      id: 2, type: 'done', indices: [],
      values: { array: [...queue] },
      description: `Enqueue complete. ${op.value} is now at the REAR. Queue size: ${queue.length}.`,
    });
  } else {
    if (queue.length === 0) {
      steps.push({
        id: 1, type: 'highlight', indices: [],
        values: { array: [] },
        description: `Queue is EMPTY — cannot dequeue (Queue Underflow Error).`,
      });
    } else {
      const dequeued = queue[0]; // FIFO: front is index 0
      steps.push({
        id: 1, type: 'delete', indices: [0],
        values: { array: [...queue] },
        description: `Dequeuing FRONT element: ${dequeued}. (FIFO — First one in is always the first one out!)`,
      });
      queue.shift();
      steps.push({
        id: 2, type: 'done', indices: [],
        values: { array: [...queue] },
        description: `Dequeue complete. ${dequeued} removed. New FRONT: ${queue.length > 0 ? queue[0] : 'NULL'}. Queue size: ${queue.length}.`,
      });
    }
  }

  return { steps, nextQueue: queue };
}

export default function QueuePage() {
  const [queueArr, setQueueArr] = useState<number[]>([10, 20, 30]);
  const [inputValue, setInputValue] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("queue");
    setSteps([{
      id: 0, type: 'highlight', indices: [],
      values: { array: [...queueArr] },
      description: `Queue loaded with ${queueArr.length} elements. FRONT is ${queueArr[0]}.`,
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

  const runOperation = (op: { type: 'enqueue'; value: number } | { type: 'dequeue' }) => {
    const { steps: newSteps, nextQueue } = generateSingleQueueSteps(queueArr, op);
    resetVisualizer();
    setSteps(newSteps);
    setQueueArr(nextQueue);
    setTimeout(() => setIsPlaying(true), 50);
  };

  const handleEnqueue = () => {
    const val = parseInt(inputValue);
    if (isNaN(val) || val < 0 || val > 999) return;
    setInputValue("");
    runOperation({ type: 'enqueue', value: val });
  };

  const handleDequeue = () => {
    runOperation({ type: 'dequeue' });
  };

  const handleClear = () => {
    setQueueArr([]);
    resetVisualizer();
    setSteps([{
      id: 0, type: 'highlight', indices: [],
      values: { array: [] },
      description: `Queue cleared. Empty queue — FRONT is NULL.`,
    }]);
  };

  const currentStepData = steps[currentStepIndex];

  const formattedDescription = currentStepData?.description
    ? currentStepData.description
        .replace(/\b(\d+)\b/g, '<span class="text-[var(--lime-dark)] dark:text-lime font-bold">$1</span>')
        + `<span class="text-indigo-400 italic ml-2">(${
            currentStepData.type === 'insert' ? 'Enqueue →' :
            currentStepData.type === 'delete' ? '← Dequeue' :
            currentStepData.type === 'done'   ? '✓ Done' : 'Viewing'
          })</span>`
    : "Ready...";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Queue (FIFO)"
        description="First-In-First-Out Data Structure. Elements are added (enqueued) to the back and removed (dequeued) from the front, exactly like waiting in a line."
        complexity={{ time: '1', space: 'n', difficulty: 'Easy' }}
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
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleEnqueue(); } }}
                  placeholder="Value to Enqueue (0-999)"
                  className="flex-1 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-lime-600 dark:text-lime outline-none focus:border-indigo-500 transition-all font-mono"
                />
                <button
                  onClick={handleEnqueue}
                  className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-lg"
                >
                  Enqueue →
                </button>
              </div>

              <div className="w-full md:w-auto flex gap-2">
                <button
                  onClick={handleDequeue}
                  className="flex-1 md:flex-none px-6 py-2.5 rounded-lg border border-orange-500/50 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold transition-colors shadow-sm"
                >
                  ← Dequeue
                </button>
                <button
                  onClick={handleClear}
                  className="flex-1 md:flex-none px-6 py-2.5 rounded-lg bg-slate-200 dark:bg-[#252840] hover:bg-slate-300 dark:hover:bg-[#2f3352] text-slate-700 dark:text-slate-300 font-semibold transition-colors"
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
            title="Queue"
            description="A Queue is a linear data structure that follows the FIFO (First-In-First-Out) principle. This means the first element added to the queue will be the first one to be removed. It primarily supports two main operations: Enqueue (add to the rear) and Dequeue (remove from the front)."
            descriptionHi="Queue ek linear data structure hai jo FIFO (First-In-First-Out) rule follow karta hai. Iska matlab jo pehle aayega, pehle wahi jayega. Isme do main operations hote hain: Enqueue (rear pe add karna) aur Dequeue (front se remove karna)."
            analogy={{
              icon: "🎟️",
              title: "A Ticket Counter Line",
              titleHi: "Ticket Counter ki Queue",
              desc: "Imagine a queue at a movie ticket counter. The first person to arrive stands at the FRONT and gets their ticket first (Dequeue). Every new person joins at the REAR of the line (Enqueue). This is pure FIFO — fair and ordered!",
              descHi: "Cinema ticket counter ki line sochiye. Jo pehle aaya wo FRONT pe hota hai aur ticket pehle pata hai (Dequeue). Har naya aadmi line ke REAR (peeche) mein lagta hai (Enqueue). Yehi FIFO hai — seedha aur fair!"
            }}
            readingTip={{
              en: "Unlike a Stack (LIFO), a Queue ensures fairness: whoever arrives first, leaves first. This is exactly how printers, CPU task schedulers, and BFS graph traversal work.",
              hi: "Stack (LIFO) ke ulta, Queue fairness ensure karta hai: jo pehle aaya wo pehle jayega. Printers, CPU schedulers, aur BFS algorithm issi principle pe kaam karte hain."
            }}
            quote={{
              en: '"A Queue is democracy in data structures — everyone waits their turn, no cutting the line."',
              hi: '"Queue data structures mein democracy hai — sab apni baari ka intezar karte hain, koi line nahi todta."'
            }}
            complexities={[
              { case: "Enqueue", time: "1", space: "1", note: "Instant addition to the rear." },
              { case: "Dequeue", time: "1", space: "1", note: "Instant removal from the front." },
              { case: "Peek",    time: "1", space: "1", note: "Viewing the front element." },
            ]}
            pseudocode={`class Queue:
  constructor():
    items = []
    
  enqueue(element):
    items.append(element)     # Add to REAR
    
  dequeue():
    if not isEmpty():
      return items.removeFirst()  # Remove from FRONT (FIFO!)
    else:
      return "Queue Underflow!"
      
  peek():
    return items[0]           # Look at FRONT
      
  isEmpty():
    return items.length == 0`}
            useCases={[
              "Printer task queue (first print job submitted prints first).",
              "CPU Process Scheduling (round-robin).",
              "BFS (Breadth-First Search) in graphs.",
              "Asynchronous message/event processing systems.",
            ]}
            useCasesHi={[
              "Printer queue: jo pehle print job bheja, pehle print hota hai.",
              "CPU Process Scheduling (round-robin) ke liye.",
              "Graphs mein BFS (Breadth-First Search) ke liye.",
              "Asynchronous message aur event processing ke liye."
            ]}
            howItWorks={{
              en: [
                { icon: "➡️", text: "Enqueue: New element joins at the REAR of the queue. Everyone already waiting gets priority." },
                { icon: "⬅️", text: "Dequeue: The element at the FRONT is removed. (FIFO: first one in, first one out!)" },
                { icon: "👀", text: "Peek/Front: Look at the front element without removing it." },
                { icon: "🚫", text: "Underflow: Dequeuing from an empty queue causes an error." }
              ],
              hi: [
                { icon: "➡️", text: "Enqueue: Naya element REAR (peeche) mein join karta hai. Pehle wale sabko priority milti hai." },
                { icon: "⬅️", text: "Dequeue: FRONT pe jo hai use remove kiya jata hai. (FIFO: pehle aaya, pehle gaya!)" },
                { icon: "👀", text: "Peek/Front: Front element ko bina nikale sirf dekhna." },
                { icon: "🚫", text: "Underflow: Khali queue se dequeue karne ki koshish karna error deta hai." }
              ]
            }}
            example={{
              array: [],
              steps: [
                { desc: "Queue is initially empty.", descHi: "Shuru mein Queue bilkul khali hai.", array: [], highlight: [] },
                { desc: "ENQUEUE 10: 10 joins at the REAR. FRONT = 10.", descHi: "ENQUEUE 10: 10 REAR pe join kiya. FRONT = 10.", array: [10], highlight: [0] },
                { desc: "ENQUEUE 20: 20 joins at the REAR. FRONT = 10 (unchanged).", descHi: "ENQUEUE 20: 20 REAR pe aaya. FRONT = 10.", array: [10, 20], highlight: [1] },
                { desc: "ENQUEUE 30: 30 joins at the REAR. FRONT = 10 (unchanged).", descHi: "ENQUEUE 30: 30 REAR pe aaya. FRONT = 10.", array: [10, 20, 30], highlight: [2] },
                { desc: "DEQUEUE: FIFO means we MUST remove FRONT first. 10 is removed!", descHi: "DEQUEUE: FIFO ka matlab FRONT (10) ko pehle nikalna padega!", array: [20, 30], highlight: [] },
                { desc: "ENQUEUE 40: 40 joins at REAR. FRONT = 20 (20 was next in line).", descHi: "ENQUEUE 40: 40 REAR pe aaya. FRONT = 20.", array: [20, 30, 40], highlight: [2] },
              ]
            }}
          />
        }
      >
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          <div className="absolute top-4 right-4 md:right-6 z-20 flex flex-col items-end gap-2 text-xs font-mono bg-white/80 dark:bg-[#0d0f1a]/80 backdrop-blur-sm p-2 rounded-lg border border-black/5 dark:border-white/5">
            <span className="text-black/40 dark:text-slate-500 uppercase tracking-[0.2em] font-bold text-[9px] md:text-[10px] mb-1">Queue Status</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Size: {queueArr.length}</span>
            <span className="text-lime-600 dark:text-lime font-bold">FRONT: {queueArr.length > 0 ? queueArr[0] : 'NULL'}</span>
          </div>
          <StackQueueViz currentStepData={currentStepData} layout="horizontal" />
        </div>
      </VisualizerFrame>
    </div>
  );
}
