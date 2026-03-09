"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateShellSortSteps } from "@/lib/algorithms/sorting/shellSort";
import { ArrayViz } from "@/components/d3/ArrayViz";
import { ControlBar } from "@/components/visualizer/ControlBar";

export default function ShellSortPage() {
  const [arraySize, setArraySize] = useState([12]);
  const [data, setData] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const generateData = () => {
    const size = arraySize[0];
    const newArr = Array.from({ length: size }, () => Math.floor(Math.random() * 100));
    setData(newArr);
    resetVisualizer();
  };

  useEffect(() => {
    generateData();
  }, [arraySize]);

  useEffect(() => {
    setAlgorithmId("shell-sort");
    if (data.length > 0) {
      const generatedSteps = generateShellSortSteps(data);
      setSteps(generatedSteps);
    }

    return () => {
      resetVisualizer();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [data, setSteps, resetVisualizer, setAlgorithmId]);

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
         <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-text-primary">Shell Sort</h1>
            <p className="text-text-secondary mt-1">
              An optimization of insertion sort that allows the exchange of items that are far apart, reducing the distance elements need to travel.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-bg-card p-4 rounded-xl border border-border">
             <div className="flex flex-col">
                <label className="text-xs text-text-muted mb-1 font-mono uppercase tracking-wider">Array Size: {arraySize[0]}</label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={arraySize[0]}
                  onChange={(e) => {
                    setArraySize([parseInt(e.target.value)]);
                  }}
                  className="w-32 accent-accent-primary"
                />
             </div>
             <div className="w-px h-8 bg-border"></div>
             <button
                onClick={generateData}
                className="px-4 py-2 bg-bg-secondary hover:bg-bg-hover text-text-primary text-sm font-medium rounded-lg transition-colors border border-border"
             >
               Randomize Array
             </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[400px]">
        <ArrayViz data={data} currentStepData={currentStepData} />
      </div>

      <div className="bg-bg-card border border-border rounded-lg p-4">
        <p className="text-text-primary font-mono text-sm">
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
