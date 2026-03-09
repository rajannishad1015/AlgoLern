"use client";

import { useEffect, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateLinkedListSteps } from "@/lib/algorithms/data-structures/linkedListOperations";
import { LinkedListViz } from "@/components/d3/LinkedListViz";
import { ControlBar } from "@/components/visualizer/ControlBar";

export default function LinkedListPage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const operations = [
      { type: 'insertHead', value: 10 },
      { type: 'insertTail', value: 20 },
      { type: 'insertTail', value: 30 },
      { type: 'insertHead', value: 5 },
      { type: 'deleteHead' },
      { type: 'deleteTail' },
      { type: 'insertTail', value: 40 },
  ] as any;

  const {
    steps,
    currentStepIndex,
    isPlaying,
    speed,
    setSteps,
    setIsPlaying,
    setSpeed,
    stepForward,
    stepBackward,
    resetVisualizer,
    setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("linked-list");
    const generatedSteps = generateLinkedListSteps(operations);
    setSteps(generatedSteps);

    return () => {
      resetVisualizer();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [setSteps, resetVisualizer, setAlgorithmId]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (currentStepIndex < steps.length - 1) {
          stepForward();
        } else {
          setIsPlaying(false);
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, speed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, steps.length, speed, stepForward, setIsPlaying]);

  const handleReset = () => {
    resetVisualizer();
  };

  const currentStepData = steps[currentStepIndex];

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold text-text-primary">Singly Linked List</h1>
        <p className="text-text-secondary">
          A fundamental data structure where each node points to the next node in the sequence. Visualizing insertions and deletions.
        </p>
      </div>

      <div className="flex-1 min-h-[400px]">
        <LinkedListViz currentStepData={currentStepData} />
      </div>

      <div className="bg-bg-card border border-border rounded-lg p-4 transition-all flex items-center gap-4">
         <span className="px-3 py-1 bg-accent-success/20 text-emerald-400 rounded font-mono text-sm border border-emerald-500/30 uppercase">
             {currentStepData?.type || 'init'}
        </span>
        <p className="text-text-primary font-mono text-sm max-w-[800px]">
           {currentStepData?.description || "Ready to visualize..."}
        </p>
      </div>

      <ControlBar
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onStepForward={stepForward}
        onStepBackward={stepBackward}
        onReset={handleReset}
        onSpeedChange={setSpeed}
        isPlaying={isPlaying}
        currentStep={currentStepIndex}
        totalSteps={steps.length}
        speed={speed}
      />
    </div>
  );
}
