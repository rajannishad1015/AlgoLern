"use client";

import { useEffect, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateBellmanFordSteps } from "@/lib/algorithms/graphs/bellmanFord";
import { GraphViz } from "@/components/d3/GraphViz";
import { ControlBar } from "@/components/visualizer/ControlBar";

const sampleNodes = [
  { id: 'A', label: 'A', x: 15, y: 50 },
  { id: 'B', label: 'B', x: 40, y: 20 },
  { id: 'C', label: 'C', x: 40, y: 80 },
  { id: 'D', label: 'D', x: 70, y: 50 },
  { id: 'E', label: 'E', x: 90, y: 25 },
];

const sampleEdges = [
  { id: 'e1', source: 'A', target: 'B', weight: 6, isDirected: true },
  { id: 'e2', source: 'A', target: 'C', weight: 7, isDirected: true },
  { id: 'e3', source: 'B', target: 'D', weight: 5, isDirected: true },
  { id: 'e4', source: 'C', target: 'B', weight: 8, isDirected: true },
  { id: 'e5', source: 'C', target: 'D', weight: -3, isDirected: true },
  { id: 'e6', source: 'D', target: 'E', weight: 9, isDirected: true },
  { id: 'e7', source: 'B', target: 'E', weight: -4, isDirected: true },
];

export default function BellmanFordPage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId('bellman-ford');
    const generatedSteps = generateBellmanFordSteps(sampleNodes, sampleEdges, 'A');
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

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 gap-4">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary">Bellman-Ford Algorithm</h1>
        <p className="text-text-secondary mt-1">
          Finds shortest paths from a source to all vertices. Unlike Dijkstra, handles <strong>negative weight edges</strong> and detects negative cycles.
        </p>
      </div>

      <div className="flex gap-4 min-h-[480px]">
        {/* Distance Table */}
        <div className="w-[280px] bg-bg-card border border-border rounded-lg flex flex-col overflow-hidden">
          <div className="bg-bg-secondary px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary">Distance Table</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left font-mono text-sm">
              <thead>
                <tr className="bg-bg-hover text-text-muted uppercase tracking-wider text-xs">
                  <th className="py-2 px-3 border-b border-border">Node</th>
                  <th className="py-2 px-3 border-b border-border">Dist</th>
                  <th className="py-2 px-3 border-b border-border">Prev</th>
                </tr>
              </thead>
              <tbody>
                {sampleNodes.map(node => {
                  const distVal = currentStepData?.values?.distances?.[node.id];
                  const dist = distVal === Infinity || distVal === undefined ? '∞' : distVal;
                  const prev = currentStepData?.values?.previous?.[node.id] || '-';
                  const isActive = currentStepData?.nodeIds?.includes(node.id);
                  return (
                    <tr key={node.id} className={`border-b border-border/50 ${isActive ? 'text-accent-primary bg-accent-primary/10 font-bold' : 'text-text-secondary'}`}>
                      <td className="py-2 px-3">{node.id}</td>
                      <td className="py-2 px-3">{String(dist)}</td>
                      <td className="py-2 px-3">{prev}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {currentStepData?.values?.negCycle && (
            <div className="p-3 bg-red-500/10 border-t border-red-500/30 text-red-400 text-xs font-mono">
              ⚠ Negative cycle detected!
            </div>
          )}
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
