"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateShellSortSteps } from "@/lib/algorithms/sorting/shellSort";
import { ArrayViz } from "@/components/d3/ArrayViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";

// Fixed initial array that clearly shows gap sorting benefits
const DEFAULT_ARRAY = [62, 23, 85, 12, 45, 91, 38, 54];
const randomArray = () => Array.from({ length: 8 }, () => Math.floor(Math.random() * 90) + 10);

export default function ShellSortPage() {
  const [data, setData] = useState<number[]>(DEFAULT_ARRAY);
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputText, setInputText] = useState(DEFAULT_ARRAY.join(", "));
  const [inputError, setInputError] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { steps, currentStepIndex, isPlaying, speed, setSteps, setIsPlaying, setSpeed, stepForward, stepBackward, resetVisualizer, setAlgorithmId } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("shell-sort");
    setSteps(generateShellSortSteps(data));
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

  // Parse gap size from description if available
  let currentGap = "1";
  if (currentStepData?.description) {
    const gapMatch = currentStepData.description.match(/distance (\d+)|gap distance configured to (\d+)/i);
    if (gapMatch) currentGap = gapMatch[1] || gapMatch[2];
  }

  const formattedDescription = currentStepData?.description
    ? currentStepData.description
        .replace(/\b(\d+)\b/g, '<span class="text-[var(--lime-dark)] dark:text-lime font-bold">$1</span>')
        + `<span class="text-indigo-400 italic ml-2">(Next: ${
            currentStepData.type === 'compare'   ? 'Compare Elements' :
            currentStepData.type === 'highlight' ? 'Select / Set Gap' :
            currentStepData.type === 'swap'      ? 'Shift Across Gap' :
            currentStepData.type === 'insert'    ? 'Insert Element' :
            currentStepData.type === 'sorted'    ? 'Sorted' : 'Run'
          })</span>`
    : "Awaiting execution parameters.";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Shell Sort"
        description="A highly efficient variation of Insertion Sort that compares and moves elements that are far apart, progressively shrinking the gap until the array is completely sorted."
        complexity={{ time: 'n log² n', space: '1', difficulty: 'Medium' }}
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
            title="Shell Sort"
            description="Shell Sort is an optimization of Insertion Sort. In standard Insertion Sort, elements move only one position at a time. Shell Sort fixes this by comparing elements separated by a 'gap'. It starts with a large gap to move out-of-place elements quickly, then reduces the gap in each pass. The final pass uses a gap of 1, functioning exactly like a normal Insertion Sort, but on a nearly-sorted array where it is lightning fast."
            descriptionHi="Shell Sort asal mein Insertion Sort ka ek update (optimization) hai. Insertion Sort mein numbers sirf ek-ek step khiskate hain. Shell Sort is problem ko solve karta hai ek 'gap' use karke — pehle door-door wale numbers ko compare karke sahi jagah bhejta hai, phir gap ko dheere-dheere kam karta hai. Aakhiri round mein gap 1 ho jaata hai, jo bilkul Insertion Sort jaisa hai, lekin kyunki array pehle se hi kaafi had tak set ho chuka hota hai, yeh bohot fast kaam karta hai."
            analogy={{
              icon: "🏃‍♂️",
              title: "The Long Jump to Short Steps",
              titleHi: "Lambi Chhalaang se Chhote Kadam",
              desc: "Imagine trying to cross a rocky stream. First, you take big leaps (large gap) to cover distance quickly. As you get closer to the other side, your jumps get shorter (reduced gap). Finally, you take tiny baby steps (gap = 1) to perfectly land on the exact spot. Shell Sort moves data the exact same way!",
              descHi: "Sochiye aap pathrile raaste par chal rahe hain. Shuru mein aap lambi chhalaang (large gap) maarte hain taaki jaldi aage badh sakein. Jaise-jaise aap target ke paas pohnchte hain, aapke kadam chhote (reduced gap) hote jaate hain. Ant mein, aap bilkul chhote kadam (gap = 1) lete hain sahi jagah khade hone ke liye. Shell Sort data ko bilkul aise hi move karta hai!"
            }}
            readingTip={{
              en: "The secret to Shell Sort's speed is its 'Gap Sequence'. The standard Donald Shell sequence is n/2, n/4, ..., 1. Better sequences (like Hibbard's or Sedgewick's) make the algorithm even faster!",
              hi: "Shell Sort ki speed ka raaz uski 'Gap Sequence' hai. Standard tarike mein gap n/2, n/4... karte hue 1 tak jaata hai. Kuch aur best sequences (jaise Hibbard ya Sedgewick) isko aur bhi fast bana dete hain!"
            }}
            quote={{
              en: '"By allowing long-distance exchanges early on, Shell Sort solves the tortoise problem of Insertion Sort, where small elements at the end take forever to reach the front."',
              hi: '"Shuru mein lambe-lambe jumps laagu karke, Shell Sort Insertion Sort ki us problem ko theek kar deta hai, jahan end ke chhote numbers ko aage aane mein bahut time lagta thaa."'
            }}
            complexities={[
              { case: "Best",    time: "n log n", space: "1", note: "When array is already sorted." },
              { case: "Average", time: "n log² n", space: "1", note: "Depends heavily on the chosen gap sequence." },
              { case: "Worst",   time: "n²", space: "1", note: "O(n²) for standard n/2 sequence. Can be O(n^1.5) with better gaps." },
            ]}
            pseudocode={`procedure shellSort(arr):
  n = arr.length

  // Start with a large gap, reduce it by half each time
  for gap = n/2 down to 1 (gap = gap/2):

    // Do a gapped Insertion Sort for this gap
    for i = gap to n-1:
      temp = arr[i]
      j = i

      // Fast shift larger elements across the gap
      while j >= gap and arr[j - gap] > temp:
        arr[j] = arr[j - gap]
        j = j - gap

      // Insert the original temp value
      arr[j] = temp`}
            useCases={[
              "Sorting medium-sized arrays (up to ~10,000 elements).",
              "Embedded systems where memory is extremely tight (O(1) space).",
              "When an algorithm simpler than Quick Sort/Merge Sort is preferred.",
              "As a fallback inside standard library sorting implementations.",
            ]}
            useCasesHi={[
              "Medium size ke arrays ko sort karne ke liye (lagbhag 10,000 items tak).",
              "Hardware aur embedded systems jahan memory bilkul nahi hoti (sirf O(1) space).",
              "Jab Quick Sort ya Merge Sort ka complex code nahi likhna ho.",
              "C/C++ ki purani standard libraries mein default sort ke taur par use hota tha.",
            ]}
            howItWorks={{
              en: [
                { icon: "1️⃣", text: "Choose an initial gap (usually half the array length)." },
                { icon: "2️⃣", text: "Compare elements separated by this gap. If the left one is bigger, swap them." },
                { icon: "3️⃣", text: "Move one step right and compare the next gap-separated pair. Repeat for the whole array." },
                { icon: "4️⃣", text: "Halve the gap. The array is now partially sorted, enabling faster moves." },
                { icon: "5️⃣", text: "Repeat the gapped comparisons and swaps for the new smaller gap." },
                { icon: "✅", text: "The final pass uses gap = 1 (pure Insertion Sort). Since the array is mostly sorted, it finishes instantly!" },
              ],
              hi: [
                { icon: "1️⃣", text: "Sabse pehle ek gap chuno (aam taur par array ki length ka aadha)." },
                { icon: "2️⃣", text: "Us gap ki doori par मौजूद elements ko compare karo. Agar left wala bada ho, toh unhe swap karo." },
                { icon: "3️⃣", text: "Ek step aage badho aur agle pair ko compare karo. Poore array mein yahi karo." },
                { icon: "4️⃣", text: "Ab gap ko aadha kar do. Array ab kaafi had tak sort ho chuka hoga." },
                { icon: "5️⃣", text: "Naye chhote gap ke saath yahi comparisons aur swaps dobara karo." },
                { icon: "✅", text: "Aakhiri round mein gap = 1 hota hai (jo ki normal Insertion Sort hai). Array pehle hi set hone ki wajah se yeh turant sort ho jaata hai!" },
              ]
            }}
            example={{
              array: [62, 23, 85, 12, 45, 91, 38, 54],
              steps: [
                { desc: "Array: [62, 23, 85, 12, 45, 91, 38, 54]. Length n = 8. Let's start with Gap = n/2 = 4.", descHi: "Array hai [62, 23, 85, 12, 45, 91, 38, 54]. n=8 hai. Hum gap = 4 (yani 8/2) se shuru karenge.", array: [62, 23, 85, 12, 45, 91, 38, 54], highlight: [0, 4] },
                { desc: "Gap = 4. Compare 62 (index 0) and 45 (index 4). 62 > 45, so SWAP!", descHi: "Gap = 4. 62 aur 45 ko compare kiya. 62 bada hai, toh donon ko swap kiya!", array: [45, 23, 85, 12, 62, 91, 38, 54], highlight: [0, 4] },
                { desc: "Gap = 4. Compare 23 (index 1) and 91 (index 5). 23 < 91, so no swap.", descHi: "Gap = 4. 23 aur 91 ko compare kiya. 23 chhota hai, theek jagah par hai, toh leave it.", array: [45, 23, 85, 12, 62, 91, 38, 54], highlight: [1, 5] },
                { desc: "Gap = 4. Compare 85 (index 2) and 38 (index 6). 85 > 38, so SWAP!", descHi: "Gap = 4. 85 aur 38 ko compare kiya. 85 bada hai, toh donon ko swap kiya!", array: [45, 23, 38, 12, 62, 91, 85, 54], highlight: [2, 6] },
                { desc: "Gap = 4. Compare 12 (index 3) and 54 (index 7). 12 < 54, so no swap.", descHi: "Gap = 4. 12 aur 54 ko compare kiya. Theek hai, koi swap nahi.", array: [45, 23, 38, 12, 62, 91, 85, 54], highlight: [3, 7] },
                { desc: "Gap = 4 complete! Now half the gap: Gap = 2.", descHi: "Gap 4 ka round khatam! Ab gap ko aadha karte hain: Naya Gap = 2.", array: [45, 23, 38, 12, 62, 91, 85, 54], highlight: [] },
                { desc: "Gap = 2. Compare 45 (idx 0) and 38 (idx 2). SWAP! Then compare 23 and 12. SWAP!", descHi: "Gap = 2. Ab dono ki doori par check karenge. 45 aur 38 ko swap kiya. Phir 23 aur 12 ko swap kiya.", array: [38, 12, 45, 23, 62, 91, 85, 54], highlight: [0, 2, 1, 3] },
                { desc: "Fast forward Gap = 2... Small elements are moving quickly to the front!", descHi: "Gap = 2 aise hi chalega... Notice karo ki chhote numbers jaldi-jaldi aage ki taraf aa rahe hain!", array: [38, 12, 45, 23, 62, 54, 85, 91], highlight: [] },
                { desc: "Gap = 2 complete! Now final pass: Gap = 1 (Pure Insertion Sort).", descHi: "Gap 2 ka round khatam! Aakhiri round: Gap = 1 (Bilkul Insertion Sort jaisa).", array: [38, 12, 45, 23, 62, 54, 85, 91], highlight: [] },
                { desc: "Gap = 1. Compare 38 and 12. SWAP! Then 45 and 23. SWAP! Array is fully sorted! ✨", descHi: "Gap = 1. Saath wale numbers compare honge. Array lagbhag sort ho hi chuka tha, toh yeh turant sort ho gaya! ✨", array: [12, 23, 38, 45, 54, 62, 85, 91], highlight: [0, 1, 2, 3, 4, 5, 6, 7] },
              ]
            }}
            code={{
              language: "JavaScript",
              content: `function shellSort(arr) {
  const n = arr.length;

  // Start with a large gap, reduce it by half
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    
    // Gapped Insertion Sort
    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j = i;

      // Fast shift larger elements across the gap
      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap];
        j -= gap;
      }
      
      // Place the element
      arr[j] = temp;
    }
  }
  return arr;
}`
            }}
          />
        }
      >
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          <div className="absolute top-4 right-4 md:right-6 z-20 flex flex-col items-end gap-2">
            <div className="flex flex-col items-end text-xs font-mono bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-700 dark:text-indigo-400 backdrop-blur-sm px-3 py-2 rounded-lg border border-indigo-500/20">
              <span className="uppercase tracking-[0.2em] font-bold text-[9px] md:text-[10px] mb-1 opacity-80">Current Gap</span>
              <span className="font-black text-lg">{currentGap}</span>
            </div>
            <div className="flex flex-col items-end text-xs font-mono bg-white/80 dark:bg-[#0d0f1a]/80 backdrop-blur-sm p-2 rounded-lg border border-black/5 dark:border-white/5">
              <span className="text-black/40 dark:text-slate-500 uppercase tracking-[0.2em] font-bold text-[9px] md:text-[10px] mb-1">Execution Status</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">Step: {currentStepIndex}</span>
            </div>
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
                placeholder="e.g. 62, 23, 85, 12, 45"
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
