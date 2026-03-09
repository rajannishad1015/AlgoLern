"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateStackSteps } from "@/lib/algorithms/data-structures/stackOperations";
import { StackQueueViz } from "@/components/d3/StackQueueViz";
import { ControlBar } from "@/components/visualizer/ControlBar";

export default function StackPage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // We hardcode a series of operations to animate for the user
  const operations = [
      { type: 'push', value: 10 },
      { type: 'push', value: 20 },
      { type: 'push', value: 30 },
      { type: 'pop' },
      { type: 'push', value: 40 },
      { type: 'push', value: 50 },
      { type: 'pop' },
      { type: 'pop' },
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
    setAlgorithmId("stack");
    const generatedSteps = generateStackSteps(operations);
    setSteps(generatedSteps);

    return () => {
      resetVisualizer();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [setSteps, resetVisualizer, setAlgorithmId]);

  // Main playback engine
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
        <h1 className="text-3xl font-display font-bold text-text-primary">Stack (LIFO)</h1>
        <p className="text-text-secondary">
          Last-In-First-Out Data Structure. We've queued up a series of Push and Pop operations for demonstration.
        </p>
      </div>

      <div className="flex-1 min-h-[400px]">
        <StackQueueViz currentStepData={currentStepData} layout="vertical" />
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
