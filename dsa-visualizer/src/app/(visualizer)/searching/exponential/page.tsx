"use client";

import { useState, useEffect, useRef } from "react";
import { ArrayViz } from "@/components/d3/ArrayViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateExponentialSearchSteps } from "@/lib/algorithms/searching/exponentialSearch";

const MAX_ARRAY_SIZE = 40;

export default function ExponentialSearchPage() {
  const [arraySize, setArraySize] = useState([20]);
  const [targetValue, setTargetValue] = useState(42);
  const [array, setArray] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  const generateData = () => {
    const size = arraySize[0];
    const newArr = Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1)
                        .sort((a, b) => a - b);
    if (Math.random() > 0.4) {
      setTargetValue(newArr[Math.floor(Math.random() * size)]);
    } else {
      setTargetValue(Math.floor(Math.random() * 99) + 1);
    }
    setArray(newArr);
    resetVisualizer();
  };

  useEffect(() => { generateData(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [arraySize]);

  useEffect(() => {
    setAlgorithmId("exponential-search");
    if (array.length > 0) setSteps(generateExponentialSearchSteps(array, targetValue));
    return () => { resetVisualizer(); if (timerRef.current) clearInterval(timerRef.current); };
  }, [array, targetValue, setSteps, resetVisualizer, setAlgorithmId]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (currentStepIndex < steps.length - 1) stepForward();
        else { setIsPlaying(false); if (timerRef.current) clearInterval(timerRef.current); }
      }, speed);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, currentStepIndex, steps.length, speed, stepForward, setIsPlaying]);

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) { setTargetValue(val); resetVisualizer(); }
  };

  const handleSearch = () => {
    resetVisualizer();
    if (array.length > 0) {
      setSteps(generateExponentialSearchSteps(array, targetValue));
      setTimeout(() => setIsPlaying(true), 100);
    }
  };

  const currentStepData = steps[currentStepIndex];

  let formattedDescription = currentStepData?.description || "Ready to search...";
  if (currentStepData?.description) {
    formattedDescription = currentStepData.description
      .replace(/\b(\d+)\b/g, '<span class="text-[var(--lime-dark)] dark:text-lime font-bold">$1</span>')
      + `<span class="text-indigo-400 italic ml-2">(${
          currentStepData.type === "done"      ? "🎯 Found!" :
          currentStepData.type === "not_found" ? "❌ Not Found" :
          currentStepData.type === "visit"     ? "⚡ Doubling Bound" :
          currentStepData.type === "compare"   ? "🔍 Binary Probe" : "Viewing"
        })</span>`;
    if (currentStepData.auxiliaryState?.stateInfo) {
      formattedDescription += ` <span class="text-xs ml-2 text-slate-500 bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full">${currentStepData.auxiliaryState.stateInfo}</span>`;
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Exponential Search"
        description="Find the range where the target exists by doubling the index each time, then run Binary Search within that range. Combines exponential bounding with Binary Search precision."
        complexity={{ time: "log n", space: "log n", difficulty: "Medium" }}
        controls={
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4">
              <div className="flex-1 w-full flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto p-2 bg-black/5 dark:bg-black/20 rounded-lg">
                  <span className="text-xs font-mono font-bold text-slate-500 min-w-[50px] uppercase">Size: {arraySize[0]}</span>
                  <input type="range" min="5" max={MAX_ARRAY_SIZE} step="1" value={arraySize[0]}
                    onChange={(e) => setArraySize([parseInt(e.target.value)])}
                    className="w-24 md:w-32 accent-indigo-500" />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <input type="number" value={targetValue} onChange={handleTargetChange}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleSearch(); } }}
                    placeholder="Search target..."
                    className="w-full md:w-36 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-lime-600 dark:text-lime outline-none focus:border-indigo-500 transition-all font-mono" />
                  <button onClick={handleSearch}
                    className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-lg whitespace-nowrap">
                    Find Target
                  </button>
                </div>
              </div>
              <div className="w-full md:w-auto flex">
                <button onClick={generateData}
                  className="w-full px-6 py-2.5 rounded-lg border border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold transition-colors shadow-sm whitespace-nowrap">
                  🎲 Randomize (Sorted)
                </button>
              </div>
            </div>
            <ControlBar
              onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)}
              onStepForward={stepForward} onStepBackward={stepBackward}
              onReset={resetVisualizer} onSpeedChange={setSpeed}
              isPlaying={isPlaying} currentStep={currentStepIndex}
              totalSteps={steps.length} speed={speed} stepDescription={formattedDescription} />
          </div>
        }
        info={
          <TheoryCard
            title="Exponential Search"
            description="Exponential Search works by first finding a range [2^(k-1), 2^k] where the target element may reside, then using Binary Search within that range. It's especially useful for unbounded/infinite arrays and when the target is near the beginning."
            descriptionHi="Exponential Search pehle ek range [2^(k-1), 2^k] dhoodhdta hai jahan target ho sakta hai (bound ko har baar double karke), phir us range mein Binary Search chalata hai. Unbounded ya infinite arrays ke liye bahut useful hai."
            analogy={{
              icon: "⚡",
              title: "Library Book Search",
              titleHi: "Library Mein Book Dhoodhna",
              desc: "Imagine a huge unsorted library where you know books are roughly ordered. Instead of opening from page 1, you flip to page 1, then 2, then 4, then 8, then 16... Once you overshoot, you go back to the previous marker and search linearly from there.",
              descHi: "Ek badi library mein book dhoodhne ke liye aap page 1, phir 2, phir 4, 8, 16 kholte ho. Jab aage nikal jao, wapas pichle marker pe ao aur wahan se Binary Search karo."
            }}
            readingTip={{
              en: "The key insight: doubling the index each step means we find the right range in O(log n) steps, then Binary Search completes in O(log n) too. Total: O(log n).",
              hi: "Key point: har step pe index double karne se O(log n) mein range milti hai, phir Binary Search bhi O(log n) mein complete hota hai. Total: O(log n)."
            }}
            complexities={[
              { case: "Best Case",  time: "1",     space: "log n", note: "Target at index 0." },
              { case: "Worst Case", time: "log n", space: "log n", note: "Target near the end." },
              { case: "Average",    time: "log n", space: "log n", note: "Recursive Binary Search stack." },
            ]}
            pseudocode={`function exponentialSearch(arr, target):
  n = arr.length
  if arr[0] == target: return 0

  // Find range by doubling
  i = 1
  while i < n and arr[i] <= target:
    i = i * 2

  // Binary search in found range
  return binarySearch(arr, i/2, min(i, n-1), target)

function binarySearch(arr, lo, hi, target):
  while lo <= hi:
    mid = (lo + hi) / 2
    if arr[mid] == target: return mid
    if arr[mid] < target:  lo = mid + 1
    else:                  hi = mid - 1
  return -1`}
            useCases={[
              "Searching in unbounded or infinite sorted arrays.",
              "When the target element is likely near the start.",
              "Online search problems where array size is unknown.",
              "Faster than Binary Search when element is near beginning.",
            ]}
            useCasesHi={[
              "Unbounded ya infinite sorted arrays mein search.",
              "Jab target element shuruat ke paas hone ki sambhavna ho.",
              "Online search problems jahan array size pata nahi.",
              "Shuruat ke paas element ke liye Binary Search se faster.",
            ]}
            howItWorks={{
              en: [
                { icon: "✅", text: "Check index 0. If match, done in O(1)." },
                { icon: "⚡", text: "Double the index (1→2→4→8...) until arr[i] > target or end of array." },
                { icon: "🎯", text: "Target must be in range [i/2, min(i, n-1)]." },
                { icon: "🔍", text: "Run Binary Search in the identified range." },
              ],
              hi: [
                { icon: "✅", text: "Index 0 check karo. Match mila toh O(1) mein done." },
                { icon: "⚡", text: "Index double karo (1→2→4→8...) jab tak arr[i] > target." },
                { icon: "🎯", text: "Target [i/2, min(i, n-1)] range mein hoga." },
                { icon: "🔍", text: "Us range mein Binary Search chalao." },
              ]
            }}
            code={{
              language: "javascript",
              content: `function exponentialSearch(arr, target) {
  const n = arr.length;
  if (arr[0] === target) return 0;

  let i = 1;
  while (i < n && arr[i] <= target) i *= 2;

  // Binary Search in [i/2, min(i, n-1)]
  let lo = Math.floor(i / 2), hi = Math.min(i, n - 1);
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target)  lo = mid + 1;
    else                    hi = mid - 1;
  }
  return -1;
}`
            }}
            quiz={[
              {
                q: "What is the time complexity of Exponential Search?",
                options: ["O(n)", "O(log n)", "O(√n)", "O(n log n)"],
                answer: 1,
              },
              {
                q: "In which scenario does Exponential Search have an advantage over Binary Search?",
                options: ["When array is unsorted", "When target is near the beginning", "When array has duplicates", "When array size is small"],
                answer: 1,
              },
              {
                q: "After finding the range in Exponential Search, which algorithm is used?",
                options: ["Linear Search", "Jump Search", "Binary Search", "Interpolation Search"],
                answer: 2,
              },
            ]}
          />
        }
      >
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
          <ArrayViz data={array} currentStepData={currentStepData} />
        </div>
      </VisualizerFrame>
    </div>
  );
}
