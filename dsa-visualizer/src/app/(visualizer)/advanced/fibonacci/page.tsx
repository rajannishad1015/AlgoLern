"use client";

import { useEffect, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateFibonacciDPSteps } from "@/lib/algorithms/advanced/fibonacciDP";
import { GridViz } from "@/components/d3/GridViz";
import { ControlBar } from "@/components/visualizer/ControlBar";

export default function FibonacciDPPage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const N = 5; // Calculate up to 5th Fibonacci for visual simplicity

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
    setAlgorithmId("dp-fibonacci");
    const generatedSteps = generateFibonacciDPSteps(N);
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
        <h1 className="text-3xl font-display font-bold text-text-primary">Fibonacci (Top-Down DP)</h1>
        <p className="text-text-secondary max-w-3xl">
          Visualizing Top-Down Dynamic Programming (Memoization). By caching answers in an array, we prevent the function from recalculating the same values (Cache Hits). Calculating <span className="font-mono">Fib({N})</span>.
        </p>
      </div>

      <div className="flex-1 min-h-[300px] flex items-center justify-center">
        <div className="w-full">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2 text-center">Memoization Cache Array</h3>
            <div className="h-[150px]">
               <GridViz currentStepData={currentStepData} type="dp-1d" size={N + 1} />
            </div>
            {currentStepData?.values?.currentN !== null && (
                <div className="text-center mt-4 text-sm font-mono text-accent-primary animate-pulse">
                    Currently executing: fib({currentStepData?.values?.currentN})
                </div>
            )}
        </div>
      </div>

      <div className="bg-bg-card border border-border rounded-lg p-4 transition-all flex items-center gap-4">
        <span className="px-3 py-1 bg-accent-secondary/20 text-accent-secondary rounded font-mono text-sm border border-accent-secondary/30 uppercase">
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
