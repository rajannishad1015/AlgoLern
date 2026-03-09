"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateInsertionSortSteps } from "@/lib/algorithms/sorting/insertionSort";
import { ArrayViz } from "@/components/d3/ArrayViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";

const DEFAULT_ARRAY = [50, 20, 80, 10, 90, 30, 70, 40];

function randomArray(): number[] {
  return Array.from({ length: 8 }, () => Math.floor(Math.random() * 85) + 10);
}

export default function InsertionSortPage() {
  const [data, setData] = useState<number[]>(DEFAULT_ARRAY);
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputText, setInputText] = useState(DEFAULT_ARRAY.join(", "));
  const [inputError, setInputError] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("insertion-sort");
    setSteps(generateInsertionSortSteps(data));
    return () => { resetVisualizer(); if (timerRef.current) clearInterval(timerRef.current); };
  }, [data, setSteps, resetVisualizer, setAlgorithmId]);

  const stepForwardRef = useRef(stepForward);
  stepForwardRef.current = stepForward;
  const currentStepRef = useRef(currentStepIndex);
  currentStepRef.current = currentStepIndex;
  const stepsLengthRef = useRef(steps.length);
  stepsLengthRef.current = steps.length;

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    timerRef.current = setInterval(() => {
      if (currentStepRef.current < stepsLengthRef.current - 1) {
        stepForwardRef.current();
      } else {
        setIsPlaying(false);
      }
    }, speed);
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [isPlaying, speed, setIsPlaying]);

  const handleApplyInput = () => {
    const parsed = inputText.split(/[\s,]+/).filter(Boolean).map(Number);
    if (parsed.some(isNaN) || parsed.length < 2 || parsed.length > 20) {
      setInputError("Enter 2–20 numbers.");
      return;
    }
    setInputError("");
    setData(parsed);
    resetVisualizer();
    setShowInputModal(false);
  };

  const currentStepData = steps[currentStepIndex];

  const formattedDescription = currentStepData?.description
    ? currentStepData.description
        .replace(/\b(\d+)\b/g, '<span class="text-[var(--lime-dark)] dark:text-lime font-bold">$1</span>')
        + `<span class="text-indigo-400 italic ml-2">(Next: ${
            currentStepData.type === 'highlight' ? 'Compare' :
            currentStepData.type === 'compare'   ? 'Shift' :
            currentStepData.type === 'update'    ? 'Insert' :
            currentStepData.type === 'swap'      ? 'Lock' :
            currentStepData.type === 'sorted'    ? 'Done' : 'Run'
          })</span>`
    : "Awaiting execution parameters.";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Insertion Sort"
        description="Builds the sorted array one element at a time by inserting each new element in the correct position."
        complexity={{ time: 'n²', space: '1', difficulty: 'Easy' }}
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
            onRandomize={() => {
              const arr = randomArray();
              setData(arr);
              setInputText(arr.join(", "));
              resetVisualizer();
            }}
            onCustomInput={() => setShowInputModal(true)}
          />
        }
        info={
          <TheoryCard
            title="Insertion Sort"
            description="Insertion Sort builds a sorted list one element at a time. It picks each element from the unsorted section and inserts it at the correct position in the already-sorted left portion — just like how you arrange playing cards in your hand."
            descriptionHi="Insertion Sort ek ek element karke sorted list banata hai. Har baar unsorted part se ek element pick karta hai aur usse already-sorted left part mein sahi jagah pe insert kar deta hai — bilkul jaise aap haath mein playing cards sort karte ho."
            complexities={[
              { case: "Best",    time: "n",  space: "1", note: "Already sorted array. Only n comparisons, 0 shifts." },
              { case: "Average", time: "n²", space: "1", note: "Random data. Each insert scans roughly half the sorted part." },
              { case: "Worst",   time: "n²", space: "1", note: "Reverse sorted. Every element shifts past all sorted elements." },
            ]}
            pseudocode={`procedure insertionSort(arr):\n  n = length(arr)\n  for i = 1 to n-1:\n    key = arr[i]        ← element to insert\n    j = i - 1\n    while j >= 0 and arr[j] > key:\n      arr[j+1] = arr[j]  ← shift right to make room\n      j = j - 1\n    arr[j+1] = key       ← insert key in correct place\n  return arr`}
            useCases={[
              "Best case O(n) — great for nearly-sorted arrays.",
              "Stable: equal elements keep their original order.",
              "In-place: O(1) extra memory only.",
              "Online: can sort a stream of data as it arrives.",
              "Used inside Timsort (Python, Java) for small subarrays.",
              "Faster than Bubble/Selection Sort in practice on small n.",
            ]}
            useCasesHi={[
              "Best case O(n) — nearly-sorted arrays ke liye best hai.",
              "Stable: barabar elements ka original order maintain hota hai.",
              "In-place: sirf O(1) extra memory lagti hai.",
              "Online: stream of data ko aate aate sort kar sakta hai.",
              "Timsort (Python, Java) mein chhote subarrays ke liye use hota hai.",
              "Chhote n ke liye Bubble/Selection Sort se tez hota hai in practice.",
            ]}
            example={{
              array: [5, 3, 8, 1, 4],
              steps: [
                { desc: "Starting array. First element [5] is already 'sorted'. We'll insert each next element.", descHi: "Shuru ka array. Pehla element [5] already 'sorted' maana jaata hai. Ab baaki ko insert karenge.", array: [5, 3, 8, 1, 4], highlight: [0] },
                { desc: "Pick key = 3 (index 1). Compare with 5. Since 5 > 3, shift 5 right. Insert 3 at index 0. 🔄", descHi: "Key = 3 (index 1). 5 se compare karo. 5 > 3 hai, 5 ko daayein shift karo. 3 ko index 0 pe insert karo. 🔄", array: [3, 5, 8, 1, 4], highlight: [0, 1] },
                { desc: "Sorted part is [3, 5]. Pick key = 8 (index 2). 8 > 5, no shift. Insert 8 in place. ✓", descHi: "Sorted part [3, 5] hai. Key = 8 (index 2). 8 > 5 hai, shift nahi. 8 wahi raha. ✓", array: [3, 5, 8, 1, 4], highlight: [2] },
                { desc: "Sorted part is [3, 5, 8]. Pick key = 1. Shift 8, 5, 3 right. Insert 1 at index 0. 🔄", descHi: "Sorted part [3, 5, 8] hai. Key = 1. 8, 5, 3 ko shift karo. 1 ko index 0 pe insert karo. 🔄", array: [1, 3, 5, 8, 4], highlight: [0, 1, 2, 3] },
                { desc: "Sorted part is [1, 3, 5, 8]. Pick key = 4. Shift 8, 5. Insert 4 at index 2. 🔄", descHi: "Sorted part [1, 3, 5, 8] hai. Key = 4. 8, 5 shift karo. 4 ko index 2 pe insert karo. 🔄", array: [1, 3, 4, 5, 8], highlight: [2, 3, 4] },
                { desc: "Array is fully sorted! ✨ Total shifts were fewer than Bubble Sort!", descHi: "Array poora sort ho gaya! ✨ Total shifts Bubble Sort se kam the!", array: [1, 3, 4, 5, 8], highlight: [0, 1, 2, 3, 4] },
              ],
            }}
            code={{
              language: "JavaScript",
              content: `function insertionSort(arr) {\n  const n = arr.length;\n  for (let i = 1; i < n; i++) {\n    const key = arr[i]; // Element to insert\n    let j = i - 1;\n    // Shift elements greater than key to the right\n    while (j >= 0 && arr[j] > key) {\n      arr[j + 1] = arr[j];\n      j--;\n    }\n    // Place key in its correct sorted position\n    arr[j + 1] = key;\n  }\n  return arr;\n}\n\n// Example usage:\nconst nums = [5, 3, 8, 1, 4];\nconsole.log(insertionSort(nums)); // [1, 3, 4, 5, 8]`,
            }}
            quiz={[
              {
                q: "What is the best-case time complexity of Insertion Sort?",
                options: ["O(n²)", "O(n log n)", "O(n)", "O(1)"],
                answer: 2,
              },
              {
                q: "Which real-world scenario is Insertion Sort most analogy to?",
                options: ["Building a pyramid", "Sorting playing cards in hand", "Counting items", "Binary search"],
                answer: 1,
              },
              {
                q: "Why is Insertion Sort used inside Timsort for small arrays?",
                options: [
                  "It uses O(n log n) memory",
                  "It has lower overhead and is cache-friendly for small inputs",
                  "It runs recursively",
                  "It never makes comparisons",
                ],
                answer: 1,
              },
            ]}
          />
        }
      >
        {/* Execution Status Badge */}
        <div className="absolute top-4 right-4 md:right-6 z-20 flex flex-col items-end text-xs font-mono bg-white/80 dark:bg-[#0d0f1a]/80 backdrop-blur-sm p-2 rounded-lg border border-black/5 dark:border-white/5">
          <span className="text-black/40 dark:text-slate-500 uppercase tracking-[0.2em] font-bold text-[9px] md:text-[10px] mb-1">Execution Status</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">
            Pass: {currentStepIndex} <span className="text-black/20 dark:text-slate-600 mx-1">|</span> Step: {currentStepIndex}
          </span>
        </div>

        <div className="w-full h-full flex items-center justify-center">
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
              <div className="flex justify-end gap-3 mt-2">
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
