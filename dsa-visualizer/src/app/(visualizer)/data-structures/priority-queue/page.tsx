"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generatePriorityQueueSteps, PQNode } from "@/lib/algorithms/data-structures/priorityQueue";
import { ControlBar } from "@/components/visualizer/ControlBar";

function PQViz({ heap, activeIndices }: { heap: PQNode[]; activeIndices: number[] }) {
  if (heap.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted font-mono text-sm">
        Priority Queue is empty
      </div>
    );
  }

  // Render as a visual min-heap tree using simple layout calculation
  const levels: PQNode[][] = [];
  let levelStart = 0;
  let levelSize = 1;
  while (levelStart < heap.length) {
    levels.push(heap.slice(levelStart, Math.min(levelStart + levelSize, heap.length)));
    levelStart += levelSize;
    levelSize *= 2;
  }

  const globalIndex = (levelIdx: number, nodeIdx: number): number => {
    let total = 0;
    for (let l = 0; l < levelIdx; l++) total += Math.pow(2, l);
    return total + nodeIdx;
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 h-full overflow-auto">
      <div className="text-xs font-mono text-text-muted mb-2">Min-Heap (lowest priority = highest priority)</div>
      {levels.map((level, li) => (
        <div key={li} className="flex gap-4 justify-center">
          {level.map((node, ni) => {
            const gi = globalIndex(li, ni);
            const isActive = activeIndices.includes(gi);
            return (
              <div
                key={ni}
                className={`flex flex-col items-center justify-center rounded-xl border-2 p-2 min-w-[64px] transition-colors ${
                  gi === 0 ? 'border-emerald-400 bg-emerald-400/10' :
                  isActive ? 'border-accent-primary bg-accent-primary/10' :
                  'border-border bg-bg-card'
                }`}
              >
                <div className="text-xs text-text-muted font-mono">P:{node.priority}</div>
                <div className="text-lg font-bold text-text-primary font-mono">{node.value}</div>
                <div className="text-[9px] text-text-muted font-mono">idx:{gi}</div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const defaultOps: { type: 'enqueue' | 'dequeue'; value?: number; priority?: number }[] = [
  { type: 'enqueue', value: 10, priority: 3 },
  { type: 'enqueue', value: 20, priority: 1 },
  { type: 'enqueue', value: 30, priority: 5 },
  { type: 'enqueue', value: 40, priority: 2 },
  { type: 'dequeue' },
  { type: 'enqueue', value: 50, priority: 1 },
  { type: 'dequeue' },
];

export default function PriorityQueuePage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [heap, setHeap] = useState<PQNode[]>([]);
  const [activeIndices, setActiveIndices] = useState<number[]>([]);

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("priority-queue");
    const generatedSteps = generatePriorityQueueSteps(defaultOps);
    setSteps(generatedSteps);
    return () => { resetVisualizer(); if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    const step = steps[currentStepIndex];
    if (step?.values?.heap) setHeap(step.values.heap as PQNode[]);
    setActiveIndices(step?.indices ?? []);
  }, [currentStepIndex, steps]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (currentStepIndex < steps.length - 1) stepForward();
        else { setIsPlaying(false); if (timerRef.current) clearInterval(timerRef.current); }
      }, speed);
    } else if (timerRef.current) { clearInterval(timerRef.current); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, currentStepIndex, steps.length, speed, stepForward, setIsPlaying]);

  const currentStepData = steps[currentStepIndex];

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 gap-4">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary">Priority Queue</h1>
        <p className="text-text-secondary mt-1">
          A Min-Heap where every element has a priority. The element with the lowest priority number is always dequeued first.
        </p>
      </div>

      <div className="flex-1 min-h-[350px] bg-bg-card border border-border rounded-xl overflow-hidden">
        <PQViz heap={heap} activeIndices={activeIndices} />
      </div>

      <div className="flex gap-3 text-xs font-mono">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm border-2 border-emerald-400 inline-block"></span>Root (min priority)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm border-2 border-accent-primary inline-block"></span>Active comparison</span>
      </div>

      <div className="bg-bg-card border border-border rounded-lg p-4">
        <p className="text-text-primary font-mono text-sm">{currentStepData?.description || "Ready to visualize..."}</p>
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
      />
    </div>
  );
}
