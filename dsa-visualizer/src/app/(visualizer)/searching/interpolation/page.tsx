"use client";

import { useState, useEffect, useRef } from "react";
import { ArrayViz } from "@/components/d3/ArrayViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateInterpolationSearchSteps } from "@/lib/algorithms/searching/interpolationSearch";

const MAX_ARRAY_SIZE = 40;

export default function InterpolationSearchPage() {
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
    // Uniformly distributed for best Interpolation Search perf
    const newArr = Array.from({ length: size }, (_, i) => Math.floor((i / size) * 99) + Math.floor(Math.random() * 4) + 1)
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
    setAlgorithmId("interpolation-search");
    if (array.length > 0) setSteps(generateInterpolationSearchSteps(array, targetValue));
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
      setSteps(generateInterpolationSearchSteps(array, targetValue));
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
          currentStepData.type === "visit"     ? "📐 Narrowing Range" :
          currentStepData.type === "compare"   ? "🧮 Interpolating" : "Viewing"
        })</span>`;
    if (currentStepData.auxiliaryState?.stateInfo) {
      formattedDescription += ` <span class="text-xs ml-2 text-slate-500 bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full">${currentStepData.auxiliaryState.stateInfo}</span>`;
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Interpolation Search"
        description="An improved Binary Search for uniformly distributed sorted arrays. Instead of always checking the midpoint, it estimates the probe position using a linear interpolation formula — like a smart guess."
        complexity={{ time: "log log n", space: "1", difficulty: "Hard" }}
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
                  🎲 Randomize (Uniform)
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
            title="Interpolation Search"
            description="Instead of always going to the midpoint like Binary Search, Interpolation Search uses the formula: pos = lo + ((target - arr[lo]) / (arr[hi] - arr[lo])) × (hi - lo). This 'guesses' where the target is based on the value distribution. On uniformly distributed data, this achieves O(log log n)."
            descriptionHi="Binary Search jo hamesha midpoint choose karta hai usse alag, Interpolation Search ek formula use karta hai: pos = lo + ((target - arr[lo]) / (arr[hi] - arr[lo])) × (hi - lo). Yeh guess karta hai ki target kahan hoga value distribution ke basis par. Uniform data mein O(log log n) milta hai."
            analogy={{
              icon: "📞",
              title: "Phone Directory Trick",
              titleHi: "Phone Directory Ka Smart Trick",
              desc: "When you look up 'Smith' in a phone book, you don't open it to the middle — you open it near the end because 'S' is late in the alphabet. That proportional guessing is exactly Interpolation Search.",
              descHi: "'Smith' ko phone directory mein dhoodhte waqt aap middle nahi kholte — aap end ke paas kholte ho kyunki 'S' alphabet mein late hai. Yahi proportional guessing Interpolation Search karta hai."
            }}
            readingTip={{
              en: "Works best on uniformly distributed data. On skewed distributions (many values clustered), it can degrade to O(n) in the worst case.",
              hi: "Uniformly distributed data mein best kaam karta hai. Agar data skewed hai (values cluster mein hain), worst case mein O(n) tak gir sakta hai."
            }}
            complexities={[
              { case: "Best Case",  time: "1",        space: "1", note: "Exact probe on first try." },
              { case: "Average",    time: "log log n", space: "1", note: "Uniform distribution." },
              { case: "Worst Case", time: "n",         space: "1", note: "Extremely skewed data." },
            ]}
            pseudocode={`function interpolationSearch(arr, target):
  lo = 0, hi = n - 1
  while lo <= hi and target >= arr[lo] and target <= arr[hi]:
    if lo == hi:
      if arr[lo] == target: return lo
      else: return -1

    // Interpolation formula
    pos = lo + ((target - arr[lo]) × (hi - lo)) / (arr[hi] - arr[lo])

    if arr[pos] == target: return pos
    if arr[pos] < target:  lo = pos + 1
    else:                  hi = pos - 1
  return -1`}
            useCases={[
              "Phone directories and large sorted datasets.",
              "Database indexing where data is uniformly distributed.",
              "Searching in sorted numerical datasets.",
              "When data distribution is known to be uniform.",
            ]}
            useCasesHi={[
              "Phone directories aur bade sorted datasets.",
              "Database indexing jahan data uniformly distributed ho.",
              "Sorted numerical datasets mein search.",
              "Jab data distribution uniform ho pata ho.",
            ]}
            howItWorks={{
              en: [
                { icon: "📐", text: "Use the interpolation formula to estimate probe position (not always midpoint)." },
                { icon: "🧮", text: "pos = lo + ((target - arr[lo]) / (arr[hi] - arr[lo])) × (hi - lo)" },
                { icon: "↔️", text: "If arr[pos] < target, narrow search to [pos+1, hi]. If greater, narrow to [lo, pos-1]." },
                { icon: "🎯", text: "Repeat until found or range exhausted." },
              ],
              hi: [
                { icon: "📐", text: "Formula se probe position estimate karo (always midpoint nahi)." },
                { icon: "🧮", text: "pos = lo + ((target - arr[lo]) / (arr[hi] - arr[lo])) × (hi - lo)" },
                { icon: "↔️", text: "arr[pos] < target hai toh [pos+1, hi] mein jao. Bada hai toh [lo, pos-1] mein." },
                { icon: "🎯", text: "Tab tak repeat karo jab tak mila ya range khatam na ho." },
              ]
            }}
            code={{
              language: "javascript",
              content: `function interpolationSearch(arr, target) {
  let lo = 0, hi = arr.length - 1;

  while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
    if (lo === hi) return arr[lo] === target ? lo : -1;

    // The magic formula
    const pos = lo + Math.floor(
      ((target - arr[lo]) * (hi - lo)) / (arr[hi] - arr[lo])
    );

    if (arr[pos] === target) return pos;
    if (arr[pos] < target)   lo = pos + 1;
    else                     hi = pos - 1;
  }
  return -1;
}`
            }}
            quiz={[
              {
                q: "What is the average time complexity of Interpolation Search on uniformly distributed data?",
                options: ["O(n)", "O(log n)", "O(log log n)", "O(1)"],
                answer: 2,
              },
              {
                q: "Interpolation Search works best when data is:",
                options: ["Randomly shuffled", "Uniformly distributed and sorted", "Clustered at one end", "Has many duplicates"],
                answer: 1,
              },
              {
                q: "What happens to Interpolation Search's performance on heavily skewed data?",
                options: ["It stays O(log log n)", "It improves to O(1)", "It degrades to O(n)", "It becomes O(log n)"],
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
