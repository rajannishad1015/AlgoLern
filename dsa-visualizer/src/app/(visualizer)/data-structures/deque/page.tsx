"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateDequeSteps, DequeItem } from "@/lib/algorithms/data-structures/deque";
import { ControlBar } from "@/components/visualizer/ControlBar";

function DequeViz({ deque, activeIndices }: { deque: DequeItem[]; activeIndices: number[] }) {
  if (deque.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted font-mono text-sm">
        [ empty ]
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-0 h-full flex-wrap p-4">
      {/* FRONT label */}
      <div className="flex flex-col items-center mr-3 text-xs font-mono text-emerald-400">
        <span className="font-bold">FRONT</span>
        <span>↓</span>
      </div>

      {deque.map((item, i) => (
        <div key={item.id} className="flex items-center">
          <div
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg border-2 font-mono transition-colors ${
              activeIndices.includes(i)
                ? 'border-accent-primary bg-accent-primary/20 text-text-primary'
                : 'border-border bg-bg-card text-text-primary'
            }`}
          >
            <span className="text-lg font-bold">{item.value}</span>
            <span className="text-[9px] text-text-muted">[{i}]</span>
          </div>
          {i < deque.length - 1 && (
            <div className="w-5 h-px bg-border mx-1" />
          )}
        </div>
      ))}

      {/* REAR label */}
      <div className="flex flex-col items-center ml-3 text-xs font-mono text-indigo-400">
        <span className="font-bold">REAR</span>
        <span>↓</span>
      </div>
    </div>
  );
}

const defaultOps: { type: 'addFront' | 'addRear' | 'removeFront' | 'removeRear'; value?: number }[] = [
  { type: 'addRear', value: 10 },
  { type: 'addRear', value: 20 },
  { type: 'addFront', value: 5 },
  { type: 'addRear', value: 30 },
  { type: 'removeFront' },
  { type: 'addFront', value: 1 },
  { type: 'removeRear' },
];

export default function DequePage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [deque, setDeque] = useState<DequeItem[]>([]);
  const [activeIndices, setActiveIndices] = useState<number[]>([]);

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("deque");
    const generatedSteps = generateDequeSteps(defaultOps);
    setSteps(generatedSteps);
    return () => { resetVisualizer(); if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetVisualizer, setAlgorithmId, setSteps]);

  // Derived state rather than effect state copying
  const currentStepData = steps[currentStepIndex];
  const dequeDisplay = currentStepData?.values?.deque ? (currentStepData.values.deque as DequeItem[]) : [];
  const activeIndicesDisplay = currentStepData?.indices ?? [];

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (currentStepIndex < steps.length - 1) stepForward();
        else { setIsPlaying(false); if (timerRef.current) clearInterval(timerRef.current); }
      }, speed);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, currentStepIndex, steps.length, speed, stepForward, setIsPlaying]);

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 gap-4">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary">Deque</h1>
        <p className="text-text-secondary mt-1">
          A Double-Ended Queue — elements can be inserted and removed from <strong>both ends</strong> efficiently.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'addFront()', color: 'emerald', desc: 'Insert at front' },
          { label: 'addRear()', color: 'indigo', desc: 'Insert at rear' },
          { label: 'removeFront()', color: 'red', desc: 'Remove from front' },
          { label: 'removeRear()', color: 'amber', desc: 'Remove from rear' },
        ].map(op => (
          <div key={op.label} className="bg-bg-card border border-border rounded-lg p-3 flex flex-col gap-0.5">
            <span className="text-xs font-mono text-text-primary font-bold">{op.label}</span>
            <span className="text-xs text-text-muted">{op.desc}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-[200px] bg-bg-card border border-border rounded-xl overflow-hidden">
        <DequeViz deque={dequeDisplay} activeIndices={activeIndicesDisplay} />
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
