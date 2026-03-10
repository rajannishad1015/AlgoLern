"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateBubbleSortSteps } from "@/lib/algorithms/sorting/bubbleSort";
import { ArrayViz } from "@/components/d3/ArrayViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";

// Re-add Lucide layout specifics needed for simple Randomize/Custom
import { Shuffle } from "lucide-react";

const DEFAULT_ARRAY = [50, 20, 80, 10, 90, 30, 70, 40];

function randomArray(): number[] {
  return Array.from({ length: 8 }, () => Math.floor(Math.random() * 85) + 10);
}

export default function BubbleSortPage() {
  const [data, setData] = useState<number[]>(DEFAULT_ARRAY);
  
  // Custom Input Modal State
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
    setAlgorithmId("bubble-sort");
    const generatedSteps = generateBubbleSortSteps(data);
    setSteps(generatedSteps);
    return () => { resetVisualizer(); if (timerRef.current) clearInterval(timerRef.current); };
  }, [data, setSteps, resetVisualizer, setAlgorithmId]);

  // Use a stable ref for stepForward so the interval doesn't need it as a dependency
  const stepForwardRef = useRef(stepForward);
  stepForwardRef.current = stepForward;
  const currentStepRef = useRef(currentStepIndex);
  currentStepRef.current = currentStepIndex;
  const stepsLengthRef = useRef(steps.length);
  stepsLengthRef.current = steps.length;

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    // Start a fresh interval. Read latest state via refs inside the callback
    // so we never need to recreate the interval when step changes.
    timerRef.current = setInterval(() => {
      if (currentStepRef.current < stepsLengthRef.current - 1) {
        stepForwardRef.current();
      } else {
        setIsPlaying(false);
      }
    }, speed);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  // Only restart when play state or speed changes — NOT on every step
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
  
  // Format step description dynamically for ControlBar UI emphasis
  const formattedDescription = currentStepData?.description
    ? currentStepData.description
        .replace(/\b(\d+)\b/g, '<span class="text-[var(--lime-dark)] dark:text-lime font-bold">$1</span>')
        .replace(/index (\d+)/g, 'index <span class="text-white/80 border-b border-white/20">$1</span>')
        .replace(/indices (\d+) and (\d+)/g, 'indices <span class="text-white/80 border-b border-white/20">$1</span> and <span class="text-white/80 border-b border-white/20">$2</span>')
        + `<span class="text-indigo-400 italic ml-2">(Next: ${
            currentStepData.type === 'compare' ? 'Swap' : 
            currentStepData.type === 'swap' ? 'Iterate' : 
            currentStepData.type === 'sorted' ? 'Lock' : 'Run'
          })</span>`
    : "Awaiting execution parameters.";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Bubble Sort"
        description="A simple comparison-based sorting algorithm."
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
            title="Bubble Sort"
            description="Bubble Sort works by repeatedly stepping through the list, comparing adjacent elements, and swapping them if they are in the wrong order. The pass through the list is repeated until the list is sorted. It gets its name because smaller elements 'bubble' to the top of the list with each pass."
            descriptionHi="Bubble Sort ek simple sorting algorithm hai jo baar baar list ko scan karta hai, adjacent elements compare karta hai, aur agar galat order mein hain toh unhe swap kar deta hai. Yeh tab tak karta rehta hai jab tak list sort naa ho jaaye. Iska naam is liye hai kyunki chhote elements 'bubble' karke list ke upar aa jaate hain har pass mein."
            analogy={{
              icon: "🫧",
              title: "Bubbles in Water",
              titleHi: "Paani ke andar bubbles",
              desc: "Imagine numbers as bubbles under water. Heavy numbers (bigger values) keep sinking to the bottom (end of the array), while lighter bubbles (smaller values) float to the top. This keeps happening until all bubbles are in the right order.",
              descHi: "Socho numbers paani ke andar bubbles hain. Bhaari numbers (bade values) neeche jaate rehte hain (array ke end mein), aur halke bubbles (chhote values) upar aate hain. Yeh tab tak hota hai jab tak sab bubbles sahi jagah naa aa jaayein."
            }}
            readingTip={{
              en: "The outer loop runs n times (one pass per element). The inner loop compares adjacent pairs. Each pass places one more element in its correct final position.",
              hi: "Outer loop n baar chalta hai (ek pass har element ke liye). Inner loop adjacent pairs compare karta hai. Har pass mein ek aur element apni final sahi jagah pe aa jaata hai."
            }}
            quote={{
              en: "\"Bubble Sort is not used in production because it's slow (O(n²)), but it's the best algorithm to understand the concept of sorting. Every programmer learns it first!\"",
              hi: "\"Bubble Sort real projects mein use nahi hota kyunki yeh slow hai (O(n²)), lekin yeh sabse best algorithm hai sorting samajhne ke liye. Har programmer isko pehle seekhta hai!\""
            }}
            complexities={[
              { case: "Best",    time: "n",  space: "1", note: "Array already sorted. Only 1 pass needed (with flag optimization)." },
              { case: "Average", time: "n\u00b2", space: "1", note: "Random data. n passes, n comparisons each." },
              { case: "Worst",   time: "n\u00b2", space: "1", note: "Reverse sorted array. Maximum swaps needed." },
            ]}
            pseudocode={`procedure bubbleSort(arr):\n  n = length(arr)\n  for i = 0 to n-1:\n    swapped = false\n    for j = 0 to n-i-2:\n      if arr[j] > arr[j+1]:\n        swap(arr[j], arr[j+1])\n        swapped = true\n    if swapped == false:  ← optimization\n      break             ← already sorted!\n  return arr`}
            useCases={[
              "Stable: equal elements keep their original order.",
              "In-place: uses only O(1) extra memory.",
              "Adaptive: stops early if array is already sorted.",
              "Simple to implement — great for learning sorting concepts.",
              "Good for nearly-sorted arrays with the swap flag optimization.",
              "Not suitable for large datasets (n > 1000). Use QuickSort instead.",
            ]}
            useCasesHi={[
              "Stable: barabar elements apna original order maintain karte hain.",
              "In-place: sirf O(1) extra memory use hoti hai.",
              "Adaptive: agar array pehle se sorted hai toh jaldi ruk jaata hai.",
              "Implement karna aasaan hai — sorting concepts seekhne ke liye best.",
              "Nearly-sorted arrays ke liye swap flag optimization ke saath achha kaam karta hai.",
              "Bade datasets (n > 1000) ke liye suitable nahi. QuickSort use karo.",
            ]}
            howItWorks={{
              en: [
                { icon: "1️⃣", text: "Start from the first element. Compare it with the next element." },
                { icon: "2️⃣", text: "If the left element is BIGGER than the right one — swap them! The big one bubbles right." },
                { icon: "3️⃣", text: "Move to the next pair and repeat. Do this for every pair in the array." },
                { icon: "4️⃣", text: "After one full pass, the LARGEST number is at the last position. It's locked in! 🔒" },
                { icon: "5️⃣", text: "Do the same again for the remaining unsorted elements (skip the already sorted ones at the end)." },
                { icon: "✅", text: "When a full pass happens with zero swaps, the array is sorted!" },
              ],
              hi: [
                { icon: "1️⃣", text: "Shuru se ek pair dekho. Pehle number ko uske agle number se compare karo." },
                { icon: "2️⃣", text: "Agar left wala BADA hai — dono ko swap karo! Bada wala aage badhta jaata hai." },
                { icon: "3️⃣", text: "Agla pair dekho. Yahi kaam har pair ke saath karo." },
                { icon: "4️⃣", text: "Ek full round ke baad, SABSE BADA number end mein aa jaata hai. Woh set ho jaata hai! 🔒" },
                { icon: "5️⃣", text: "Agle round mein baki unsorted numbers ke liye yahi karo (end waale already set hain unhe chodo)." },
                { icon: "✅", text: "Jab poora round bina swap ke nikle, array sort ho gaya!" },
              ]
            }}
            example={{
              array: [5, 3, 8, 1, 4],
              steps: [
                { desc: "Starting array. We will sort this from smallest to largest.", descHi: "Shuru ka array. Isko sabse chhote se bade tak sort karenge.", array: [5, 3, 8, 1, 4], highlight: [] },
                { desc: "Pass 1: Compare 5 and 3. 5 > 3, so SWAP them! 🔄", descHi: "Pass 1: 5 aur 3 compare karo. 5 > 3, toh SWAP karo! 🔄", array: [3, 5, 8, 1, 4], highlight: [0, 1] },
                { desc: "Pass 1: Compare 5 and 8. 5 < 8, no swap needed. ✓", descHi: "Pass 1: 5 aur 8 compare karo. 5 < 8, swap ki zaroorat nahi. ✓", array: [3, 5, 8, 1, 4], highlight: [1, 2] },
                { desc: "Pass 1: Compare 8 and 1. 8 > 1, so SWAP them! 🔄", descHi: "Pass 1: 8 aur 1 compare karo. 8 > 1, toh SWAP! 🔄", array: [3, 5, 1, 8, 4], highlight: [2, 3] },
                { desc: "Pass 1: Compare 8 and 4. 8 > 4, so SWAP them! 🔄", descHi: "Pass 1: 8 aur 4 compare karo. 8 > 4, toh SWAP! 🔄", array: [3, 5, 1, 4, 8], highlight: [3, 4] },
                { desc: "Pass 1 done! 8 (the largest) is now locked at the end. 🔒", descHi: "Pass 1 khatam! 8 (sabse bada) ab end mein lock ho gaya. 🔒", array: [3, 5, 1, 4, 8], highlight: [4] },
                { desc: "Pass 2: Compare 3 and 5. 3 < 5, no swap. ✓", descHi: "Pass 2: 3 aur 5 compare karo. 3 < 5, swap nahi. ✓", array: [3, 5, 1, 4, 8], highlight: [0, 1] },
                { desc: "Pass 2: Compare 5 and 1. 5 > 1, SWAP! 🔄", descHi: "Pass 2: 5 aur 1 compare karo. 5 > 1, SWAP! 🔄", array: [3, 1, 5, 4, 8], highlight: [1, 2] },
                { desc: "Pass 2: Compare 5 and 4. 5 > 4, SWAP! 🔄", descHi: "Pass 2: 5 aur 4 compare karo. 5 > 4, SWAP! 🔄", array: [3, 1, 4, 5, 8], highlight: [2, 3] },
                { desc: "Pass 2 done! 5 is now locked. 🔒", descHi: "Pass 2 khatam! 5 ab lock ho gaya. 🔒", array: [3, 1, 4, 5, 8], highlight: [3, 4] },
                { desc: "After all passes: Array is fully sorted! ✨", descHi: "Sab passes ke baad: Array poora sort ho gaya! ✨", array: [1, 3, 4, 5, 8], highlight: [0, 1, 2, 3, 4] },
              ],
            }}
            code={{
              language: "JavaScript",
              content: `function bubbleSort(arr) {\n  const n = arr.length;\n  for (let i = 0; i < n - 1; i++) {\n    let swapped = false;\n    for (let j = 0; j < n - i - 1; j++) {\n      // Compare adjacent elements\n      if (arr[j] > arr[j + 1]) {\n        // Swap them\n        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n        swapped = true;\n      }\n    }\n    // If no swap happened, array is sorted\n    if (!swapped) break;\n  }\n  return arr;\n}\n\n// Example usage:\nconst nums = [5, 3, 8, 1, 4];\nconsole.log(bubbleSort(nums)); // [1, 3, 4, 5, 8]`,
            }}
            quiz={[
              {
                q: "What is the worst-case time complexity of Bubble Sort?",
                options: ["O(n)", "O(n log n)", "O(n\u00b2)", "O(log n)"],
                answer: 2,
              },
              {
                q: "After the first complete pass of Bubble Sort, which element is guaranteed to be in its correct position?",
                options: ["The smallest element", "The middle element", "The largest element", "The first element"],
                answer: 2,
              },
              {
                q: "What does 'stable sorting' mean?",
                options: [
                  "The algorithm never crashes",
                  "Equal elements keep their original order",
                  "The algorithm always runs in the same time",
                  "It uses constant extra memory",
                ],
                answer: 1,
              },
            ]}
          />
        }
      >
        <div className="absolute top-4 right-4 md:right-6 z-20 flex flex-col items-end text-xs font-mono bg-white/80 dark:bg-[#0d0f1a]/80 backdrop-blur-sm p-2 rounded-lg border border-black/5 dark:border-white/5">
            <span className="text-black/40 dark:text-slate-500 uppercase tracking-[0.2em] font-bold text-[9px] md:text-[10px] mb-1">Execution Status</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Pass: {Math.floor(currentStepIndex / Math.max(1, data.length))} <span className="text-black/20 dark:text-slate-600 mx-1">|</span> Step: {currentStepIndex}</span>
        </div>

        <div className="w-full h-full flex items-center justify-center">
          <ArrayViz data={data} currentStepData={currentStepData} />
        </div>

        {/* Custom Input Modal Overlay */}
        {showInputModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
             <div className="bg-[#14151f] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
                <h3 className="text-xl font-display text-white tracking-tight">Custom Array Input</h3>
                <p className="text-sm font-light text-white/50">Enter comma-separated numbers (2-20 values).</p>
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
                   <button 
                     onClick={() => setShowInputModal(false)}
                     className="px-4 py-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white text-sm transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handleApplyInput}
                     className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg text-sm transition-colors"
                   >
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
