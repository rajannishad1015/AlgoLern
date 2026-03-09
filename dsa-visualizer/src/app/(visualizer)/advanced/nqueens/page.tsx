"use client";

import { useEffect, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateNQueensSteps } from "@/lib/algorithms/advanced/nQueens";
import { GridViz } from "@/components/d3/GridViz";
import { ControlBar } from "@/components/visualizer/ControlBar";

export default function NQueensPage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const N = 4; // Using 4x4 for rapid visualization without making the step count massive.

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
    setAlgorithmId("advanced-nqueens");
    const generatedSteps = generateNQueensSteps(N);
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
        <h1 className="text-3xl font-display font-bold text-text-primary">{N}-Queens (Backtracking)</h1>
        <p className="text-text-secondary max-w-3xl">
          Visualizing exhaustive search via Backtracking. We try placing queens row by row. If an attack conflict occurs, we backtrack and try the next column.
        </p>
      </div>

      <div className="flex-1 min-h-[500px]">
        <GridViz currentStepData={currentStepData} type="chessboard" size={N} />
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
