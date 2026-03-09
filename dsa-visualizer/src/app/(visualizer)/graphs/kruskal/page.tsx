"use client";

import { useEffect, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateKruskalSteps } from "@/lib/algorithms/graphs/kruskal";
import { GraphViz } from "@/components/d3/GraphViz";
import { ControlBar } from "@/components/visualizer/ControlBar";

const sampleNodes = [
  { id: 'A', label: 'A', x: 20, y: 50 },
  { id: 'B', label: 'B', x: 45, y: 20 },
  { id: 'C', label: 'C', x: 45, y: 80 },
  { id: 'D', label: 'D', x: 70, y: 50 },
  { id: 'E', label: 'E', x: 90, y: 20 },
];

const sampleEdges = [
  { id: 'e1', source: 'A', target: 'B', weight: 4, isDirected: false },
  { id: 'e2', source: 'A', target: 'C', weight: 2, isDirected: false },
  { id: 'e3', source: 'B', target: 'C', weight: 5, isDirected: false },
  { id: 'e4', source: 'B', target: 'D', weight: 10, isDirected: false },
  { id: 'e5', source: 'C', target: 'D', weight: 3, isDirected: false },
  { id: 'e6', source: 'D', target: 'E', weight: 7, isDirected: false },
  { id: 'e7', source: 'B', target: 'E', weight: 1, isDirected: false },
];

export default function KruskalPage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId('kruskal');
    const generatedSteps = generateKruskalSteps(sampleNodes, sampleEdges);
    setSteps(generatedSteps);
    return () => { resetVisualizer(); if (timerRef.current) clearInterval(timerRef.current); };
  }, [setSteps, resetVisualizer, setAlgorithmId]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (currentStepIndex < steps.length - 1) stepForward();
        else { setIsPlaying(false); if (timerRef.current) clearInterval(timerRef.current); }
      }, speed);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, currentStepIndex, steps.length, speed, stepForward, setIsPlaying]);

  const currentStepData = steps[currentStepIndex];
  const mstEdges = (currentStepData?.values?.mstEdges ?? []) as string[];
  const totalWeight = (currentStepData?.values?.totalWeight ?? 0) as number;
  const sortedEdges = [...sampleEdges].sort((a, b) => a.weight - b.weight);

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 gap-4">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary">Kruskal's Algorithm</h1>
        <p className="text-text-secondary mt-1">
          Finds the <strong>Minimum Spanning Tree</strong> by greedily adding the lowest-weight edges that don't create cycles (uses Union-Find).
        </p>
      </div>

      <div className="flex gap-4 min-h-[480px]">
        {/* Edge list */}
        <div className="w-[260px] bg-bg-card border border-border rounded-lg flex flex-col overflow-hidden">
          <div className="bg-bg-secondary px-4 py-3 border-b border-border flex justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Edges (sorted)</h3>
            <span className="text-xs font-mono text-accent-secondary">MST weight: {totalWeight}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sortedEdges.map(edge => {
              const inMST = mstEdges.includes(edge.id);
              const isActive = currentStepData?.edgeIds?.includes(edge.id);
              return (
                <div
                  key={edge.id}
                  className={`flex items-center justify-between px-4 py-2.5 border-b border-border/50 text-sm font-mono transition-colors ${
                    inMST ? 'bg-emerald-500/10 text-emerald-400 font-bold' :
                    isActive ? 'bg-accent-primary/10 text-accent-primary' :
                    'text-text-secondary'
                  }`}
                >
                  <span>{edge.source} — {edge.target}</span>
                  <span>w={edge.weight}</span>
                  {inMST && <span className="text-xs">✓ MST</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 h-full">
          <GraphViz currentStepData={currentStepData} />
        </div>
      </div>

      <div className="bg-bg-card border border-border rounded-lg p-4 flex items-center gap-4">
        <span className="px-3 py-1 bg-accent-secondary/20 text-accent-secondary rounded font-mono text-sm border border-accent-secondary/30 uppercase">
          {currentStepData?.type || 'init'}
        </span>
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
