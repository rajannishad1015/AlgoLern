"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateQuickSortSteps } from "@/lib/algorithms/sorting/quickSort";
import { ArrayViz } from "@/components/d3/ArrayViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { Shuffle } from "lucide-react";

const DEFAULT_ARRAY = [50, 20, 80, 10, 90, 30, 70, 40];
const randomArray = () => Array.from({ length: 8 }, () => Math.floor(Math.random() * 95) + 5);

export default function QuickSortPage() {
  const [data, setData] = useState<number[]>(DEFAULT_ARRAY);
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputText, setInputText] = useState(DEFAULT_ARRAY.join(", "));
  const [inputError, setInputError] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { steps, currentStepIndex, isPlaying, speed, setSteps, setIsPlaying, setSpeed, stepForward, stepBackward, resetVisualizer, setAlgorithmId } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("quick-sort");
    setSteps(generateQuickSortSteps(data));
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
    setInputError(""); setData(parsed); resetVisualizer(); setShowInputModal(false);
  };
  const handleShuffle = () => { const a = randomArray(); setData(a); setInputText(a.join(", ")); setInputError(""); resetVisualizer(); };

  const currentStepData = steps[currentStepIndex];

  const formattedDescription = currentStepData?.description
    ? currentStepData.description
        .replace(/\b(\d+)\b/g, '<span class="text-[var(--lime-dark)] dark:text-lime font-bold">$1</span>')
        + `<span class="text-indigo-400 italic ml-2">(Next: ${
            currentStepData.type === 'compare'   ? 'Compare Elements' :
            currentStepData.type === 'highlight' ? 'Pivot' :
            currentStepData.type === 'swap'      ? 'Swap' :
            currentStepData.type === 'sorted'    ? 'Partition Good' : 'Run'
          })</span>`
    : "Awaiting execution parameters.";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Quick Sort"
        description="A highly efficient in-place divide-and-conquer sorting algorithm. Selects a pivot, partitions around it, and recursively sorts."
        complexity={{ time: 'n log n', space: 'log n', difficulty: 'Hard' }}
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
            title="Quick Sort"
            description="Quick Sort is a highly efficient in-place divide-and-conquer sorting algorithm. It selects a pivot and partitions the array such that all elements less than the pivot are on the left, all greater are on the right. It then recursively sorts both partitions. Average performance is excellent due to cache efficiency."
            descriptionHi="Quick Sort duniya ka sabse mashhoor aur tez sorting algorithm hai. Yeh ek 'Pivot' (ek number jisko hum reference ke liye choose karte hain) chunta hai aur array ko do hisson mein baant deta hai: pivot se chhote numbers ek taraf, aur bade numbers doosri taraf. Phir dono hisson ko recursively sort karta hai."
            analogy={{
              icon: "🎯",
              title: "Target Partitioning",
              titleHi: "Nishana Partnering (Pivot)",
              desc: "Imagine you're sorting books by height. You pick one book as a reference (pivot). Every book shorter than it goes to its left, and every taller book goes to its right. Now you have two smaller piles and the reference book is in its final perfect spot. Repeat for the piles!",
              descHi: "Sochiye aap logon ko height ke hisaab se khada kar rahe hain. Aap ek bande ko nishana (pivot) banate hain. Usse chhote sab log uske left mein, aur bade sab log uske right mein. Ab woh banda apni sahi jagah pe hai! Phir yahi cheez bache huye logon ke saath karein."
            }}
            readingTip={{
              en: "The pivot selection is critical. While picking the last element is common, picking a random pivot or the median helps avoid the O(n²) worst-case performance on sorted data.",
              hi: "Pivot chun-na sabse zaroori hai. Aakhiri element ko pivot banana simple hai, lekin random pivot lene se algorithm hamesha fast rehta hai, chahe data pehle se sorted hi kyun na ho."
            }}
            quote={{
              en: "\"QuickSort is arguably the most efficient sorting algorithm in practice for large arrays. It's the engine behind most programming languages' default sort functions.\"",
              hi: "\"QuickSort bade arrays ke liye duniya ka sabse tez algorithm hai. Zyadatar programming languages iska hi use karti hain kyunki yeh memory aur speed dono mein top hai.\""
            }}
            complexities={[
              { case: "Best", time: "n log n", space: "log n", note: "Pivot always splits array into equal halves." },
              { case: "Average", time: "n log n", space: "log n", note: "Random pivot usually yields balanced partitions." },
              { case: "Worst", time: "n²", space: "n", note: "Pivot is always smallest/largest (e.g., sorted array)." },
            ]}
            pseudocode={`procedure quickSort(arr, low, high):
  if low < high:
    p = partition(arr, low, high)
    quickSort(arr, low, p - 1)
    quickSort(arr, p + 1, high)

procedure partition(arr, low, high):
  pivot = arr[high]
  // move smaller elements to left of pivot
  return pivotIndex`}
            useCases={[
              "General-purpose sorting (best average-case performance)",
              "In-place sorting when O(n) extra space is not available",
              "Cache-friendly sorting (great memory locality)",
              "Used in most standard library sort() implementations",
            ]}
            useCasesHi={[
              "Har jagah use hone wala algorithm (sabse tez average speed).",
              "Jab memory bachaani ho (In-place sorting).",
              "Modern CPUs ke liye best (Cache-friendly).",
              "Zyadatar language libraries iska default use karti hain.",
            ]}
            howItWorks={{
              en: [
                { icon: "1️⃣", text: "Pick the last element as the Pivot (reference number)." },
                { icon: "2️⃣", text: "Go through the array left to right. Compare each element with the Pivot." },
                { icon: "3️⃣", text: "If an element is SMALLER than Pivot, swap it to the left partition." },
                { icon: "4️⃣", text: "After scanning all elements, place the Pivot in its correct final position." },
                { icon: "5️⃣", text: "Now repeat the same process for the left and right sub-arrays." },
                { icon: "✅", text: "When every sub-array has one element, the whole array is sorted!" },
              ],
              hi: [
                { icon: "1️⃣", text: "Array ke last number ko Pivot (reference number) bana lo." },
                { icon: "2️⃣", text: "Baki sab numbers ko left se right compare karo — ek ek karke Pivot se milao." },
                { icon: "3️⃣", text: "Jo number Pivot se CHHOTA ho, usse left side par rakh do. Bade wale right side par jaate hain." },
                { icon: "4️⃣", text: "Sab numbers compare hone ke baad, Pivot ko beech mein uski sahi jagah par rakh do." },
                { icon: "5️⃣", text: "Ab yahi kaam left wale numbers par alag se karo, aur right wale par alag se." },
                { icon: "✅", text: "Jab tak sab chhote group me ek hi number bache, tab tak karte raho — Array sort ho jaata hai!" },
              ]
            }}
            example={{
              array: [6, 3, 8, 2, 5],
              steps: [
                { desc: "Array: [6, 3, 8, 2, 5]. Last element 5 is our Pivot (reference number).", descHi: "Array hai [6, 3, 8, 2, 5]. Last number 5 hamara Pivot (reference number) hai — isko hum sab se compare karenge.", array: [6, 3, 8, 2, 5], highlight: [4] },
                { desc: "Compare 6 with Pivot 5. 6 is bigger! 6 should go to the right side. We mark this spot.", descHi: "6 ko 5 se compare kiya — 6 bada hai! 6 ko right side par jaana chahiye. Is jagah ko yaad rakhte hain.", array: [6, 3, 8, 2, 5], highlight: [0, 4] },
                { desc: "Compare 3 with Pivot 5. 3 is smaller. Since 6 was out of place, SWAP 3 and 6!", descHi: "3 ko 5 se compare kiya — 3 chhota hai. Pehle 6 galat jagah tha, toh ab 3 aur 6 ko swap kar diya! Dono sahi jagah aa gaye.", array: [3, 6, 8, 2, 5], highlight: [0, 1] },
                { desc: "Compare 8 with Pivot 5. 8 is bigger! It goes to the right. Mark this spot too.", descHi: "8 ko 5 se compare kiya — 8 bada hai, yeh bhi right side par jaayega. Is jagah ko bhi yaad rakhte hain.", array: [3, 6, 8, 2, 5], highlight: [2, 4] },
                { desc: "Compare 2 with Pivot 5. 2 is smaller. Since 6 was out of place, SWAP 2 and 6!", descHi: "2 ko 5 se compare kiya — 2 chhota hai. Is baar 6 galat jagah par tha, toh 2 aur 6 ko swap kar diya!", array: [3, 2, 8, 6, 5], highlight: [1, 3] },
                { desc: "All compared! Now put Pivot 5 in its final position — SWAP 5 and 8. Pivot 5 is permanently placed!", descHi: "Saare numbers compare ho gaye! Ab Pivot 5 ko uski sahi jagah par rakhte hain — 5 aur 8 ko swap kiya. Ab 5 ke left mein sab chhote, right mein sab bade. 5 set ho gaya!", array: [3, 2, 5, 6, 8], highlight: [2] },
                { desc: "Now sort Left [3, 2] and Right [6, 8] separately the same way. Array fully sorted! ✨", descHi: "Ab yahi Left wale [3, 2] par alag se karo, Right wale [6, 8] par alag se. Sab apni sahi jagah aa jaate hain — Array sort ho gaya! ✨", array: [2, 3, 5, 6, 8], highlight: [0, 1, 2, 3, 4] },
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
