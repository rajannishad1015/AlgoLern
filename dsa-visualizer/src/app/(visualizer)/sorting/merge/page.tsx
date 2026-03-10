"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateMergeSortSteps } from "@/lib/algorithms/sorting/mergeSort";
import { ArrayViz } from "@/components/d3/ArrayViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { Shuffle } from "lucide-react";

const DEFAULT_ARRAY = [50, 20, 80, 10, 90, 30, 70, 40];
const randomArray = () => Array.from({ length: 8 }, () => Math.floor(Math.random() * 95) + 5);

export default function MergeSortPage() {
  const [data, setData] = useState<number[]>(DEFAULT_ARRAY);
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputText, setInputText] = useState(DEFAULT_ARRAY.join(", "));
  const [inputError, setInputError] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { steps, currentStepIndex, isPlaying, speed, setSteps, setIsPlaying, setSpeed, stepForward, stepBackward, resetVisualizer, setAlgorithmId } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("merge-sort");
    setSteps(generateMergeSortSteps(data));
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
            currentStepData.type === 'highlight' ? 'Divide' :
            currentStepData.type === 'swap'      ? 'Swap' :
            currentStepData.type === 'update'    ? 'Merge Element' :
            currentStepData.type === 'sorted'    ? 'Pass Complete' : 'Run'
          })</span>`
    : "Awaiting execution parameters.";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Merge Sort"
        description="A divide-and-conquer algorithm that splits the array in half, recursively sorts each half, then merges the sorted halves back together."
        complexity={{ time: 'n log n', space: 'n', difficulty: 'Medium' }}
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
            title="Merge Sort"
            description="Merge Sort is a stable, divide-and-conquer sorting algorithm. It splits the array into two halves, recursively sorts them, then merges the two sorted halves using an auxiliary array. It guarantees O(n log n) time in all cases."
            descriptionHi="Merge Sort ek kamaal ka 'Divide and Conquer' (baanto aur jeeto) algorithm hai. Yeh list ko beecho-beech se tab tak todta hai jab tak har tukde me sirf ek number na bache. Phir un chote tukdon ko wapas jodte (merge) waqt sort karta jata hai. Sabse acchi baat? Yeh humesha bahut fast (O(n log n)) chalta hai."
            analogy={{
              icon: "🧩",
              title: "Solving a Puzzle",
              titleHi: "Jigsaw Puzzle Solve Karna",
              desc: "Imagine you have a giant puzzle. Instead of sorting all pieces at once, you divide it among friends. Each friend sorts their small pile. Then, you combine the sorted piles together step by step until the whole puzzle is done.",
              descHi: "Sochiye akele ek badi puzzle solve karne ki jagah, aap usko apne doston me baant dete hain. Har dost apna chota hissa solve kar leta hai. Phir aap sab mil kar un chhote suljhe hue hisson ko ek badi puzzle me jod (merge) dete hain."
            }}
        readingTip={{
          en: "The magic of Merge Sort is in the 'Merge' step. It takes two arrays that are ALREADY sorted, and efficiently combines them into one larger sorted array by always picking the smallest element from the front of either array.",
          hi: "Merge Sort ka asli jaadu 'Merge' step me hai. Yeh do aisi lists ko uthata hai jo pehle se hi sorted hain, aur unhe compare kar ke ek badi sorted list bana deta hai."
        }}
        quote={{
          en: "\"Merge Sort is the gold standard for predictable performance. Unlike QuickSort, it never degrades to O(n²), making it the safe choice for critical systems.\"",
          hi: "\"Merge Sort predictable performance ke liye jaana jaata hai. QuickSort ki tarah yeh kabhi bhi slow nahi padta, isiliye bade systems me yeh pehli pasand hota hai.\""
        }}
        complexities={[
          { case: "Best", time: "n log n", space: "n", note: "Always divides the work equally." },
          { case: "Average", time: "n log n", space: "n", note: "Performance is consistent across all data types." },
          { case: "Worst",   time: "n log n", space: "n", note: "Guaranteed O(n log n) even in worst case." },
        ]}
        pseudocode={`procedure mergeSort(arr, left, right):
  if left >= right: return
  mid = (left + right) / 2
  mergeSort(arr, left, mid)    ← divide left
  mergeSort(arr, mid+1, right)  ← divide right
  merge(arr, left, mid, right)  ← conquer/merge`}
        useCases={[
          "It is a Stable sort (equal elements stay in their original relative order).",
          "Excellent for sorting linked lists since it doesn't need random access.",
          "Perfect for external sorting (data that is too huge to fit in RAM).",
          "Used internally by Java's Collections.sort() for sorting objects.",
        ]}
        useCasesHi={[
          "Yeh Stable hai: matlab agar do same numbers aaye toh unka position aage-peeche nahi hota.",
          "Linked lists ko sort karne ke liye best algorithm maana jata hai.",
          "Jab data bahut bada ho (e.g. 100GB) aur memory me fit na ho toh yahi use hota hai.",
          "Java me Arrays ya Objects ko sort karne ke liye parde ke peeche yahi algorithm dorta hai.",
        ]}
        howItWorks={{
          en: [
            { icon: "1️⃣", text: "Split the array into two halves from the middle." },
            { icon: "2️⃣", text: "Keep splitting each half recursively until every piece has just 1 element." },
            { icon: "3️⃣", text: "A single element is always sorted on its own!" },
            { icon: "4️⃣", text: "Now merge two sorted pieces: compare their front elements, pick the smaller one first." },
            { icon: "5️⃣", text: "Keep merging sorted pairs into larger sorted groups, all the way back up." },
            { icon: "✅", text: "When all pieces are merged back into one, the array is fully sorted!" },
          ],
          hi: [
            { icon: "1️⃣", text: "Array ko beech se do hisso mein baant do." },
            { icon: "2️⃣", text: "Har hisse ko phir se aadha karo — tab tak jab tak ek-ek number alag na ho jaaye." },
            { icon: "3️⃣", text: "Ek akela number hamesha sorted hota hai!" },
            { icon: "4️⃣", text: "Ab do sorted groups ko merge karo: dono ke pehle numbers compare karo, jo chhota ho usse pehle rakho." },
            { icon: "5️⃣", text: "Aise karte karte chhote groups bade sorted groups bante jaate hain." },
            { icon: "✅", text: "Jab saare groups ek mein wapas jud jaayein, array poora sort ho jaata hai!" },
          ]
        }}
        example={{
          array: [38, 27, 43, 3, 9, 82, 10, 19],
          steps: [
            { desc: "Start with the full array [38, 27, 43, 3, 9, 82, 10, 19]. It's unsorted.", descHi: "Shuruat me pura 8-element array unsorted hai.", array: [38, 27, 43, 3, 9, 82, 10, 19], highlight: [0, 1, 2, 3, 4, 5, 6, 7] },
            { desc: "Divide in half! Left is [38, 27, 43, 3], Right is [9, 82, 10, 19].", descHi: "Beech se kaat diya! Left hissa 4 numbers ka, aur Right hissa 4 numbers ka.", array: [38, 27, 43, 3, 9, 82, 10, 19], highlight: [0, 1, 2, 3] },
            { desc: "Divide Left half further... [38, 27] and [43, 3]. Let's focus on [38, 27].", descHi: "Left hisse ko phir toda: [38, 27] aur [43, 3]. Pehle [38, 27] par focus karte hain.", array: [38, 27, 43, 3, 9, 82, 10, 19], highlight: [0, 1] },
            { desc: "Split into [38] and [27]. Compare 38 and 27. 27 is smaller, so it goes first.", descHi: "Akele-akele toda: [38] aur [27]. Dono ko compare kiya: 27 chhota hai, usko pehle rakha.", array: [27, 38, 43, 3, 9, 82, 10, 19], highlight: [0, 1] },
            { desc: "Now focus on [43, 3]. Split into [43] and [3]. Compare 43 and 3. 3 is smaller.", descHi: "Ab [43, 3] ki baari. Tod kar compare kiya: 3 chhota hai, usko pehle rakha.", array: [27, 38, 3, 43, 9, 82, 10, 19], highlight: [2, 3] },
            { desc: "Combine Left halves: [27, 38] and [3, 43]. Compare 27 and 3. 3 is smaller, so it goes first! Then 27 vs 43. 27 is smaller! Then 38 vs 43. 38 is smaller! Left half is sorted: [3, 27, 38, 43].", descHi: "Ab dono sorted arrays ko merge kiya: comparing 27 aur 3. 3 chhota hai, isiliye wo pehle aagya! Phir 27 aur 43 me 27 chhota hai. Phir 38 aur 43 me 38. Left half sort ho gaya!", array: [3, 27, 38, 43, 9, 82, 10, 19], highlight: [0, 1, 2, 3] },
            { desc: "Now the Right half! Split [9, 82, 10, 19] into [9, 82] and [10, 19]. Let's look at [9, 82].", descHi: "Ab chalte hain Right half par! Uske pehle 2 elements: [9, 82].", array: [3, 27, 38, 43, 9, 82, 10, 19], highlight: [4, 5] },
            { desc: "Split into [9] and [82]. Compare 9 and 82. Since 9 < 82, they stay as [9, 82].", descHi: "Tod kar compare kiya: 9 aur 82. 9 chhota hai, toh yeh order bilkul sahi hai.", array: [3, 27, 38, 43, 9, 82, 10, 19], highlight: [4, 5] },
            { desc: "Next focus on [10, 19]. Split into [10] and [19]. Compare 10 and 19. They stay as [10, 19].", descHi: "Ab aakhiri do bache: [10, 19]. Compare kiya, 10 chhota hai toh yeh bhi waise hi rahenge.", array: [3, 27, 38, 43, 9, 82, 10, 19], highlight: [6, 7] },
            { desc: "Combine Right halves: [9, 82] & [10, 19]. Compare 9 & 10. 9 is smaller! Compare 82 & 10. 10 is smaller! Compare 82 & 19. 19 is smaller! Only 82 left. Sorted: [9, 10, 19, 82].", descHi: "Same tareeke se in dono ko compare karke merge kiya: pehle 9, phir 10, phir 19, aakhir me 82 baaki reh gaya. Right half sorted!", array: [3, 27, 38, 43, 9, 10, 19, 82], highlight: [4, 5, 6, 7] },
            { desc: "Final Merge Preparation! We now have sorted Left [3, 27, 38, 43] and sorted Right [9, 10, 19, 82]. Ready to compare elements from both sides.", descHi: "Aakhiri Merge se pehle dono sorted halves taiyaar hain. Ab inke aapas mein elements compare honge.", array: [3, 27, 38, 43, 9, 10, 19, 82], highlight: [0, 1, 2, 3, 4, 5, 6, 7] },
            { desc: "Compare 3 vs 9. 3 goes first. Compare 27 vs 9. 9 goes next. Compare 27 vs 10. 10 is next. Compare 27 vs 19... And so on! Array fully sorted! ✨", descHi: "Dono list ke first numbers lagatar compare karte gaye aur jo chhota nikla use array me set karte gaye! Poora array sort ho gaya! ✨", array: [3, 9, 10, 19, 27, 38, 43, 82], highlight: [0, 1, 2, 3, 4, 5, 6, 7] }
          ]
        }}
        code={{
          language: "JavaScript",
          content: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  let result = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  
  return result.concat(left.slice(i)).concat(right.slice(j));
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
