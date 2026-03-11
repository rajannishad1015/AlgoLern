"use client";

import { useState, useEffect, useRef } from "react";
import { ArrayViz } from "@/components/d3/ArrayViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateJumpSearchSteps } from "@/lib/algorithms/searching/jumpSearch";

const MAX_ARRAY_SIZE = 50;

export default function JumpSearchPage() {
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
                        .sort((a, b) => a - b); // Jump search requires sorted array
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
    setAlgorithmId("jump-search");
    if (array.length > 0) {
      const newSteps = generateJumpSearchSteps(array, targetValue);
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
      const newSteps = generateJumpSearchSteps(array, targetValue);
      setSteps(newSteps);
      setTimeout(() => setIsPlaying(true), 100);
    }
  };

  const currentStepData = steps[currentStepIndex];

  // Decorate the description with nice formatting
  let formattedDescription = currentStepData?.description || "Ready to search...";
  if (currentStepData?.description) {
    formattedDescription = currentStepData.description
      .replace(/\bahead by\b/g, '<span class="text-indigo-500 font-bold">jumping ahead by</span>')
      .replace(/\blinear search\b/g, '<span class="text-orange-500 font-bold">linear search</span>')
      .replace(/\b(\d+)\b/g, '<span class="text-[var(--lime-dark)] dark:text-lime font-bold">$1</span>')
      + `<span class="text-indigo-400 italic ml-2">(${
          currentStepData.type === 'jump' ? '🦘 Jumping' :
          currentStepData.type === 'compare' ? '🧐 Linear Scan' :
          currentStepData.type === 'done'   ? '🎯 Found!' :
          currentStepData.type === 'not_found' ? '❌ Not Found' : 'Viewing'
        })</span>`;
    
    // Add block boundaries if tracking the boundary state
    if (currentStepData.auxiliaryState?.stateInfo) {
      formattedDescription += ` <span class="text-xs ml-2 text-slate-500 bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full select-none">${currentStepData.auxiliaryState.stateInfo}</span>`;
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Jump Search"
        description="A searching algorithm for sorted arrays that checks fewer elements than linear search by jumping ahead with fixed steps, then doing a linear search when the target bounds are found."
        complexity={{ time: '√n', space: '1', difficulty: 'Medium' }}
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
            title="Jump Search"
            description="Jump Search sits perfectly between Linear Search and Binary Search in terms of complexity. It works only on sorted arrays by jumping ahead 'm' steps at a time to find a block where the target might exist, and then running a standard Linear Search inside that specifically bounded block."
            descriptionHi="Jump Search ki speed Linear Search aur Binary Search ke theek beech mein aati hai. Yeh keval sorted array par kaam karta hai jisme yeh fix steps kood kar ek block dhoondhta hai jaha target hone ki sambhavna ho, aur phir us block ke andar seedha Linear Search laga deta hai."
            analogy={{
              icon: "🦘",
              title: "Skipping Phonebook Pages",
              titleHi: "Phonebook ke Pages Skip Karna",
              desc: "Instead of searching for a friend's name line by line (Linear Search) or jumping exactly to the middle (Binary Search), imagine skipping chunks of pages at a time—say, 50 pages at once. Once you realize you've gone past the letter their name starts with, you stop jumping, go backward to the last block you checked, and then look line-by-line in just that small 50-page chunk.",
              descHi: "Kisko phonebook mein dhoondhne ke liye line se padhna (Linear Search) ya seedha book aadhi kholne (Binary Search) ke bajaye, aap ek saath blocks of pages ulat-te ho (maano 50 page). Jaise hi aapko dikhta hai ki aap aage nikal gaye ho, aap pichle point par aakar sirf us chote block mein dhyan se dhoondhte ho."
            }}
            readingTip={{
              en: "The optimal jump block size is √n (the square root of the array length). If your array has 100 elements, your pointers will jump ahead 10 elements per block.",
              hi: "Ek perfect jump ka step/gap nikalne ka tareeka hai √n (math square root) array ke size ka. Agar array me 100 numbers hain, toh aapka searcher ek-ek baar mein 10 kadam jump karega."
            }}
            complexities={[
              { case: "Best Case", time: "1", space: "1", note: "Target is the very first element (Index 0)." },
              { case: "Worst Case", time: "√n", space: "1", note: "Target is at the end or missing." },
              { case: "Average Case", time: "√n", space: "1", note: "Halfway through the array blocks." },
            ]}
            pseudocode={`function jumpSearch(array, target):
  n = array.length
  step = floor(sqrt(n))
  prev = 0
  
  // Jump blocks until we overshoot the target
  while array[min(step, n) - 1] < target:
    prev = step
    step += floor(sqrt(n))
    if prev >= n:
      return -1 // Reached end, not found
      
  // Linear search inside the block (from 'prev' to 'step')
  while array[prev] < target:
    prev++
    if prev == min(step, n):
      return -1
      
  // Return if the matching element was discovered
  if array[prev] == target:
    return prev
    
  return -1`}
            useCases={[
              "When you need an algorithm slightly better than Linear Search but can't jump fully back-and-forth like Binary Search.",
              "Disk seeking algorithms or large arrays scattered non-contiguously where Binary 'jumping' completely across bounds is extremely expensive.",
              "Systems where elements are sorted, but determining the exact middle node is costly (though jump is more common in primitive arrays)."
            ]}
            useCasesHi={[
              "Jab aapko Linear Search se thoda fast mechanism chahiye ho par Binary Search ka aage-peeche backward jumping disk expensive lagta ho.",
              "Large disk drives par jahan Binary Search ka opposite seek karna disk headers ke liye expensive process hota hai.",
              "Chhote sorted collections jisme Binary search thoda complex lagta ho implementation me."
            ]}
            howItWorks={{
              en: [
                { icon: "🧮", text: "Determine the optimal jump size: m = √n (Square root of array length)." },
                { icon: "🦘", text: "Jump 'm' steps forward continuously while checking the boundary value." },
                { icon: "📉", text: "If the value at array[m] is greater than the target, we've gone too far." },
                { icon: "🔙", text: "Go back one chunk, and perform a simple linear search until the target is hit." },
                { icon: "🎯", text: "Return the index once the linear search finds the exact match." },
              ],
              hi: [
                { icon: "🧮", text: "Sabse safe jump size nikalne ke liye √n use karein." },
                { icon: "🦘", text: "'m' steps seedha jump karein aur sirf current interval point check karein." },
                { icon: "📉", text: "Agar boundary wala item target se bada hai, iska matlab hum aage nikal aaye hain." },
                { icon: "🔙", text: "Ek chunk wapis aao aur us bound ke beech me ek chota Linear Search chalao." },
                { icon: "🎯", text: "Target catch hone par index return kardo." },
              ]
            }}
            code={{
              language: 'javascript',
              content: `function jumpSearch(arr, target) {
  const n = arr.length;
  // Step 1: Find the best jump step size using Square Root
  let step = Math.floor(Math.sqrt(n));
  let prev = 0;

  // Step 2: Finding the correct block where element belongs
  while (arr[Math.min(step, n) - 1] < target) {
    prev = step;
    step += Math.floor(Math.sqrt(n)); // Jump to the next block
    
    // Safety check if we exceeded array size completely
    if (prev >= n) {
      return -1;
    }
  }

  // Step 3: Doing a continuous linear search backwards 
  // from the current established block boundary
  while (arr[prev] < target) {
    prev++;

    // Safety check if we crossed the next boundary entirely without finding it
    if (prev === Math.min(step, n)) {
      return -1;
    }
  }

  // Return exactly where we found it!
  if (arr[prev] === target) {
    return prev;
  }

  return -1;
}`
            }}
            quiz={[
              {
                q: "What is the optimal block jump size for Jump Search passing through an array of length N?",
                options: [
                  "N / 2",
                  "Math.sqrt(N)",
                  "Math.log(N)",
                  "Always exactly 10 no matter the size"
                ],
                answer: 1
              },
              {
                q: "Like Binary Search, what strict state condition must an array satisfy before running Jump Search?",
                options: [
                  "The array data needs to be scrambled randomly.",
                  "It can only contain integers.",
                  "It needs to be strictly sorted first.",
                  "It must possess an exact, even amount of nodes."
                ],
                answer: 2
              },
              {
                q: "Why would someone choose to use Jump Search instead of Binary Search when dealing with hard disks?",
                options: [
                  "Binary search is theoretically slower.",
                  "Jump Search only steps 'forward' minimizing expensive backward disk-seeking routines.",
                  "Memory limitations on older motherboards.",
                  "Jump Search avoids integer-overflow errors inherently."
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
