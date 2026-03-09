'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrayViz } from '@/components/d3/ArrayViz';
import { ControlBar } from '@/components/visualizer/ControlBar';
import { useVisualizerStore } from '@/lib/store/visualizerStore';
import { generateLinearSearchSteps } from '@/lib/algorithms/searching/linearSearch';

export default function LinearSearchPage() {
  const [arraySize, setArraySize] = useState([8]);
  const [targetValue, setTargetValue] = useState(42);
  const [array, setArray] = useState<number[]>([]);
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
    // Ensure target is occasionally in the array for good demonstration
    if (Math.random() > 0.5) {
      setTargetValue(newArr[Math.floor(Math.random() * size)]);
    } else {
      setTargetValue(Math.floor(Math.random() * 100));
    }
    setArray(newArr);
    resetVisualizer();
  };

  useEffect(() => {
    generateData();
  }, [arraySize]);

  useEffect(() => {
    setAlgorithmId("linear-search");
    if (array.length > 0) {
      const newSteps = generateLinearSearchSteps(array, targetValue);
      setSteps(newSteps);
    }
    return () => {
      resetVisualizer();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [array, targetValue, setSteps, resetVisualizer, setAlgorithmId]);

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

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      setTargetValue(val);
      resetVisualizer();
    }
  };

  const handleReset = () => {
    resetVisualizer();
  };

  const currentStepData = steps[currentStepIndex];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none p-6 border-b border-border">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-text-primary">Linear Search</h1>
            <p className="text-text-secondary mt-2">Sequentially checking each element in a list until a match is found.</p>
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
             <div className="flex flex-col">
                <label className="text-xs text-text-muted mb-1 font-mono uppercase tracking-wider">Target Value</label>
                <input
                  type="number"
                  value={targetValue}
                  onChange={handleTargetChange}
                  className="w-20 bg-bg-secondary text-text-primary border border-border rounded px-2 py-1 text-sm font-mono focus:outline-none focus:border-accent-primary"
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

      <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
        <ArrayViz data={array} currentStepData={currentStepData} />
        
        <div className="flex-none space-y-4">
          <div className="bg-bg-card border border-border rounded-lg p-4 flex items-center justify-between">
            <p className="text-text-primary font-mono text-sm">
              {currentStepData?.description || "Ready"}
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
      </div>
    </div>
  );
}
