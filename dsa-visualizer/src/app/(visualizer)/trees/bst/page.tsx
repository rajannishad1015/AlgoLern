"use client";

import { useEffect, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateBSTSteps, BSTOperation } from "@/lib/algorithms/trees/bstOperations";
import { TreeViz } from "@/components/d3/TreeViz";
import { ControlBar } from "@/components/visualizer/ControlBar";

export default function BSTPage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const operations: BSTOperation[] = [
      { type: 'insert', value: 50 },
      { type: 'insert', value: 30 },
      { type: 'insert', value: 70 },
      { type: 'insert', value: 20 },
      { type: 'insert', value: 40 },
      { type: 'insert', value: 60 },
      { type: 'insert', value: 80 },
      { type: 'search', value: 60 },
      { type: 'search', value: 90 },
  ];

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
    setAlgorithmId("bst");
    const generatedSteps = generateBSTSteps(operations);
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
        <h1 className="text-3xl font-display font-bold text-text-primary">Binary Search Tree (BST)</h1>
        <p className="text-text-secondary">
          A tree where the left child is always smaller than the parent, and the right child is always greater. Demonstrating insertion and search.
        </p>
      </div>

      <div className="flex-1 min-h-[400px]">
        <TreeViz currentStepData={currentStepData} />
      </div>

      <div className="bg-bg-card border border-border rounded-lg p-4 transition-all flex items-center gap-4">
        <span className="px-3 py-1 bg-accent-primary/20 text-accent-primary rounded font-mono text-sm border border-accent-primary/30 uppercase">
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
