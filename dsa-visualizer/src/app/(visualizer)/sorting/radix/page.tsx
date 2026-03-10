"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateRadixSortSteps } from "@/lib/algorithms/sorting/radixSort";
import { ArrayViz } from "@/components/d3/ArrayViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";

const DEFAULT_ARRAY = [170, 45, 75, 90, 802, 24, 2, 66];
const randomArray = () => Array.from({ length: 8 }, () => Math.floor(Math.random() * 900) + 10);

export default function RadixSortPage() {
  const [data, setData] = useState<number[]>(DEFAULT_ARRAY);
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputText, setInputText] = useState(DEFAULT_ARRAY.join(", "));
  const [inputError, setInputError] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { steps, currentStepIndex, isPlaying, speed, setSteps, setIsPlaying, setSpeed, stepForward, stepBackward, resetVisualizer, setAlgorithmId } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("radix-sort");
    setSteps(generateRadixSortSteps(data));
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
            currentStepData.type === 'compare'   ? 'Scan Digit' :
            currentStepData.type === 'highlight' ? 'Read Digit' :
            currentStepData.type === 'insert'    ? 'Place by Digit' :
            currentStepData.type === 'update'    ? 'Pass Complete' :
            currentStepData.type === 'sorted'    ? 'Sorted' : 'Run'
          })</span>`
    : "Awaiting execution parameters.";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Radix Sort"
        description="Sorts numbers digit by digit — from Least Significant Digit (units) to Most Significant Digit (hundreds). Uses Counting Sort internally on each digit pass."
        complexity={{ time: 'n · k', space: 'n + k', difficulty: 'Medium' }}
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
            title="Radix Sort"
            description="Radix Sort is a non-comparison integer sorting algorithm that sorts numbers by processing individual digits. Starting from the least significant digit (units place) to the most significant (highest place value), it groups numbers by each digit using a stable sort (usually Counting Sort). After all digit passes, the array is fully sorted."
            descriptionHi="Radix Sort ek aisa algorithm hai jo numbers ko ek ek digit ke hisaab se sort karta hai — pehle units place (1s), phir tens place (10s), phir hundreds (100s) — jab tak sab sort na ho jaaye. Yeh numbers ko kabhi aapas mein compare nahi karta!"
            analogy={{
              icon: "📬",
              title: "Post Office Sorting System",
              titleHi: "Post Office Tarika",
              desc: "Imagine sorting thousands of letters at a post office. First, you sort them by the last digit of the PIN code. Then by the second-last digit, and so on. After a few passes through all digits, every letter is in perfect order — and you never had to 'compare' two letters directly!",
              descHi: "Sochiye post office mein hazaron chithiyan sort karni hain PIN code ke hisaab se. Pehle last digit se sort karo, phir usse pehle wali digit se, aise karte karte poori PIN process ho jaati hai. Aur kisi bhi chitthi ko kisi doosre se compare hi nahi karna padta!"
            }}
            readingTip={{
              en: "k = number of digits in the largest number. Sorting 8 three-digit numbers takes just 3 passes of Counting Sort. That's why Radix is blazing fast for fixed-width integers!",
              hi: "k = sabse bade number mein kitne digits hain. Agar 8 three-digit numbers sort karne hain toh sirf 3 passes lagenge. Isliye fixed-size integers ke liye Radix Sort bahut fast hota hai!"
            }}
            quote={{
              en: '"Radix Sort turns a seemingly hard problem into k simple bucket-sort passes — elegant, predictable, and blazing fast."',
              hi: '"Radix Sort ek mushkil problem ko k simple passes mein tod deta hai — simple, predictable, aur bahut fast."'
            }}
            complexities={[
              { case: "Best",    time: "n · k", space: "n + k", note: "k = digits in max number. For fixed-width integers, k is constant." },
              { case: "Average", time: "n · k", space: "n + k", note: "Same for all distributions — no worst case!" },
              { case: "Worst",   time: "n · k", space: "n + k", note: "k can grow with very large numbers. Still O(n) for fixed-width data." },
            ]}
            pseudocode={`procedure radixSort(arr):
  max = findMax(arr)

  // Run Counting Sort for each digit place
  exp = 1  // Start from units digit
  while max / exp > 0:
    countingSortByDigit(arr, exp)
    exp *= 10   // Move to next digit place

procedure countingSortByDigit(arr, exp):
  count = [0] * 10          // 10 buckets for digits 0-9
  for each val in arr:
    digit = (val / exp) % 10
    count[digit]++
  // prefix sum → find positions
  for i from 1 to 9:
    count[i] += count[i-1]
  // build sorted output (backwards for stability)
  output = []
  for i from arr.length-1 to 0:
    digit = (arr[i] / exp) % 10
    output[ count[digit]-1 ] = arr[i]
    count[digit]--
  copy output → arr`}
            useCases={[
              "Sorting fixed-width integers (e.g. phone numbers, zip codes).",
              "When k (digit count) is small relative to n.",
              "Network packet sorting and IP address ordering.",
              "Faster than O(n log n) algorithms when k is constant.",
            ]}
            useCasesHi={[
              "Fixed-width integers sort karne ke liye (phone numbers, PIN codes).",
              "Jab numbers mein digits ki count (k) chhoti ho.",
              "Network packets aur IP addresses sort karne mein use hota hai.",
              "Jab k constant ho toh O(n log n) algorithms se bhi fast hota hai.",
            ]}
            howItWorks={{
              en: [
                { icon: "1️⃣", text: "Find the maximum number to know how many digit passes are needed (k = number of digits in max)." },
                { icon: "2️⃣", text: "Pass 1 — Units digit (1s place): Sort all numbers based only on their last digit." },
                { icon: "3️⃣", text: "Pass 2 — Tens digit (10s place): Re-sort the array based on the second-last digit. Keep it stable!" },
                { icon: "4️⃣", text: "Pass 3 — Hundreds digit (if needed): Sort by the third digit. Numbers with fewer digits treat missing digits as 0." },
                { icon: "5️⃣", text: "Each pass uses Counting Sort internally — O(n + 10) = O(n) per pass." },
                { icon: "✅", text: "After k passes, every number is in its final sorted position!" },
              ],
              hi: [
                { icon: "1️⃣", text: "Sabse bada number dhundho — kitne passes lagengie yeh pata chalega (k = max number mein digits)." },
                { icon: "2️⃣", text: "Pass 1 — Units digit (1s): Sirf last digit dekh ke sort karo." },
                { icon: "3️⃣", text: "Pass 2 — Tens digit (10s): Ab second-last digit se sort karo. Stable rakhna zaroori hai!" },
                { icon: "4️⃣", text: "Pass 3 — Hundreds digit (agar zaroorat ho): Teesre digit se sort karo. Chhote numbers ke liye missing digit = 0." },
                { icon: "5️⃣", text: "Har pass mein Counting Sort use hota hai — O(n + 10) = O(n) per pass." },
                { icon: "✅", text: "k passes ke baad, har number apni sahi sorted jagah par!" },
              ]
            }}
            example={{
              array: [170, 45, 75, 90, 802, 24, 2, 66],
              steps: [
                { desc: "Array: [170, 45, 75, 90, 802, 24, 2, 66]. Max = 802 → 3 digit passes needed.", descHi: "Array hai [170, 45, 75, 90, 802, 24, 2, 66]. Sabse bada 802 hai — 3 digits hain, toh 3 passes lagenge.", array: [170, 45, 75, 90, 802, 24, 2, 66], highlight: [0, 1, 2, 3, 4, 5, 6, 7] },
                { desc: "Pass 1 — Units digit (1s place). Extract last digit of each number.", descHi: "Pass 1 — Units digit. Har number ka last digit dekho:", array: [170, 45, 75, 90, 802, 24, 2, 66], highlight: [0, 1, 2, 3, 4, 5, 6, 7] },
                { desc: "Digits: 170→0, 45→5, 75→5, 90→0, 802→2, 24→4, 2→2, 66→6. Sort by these digits.", descHi: "Last digits: 170→0, 45→5, 75→5, 90→0, 802→2, 24→4, 2→2, 66→6. Inhi se sort karo.", array: [170, 90, 802, 2, 24, 45, 75, 66], highlight: [0, 1, 2, 3, 4, 5, 6, 7] },
                { desc: "After Pass 1: [170, 90, 802, 2, 24, 45, 75, 66]. Sorted by units digit! (0s first, then 2s, 4, 5s, 6)", descHi: "Pass 1 ke baad: [170, 90, 802, 2, 24, 45, 75, 66]. Units digit se sort ho gaya!", array: [170, 90, 802, 2, 24, 45, 75, 66], highlight: [0, 1, 2, 3, 4, 5, 6, 7] },
                { desc: "Pass 2 — Tens digit (10s place). Extract tens digit from each number.", descHi: "Pass 2 — Tens digit. Ab doosri digit dekho (tens place):", array: [170, 90, 802, 2, 24, 45, 75, 66], highlight: [0, 1, 2, 3, 4, 5, 6, 7] },
                { desc: "Tens digits: 170→7, 90→9, 802→0, 2→0, 24→2, 45→4, 75→7, 66→6. Sort by tens digit.", descHi: "Tens digits: 170→7, 90→9, 802→0, 2→0, 24→2, 45→4, 75→7, 66→6. Inse sort karo.", array: [802, 2, 24, 45, 66, 170, 75, 90], highlight: [0, 1, 2, 3, 4, 5, 6, 7] },
                { desc: "After Pass 2: [802, 2, 24, 45, 66, 170, 75, 90]. Now sorted by last two digits!", descHi: "Pass 2 ke baad: [802, 2, 24, 45, 66, 170, 75, 90]. Ab last do digits ke hisaab se sort hai!", array: [802, 2, 24, 45, 66, 170, 75, 90], highlight: [0, 1, 2, 3, 4, 5, 6, 7] },
                { desc: "Pass 3 — Hundreds digit (100s place). Numbers with fewer than 3 digits use 0 for missing hundreds.", descHi: "Pass 3 — Hundreds digit. 3 se kam digits wale numbers ke liye hundreds digit = 0 maano.", array: [802, 2, 24, 45, 66, 170, 75, 90], highlight: [0, 1, 2, 3, 4, 5, 6, 7] },
                { desc: "Hundreds digits: 2→0, 24→0, 45→0, 66→0, 75→0, 90→0, 170→1, 802→8. Sort!", descHi: "Hundreds digits: chhote numbers ke 0, 170 ka 1, 802 ka 8. Ab sort karo!", array: [2, 24, 45, 66, 75, 90, 170, 802], highlight: [0, 1, 2, 3, 4, 5, 6, 7] },
                { desc: "After all 3 passes: [2, 24, 45, 66, 75, 90, 170, 802]. Fully sorted — no comparisons made! ✨", descHi: "Teeno passes ke baad: [2, 24, 45, 66, 75, 90, 170, 802]. Poora sort ho gaya — bina kisi comparison ke! ✨", array: [2, 24, 45, 66, 75, 90, 170, 802], highlight: [0, 1, 2, 3, 4, 5, 6, 7] },
              ]
            }}
            code={{
              language: "JavaScript",
              content: `function radixSort(arr) {
  const max = Math.max(...arr);
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    countingSortByDigit(arr, exp);
  }
  return arr;
}

function countingSortByDigit(arr, exp) {
  const n = arr.length;
  const output = new Array(n).fill(0);
  const count  = new Array(10).fill(0);

  for (let i = 0; i < n; i++) {
    count[Math.floor(arr[i] / exp) % 10]++;
  }
  for (let i = 1; i < 10; i++) {
    count[i] += count[i - 1];
  }
  for (let i = n - 1; i >= 0; i--) {
    const digit = Math.floor(arr[i] / exp) % 10;
    output[--count[digit]] = arr[i];
  }
  for (let i = 0; i < n; i++) arr[i] = output[i];
}`
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
              <p className="text-sm font-light text-white/50">Enter positive integers (2–20 values). Works best with varied digit counts!</p>
              <input
                type="text"
                autoFocus
                value={inputText}
                onChange={e => { setInputText(e.target.value); setInputError(""); }}
                onKeyDown={e => e.key === "Enter" && handleApplyInput()}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-lime outline-none focus:border-lime/50 transition-all font-mono"
                placeholder="e.g. 170, 45, 75, 90, 802"
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
