"use client";

import { useState, useEffect, useRef } from "react";
import { ArrayViz } from "@/components/d3/ArrayViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateLinearSearchSteps } from "@/lib/algorithms/searching/linearSearch";

const MAX_ARRAY_SIZE = 30;

export default function LinearSearchPage() {
  const [arraySize, setArraySize] = useState([8]);
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
    const newArr = Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1);
    // Ensure target is occasionally in the array for good demonstration
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
    setAlgorithmId("linear-search");
    if (array.length > 0) {
      const newSteps = generateLinearSearchSteps(array, targetValue);
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
      const newSteps = generateLinearSearchSteps(array, targetValue);
      setSteps(newSteps);
      setTimeout(() => setIsPlaying(true), 100);
    }
  };

  const currentStepData = steps[currentStepIndex];

  const formattedDescription = currentStepData?.description
    ? currentStepData.description
        .replace(/\b(\d+)\b/g, '<span class="text-[var(--lime-dark)] dark:text-lime font-bold">$1</span>')
        + `<span class="text-indigo-400 italic ml-2">(${
            currentStepData.type === 'compare' ? '🧐 Compare' :
            currentStepData.type === 'done'   ? '🎉 Found!' :
            currentStepData.type === 'not_found' ? '❌ Not Found' : 'Viewing'
          })</span>`
    : "Ready to search...";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Linear Search"
        description="The simplest searching algorithm. It sequentially checks each element in a list until a match is found or the whole list has been searched."
        complexity={{ time: 'n', space: '1', difficulty: 'Easy' }}
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
                  <span className="hidden md:inline">🎲 </span>Randomize Array
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
            title="Linear Search"
            description="Linear Search is a sequential algorithm that checks every element in a list one by one until it finds the target value or reaches the end. It doesn't require the array to be sorted."
            descriptionHi="Linear Search ek line-by-line chalne wala algorithm hai jo list ke ek-ek element ko check karta hai jab tak target mil nahi jata. Isme array ka sorted hona zaroori nahi hai."
            analogy={{
              icon: "📚",
              title: "Checking a Bookshelf",
              titleHi: "Bookshelf mein se Kitab Dhoondhna",
              desc: "Imagine looking for a specific book on an unorganized shelf. You start from the first book and check the title. If it's not the one, you check the next, and keep going until you either find the book or run out of books. This is exactly how Linear Search works through an array.",
              descHi: "Bina arrange ki hui shelf par koi specific kitab dhoondhne ke baare mein socho. Aap pehli book check karte ho, phir doosri, aur line se chalte rehte ho jab tak kitab mil nahi jaati. Bilkul isi tarah Linear Search kaam karta hai."
            }}
            readingTip={{
              en: "Since Linear Search relies on brute force checking, its speed scales directly with the number of elements (O(n)). For very large arrays, consider sorting the data first and using Binary Search (O(log n)).",
              hi: "Kyunki Linear Search sabko check karta hai, iski speed elements ke sath badhti hai (O(n)). Agar array bahut bada hai, toh usko pehle sort karke Binary Search (O(log n)) use karna behtar hota hai."
            }}
            complexities={[
              { case: "Best Case", time: "1", space: "1", note: "Target is the very first element." },
              { case: "Worst Case", time: "n", space: "1", note: "Target is the last element or not in the array." },
              { case: "Average Case", time: "n", space: "1", note: "On average, the target is in the middle." },
            ]}
            pseudocode={`function linearSearch(array, target):
  for index from 0 to array.length - 1:
    if array[index] == target:
      return index // Found the target!
  
  return -1 // Target not found`}
            useCases={[
              "Searching small unsorted collections.",
              "When you need to find all occurrences of a value, not just one.",
              "Data streams where data cannot quickly be indexed.",
              "The simplest search fallback when other fast logic fails."
            ]}
            useCasesHi={[
              "Chhote collections mein search karna jinki sorting nahi hui ho.",
              "Jab aapko target saari jagah par dhoondhna ho, sirf ek hi baar nahi.",
              "Live data jise easily sort nahi kiya ja sakta.",
              "Jab aur saare searching algorithms ka backup chahiye ho."
            ]}
            howItWorks={{
              en: [
                { icon: "0️⃣", text: "Start at the first element (index 0) of the array." },
                { icon: "👀", text: "Compare the current element with the target value." },
                { icon: "✅", text: "If they match, return the current index. The search is complete!" },
                { icon: "➡️", text: "If they don't match, move to the next element." },
                { icon: "❌", text: "If the end of the array is reached, the target doesn't exist. Return -1." }
              ],
              hi: [
                { icon: "0️⃣", text: "Array ke pehle element (index 0) se shuruat karein." },
                { icon: "👀", text: "Current element ko target value se compare karein." },
                { icon: "✅", text: "Agar match ho jaye, toh current index return kar de. Search poori hui!" },
                { icon: "➡️", text: "Agar match na ho, toh aage wale element pe badh jayein." },
                { icon: "❌", text: "Agar array khatam ho gaya, iska matlab value nahi hai. Return -1" }
              ]
            }}
            code={{
              language: 'javascript',
              content: `// Standard Linear Search
function linearSearch(arr, target) {
  // Loop through every single element in the array
  for (let i = 0; i < arr.length; i++) {
    
    // Check if the current element matches what we want
    if (arr[i] === target) {
      return i; // Success: Return its position
    }
  }

  // Loop finished, elements exhausted
  return -1; // Failure: Not found
}

// Example:
const numbers = [45, 12, 89, 23, 7];
const result = linearSearch(numbers, 23); // Returns 3 (index of 23)
const missing = linearSearch(numbers, 99); // Returns -1`
            }}
            quiz={[
              {
                q: "What is the primary advantage of Linear Search over Binary Search?",
                options: [
                  "It is significantly faster on large datasets.",
                  "It uses less memory than Binary Search.",
                  "It works on unsorted arrays naturally.",
                  "It can find multiple identical items at once."
                ],
                answer: 2
              },
              {
                q: "If an array has 50 elements, what is the maximum number of comparisons Linear Search will make?",
                options: ["1 comparison", "25 comparisons (half)", "50 comparisons", "Log(50) comparisons"],
                answer: 2
              },
              {
                q: "When would Linear Search hit its 'Best Case' O(1) time complexity?",
                options: [
                  "When the array is perfectly sorted ascendingly.",
                  "When the target is located exactly at index 0.",
                  "When the target is exactly in the middle.",
                  "When the target doesn't exist in the array."
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
