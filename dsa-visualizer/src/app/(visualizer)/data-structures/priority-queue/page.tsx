"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateSinglePQSteps, PQNode } from "@/lib/algorithms/data-structures/priorityQueue";
import { HeapViz } from "@/components/d3/HeapViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";

const MAX_CAPACITY = 15;

export default function PriorityQueuePage() {
  const [heapArr, setHeapArr] = useState<PQNode[]>([
    { value: 20, priority: 1 },
    { value: 40, priority: 2 },
    { value: 10, priority: 3 },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [inputPriority, setInputPriority] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("priority-queue");
    setSteps([{
      id: 0, type: 'highlight', indices: [],
      values: { heap: [...heapArr] },
      description: `Priority Queue loaded with ${heapArr.length} elements. Root: value=${heapArr[0]?.value}, priority=${heapArr[0]?.priority}.`,
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

  const runOperation = (op: { type: 'enqueue'; value: number; priority: number } | { type: 'dequeue' }) => {
    const { steps: newSteps, nextHeap } = generateSinglePQSteps(heapArr, op);
    resetVisualizer();
    setSteps(newSteps);
    setHeapArr(nextHeap);
    setTimeout(() => setIsPlaying(true), 50);
  };

  const handleEnqueue = () => {
    const val = parseInt(inputValue);
    const pri = parseInt(inputPriority);
    if (isNaN(val) || val < 0 || val > 999) return;
    if (isNaN(pri) || pri < 0 || pri > 99) return;
    if (heapArr.length >= MAX_CAPACITY) {
      setSteps([{
        id: 0, type: 'highlight', indices: [],
        values: { heap: [...heapArr] },
        description: `Heap Overflow! Maximum capacity of ${MAX_CAPACITY} reached. Dequeue some elements first.`,
      }]);
      setInputValue("");
      setInputPriority("");
      return;
    }
    setInputValue("");
    setInputPriority("");
    runOperation({ type: 'enqueue', value: val, priority: pri });
  };

  const handleDequeue = () => {
    runOperation({ type: 'dequeue' });
  };

  const handleClear = () => {
    setHeapArr([]);
    resetVisualizer();
    setSteps([{
      id: 0, type: 'highlight', indices: [],
      values: { heap: [] },
      description: `Priority Queue cleared. Empty heap.`,
    }]);
  };

  const currentStepData = steps[currentStepIndex];

  const formattedDescription = currentStepData?.description
    ? currentStepData.description
        .replace(/\b(\d+)\b/g, '<span class="text-[var(--lime-dark)] dark:text-lime font-bold">$1</span>')
        + `<span class="text-indigo-400 italic ml-2">(${
            currentStepData.type === 'insert' ? 'Enqueue ↑' :
            currentStepData.type === 'delete' ? 'Dequeue ↓' :
            currentStepData.type === 'swap'   ? '⇅ Swap' :
            currentStepData.type === 'compare' ? '⇔ Compare' :
            currentStepData.type === 'done'   ? '✓ Done' : 'Viewing'
          })</span>`
    : "Ready...";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Priority Queue (Min-Heap)"
        description="A heap-based data structure where every element has a priority. The element with the lowest priority number is always dequeued first — like an emergency room where critical patients are seen before others."
        complexity={{ time: 'log n', space: 'n', difficulty: 'Medium' }}
        controls={
          <div className="flex flex-col gap-4 w-full">
            {/* Inline Action Row */}
            <div className="flex flex-col md:flex-row gap-3 items-center bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4">
              <div className="flex-1 w-full flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={999}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleEnqueue(); } }}
                  placeholder="Value (0-999)"
                  className="flex-1 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-lime-600 dark:text-lime outline-none focus:border-indigo-500 transition-all font-mono"
                />
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={inputPriority}
                  onChange={e => setInputPriority(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleEnqueue(); } }}
                  placeholder="Priority (0-99)"
                  className="w-32 md:w-36 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-emerald-600 dark:text-emerald-400 outline-none focus:border-indigo-500 transition-all font-mono"
                />
                <button
                  onClick={handleEnqueue}
                  className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-lg"
                >
                  Enqueue ↑
                </button>
              </div>

              <div className="w-full md:w-auto flex gap-2">
                <button
                  onClick={handleDequeue}
                  className="flex-1 md:flex-none px-6 py-2.5 rounded-lg border border-orange-500/50 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold transition-colors shadow-sm"
                >
                  Dequeue ↓
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
            title="Priority Queue"
            description="A Priority Queue is an abstract data type where each element has a priority. Unlike a normal queue (FIFO), the element with the highest priority (lowest priority number in a Min-Heap) is dequeued first. It is most efficiently implemented using a Binary Heap — a complete binary tree stored in an array."
            descriptionHi="Priority Queue ek aisa data structure hai jismein har element ki ek priority hoti hai. Normal queue (FIFO) ke ulta, yahan sabse zyada priority wala (Min-Heap mein sabse chhota number) pehle bahar aata hai. Ise Binary Heap se efficiently implement kiya jaata hai — ek complete binary tree jo array mein store hota hai."
            analogy={{
              icon: "🏥",
              title: "Emergency Room Triage",
              titleHi: "Hospital ka Emergency Room",
              desc: "Think of a hospital ER. Patients don't wait in a simple first-come-first-served queue. Instead, a person with a heart attack (priority 1) is treated before someone with a sprained ankle (priority 5), regardless of who arrived first. That's exactly how a Priority Queue works!",
              descHi: "Hospital ke emergency room ko sochiye. Yahan pehle aaya pehle paaya nahi chalta. Heart attack wala patient (priority 1) mooch katne wale (priority 5) se pehle treat hoga, chahe baad mein aaya ho. Yehi Priority Queue hai!"
            }}
            readingTip={{
              en: "Priority Queues power Dijkstra's shortest path algorithm, CPU task scheduling (OS), Huffman coding for compression, and event-driven simulations. The heap structure ensures O(log n) insert and extract operations.",
              hi: "Priority Queue Dijkstra ke shortest path algorithm, CPU task scheduling (OS), Huffman coding (compression) aur event-driven simulations mein use hota hai. Heap structure inserts aur extracts ko O(log n) mein karna ensure karta hai."
            }}
            quote={{
              en: '"In a Priority Queue, importance beats arrival time — the most urgent task always goes first."',
              hi: '"Priority Queue mein importance arrival time ko harati hai — sabse zaroori kaam hamesha pehle hota hai."'
            }}
            complexities={[
              { case: "Enqueue (Insert)", time: "log n", space: "1", note: "Insert at end, then heapify up." },
              { case: "Dequeue (Extract Min)", time: "log n", space: "1", note: "Remove root, heapify down." },
              { case: "Peek (Get Min)", time: "1", space: "1", note: "Root element is always the minimum." },
              { case: "Build Heap", time: "n", space: "1", note: "Bottom-up heapification is O(n)." },
            ]}
            pseudocode={`class MinHeap:
  constructor():
    heap = []

  enqueue(value, priority):
    heap.append({value, priority})
    heapifyUp(heap.length - 1)

  dequeue():
    if isEmpty(): return "Underflow!"
    min = heap[0]
    heap[0] = heap[last]
    heap.removeLast()
    heapifyDown(0)
    return min

  heapifyUp(idx):
    while idx > 0:
      parent = (idx - 1) / 2
      if heap[parent].priority > heap[idx].priority:
        swap(heap[parent], heap[idx])
        idx = parent
      else: break

  heapifyDown(idx):
    while true:
      smallest = idx
      left = 2*idx + 1, right = 2*idx + 2
      if left < n and heap[left] < heap[smallest]:
        smallest = left
      if right < n and heap[right] < heap[smallest]:
        smallest = right
      if smallest != idx:
        swap(heap[idx], heap[smallest])
        idx = smallest
      else: break`}
            useCases={[
              "Dijkstra's Shortest Path Algorithm (graph problems).",
              "CPU/OS Task Scheduling (process priority).",
              "Huffman Coding (data compression).",
              "Event-driven simulations (process next event by time).",
              "A* Search Algorithm (pathfinding in games/maps).",
              "Merge K Sorted Lists (LeetCode classic).",
            ]}
            useCasesHi={[
              "Dijkstra ka Shortest Path Algorithm (graph problems).",
              "CPU/OS Task Scheduling (process ki priority).",
              "Huffman Coding (data compression).",
              "Event-driven simulations (time ke hisab se next event).",
              "A* Search Algorithm (games/maps mein pathfinding).",
              "K Sorted Lists ko Merge karna (LeetCode classic).",
            ]}
            howItWorks={{
              en: [
                { icon: "📥", text: "Enqueue: Add new element at the end of the heap array, then 'bubble up' by comparing with parent until heap property is restored." },
                { icon: "📤", text: "Dequeue: Remove root (min element), move last element to root, then 'sink down' by comparing with children until heap is valid." },
                { icon: "⬆️", text: "Heapify Up: Compare child with parent — if child has lower priority number, swap them. Repeat until root or property holds." },
                { icon: "⬇️", text: "Heapify Down: Compare parent with both children — swap with the smallest child. Repeat until a leaf or property holds." },
                { icon: "🌳", text: "Array Storage: For node at index i → left child = 2i+1, right child = 2i+2, parent = (i-1)/2." },
              ],
              hi: [
                { icon: "📥", text: "Enqueue: Naya element heap array ke end mein daalo, phir parent se compare karke upar 'bubble up' karo jab tak heap property na ban jaaye." },
                { icon: "📤", text: "Dequeue: Root (min element) nikalo, last element ko root pe daalo, phir children se compare karke neeche 'sink down' karo." },
                { icon: "⬆️", text: "Heapify Up: Child ko parent se compare karo — agar child ki priority chhoti hai toh swap. Root ya sahi jagah tak repeat karo." },
                { icon: "⬇️", text: "Heapify Down: Parent ko dono children se compare karo — sabse chhote child se swap. Leaf ya sahi jagah tak repeat karo." },
                { icon: "🌳", text: "Array mein Storage: Index i ka left child = 2i+1, right child = 2i+2, parent = (i-1)/2." },
              ]
            }}
            example={{
              array: [],
              steps: [
                { desc: "Heap is initially empty.", descHi: "Shuru mein Heap bilkul khali hai.", array: [], highlight: [] },
                { desc: "ENQUEUE (10, P:3): 10 is inserted. It's the only element, so it's the root.", descHi: "ENQUEUE (10, P:3): 10 insert hua. Akela element hai, toh root hai.", array: [10], highlight: [0] },
                { desc: "ENQUEUE (20, P:1): 20 added at end. P:1 < P:3 → bubbles up to root!", descHi: "ENQUEUE (20, P:1): 20 end mein aaya. P:1 < P:3 → upar bubble up karke root ban gaya!", array: [20, 10], highlight: [0] },
                { desc: "ENQUEUE (30, P:5): 30 added at end. P:5 > P:1 → stays. Heap: [20,10,30].", descHi: "ENQUEUE (30, P:5): 30 end mein aaya. P:5 > P:1 → wahi raha. Heap: [20,10,30].", array: [20, 10, 30], highlight: [2] },
                { desc: "DEQUEUE: Remove root (20, P:1). Move 30 to root. Heapify: 10 bubbles up.", descHi: "DEQUEUE: Root (20, P:1) nikala. 30 ko root pe daala. Heapify: 10 upar aaya.", array: [10, 30], highlight: [] },
                { desc: "ENQUEUE (50, P:0): 50 added with P:0 → bubbles all the way up to root!", descHi: "ENQUEUE (50, P:0): 50 P:0 ke saath aaya → root tak bubble up ho gaya!", array: [50, 10, 30], highlight: [0] },
              ]
            }}
            code={{
              language: 'javascript',
              content: `class MinHeap {
  constructor() {
    this.heap = [];
  }

  // Time: O(log n) — Insert then bubble up
  enqueue(value, priority) {
    this.heap.push({ value, priority });
    this._heapifyUp(this.heap.length - 1);
  }

  // Time: O(log n) — Remove root then sink down
  dequeue() {
    if (this.isEmpty()) return null;
    const min = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._heapifyDown(0);
    }
    return min;
  }

  // Time: O(1) — Root is always the minimum
  peek() {
    return this.heap[0] ?? null;
  }

  _heapifyUp(idx) {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this.heap[parent].priority > this.heap[idx].priority) {
        [this.heap[parent], this.heap[idx]] = [this.heap[idx], this.heap[parent]];
        idx = parent;
      } else break;
    }
  }

  _heapifyDown(idx) {
    const n = this.heap.length;
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      if (left < n && this.heap[left].priority < this.heap[smallest].priority) smallest = left;
      if (right < n && this.heap[right].priority < this.heap[smallest].priority) smallest = right;
      if (smallest !== idx) {
        [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
        idx = smallest;
      } else break;
    }
  }

  isEmpty() { return this.heap.length === 0; }
  size()    { return this.heap.length; }
}

// Usage example:
const pq = new MinHeap();
pq.enqueue('Task A', 3);  // priority 3
pq.enqueue('Task B', 1);  // priority 1 (highest priority!)
pq.enqueue('Task C', 2);

console.log(pq.peek());    // { value: 'Task B', priority: 1 }
console.log(pq.dequeue()); // Task B is served first (lowest priority number)`
            }}
            quiz={[
              {
                q: "In a Min-Heap based Priority Queue, which element is always at the root?",
                options: [
                  "The element with the largest value",
                  "The element with the smallest value",
                  "The element with the lowest priority number (highest priority)",
                  "The element that was inserted first"
                ],
                answer: 2
              },
              {
                q: "After dequeuing the root in a Min-Heap, what happens next?",
                options: [
                  "The second-smallest element automatically becomes the root.",
                  "The last element is moved to the root, then heapify-down restores the heap property.",
                  "Everything is re-sorted from scratch.",
                  "Nothing — the heap is left in an invalid state."
                ],
                answer: 1
              },
              {
                q: "What is the time complexity of both Enqueue and Dequeue operations in a Binary Heap?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
                answer: 1
              }
            ]}
          />
        }
      >
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          {/* Status Badge */}
          <div className="absolute top-4 right-4 md:right-6 z-20 flex flex-col items-end gap-2 text-xs font-mono bg-white/80 dark:bg-[#0d0f1a]/80 backdrop-blur-sm p-2 rounded-lg border border-black/5 dark:border-white/5">
            <span className="text-black/40 dark:text-slate-500 uppercase tracking-[0.2em] font-bold text-[9px] md:text-[10px] mb-1">Heap Status</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Size: {heapArr.length}</span>
            <span className="text-lime-600 dark:text-lime font-bold">
              Root: {heapArr.length > 0 ? `${heapArr[0].value} (P:${heapArr[0].priority})` : 'NULL'}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              Type: Min-Heap
            </span>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 md:left-6 z-20 flex flex-wrap gap-3 text-[10px] font-mono bg-white/80 dark:bg-[#0d0f1a]/80 backdrop-blur-sm p-2 rounded-lg border border-black/5 dark:border-white/5">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-900 border border-emerald-400 inline-block"></span>Root</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-900 border border-indigo-400 inline-block"></span>Compare</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-900 border border-red-400 inline-block"></span>Swap</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-900 border border-purple-400 inline-block"></span>Insert</span>
          </div>

          <HeapViz currentStepData={currentStepData} />
        </div>
      </VisualizerFrame>
    </div>
  );
}
