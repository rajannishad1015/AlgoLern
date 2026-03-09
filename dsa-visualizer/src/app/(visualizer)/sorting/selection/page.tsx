"use client";

import { useEffect, useRef, useState } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateSelectionSortSteps } from "@/lib/algorithms/sorting/selectionSort";
import { ArrayViz } from "@/components/d3/ArrayViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";

const DEFAULT_ARRAY = [64, 25, 12, 22, 11];

function randomArray(): number[] {
  return Array.from({ length: 8 }, () => Math.floor(Math.random() * 85) + 10);
}

export default function SelectionSortPage() {
  const [data, setData] = useState<number[]>(DEFAULT_ARRAY);
  const [inputText, setInputText] = useState(DEFAULT_ARRAY.join(", "));
  const [inputError, setInputError] = useState("");
  const [showInputModal, setShowInputModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  // Stable refs so the interval never needs to restart on each step
  const stepForwardRef = useRef(stepForward);
  const currentStepRef = useRef(currentStepIndex);
  const stepsLengthRef = useRef(steps.length);
  
  useEffect(() => {
    stepForwardRef.current = stepForward;
    currentStepRef.current = currentStepIndex;
    stepsLengthRef.current = steps.length;
  }, [stepForward, currentStepIndex, steps.length]);

  useEffect(() => {
    setAlgorithmId("selection-sort");
    const generated = generateSelectionSortSteps(data);
    setSteps(generated);
    return () => {
      resetVisualizer();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [data, setSteps, resetVisualizer, setAlgorithmId]);

  // Stable interval — only restarts when isPlaying or speed change
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
    return () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };
  }, [isPlaying, speed, setIsPlaying]);

  const handleApplyInput = () => {
    const parsed = inputText
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
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
            currentStepData.type === 'compare'   ? 'Find Min' :
            currentStepData.type === 'highlight' ? 'Compare' :
            currentStepData.type === 'swap'      ? 'Lock' :
            currentStepData.type === 'sorted'    ? 'Next Pass' : 'Run'
          })</span>`
    : "Awaiting execution parameters.";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Selection Sort"
        description="Finds the minimum element and places it at the beginning each pass."
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
            title="Selection Sort"
            description="Selection Sort works by dividing the array into two parts: a sorted part on the left and an unsorted part on the right. In each pass, it finds the MINIMUM element from the unsorted part and swaps it to the beginning of the unsorted section. The sorted part grows one element at a time."
            descriptionHi="Selection Sort array ko do hisson mein divide karta hai: left mein sorted, right mein unsorted. Har pass mein, unsorted part mein se MINIMUM element dhundhta hai aur use unsorted part ke start mein swap kar deta hai. Yahi kaam tab tak karta hai jab tak poora array sort naa ho jaaye."
            complexities={[
              { case: "Best",    time: "n²", space: "1", note: "No early exit possible — always scans full unsorted part." },
              { case: "Average", time: "n²", space: "1", note: "n passes, each scanning fewer elements." },
              { case: "Worst",   time: "n²", space: "1", note: "Reverse sorted. Same as average — no advantage." },
            ]}
            pseudocode={`procedure selectionSort(arr):
  n = length(arr)
  for i = 0 to n-1:
    minIdx = i            ← assume current is minimum
    for j = i+1 to n-1:
      if arr[j] < arr[minIdx]:
        minIdx = j        ← found a smaller element!
    if minIdx != i:
      swap(arr[i], arr[minIdx])  ← place min at position i
    ← arr[i] is now sorted 🔒
  return arr`}
            useCases={[
              "Makes minimum number of swaps — O(n) swaps total.",
              "In-place: uses only O(1) extra memory.",
              "Not stable: equal elements may change order.",
              "Not adaptive: always runs O(n²) even if sorted.",
              "Good when write/swap operations are expensive.",
              "Simple and predictable — great for learning.",
            ]}
            useCasesHi={[
              "Minimum swaps karta hai — total sirf O(n) swaps.",
              "In-place: sirf O(1) extra memory use hoti hai.",
              "Stable nahi: barabar elements ka order change ho sakta hai.",
              "Adaptive nahi: sorted array pe bhi O(n²) hi lagta hai.",
              "Jab swap/write operations expensive hon tab achha hai.",
              "Simple aur predictable — seekhne ke liye best.",
            ]}
            example={{
              array: [64, 25, 12, 22, 11],
              steps: [
                { desc: "Starting array. Find the minimum and place it at position 0.", descHi: "Shuru ka array. Minimum dhundho aur position 0 pe rakho.", array: [64, 25, 12, 22, 11], highlight: [] },
                { desc: "Pass 1: Scan all elements. Found minimum = 11 at index 4.", descHi: "Pass 1: Sab elements scan kiye. Minimum = 11, index 4 pe.", array: [64, 25, 12, 22, 11], highlight: [4] },
                { desc: "Pass 1: SWAP 11 (index 4) with 64 (index 0). 11 now in position 0. 🔒", descHi: "Pass 1: 11 (index 4) aur 64 (index 0) ko SWAP karo. 11 position 0 pe! 🔒", array: [11, 25, 12, 22, 64], highlight: [0, 4] },
                { desc: "Pass 1 done! 11 is sorted. 🔒 Now find minimum from index 1 onwards.", descHi: "Pass 1 khatam! 11 sort ho gaya. 🔒 Ab index 1 se minimum dhundho.", array: [11, 25, 12, 22, 64], highlight: [0] },
                { desc: "Pass 2: Scan [25, 12, 22, 64]. Found minimum = 12 at index 2.", descHi: "Pass 2: [25, 12, 22, 64] scan kiya. Minimum = 12, index 2 pe.", array: [11, 25, 12, 22, 64], highlight: [2] },
                { desc: "Pass 2: SWAP 12 (index 2) with 25 (index 1). 12 now in position 1. 🔒", descHi: "Pass 2: 12 aur 25 ko SWAP karo. 12 position 1 pe! 🔒", array: [11, 12, 25, 22, 64], highlight: [1, 2] },
                { desc: "Pass 3: Scan [25, 22, 64]. Found minimum = 22 at index 3.", descHi: "Pass 3: [25, 22, 64] scan kiya. Minimum = 22 at index 3.", array: [11, 12, 25, 22, 64], highlight: [3] },
                { desc: "Pass 3: SWAP 22 (index 3) with 25 (index 2). 🔒", descHi: "Pass 3: 22 aur 25 ko SWAP karo. 🔒", array: [11, 12, 22, 25, 64], highlight: [2, 3] },
                { desc: "Pass 4: Scan [25, 64]. 25 is already minimum at index 3. No swap needed. ✓", descHi: "Pass 4: [25, 64] scan kiya. 25 pehle se hi minimum hai. Swap nahi. ✓", array: [11, 12, 22, 25, 64], highlight: [3] },
                { desc: "Array is fully sorted! ✨ Total swaps: only 3!", descHi: "Array poora sort ho gaya! ✨ Total sirf 3 swaps lage!", array: [11, 12, 22, 25, 64], highlight: [0, 1, 2, 3, 4] },
              ],
            }}
            code={{
              language: "JavaScript",
              content: `function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    // Find the minimum element in remaining unsorted array
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j; // Found a smaller element
      }
    }
    // Swap the found minimum with the first unsorted element
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
    // arr[0..i] is now sorted
  }
  return arr;
}

// Example:
const nums = [64, 25, 12, 22, 11];
console.log(selectionSort(nums)); // [11, 12, 22, 25, 64]`,
            }}
            quiz={[
              {
                q: "What is the maximum number of swaps Selection Sort performs for n elements?",
                options: ["O(n²)", "O(n log n)", "O(n)", "O(1)"],
                answer: 2,
              },
              {
                q: "After the kth pass of Selection Sort, how many elements are guaranteed to be in their correct final position?",
                options: ["k/2", "k", "k²", "2k"],
                answer: 1,
              },
              {
                q: "How is Selection Sort different from Bubble Sort?",
                options: [
                  "Selection Sort is always faster",
                  "Selection Sort finds and places the minimum, Bubble Sort swaps adjacent pairs",
                  "Selection Sort is stable, Bubble Sort is not",
                  "Selection Sort uses O(log n) memory",
                ],
                answer: 1,
              },
            ]}
          />
        }
      >
        {/* Execution Status */}
        <div className="absolute top-4 right-4 md:right-6 z-20 flex flex-col items-end text-xs font-mono bg-white/80 dark:bg-[#0d0f1a]/80 backdrop-blur-sm p-2 rounded-lg border border-black/5 dark:border-white/5">
          <span className="text-black/40 dark:text-slate-500 uppercase tracking-[0.2em] font-bold text-[9px] md:text-[10px] mb-1">Execution Status</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">
            Pass: {Math.floor(currentStepIndex / Math.max(1, data.length))}
            <span className="text-black/20 dark:text-slate-600 mx-1">|</span>
            Step: {currentStepIndex}
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
              {inputError && <p className="text-xs text-red-400 font-bold">{inputError}</p>}
              <div className="flex gap-3">
                <button
                  onClick={handleApplyInput}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
                >
                  Apply
                </button>
                <button
                  onClick={() => setShowInputModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </VisualizerFrame>
    </div>
  );
}
