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
            description="Selection Sort is a simple comparison-based algorithm. It works by repeatedly finding the MINIMUM element from the unsorted part and moving it to the beginning of that part. Imagine it as 'selecting' the smallest item and placing it in its correct spot one by one."
            descriptionHi="Selection Sort ek simple algorithm hai jo har baar unsorted hisse mein se SABSE CHHOTA (minimum) number dhundhta hai aur usse shuru mein le aata hai. Isme hum har pass mein ek 'selection' karte hain, isiliye iska naam Selection Sort hai."
            analogy={{
              icon: "🃏",
              title: "Selecting Cards",
              titleHi: "Cards Selection",
              desc: "Imagine you have a hand of unsorted playing cards. You look through all of them, find the smallest card, and move it to the very left. Then you look at the remaining cards, find the next smallest, and move it next to the first one. You repeat this until all cards are in order.",
              descHi: "Maan lo aapke paas cards ka ek dher hai. Aap sabse chhota card dhundhte ho aur usse sabse pehle (left mein) rakh dete ho. Phir bache huye cards mein se agla sabse chhota dhundhte ho aur pehle wale ke baad rakhte ho. Aise hi poora deck sort hota hai."
            }}
            readingTip={{
              en: "The outer loop runs n times (one pass per element). In each pass, it selects the minimum element from the unsorted sub-list and swaps it with the leftmost unsorted element.",
              hi: "Outer loop n baar chalta hai. Har pass mein, unsorted list mein se minimum number ko select kiya jaata hai aur usse unsorted part ke pehle element se swap kar diya jaata hai."
            }}
            quote={{
              en: "\"Selection Sort is like picking the smallest pebble from a pile and starting a new, organized pile. It's simple, predictable, and does the least amount of movement (swaps).\"",
              hi: "\"Selection Sort jaise ek dher mein se sabse chhota pathar chun-na aur naya dher banana. Yeh simple hai, aur isme swapping (movement) sabse kam hoti hai.\""
            }}
            complexities={[
              { case: "Best Case",    time: "O(n²)", space: "O(1)", note: "Even if sorted, it still scans everything to find the min." },
              { case: "Average Case", time: "O(n²)", space: "O(1)", note: "Standard nested loop behavior." },
              { case: "Worst Case",   time: "O(n²)", space: "O(1)", note: "Reverse sorted or random - same performance." },
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
    ← index i is now sorted 🔒
  return arr`}
            useCases={[
              "Ideal when memory is limited (In-place algorithm).",
              "Performs the minimum number of swaps - O(n) total.",
              "Simple to implement and understand for beginners.",
              "Useful when writing to memory is much more expensive than reading.",
              "Predictable performance: always O(n²) regardless of data.",
            ]}
            useCasesHi={[
              "Yahan memory ki kami ho wahan use kar sakte hain (In-place).",
              "Isme swaps sabse kam hote hain - total sirf O(n).",
              "Shuruat karne walo ke liye samajhne mein sabse asaan.",
              "Jab memory mein 'write' karna expensive ho tab best hai.",
              "Predictable hai: data kaisa bhi ho, time O(n²) hi lagega.",
            ]}
            howItWorks={{
              en: [
                { icon: "1️⃣", text: "Start from the beginning. Scan the entire array to find the smallest number." },
                { icon: "2️⃣", text: "Swap that smallest number with the first element. It's now in its correct position! 🔒" },
                { icon: "3️⃣", text: "Move one position ahead. Scan the remaining elements for the new minimum." },
                { icon: "4️⃣", text: "Swap the new minimum with the first unsorted element. Lock it in! 🔒" },
                { icon: "5️⃣", text: "Repeat: each pass selects the minimum from the unsorted part and places it correctly." },
                { icon: "✅", text: "After n-1 passes, every element is in its final sorted position!" },
              ],
              hi: [
                { icon: "1️⃣", text: "Shuru se pura array dekho aur sabse chhota number dhundho." },
                { icon: "2️⃣", text: "Woh chhota number jo mila use pehle wale element se swap karo. Woh ab sahi jagah hai! 🔒" },
                { icon: "3️⃣", text: "Ek step aage bado. Baki unsorted numbers mein se phir minimum dhundho." },
                { icon: "4️⃣", text: "Naya minimum mila? Usse pehle unsorted jagah par swap karo. Aur ek number set ho gaya! 🔒" },
                { icon: "5️⃣", text: "Yahi karte raho: har baar ek naya minimum chunte hain aur uski sahi jagah rakh dete hain." },
                { icon: "✅", text: "n-1 passes ke baad, poora array sort ho jaata hai!" },
              ]
            }}
            example={{
              array: [64, 25, 12, 22, 11],
              steps: [
                { desc: "Initial state. We need to find the minimum in the whole array.", descHi: "Shuruat. Humein poore array mein se sabse chhota number dhundhna hai.", array: [64, 25, 12, 22, 11], highlight: [] },
                { desc: "Pass 1: Found 11 is the minimum. Swap 11 with 64 (start of unsorted part).", descHi: "Pass 1: Pata chala 11 sabse chhota hai. 11 ko 64 se swap karo.", array: [11, 25, 12, 22, 64], highlight: [0, 4] },
                { desc: "11 is now sorted! 🔒 Now look for the minimum in [25, 12, 22, 64].", descHi: "11 sort ho gaya! 🔒 Ab bache huye [25, 12, 22, 64] mein se minimum dhundho.", array: [11, 25, 12, 22, 64], highlight: [0] },
                { desc: "Pass 2: Found 12 is minimum. Swap 12 with 25.", descHi: "Pass 2: 12 minimum mila. 12 ko 25 se swap karo.", array: [11, 12, 25, 22, 64], highlight: [1, 2] },
                { desc: "12 is sorted! 🔒 Look for minimum in [25, 22, 64].", descHi: "12 sort ho gaya! 🔒 Ab [25, 22, 64] mein se minimum dhundho.", array: [11, 12, 25, 22, 64], highlight: [1] },
                { desc: "Pass 3: Found 22 is minimum. Swap 22 with 25.", descHi: "Pass 3: 22 minimum mila. 22 aur 25 ko swap karo.", array: [11, 12, 22, 25, 64], highlight: [2, 3] },
                { desc: "22 is sorted! 🔒 Only [25, 64] left. 25 is smallest here.", descHi: "22 sort ho gaya! 🔒 Ab sirf [25, 64] bacha hai. Yahan 25 chhota hai.", array: [11, 12, 22, 25, 64], highlight: [2] },
                { desc: "25 is sorted! 🔒 64 is the last remaining element, so it must be in place.", descHi: "25 sort ho gaya! 🔒 64 aakhiri bacha hai, iska matlab woh sahi jagah pe hai.", array: [11, 12, 22, 25, 64], highlight: [3] },
                { desc: "Selection Complete! Array is fully sorted. ✨", descHi: "Selection khatam! Array poora sort ho gaya hai. ✨", array: [11, 12, 22, 25, 64], highlight: [0, 1, 2, 3, 4] },
              ],
            }}
            code={{
              language: "JavaScript",
              content: `function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i; // Assume current index is minimum
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j; // Update minIdx if smaller element found
      }
    }
    // Swap the found minimum with the first unsorted position
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
  }
  return arr;
}`,
            }}
            quiz={[
              {
                q: "What is the time complexity of Selection Sort in the best case?",
                options: ["O(n)", "O(n log n)", "O(n²)", "O(1)"],
                answer: 2,
              },
              {
                q: "Why is it called 'Selection' Sort?",
                options: [
                  "Because it selects random elements",
                  "Because it repeatedly selects the minimum element",
                  "Because it selects the middle element",
                  "Because it's a very selective algorithm",
                ],
                answer: 1,
              },
              {
                q: "Which property is true for Selection Sort?",
                options: [
                  "It is a stable sorting algorithm",
                  "It is an adaptive algorithm",
                  "It makes minimum number of swaps [O(n)]",
                  "It is best for large datasets",
                ],
                answer: 2,
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
