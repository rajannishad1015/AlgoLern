"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateHeapSortSteps } from "@/lib/algorithms/sorting/heapSort";
import { ArrayViz } from "@/components/d3/ArrayViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";

const DEFAULT_ARRAY = [4, 10, 3, 5, 1, 8, 6];
const randomArray = () => Array.from({ length: 8 }, () => Math.floor(Math.random() * 95) + 5);

export default function HeapSortPage() {
  const [data, setData] = useState<number[]>(DEFAULT_ARRAY);
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputText, setInputText] = useState(DEFAULT_ARRAY.join(", "));
  const [inputError, setInputError] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { steps, currentStepIndex, isPlaying, speed, setSteps, setIsPlaying, setSpeed, stepForward, stepBackward, resetVisualizer, setAlgorithmId } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("heap-sort");
    setSteps(generateHeapSortSteps(data));
    return () => { resetVisualizer(); if (timerRef.current) clearInterval(timerRef.current); };
  }, [data, setSteps, resetVisualizer, setAlgorithmId]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (currentStepIndex < steps.length - 1) stepForward();
        else { setIsPlaying(false); if (timerRef.current) clearInterval(timerRef.current); }
      }, speed);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, currentStepIndex, steps.length, speed, stepForward, setIsPlaying]);

  const handleApplyInput = () => {
    const parsed = inputText.split(/[\s,]+/).filter(Boolean).map(Number);
    if (parsed.some(isNaN) || parsed.length < 2 || parsed.length > 20) { setInputError("Enter 2–20 numbers."); return; }
    setInputError(""); setData(parsed); resetVisualizer(); setShowInputModal(false);
  };
  const handleShuffle = () => { const a = randomArray(); setData(a); setInputText(a.join(", ")); setInputError(""); resetVisualizer(); };

  const currentStepData = steps[currentStepIndex];

  const formattedDescription = currentStepData?.description
    ? currentStepData.description
        .replace(/\b(\d+)\b/g, '<span class="text-[var(--lime-dark)] dark:text-lime font-bold">$1</span>')
        + `<span class="text-indigo-400 italic ml-2">(Next: ${
            currentStepData.type === 'compare'   ? 'Compare / Heapify' :
            currentStepData.type === 'highlight' ? 'Inspect Node' :
            currentStepData.type === 'swap'      ? 'Swap' :
            currentStepData.type === 'sorted'    ? 'Extract Max' : 'Run'
          })</span>`
    : "Awaiting execution parameters.";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Heap Sort"
        description="Transforms the array into a Max Heap structure, then repeatedly extracts the maximum element to progressively build the sorted array."
        complexity={{ time: 'n log n', space: '1', difficulty: 'Hard' }}
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
            onRandomize={handleShuffle}
            onCustomInput={() => setShowInputModal(true)}
          />
        }
        info={
          <TheoryCard
            title="Heap Sort"
            description="Heap Sort is an efficient comparison-based sorting algorithm that uses a binary heap data structure. It first converts the array into a Max Heap (where every parent is larger than its children), then repeatedly extracts the largest element and places it at the end of the sorted portion."
            descriptionHi="Heap Sort ek smart algorithm hai jo array ko pehle ek khaas structure mein dhaalta hai jise 'Max Heap' kehte hain (jahan har parent apne dono children se bada hota hai). Phir baar baar sabse bada number nikaal ke end mein rakhta hai. Aise poora array sort ho jaata hai."
            analogy={{
              icon: "🏆",
              title: "Tournament Champion System",
              titleHi: "Tournament Jeetne wala Tarika",
              desc: "Imagine a tournament where the winner always rises to the top. You organize all players into a bracket (heap). The champion (largest) is at the top. You remove the champion, put them in the 'sorted' zone, and run the tournament again with remaining players. Repeat until everyone is ranked!",
              descHi: "Sochiye ek tournament hai jisme winner hamesha upar aata hai. Sab players ek tree structure mein arrange hain. Jo sabse bada hai woh top par hota hai. Usse hataao, 'sorted' zone mein rakh do, aur baki logon ka tournament dobara chalao. Tab tak karo jab tak sab rank na ho jaayein!"
            }}
            readingTip={{
              en: "The key insight: building the heap takes O(n) time, and each of the n extractions takes O(log n). Together: O(n log n) — guaranteed in ALL cases, unlike QuickSort!",
              hi: "Sabse badi baat: heap banana O(n) time leta hai, aur har extraction O(log n). Milaakar O(n log n) — aur yeh HAMESHA guaranteed hai, chahe data kaisa bhi ho. Quick Sort ki tarah worst case nahi aata!"
            }}
            quote={{
              en: '"Heap Sort is unique in that it achieves the theoretical optimal sorting performance while using only O(1) extra memory — no recursion, no extra arrays."',
              hi: '"Heap Sort unique hai kyunki yeh best possible performance deta hai aur saath mein O(1) hi extra memory use karta hai — na recursion, na extra arrays."'
            }}
            complexities={[
              { case: "Best",    time: "n log n", space: "1", note: "Even on sorted input, heap must be built." },
              { case: "Average", time: "n log n", space: "1", note: "Consistent for all data distributions." },
              { case: "Worst",   time: "n log n", space: "1", note: "Guaranteed O(n log n) — no worst case!" },
            ]}
            pseudocode={`procedure heapSort(arr):
  n = arr.length
  // Phase 1: Build Max Heap
  for i from n/2 down to 0:
    heapify(arr, n, i)
  // Phase 2: Extract elements one by one
  for i from n-1 down to 1:
    swap(arr[0], arr[i])   ← move max to end
    heapify(arr, i, 0)     ← re-heapify reduced heap

procedure heapify(arr, n, i):
  largest = i
  left = 2*i + 1, right = 2*i + 2
  if arr[left] > arr[largest]: largest = left
  if arr[right] > arr[largest]: largest = right
  if largest != i:
    swap(arr[i], arr[largest])
    heapify(arr, largest)`}
            useCases={[
              "When guaranteed O(n log n) is required regardless of input.",
              "Memory-constrained environments (only O(1) extra space needed).",
              "Priority queues — the heap structure is fundamental to them.",
              "External sorting and operating system scheduling algorithms.",
            ]}
            useCasesHi={[
              "Jab guaranteed fast performance chahiye ho — chahe data sorted ho, reverse ho ya random.",
              "Jab extra memory bilkul na ho — sirf O(1) hi extra space use hoti hai.",
              "Priority Queue mein — heap ka use karne wala sabse common real use case.",
              "OS scheduling aur external sorting mein bhi iski demand hoti hai.",
            ]}
            howItWorks={{
              en: [
                { icon: "1️⃣", text: "Phase 1 — Build Max Heap: Rearrange the array so every parent is larger than its children." },
                { icon: "2️⃣", text: "After building, the LARGEST element is at index 0 (the root of the heap)." },
                { icon: "3️⃣", text: "Swap the root (largest) with the last element. That last position is now permanently sorted! 🔒" },
                { icon: "4️⃣", text: "The heap shrank by 1. Restore the Max Heap property on the reduced heap (heapify)." },
                { icon: "5️⃣", text: "The new largest rises to the top again. Swap it to the new last position. Repeat." },
                { icon: "✅", text: "After n-1 swaps, every element is in its correct sorted position!" },
              ],
              hi: [
                { icon: "1️⃣", text: "Phase 1 — Max Heap Banana: Array ko is tarah arrange karo ki har parent apne dono children se bada ho." },
                { icon: "2️⃣", text: "Max Heap banne ke baad, SABSE BADA number index 0 par hota hai (tree ka top)." },
                { icon: "3️⃣", text: "Top wale (sabse bade) ko aakhiri element se swap karo. Woh last position hamesha ke liye set ho gayi! 🔒" },
                { icon: "4️⃣", text: "Ab heap mein ek element kam ho gaya. Naye top ko dobara Max Heap format mein theek karo (heapify)." },
                { icon: "5️⃣", text: "Naya sabse bada phir top par aa jaata hai. Usse phir swap karo. Yahi baar baar karo." },
                { icon: "✅", text: "n-1 swaps ke baad, poora array sort ho jaata hai!" },
              ]
            }}
            example={{
              array: [4, 10, 3, 5, 1],
              steps: [
                { desc: "PHASE 1 — Build Max Heap. Start: [4, 10, 3, 5, 1]. Goal: rearrange so every parent is bigger than its children.", descHi: "PHASE 1 — Max Heap Banana. Array hai [4, 10, 3, 5, 1]. Kaam: isko aise arrange karo ki har parent apne dono children se bada ho.", array: [4, 10, 3, 5, 1], highlight: [0, 1, 2, 3, 4] },
                { desc: "10 is bigger than its parent 4. SWAP them! Max Heap is ready: [10, 5, 3, 4, 1]. Now 10 (largest) is at the top.", descHi: "10 apne parent 4 se bada hai, toh swap hue. Aur kuch adjustments ke baad Max Heap bann gaya: [10, 5, 3, 4, 1]. Sabse bada 10 upar aa gaya!", array: [10, 5, 3, 4, 1], highlight: [0] },
                { desc: "PHASE 2 — Extract Max. SWAP root (10) with the last element (1). 10 is now permanently at the end! 🔒", descHi: "PHASE 2 — Sabse bada nikalo. Root 10 ko last element 1 se swap kiya. 10 hamesha ke liye end mein set ho gaya! 🔒", array: [1, 5, 3, 4, 10], highlight: [0, 4] },
                { desc: "1 is at the top but it's small. Heapify! 5 rises to the top as the new maximum: [5, 4, 3, 1, 10].", descHi: "1 upar aa gaya lekin woh chhota hai. Heapify kiya — 5 upar aa gaya, woh ab naya maximum hai: [5, 4, 3, 1, 10].", array: [5, 4, 3, 1, 10], highlight: [0] },
                { desc: "SWAP root (5) with last unsorted (1). 5 is permanently placed! 🔒", descHi: "Root 5 ko last unsorted element 1 se swap kiya. 5 bhi set ho gaya! 🔒", array: [1, 4, 3, 5, 10], highlight: [3, 4] },
                { desc: "Heapify again! 4 rises to the top: [4, 1, 3, 5, 10].", descHi: "Heapify kiya — ab 4 upar aa gaya: [4, 1, 3, 5, 10].", array: [4, 1, 3, 5, 10], highlight: [0] },
                { desc: "SWAP root (4) with last unsorted (3). 4 is permanently placed! 🔒", descHi: "Root 4 ko last unsorted 3 se swap kiya. 4 bhi set ho gaya! 🔒", array: [3, 1, 4, 5, 10], highlight: [2, 3, 4] },
                { desc: "3 is already the max of the remaining heap. SWAP root (3) with last unsorted (1). 3 is placed! 🔒", descHi: "3 bache hue heap mein sabse bada hai. 3 ko 1 se swap kiya. 3 bhi set ho gaya! 🔒", array: [1, 3, 4, 5, 10], highlight: [1, 2, 3, 4] },
                { desc: "Only 1 remains — it's already in the correct spot. Array is fully sorted! ✨", descHi: "Sirf 1 bacha — woh pehle se sahi jagah par hai. Array poora sort ho gaya! ✨", array: [1, 3, 4, 5, 10], highlight: [0, 1, 2, 3, 4] },
              ]
            }}
            code={{
              language: "JavaScript",
              content: `function heapSort(arr) {
  const n = arr.length;

  // Build Max Heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }

  // Extract elements one by one
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]]; // swap max to end
    heapify(arr, i, 0);
  }
  return arr;
}

function heapify(arr, n, i) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  if (left < n && arr[left] > arr[largest]) largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;

  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, largest);
  }
}`
            }}
          />
        }
      >
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          <div className="absolute top-4 right-4 md:right-6 z-20 flex flex-col items-end text-xs font-mono bg-white/80 dark:bg-[#0d0f1a]/80 backdrop-blur-sm p-2 rounded-lg border border-black/5 dark:border-white/5">
            <span className="text-black/40 dark:text-slate-500 uppercase tracking-[0.2em] font-bold text-[9px] md:text-[10px] mb-1">Execution Status</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Step: {currentStepIndex}</span>
          </div>
          <ArrayViz data={data} currentStepData={currentStepData} />
        </div>

        {/* Custom Input Modal */}
        {showInputModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-[#14151f] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
              <h3 className="text-xl font-display text-white tracking-tight">Custom Array Input</h3>
              <p className="text-sm font-light text-white/50">Enter comma-separated numbers (2–20 values).</p>
              <input
                type="text"
                autoFocus
                value={inputText}
                onChange={e => { setInputText(e.target.value); setInputError(""); }}
                onKeyDown={e => e.key === "Enter" && handleApplyInput()}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-lime outline-none focus:border-lime/50 transition-all font-mono"
                placeholder="e.g. 10, 20, 30"
              />
              {inputError && <p className="text-[10px] text-red-400 uppercase tracking-widest">{inputError}</p>}
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setShowInputModal(false)} className="px-4 py-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white text-sm transition-colors">
                  Cancel
                </button>
                <button onClick={handleApplyInput} className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg text-sm transition-colors">
                  Apply Data
                </button>
              </div>
            </div>
          </div>
        )}
      </VisualizerFrame>
    </div>
  );
}
