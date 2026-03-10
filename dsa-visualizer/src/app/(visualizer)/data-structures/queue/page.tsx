"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateQueueSteps } from "@/lib/algorithms/data-structures/queueOperations";
import { StackQueueViz } from "@/components/d3/StackQueueViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";

type QueueOp = { type: 'enqueue', value: number } | { type: 'dequeue' };

export default function QueuePage() {
  const [operations, setOperations] = useState<QueueOp[]>([
      { type: 'enqueue', value: 10 },
      { type: 'enqueue', value: 20 },
      { type: 'enqueue', value: 30 },
      { type: 'dequeue' },
      { type: 'enqueue', value: 40 },
  ]);
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { steps, currentStepIndex, isPlaying, speed, setSteps, setIsPlaying, setSpeed, stepForward, stepBackward, resetVisualizer, setAlgorithmId } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("queue");
    setSteps(generateQueueSteps(operations));
    return () => { resetVisualizer(); if (timerRef.current) clearInterval(timerRef.current); };
  }, [operations, setSteps, resetVisualizer, setAlgorithmId]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (currentStepIndex < steps.length - 1) stepForward();
        else { setIsPlaying(false); if (timerRef.current) clearInterval(timerRef.current); }
      }, speed);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, currentStepIndex, steps.length, speed, stepForward, setIsPlaying]);

  const handleEnqueue = () => {
    const val = parseInt(inputValue);
    if (isNaN(val) || val < 0 || val > 999) return;
    setOperations(prev => [...prev, { type: 'enqueue', value: val }]);
    setInputValue("");
    resetVisualizer();
  };

  const handleDequeue = () => {
    setOperations(prev => [...prev, { type: 'dequeue' }]);
    resetVisualizer();
  };
  
  const handleClear = () => {
    setOperations([]);
    resetVisualizer();
  };

  const currentStepData = steps[currentStepIndex];

  const formattedDescription = currentStepData?.description
    ? currentStepData.description
        .replace(/\b(\d+)\b/g, '<span class="text-[var(--lime-dark)] dark:text-lime font-bold">$1</span>')
        + `<span class="text-indigo-400 italic ml-2">(Next: ${
            currentStepData.type === 'insert'    ? 'Enqueue Complete' :
            currentStepData.type === 'delete'    ? 'Updating Queue' :
            currentStepData.type === 'update'    ? 'Dequeue Complete' :
            currentStepData.type === 'done'      ? 'All Ops Finished' : 'Run'
          })</span>`
    : "Waiting for operations...";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Queue (FIFO)"
        description="First-In-First-Out Data Structure. Elements are added (enqueued) to the back and removed (dequeued) from the front, exactly like waiting in a line."
        complexity={{ time: '1', space: 'n', difficulty: 'Easy' }}
        controls={
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
            onRandomize={handleClear}
            hideRandomizeText="Clear Queue"
            onCustomInput={() => setShowInputModal(true)}
            customInputText="Add Operations"
          />
        }
        info={
          <TheoryCard
            title="Queue"
            description="A Queue is a linear data structure that follows the FIFO (First-In-First-Out) principle. This means the first element added to the queue will be the first one to be removed. It primarily supports two main operations: Enqueue (add an item to the rear) and Dequeue (remove the item from the front)."
            descriptionHi="Queue ek linear data structure hai jo FIFO (First-In-First-Out) rule follow karta hai. Iska seedha sa matlab hai jo sabse pehle line mein aayega, wahi sabse pehle bahar nikalega. Iske do main operations hote hain: Enqueue (line ke peeche judna) aur Dequeue (line ke aage se nikalna)."
            analogy={{
              icon: "🎫",
              title: "Ticket Counter Line",
              titleHi: "Ticket Counter ki Line",
              desc: "Think of waiting in line at a movie theater ticket counter. The first person to arrive stands at the front and gets their ticket first (Dequeue). Anyone new who arrives must join at the back of the line (Enqueue).",
              descHi: "Sochiye aap cinema hall ki ticket counter par khade ho. Jo sabse pehle aaya tha, woh line mein sabse aage khada hai aur usko pehle ticket milegi (Dequeue). Agar koi naya insaan aata hai, toh use line ke sabse peeche hi lagna padega (Enqueue)."
            }}
            readingTip={{
              en: "Queues are essential for scheduling! Whenever tasks need to be processed in the exact order they arrived (like print jobs sent to a printer, or requests to a web server), a Queue is used.",
              hi: "Queues 'scheduling' ke liye bahut zaruri hain! Jab bhi cheezon ko usi order mein process karna ho jismein woh aayi hain (jaise printer ko di gayi commands, ya web server ki requests), tab Queue ka hi use hota hai."
            }}
            quote={{
              en: '"Queues enforce fairness: first come, first served. The ultimate equalizer in computer science."',
              hi: '"Queues fair play sikhate hain: pehle aao, pehle paao. Data ka sabse imaandaar structure."'
            }}
            complexities={[
              { case: "Enqueue", time: "1", space: "1", note: "Instant addition to the rear." },
              { case: "Dequeue", time: "1", space: "1", note: "Instant removal from the front." },
              { case: "Front/Peek", time: "1", space: "1", note: "Viewing the front element." },
            ]}
            pseudocode={`class Queue:
  constructor():
    items = []
    
  enqueue(element):
    items.append(element)
    
  dequeue():
    if not isEmpty():
      return items.removeFirst()
    else:
      return "Queue Underflow!"
      
  front():
    if not isEmpty():
      return items[0]
      
  isEmpty():
    return items.length == 0`}
            useCases={[
              "Job Scheduling (OS process management).",
              "Print Queue (handling multiple print requests).",
              "Breadth-First Search (BFS) in Graph Traversal.",
              "Handling web server requests and async tasks.",
            ]}
            useCasesHi={[
              "Operating System mein CPU scheduling (kaunsa process pehle chalega).",
              "Printer mein queue lagana (jo pehle print command di gayi, wahi pehle print hogi).",
              "Graphs aur pakdo mein Breadth-First Search (BFS) chalane ke liye.",
              "Servers par aane wali lakho requests ko line mein lagana."
            ]}
            howItWorks={{
              en: [
                { icon: "📥", text: "Enqueue: Add a new element to the back (Rear) of the queue." },
                { icon: "📤", text: "Dequeue: Remove and return the element from the front (Head) of the queue." },
                { icon: "👀", text: "Front/Peek: Look at the front element without removing it." },
                { icon: "🚫", text: "Underflow: Trying to dequeue from an empty queue causes an error." }
              ],
              hi: [
                { icon: "📥", text: "Enqueue: Naye element ko hameshan queue ke sabse peeche (Rear) jodna." },
                { icon: "📤", text: "Dequeue: Jo element sabse aage (Front) hai, use nikaalna." },
                { icon: "👀", text: "Front/Peek: Sabse aage wale vyakti ko sirf dekhna, nikaalna nahi." },
                { icon: "🚫", text: "Underflow: Agar queue khali hai aur aap 'Dequeue' try karte ho toh error aata hai." }
              ]
            }}
            example={{
              array: [],
              steps: [
                { desc: "Queue is initially empty.", descHi: "Shuru mein Queue bilkul khali hai.", array: [], highlight: [] },
                { desc: "ENQUEUE 10: 10 joins the line. It is both Front and Rear.", descHi: "ENQUEUE 10: 10 line mein aaya. Ab yahi sabse aage (Front) aur sabse peeche (Rear) hai.", array: [10], highlight: [0] },
                { desc: "ENQUEUE 20: 20 joins at the Rear (behind 10).", descHi: "ENQUEUE 20: 20 line ke peeche (10 ke peeche) lag gaya.", array: [10, 20], highlight: [1] },
                { desc: "ENQUEUE 30: 30 joins at the Rear (behind 20).", descHi: "ENQUEUE 30: 30 line ke aur peeche lag gaya.", array: [10, 20, 30], highlight: [2] },
                { desc: "DEQUEUE: We process the person at the Front. 10 leaves the line.", descHi: "DEQUEUE: Humne sabse aage wale ko process kiya. 10 line se bahar nikal gaya.", array: [20, 30], highlight: [] },
                { desc: "ENQUEUE 40: 40 joins at the new Rear.", descHi: "ENQUEUE 40: Naya element 40 line mein sabse peeche juda.", array: [20, 30, 40], highlight: [2] },
                { desc: "DEQUEUE: 20 leaves the line. 30 is now the new Front.", descHi: "DEQUEUE: 20 nikal gaya. Ab line mein sabse aage 30 khada hai.", array: [30, 40], highlight: [] },
                { desc: "DEQUEUE: 30 leaves the line. Only 40 is left.", descHi: "DEQUEUE: 30 bhi nikal gaya. Sirf 40 bacha hai.", array: [40], highlight: [] },
              ]
            }}
          />
        }
      >
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          <div className="absolute top-4 right-4 md:right-6 z-20 flex flex-col items-end gap-2 text-xs font-mono bg-white/80 dark:bg-[#0d0f1a]/80 backdrop-blur-sm p-2 rounded-lg border border-black/5 dark:border-white/5">
            <span className="text-black/40 dark:text-slate-500 uppercase tracking-[0.2em] font-bold text-[9px] md:text-[10px] mb-1">Queue Status</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Step: {currentStepIndex}</span>
            <span className="text-lime-600 dark:text-lime font-bold">Size: {currentStepData?.values?.array?.length || 0}</span>
          </div>
          <StackQueueViz currentStepData={currentStepData} layout="horizontal" />
        </div>

        {/* Custom Input Modal for Queue Operations */}
        {showInputModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-[#14151f] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
              <h3 className="text-xl font-display text-white tracking-tight">Queue Controls</h3>
              <p className="text-sm font-light text-white/50">Enqueue a value at the rear, or Dequeue from the front.</p>
              
              <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    autoFocus
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleEnqueue()}
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-lime outline-none focus:border-lime/50 transition-all font-mono"
                    placeholder="Enter number (0-999)"
                  />
                  <button onClick={handleEnqueue} className="px-5 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg text-sm transition-colors font-bold uppercase tracking-wider">
                    Enqueue
                  </button>
              </div>

              <div className="flex gap-2 items-center mt-2">
                  <button onClick={handleDequeue} className="flex-1 px-5 py-3 rounded-lg border border-orange-500/50 hover:bg-orange-500/20 text-orange-400 shadow-lg text-sm transition-colors font-bold uppercase tracking-wider">
                    Dequeue Front Element
                  </button>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10">
                 <p className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-bold">Queued Operations ({operations.length})</p>
                 <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto">
                    {operations.map((op, i) => (
                        <span key={i} className={`text-[10px] px-2 py-1 rounded font-mono ${op.type === 'enqueue' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-orange-500/20 text-orange-300'}`}>
                            {op.type.toUpperCase()} {op.type === 'enqueue' ? op.value : ''}
                        </span>
                    ))}
                 </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setShowInputModal(false)} className="px-4 py-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white text-sm transition-colors">
                  Close Engine
                </button>
              </div>
            </div>
          </div>
        )}
      </VisualizerFrame>
    </div>
  );
}
