"use client";

import { useEffect, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateFloydWarshallSteps } from "@/lib/algorithms/graphs/floydWarshall";
import { GraphViz } from "@/components/d3/GraphViz";
import { ControlBar } from "@/components/visualizer/ControlBar";

const sampleNodes = [
  { id: 'A', label: 'A', x: 20, y: 30 },
  { id: 'B', label: 'B', x: 70, y: 30 },
  { id: 'C', label: 'C', x: 20, y: 70 },
  { id: 'D', label: 'D', x: 70, y: 70 },
];

const sampleEdges = [
  { id: 'e1', source: 'A', target: 'B', weight: 3, isDirected: true },
  { id: 'e2', source: 'A', target: 'C', weight: 7, isDirected: true },
  { id: 'e3', source: 'B', target: 'C', weight: 2, isDirected: true },
  { id: 'e4', source: 'B', target: 'D', weight: 1, isDirected: true },
  { id: 'e5', source: 'C', target: 'D', weight: 2, isDirected: true },
];

export default function FloydWarshallPage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId('floyd-warshall');
    const generatedSteps = generateFloydWarshallSteps(sampleNodes, sampleEdges);
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
  const ids = sampleNodes.map(n => n.id);
  const matrix = currentStepData?.values?.matrix as Record<string, Record<string, string | number>> | undefined;
  const activeK = currentStepData?.values?.k as string | undefined;

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 gap-4">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary">Floyd-Warshall Algorithm</h1>
        <p className="text-text-secondary mt-1">
          Computes <strong>all-pairs shortest paths</strong> in a weighted graph using dynamic programming. Time complexity: O(V³).
        </p>
      </div>

      <div className="flex gap-4 min-h-[480px]">
        {/* Distance Matrix */}
        <div className="w-[320px] bg-bg-card border border-border rounded-lg flex flex-col overflow-hidden shrink-0">
          <div className="bg-bg-secondary px-4 py-3 border-b border-border flex justify-between items-center">
            <h3 className="text-sm font-semibold text-text-primary">Distance Matrix</h3>
            {activeK && (
              <span className="text-xs font-mono bg-accent-primary/20 text-accent-primary px-2 py-0.5 rounded">
                k = {activeK}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-auto p-3">
            {matrix && (
              <table className="w-full text-center font-mono text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="p-1 text-text-muted"></th>
                    {ids.map(id => (
                      <th key={id} className={`p-1 ${id === activeK ? 'text-accent-primary font-bold' : 'text-text-muted'}`}>{id}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ids.map(u => (
                    <tr key={u}>
                      <td className={`p-1 font-bold ${u === activeK ? 'text-accent-primary' : 'text-text-muted'}`}>{u}</td>
                      {ids.map(v => {
                        const val = matrix[u]?.[v];
                        const isHighlighted = currentStepData?.nodeIds?.includes(u) && currentStepData?.nodeIds?.includes(v);
                        return (
                          <td key={v} className={`p-1 border border-border/30 ${u === v ? 'text-text-muted bg-bg-secondary' : isHighlighted ? 'text-emerald-400 bg-emerald-500/10 font-bold' : 'text-text-primary'}`}>
                            {String(val ?? '∞')}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
