"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateQuickSortSteps } from "@/lib/algorithms/sorting/quickSort";
import { ArrayViz } from "@/components/d3/ArrayViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { Shuffle } from "lucide-react";

const DEFAULT_ARRAY = [50, 20, 80, 10, 90, 30, 70, 40];
const randomArray = () => Array.from({ length: 8 }, () => Math.floor(Math.random() * 95) + 5);

export default function QuickSortPage() {
  const [data, setData] = useState<number[]>(DEFAULT_ARRAY);
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

  const handleApply = () => {
    const parsed = inputText.split(/[\s,]+/).filter(Boolean).map(Number);
    if (parsed.some(isNaN) || parsed.length < 2 || parsed.length > 20) { setInputError("Enter 2–20 numbers."); return; }
    setInputError(""); setData(parsed); resetVisualizer();
  };
  const handleShuffle = () => { const a = randomArray(); setData(a); setInputText(a.join(", ")); setInputError(""); resetVisualizer(); };

  const currentStepData = steps[currentStepIndex];

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 gap-4">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary">Quick Sort</h1>
          <p className="text-text-secondary mt-1 text-sm max-w-lg">Picks a pivot element and partitions the array so all elements smaller than pivot come before it, larger come after. Recursively sorts partitions.</p>
        </div>
        <div className="flex flex-col gap-2 bg-bg-card border border-border rounded-xl p-4 min-w-[280px]">
          <span className="text-xs font-mono text-text-muted uppercase tracking-wider">Custom Array</span>
          <div className="flex gap-2">
            <input type="text" value={inputText} onChange={e => { setInputText(e.target.value); setInputError(""); }} onKeyDown={e => e.key === "Enter" && handleApply()} placeholder="e.g. 5, 3, 8, 1" className="flex-1 bg-bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary font-mono focus:outline-none focus:border-accent-primary" />
            <button onClick={handleShuffle} className="p-2 rounded-lg border border-border bg-bg-secondary hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors" title="Random"><Shuffle size={16} /></button>
          </div>
          <button onClick={handleApply} className="w-full py-1.5 rounded-lg bg-accent-primary hover:opacity-90 text-white text-sm font-medium">Apply & Visualize</button>
          {inputError && <p className="text-xs text-red-400 font-mono">{inputError}</p>}
        </div>
      </div>

      <div className="flex-1 min-h-[320px]"><ArrayViz data={data} currentStepData={currentStepData} /></div>

      <div className="bg-bg-card border border-border rounded-lg p-4 flex items-center gap-4">
        <span className={`px-2.5 py-1 rounded font-mono text-xs uppercase shrink-0 ${currentStepData?.type === 'highlight' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : currentStepData?.type === 'swap' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : currentStepData?.type === 'compare' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : currentStepData?.type === 'done' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-accent-secondary/20 text-accent-secondary border border-accent-secondary/30'}`}>{currentStepData?.type || 'init'}</span>
        <p className="text-text-primary font-mono text-sm">{currentStepData?.description || "Ready to visualize..."}</p>
      </div>

      <ControlBar onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onStepForward={stepForward} onStepBackward={stepBackward} onReset={resetVisualizer} onSpeedChange={setSpeed} isPlaying={isPlaying} currentStep={currentStepIndex} totalSteps={steps.length} speed={speed} />

      <TheoryCard
        title="Quick Sort"
        description="Quick Sort is a highly efficient in-place divide-and-conquer sorting algorithm. It selects a pivot and partitions the array such that all elements less than the pivot are on the left, all greater are on the right. It then recursively sorts both partitions. Average performance is excellent due to cache efficiency."
        complexities={[
          { case: "Best", time: "O(n log n)", space: "O(log n)" },
          { case: "Average", time: "O(n log n)", space: "O(log n)" },
          { case: "Worst", time: "O(n²)", space: "O(n)" },
        ]}
        pseudocode={`procedure quickSort(arr, low, high):
  if low < high:
    pivotIdx = partition(arr, low, high)
    quickSort(arr, low, pivotIdx - 1)
    quickSort(arr, pivotIdx + 1, high)

procedure partition(arr, low, high):
  pivot = arr[high]
  i = low - 1
  for j = low to high-1:
    if arr[j] <= pivot:
      i++
      swap(arr[i], arr[j])
  swap(arr[i+1], arr[high])
  return i + 1`}
        useCases={[
          "General-purpose sorting (best average-case performance)",
          "In-place sorting when O(n) extra space is not available",
          "Cache-friendly sorting (great memory locality)",
          "Used in most standard library sort() implementations",
        ]}
      />
    </div>
  );
}
