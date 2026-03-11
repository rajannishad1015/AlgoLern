"use client";

import { useState, useEffect, useRef } from "react";
import { ArrayViz } from "@/components/d3/ArrayViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateBinarySearchSteps } from "@/lib/algorithms/searching/binarySearch";

const MAX_ARRAY_SIZE = 50;

export default function BinarySearchPage() {
  const [arraySize, setArraySize] = useState([15]);
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
                        .sort((a, b) => a - b); // Binary search requires sorted array
    if (Math.random() > 0.5) {
      setTargetValue(newArr[Math.floor(Math.random() * size)]);
    } else {
      setTargetValue(Math.floor(Math.random() * 99) + 1);
    }
    setArray(newArr);
    resetVisualizer();
  };

  useEffect(() => {
    generateData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arraySize]);

  useEffect(() => {
    setAlgorithmId("binary-search");
    if (array.length > 0) {
      const newSteps = generateBinarySearchSteps(array, targetValue);
      setSteps(newSteps);
    }
    return () => {
      resetVisualizer();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [array, targetValue, setSteps, resetVisualizer, setAlgorithmId]);

  // Main playback engine
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
    if (!isNaN(val)) {
      setTargetValue(val);
      resetVisualizer();
    }
  };

  const handleCustomSearch = () => {
    resetVisualizer();
    if (array.length > 0) {
      const newSteps = generateBinarySearchSteps(array, targetValue);
      setSteps(newSteps);
      setTimeout(() => setIsPlaying(true), 100);
    }
  };

  const currentStepData = steps[currentStepIndex];

  // Decorate the description with some nice spans
  let formattedDescription = currentStepData?.description || "Ready to search...";
  if (currentStepData?.description) {
    formattedDescription = currentStepData.description
      .replace(/\b(\d+)\b/g, '<span class="text-[var(--lime-dark)] dark:text-lime font-bold">$1</span>')
      + `<span class="text-indigo-400 italic ml-2">(${
          currentStepData.type === 'compare' ? '⚖️ Middle Check' :
          currentStepData.type === 'done'   ? '🎯 Found!' :
          currentStepData.type === 'not_found' ? '❌ Not Found' :
          currentStepData.type === 'highlight' ? '🔍 Narrowing Bounds' : 'Viewing'
        })</span>`;
    
    // Additional suffix for bound state if available
    if (currentStepData.auxiliaryState?.pointerInfo) {
      formattedDescription += ` <span class="text-xs ml-2 text-slate-500 bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full select-none">${currentStepData.auxiliaryState.pointerInfo}</span>`;
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Binary Search"
        description="A powerful divide-and-conquer algorithm that finds the position of a target value within a sorted array. It repeatedly halves the search interval until the target is found."
        complexity={{ time: 'log n', space: '1', difficulty: 'Medium' }}
        controls={
          <div className="flex flex-col gap-4 w-full">
            {/* Action Row */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4">
              
              <div className="flex-1 w-full flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto p-2 bg-black/5 dark:bg-black/20 rounded-lg">
                  <span className="text-xs font-mono font-bold text-slate-500 min-w-[50px] uppercase">Size: {arraySize[0]}</span>
                  <input
                    type="range"
                    min="5"
                    max={MAX_ARRAY_SIZE}
                    step="1"
                    value={arraySize[0]}
                    onChange={(e) => setArraySize([parseInt(e.target.value)])}
                    className="w-24 md:w-32 accent-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <input
                    type="number"
                    value={targetValue}
                    onChange={handleTargetChange}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleCustomSearch(); } }}
                    placeholder="Search query..."
                    className="w-full md:w-36 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-lime-600 dark:text-lime outline-none focus:border-indigo-500 transition-all font-mono"
                  />
                  <button
                    onClick={handleCustomSearch}
                    className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-lg whitespace-nowrap"
                  >
                    Find Target
                  </button>
                </div>
              </div>

              <div className="w-full md:w-auto flex">
                <button
                  onClick={generateData}
                  className="w-full px-6 py-2.5 rounded-lg border border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold transition-colors shadow-sm whitespace-nowrap"
                >
                  <span className="hidden md:inline">🎲 </span>Randomize (Sorted)
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
            title="Binary Search"
            description="Binary Search is a divide-and-conquer algorithm. Rather than scanning sequentially, it requires a sorted array and continually halves the remaining search area by comparing the target to the middle element."
            descriptionHi="Binary Search ek divide-and-conquer algorithm hai. Yeh line-by-line check karne ke bajaye, ek sorted array maangta hai aur baar-baar array ko aadha (half) karke middle element se target ko compare karta hai."
            analogy={{
              icon: "📖",
              title: "Searching a Dictionary",
              titleHi: "Dictionary mein Word Dhoondhna",
              desc: "Imagine looking for the word 'Mango' in a dictionary. You don't read page 1, page 2, and so on. Instead, you open roughly to the middle (maybe 'M'). Since you're looking for 'Mango', you know whether to search the left half or the right half. You keep halving the pages until you find it.",
              descHi: "Sochiye aap dictionary mein 'Mango' dhoondh rahe hain. Aap page 1, page 2 karke nahi padhte. Aap book ke beech mein kholte hain, aur phir decide karte hain ki shabd left half mein hoga ya right mein. Aap pages ko aadha karte rehte hain jab tak shabd mil nahi jata."
            }}
            readingTip={{
              en: "Binary search is extremely fast, O(log n). It can find an item in a list of 1 million elements in just 20 comparisons. However, the data MUST be pre-sorted.",
              hi: "Binary search bahut fast hota hai, O(log n). Yeh 10 lakh elements ki list mein se bhi item sirf 20 baar compare karke dhoondh sakta hai. Lekin, iske liye data ka pehle se sort hona zaroori hai."
            }}
            complexities={[
              { case: "Best Case", time: "1", space: "1", note: "Target is exactly at the middle element on the first check." },
              { case: "Worst Case", time: "log n", space: "1", note: "Target is at the ends, or not in the array." },
              { case: "Average Case", time: "log n", space: "1", note: "Target is found after halving a few times." },
            ]}
            pseudocode={`function binarySearch(array, target):
  left = 0
  right = array.length - 1
  
  while left <= right:
    mid = floor((left + right) / 2)
    
    if array[mid] == target:
      return mid       // Target Found!
    
    if array[mid] < target:
      left = mid + 1   // Discard Left Half
    else:
      right = mid - 1  // Discard Right Half
      
  return -1 // Target not found`}
            useCases={[
              "Finding values in large, sorted database rows.",
              "Determining if an item exists within an ordered collection rapidly.",
              "Debugging a commit history (git bisect uses binary search).",
              "Finding boundaries or ranges of values in ordered data."
            ]}
            useCasesHi={[
              "Bade aur sorted databases mein values dhoondhna.",
              "Tezi se pata lagana ki ordered collection mein koi item hai ya nahi.",
              "Code bugs dhoondhna (git bisect binary search use karta hai).",
              "Sorted data ke boundaries ya ranges pata karna."
            ]}
            howItWorks={{
              en: [
                { icon: "🏁", text: "Maintain two pointers: left (start) and right (end)." },
                { icon: "⚖️", text: "Calculate the middle index: mid = (left + right) / 2." },
                { icon: "🎯", text: "If the middle element matches the target, return the index." },
                { icon: "📉", text: "If target is smaller than mid, discard right half (right = mid - 1)." },
                { icon: "📈", text: "If target is larger, discard left half (left = mid + 1)." },
                { icon: "🛑", text: "Repeat until left > right. If so, return -1 (not found)." }
              ],
              hi: [
                { icon: "🏁", text: "Do pointers rakhein: left (start) aur right (end)." },
                { icon: "⚖️", text: "Bech ka index calculate karein: mid = (left + right) / 2." },
                { icon: "🎯", text: "Agar middle element target se match kare, toh wo index return karein." },
                { icon: "📉", text: "Agar target chhota hai, right half chhod dein (right = mid - 1)." },
                { icon: "📈", text: "Agar target bada hai, left half chhod dein (left = mid + 1)." },
                { icon: "🛑", text: "Repeat karein jab tak left > right na ho. Agar ho jaye toh return -1." }
              ]
            }}
            code={{
              language: 'javascript',
              content: `// Standard iterative Binary Search
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    // Find the middle index (avoids integer overflow in other languages)
    const mid = Math.floor(left + (right - left) / 2);

    if (arr[mid] === target) {
      return mid; // Found it!
    }

    if (arr[mid] < target) {
      left = mid + 1; // Target is in the right half
    } else {
      right = mid - 1; // Target is in the left half
    }
  }

  return -1; // Exhausted search space, not found
}

const sortedNums = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
console.log(binarySearch(sortedNums, 23)); // Output: 5`
            }}
            quiz={[
              {
                q: "What is the absolute prerequisite for using Binary Search?",
                options: [
                  "The array must have an even number of elements.",
                  "The array must contain only positive integers.",
                  "The array must be sorted.",
                  "The target value must exist in the array."
                ],
                answer: 2
              },
              {
                q: "For a sorted array of 1,000,000 elements, approximately how many comparisons are needed in the worst case?",
                options: ["1,000,000", "500,000", "20", "1"],
                answer: 2
              },
              {
                q: "Why is 'mid = Math.floor(left + (right - left) / 2)' sometimes preferred over '(left + right) / 2'?",
                options: [
                  "It runs faster in JavaScript environments.",
                  "It prevents potential integer overflow errors in typed languages.",
                  "It ensures we always round up instead of rounding down.",
                  "It allows Binary Search to work on unsorted arrays."
                ],
                answer: 1
              }
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
