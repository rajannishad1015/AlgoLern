"use client";

import { useEffect, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generatePrimSteps } from "@/lib/algorithms/graphs/prim";
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

export default function PrimPage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId('prim');
    const generatedSteps = generatePrimSteps(sampleNodes, sampleEdges, 'A');
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
  const inMST = (currentStepData?.values?.inMST ?? []) as string[];
  const key = (currentStepData?.values?.key ?? {}) as Record<string, number>;
  const parent = (currentStepData?.values?.parent ?? {}) as Record<string, string | null>;
  const mstEdges = (currentStepData?.values?.mstEdges ?? []) as string[];

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 gap-4">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary">Prim's Algorithm</h1>
        <p className="text-text-secondary mt-1">
          Grows the <strong>Minimum Spanning Tree</strong> one vertex at a time, always picking the cheapest edge connecting the MST to a new vertex.
        </p>
      </div>

      <div className="flex gap-4 min-h-[480px]">
        {/* Node table */}
        <div className="w-[280px] bg-bg-card border border-border rounded-lg flex flex-col overflow-hidden">
          <div className="bg-bg-secondary px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary">Node Key Table</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full font-mono text-sm">
              <thead>
                <tr className="bg-bg-hover text-text-muted uppercase tracking-wider text-xs">
                  <th className="py-2 px-3 border-b border-border">Node</th>
                  <th className="py-2 px-3 border-b border-border">Key</th>
                  <th className="py-2 px-3 border-b border-border">Parent</th>
                  <th className="py-2 px-3 border-b border-border">In MST</th>
                </tr>
              </thead>
              <tbody>
                {sampleNodes.map(node => {
                  const keyVal = key[node.id];
                  const inTree = inMST.includes(node.id);
                  const isActive = currentStepData?.nodeIds?.includes(node.id);
                  return (
                    <tr
                      key={node.id}
                      className={`border-b border-border/50 ${
                        inTree ? 'text-emerald-400 bg-emerald-500/10 font-bold' :
                        isActive ? 'text-accent-primary bg-accent-primary/10' :
                        'text-text-secondary'
                      }`}
                    >
                      <td className="py-2 px-3">{node.id}</td>
                      <td className="py-2 px-3">{keyVal === Infinity || keyVal === undefined ? '∞' : keyVal}</td>
                      <td className="py-2 px-3">{parent[node.id] ?? '-'}</td>
                      <td className="py-2 px-3">{inTree ? '✓' : ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-border text-xs font-mono text-text-muted">
            MST edges: <span className="text-emerald-400 font-bold">{mstEdges.length}</span> / {sampleNodes.length - 1}
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
