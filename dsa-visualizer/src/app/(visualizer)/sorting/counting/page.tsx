"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateCountingSortSteps } from "@/lib/algorithms/sorting/countingSort";
import { ArrayViz } from "@/components/d3/ArrayViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";

const DEFAULT_ARRAY = [4, 2, 7, 1, 5, 3, 6, 2];
const randomArray = () => Array.from({ length: 8 }, () => Math.floor(Math.random() * 15) + 1);

export default function CountingSortPage() {
  const [data, setData] = useState<number[]>(DEFAULT_ARRAY);
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputText, setInputText] = useState(DEFAULT_ARRAY.join(", "));
  const [inputError, setInputError] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { steps, currentStepIndex, isPlaying, speed, setSteps, setIsPlaying, setSpeed, stepForward, stepBackward, resetVisualizer, setAlgorithmId } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("counting-sort");
    setSteps(generateCountingSortSteps(data));
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
    if (parsed.some(v => v < 0)) { setInputError("Use positive numbers only."); return; }
    setInputError(""); setData(parsed); resetVisualizer(); setShowInputModal(false);
  };
  const handleShuffle = () => { const a = randomArray(); setData(a); setInputText(a.join(", ")); setInputError(""); resetVisualizer(); };

  const currentStepData = steps[currentStepIndex];

  const formattedDescription = currentStepData?.description
    ? currentStepData.description
        .replace(/\b(\d+)\b/g, '<span class="text-[var(--lime-dark)] dark:text-lime font-bold">$1</span>')
        + `<span class="text-indigo-400 italic ml-2">(Next: ${
            currentStepData.type === 'compare'   ? 'Scan Range' :
            currentStepData.type === 'highlight' ? 'Count Frequency' :
            currentStepData.type === 'insert'    ? 'Place Element' :
            currentStepData.type === 'sorted'    ? 'Element Placed' : 'Run'
          })</span>`
    : "Awaiting execution parameters.";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Counting Sort"
        description="A non-comparison integer sorting algorithm. Counts occurrences of each value, computes cumulative positions, then places each element directly into its correct sorted index."
        complexity={{ time: 'n + k', space: 'n + k', difficulty: 'Medium' }}
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
            title="Counting Sort"
            description="Counting Sort is a non-comparison sorting algorithm that works by counting the occurrences of each unique value, then using that count to determine each element's final sorted position. Because it never compares elements to each other, it can achieve O(n + k) time — faster than any comparison-based algorithm for the right input."
            descriptionHi="Counting Sort ek aisa algorithm hai jo do numbers ko aapas mein compare karta hi nahi! Yeh pehle count karta hai ki kaun sa number kitni baar aaya, phir us count se directly sahi jagah par rakh deta hai. Isliye O(n + k) time mein kaam ho jaata hai — comparison wale algorithms se bhi fast!"
            analogy={{
              icon: "📊",
              title: "The Ballot Counter Method",
              titleHi: "Vote Counting Wala Tarika",
              desc: "Imagine counting votes in an election. You don't compare each ballot — you just tally how many votes each candidate got. Once you have the counts, you instantly know the final ranking without any comparisons. Counting Sort works exactly the same way!",
              descHi: "Sochiye election mein votes count kar rahe ho. Tum har ballot ko doosre se compare nahi karte — bas yeh giinte ho ki candidate A ko kitne votes mile, candidate B ko kitne. Counts aa jaane ke baad ranking turat pata chal jaati hai. Counting Sort bhi bilkul yahi karta hai!"
            }}
            readingTip={{
              en: "'k' is the range of input values (max - min). If k is small (e.g., sorting ages 0–120), Counting Sort is blazing fast. If k is huge (e.g., sorting 9-digit numbers), it wastes memory.",
              hi: "'k' matlab input numbers ki range (max - min). Agar k chhoti hai (jaise umar 0–120 sort karni ho), toh Counting Sort bahut fast hota hai. Agar k bahut badi ho (jaise 9-digit numbers), toh memory waste hoti hai."
            }}
            quote={{
              en: '"Counting Sort shows us that sometimes the fastest way to sort is to never compare at all — just count and place."',
              hi: '"Counting Sort sikhaata hai ki kabhi kabhi sabse fast sorting woh hoti hai jisme compare hi nahi karte — bas count karo aur jagah par rakh do."'
            }}
            complexities={[
              { case: "Best",    time: "n + k", space: "n + k", note: "k = range of input. Always linear if k is small." },
              { case: "Average", time: "n + k", space: "n + k", note: "Independent of data distribution." },
              { case: "Worst",   time: "n + k", space: "n + k", note: "Large k (big range) can make it slower than O(n log n)." },
            ]}
            pseudocode={`procedure countingSort(arr):
  max = findMax(arr), min = findMin(arr)
  k = max - min + 1
  count = array of k zeros

  // Phase 1: Count each element
  for each val in arr:
    count[val - min]++

  // Phase 2: Cumulative sum (prefix sum)
  for i from 1 to k-1:
    count[i] += count[i-1]

  // Phase 3: Place each element at correct position
  output = array of same size
  for i from arr.length-1 down to 0:
    output[ count[arr[i]-min] - 1 ] = arr[i]
    count[arr[i]-min]--

  copy output back to arr`}
            useCases={[
              "Sorting integers when the value range (k) is small.",
              "Used as a subroutine inside Radix Sort.",
              "Counting votes, grades, ratings — small discrete values.",
              "When stability matters (equal elements keep their relative order).",
            ]}
            useCasesHi={[
              "Jab integers sort karne ho aur unki range (k) chhoti ho.",
              "Radix Sort ke andar ek step ke roop mein use hota hai.",
              "Votes count karna, grades sort karna — chhote discrete numbers.",
              "Jab stable sort chahiye — barabar numbers ka order maintain hona chahiye.",
            ]}
            howItWorks={{
              en: [
                { icon: "1️⃣", text: "Find the minimum and maximum value in the array to know the range (k)." },
                { icon: "2️⃣", text: "Create a 'count' array of size k, all zeros. Go through every element and tally its count." },
                { icon: "3️⃣", text: "Transform count[] into a cumulative (prefix) sum — each position now tells you where that value ends up." },
                { icon: "4️⃣", text: "Walk the original array backwards. For each element, look up its final position in count[], place it there, then decrement that count." },
                { icon: "5️⃣", text: "Copy the output array back. Done — sorted without a single comparison!" },
                { icon: "✅", text: "Result: O(n + k) time. Perfect when k is small relative to n." },
              ],
              hi: [
                { icon: "1️⃣", text: "Array mein sabse chhota aur sabse bada number dhundho — range (k) pata chalti hai." },
                { icon: "2️⃣", text: "k size ka ek 'count' array banao (shuru mein sab zero). Har element ki frequency count karo." },
                { icon: "3️⃣", text: "count[] ko cumulative sum mein badlo — ab har position bataati hai ki woh value output mein kahan jaayegi." },
                { icon: "4️⃣", text: "Original array ko ulta chalao. Har element ke liye count[] se uski sahi jagah nikalo, wahan rakho, aur count ghatao." },
                { icon: "5️⃣", text: "Output array ko wapas copy karo. Khatam — bina kisi comparison ke sort ho gaya!" },
                { icon: "✅", text: "Result: O(n + k) time. Tab best hai jab k, n ke comparison mein chhota ho." },
              ]
            }}
            example={{
              array: [4, 2, 7, 1, 5, 3],
              steps: [
                { desc: "Array: [4, 2, 7, 1, 5, 3]. Min = 1, Max = 7. Range k = 7. We'll count how many times each number appears.", descHi: "Array hai [4, 2, 7, 1, 5, 3]. Sabse chhota 1, sabse bada 7. Range k = 7. Ab ginen ge — kaun sa number kitni baar aaya.", array: [4, 2, 7, 1, 5, 3], highlight: [0, 1, 2, 3, 4, 5] },
                { desc: "Count each element: 1→1 time, 2→1 time, 3→1 time, 4→1 time, 5→1 time, 7→1 time. count[] = [1,1,1,1,1,0,1]", descHi: "Har number ka count: 1 ek baar, 2 ek baar, 3 ek baar, 4 ek baar, 5 ek baar, 7 ek baar. count[] = [1,1,1,1,1,0,1]", array: [4, 2, 7, 1, 5, 3], highlight: [0, 1, 2, 3, 4, 5] },
                { desc: "Phase 2: Cumulative sum. count[] = [1,2,3,4,5,5,6]. Now count[i] tells us: value (i+1) should be at or before position count[i] in the output.", descHi: "Phase 2: Har count mein pehle waala jodao (prefix sum). count[] = [1,2,3,4,5,5,6]. Ab count[i] bataata hai — yeh value output mein kahan tak jaayegi.", array: [4, 2, 7, 1, 5, 3], highlight: [] },
                { desc: "Phase 3: Place elements backwards. Take 3 (last element). count[3-1]=3, so place 3 at index 2. Decrement count.", descHi: "Phase 3: Ulta chalte hain. 3 uthao (last element). count[2]=3, matlab 3 output ke index 2 par jaayega. Rakha!", array: [0, 0, 3, 0, 0, 0], highlight: [2] },
                { desc: "Take 5. count[5-1]=5, place 5 at index 4.", descHi: "5 uthao. count[4]=5, matlab 5 index 4 par jaayega. Rakha!", array: [0, 0, 3, 0, 5, 0], highlight: [4] },
                { desc: "Take 1. count[1-1]=1, place 1 at index 0.", descHi: "1 uthao. count[0]=1, matlab 1 index 0 par. Rakha!", array: [1, 0, 3, 0, 5, 0], highlight: [0] },
                { desc: "Take 7. count[7-1]=6, place 7 at index 5.", descHi: "7 uthao. count[6]=6, matlab 7 index 5 par. Rakha!", array: [1, 0, 3, 0, 5, 7], highlight: [5] },
                { desc: "Take 2. count[2-1]=2, place 2 at index 1.", descHi: "2 uthao. count[1]=2, matlab 2 index 1 par. Rakha!", array: [1, 2, 3, 0, 5, 7], highlight: [1] },
                { desc: "Take 4. count[4-1]=4, place 4 at index 3.", descHi: "4 uthao. count[3]=4, matlab 4 index 3 par. Rakha!", array: [1, 2, 3, 4, 5, 7], highlight: [3] },
                { desc: "Done! Every element placed without a single comparison. Array sorted in O(n + k) time! ✨", descHi: "Khatam! Ek bhi comparison nahi kiya, phir bhi poora sort ho gaya — O(n + k) time mein! ✨", array: [1, 2, 3, 4, 5, 7], highlight: [0, 1, 2, 3, 4, 5] },
              ]
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
              <p className="text-sm font-light text-white/50">Enter positive numbers (2–20 values). Small range works best!</p>
              <input
                type="text"
                autoFocus
                value={inputText}
                onChange={e => { setInputText(e.target.value); setInputError(""); }}
                onKeyDown={e => e.key === "Enter" && handleApplyInput()}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-lime outline-none focus:border-lime/50 transition-all font-mono"
                placeholder="e.g. 3, 1, 4, 1, 5, 9"
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
