"use client";

import { useEffect, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateDijkstraSteps } from "@/lib/algorithms/graphs/dijkstra";
import { GraphViz } from "@/components/d3/GraphViz";
import { ControlBar } from "@/components/visualizer/ControlBar";

// Sample Graph for Dijkstra
const sampleNodes = [
  { id: 'A', label: 'A', x: 20, y: 50 },
  { id: 'B', label: 'B', x: 50, y: 20 },
  { id: 'C', label: 'C', x: 50, y: 80 },
  { id: 'D', label: 'D', x: 80, y: 50 },
];

const sampleEdges = [
  { id: 'e1', source: 'A', target: 'B', weight: 4, isDirected: false },
  { id: 'e2', source: 'A', target: 'C', weight: 2, isDirected: false },
  { id: 'e3', source: 'B', target: 'C', weight: 1, isDirected: false },
  { id: 'e4', source: 'B', target: 'D', weight: 5, isDirected: false },
  { id: 'e5', source: 'C', target: 'D', weight: 8, isDirected: false },
];

export default function DijkstraPage() {
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

  useEffect(() => {
    setAlgorithmId('dijkstra');
    const generatedSteps = generateDijkstraSteps(sampleNodes, sampleEdges, 'A');
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
        <h1 className="text-3xl font-display font-bold text-text-primary">Dijkstra's Algorithm</h1>
        <p className="text-text-secondary max-w-3xl">
          Calculates the shortest path from a starting node to all other reachable nodes dynamically using a weighted graph.
        </p>
      </div>

      <div className="flex gap-4 min-h-[500px]">
          {/* Distance Table */}
          <div className="w-[300px] flex flex-col gap-4">
              <div className="bg-bg-card border border-border rounded-lg flex flex-col overflow-hidden shadow-sm h-full">
                  <div className="bg-bg-secondary px-4 py-3 border-b border-border">
                      <h3 className="text-sm font-semibold text-text-primary">Distance Table</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto w-full">
                      <table className="w-full text-left font-mono text-sm">
                          <thead>
                              <tr className="bg-bg-hover text-text-muted uppercase tracking-wider text-xs">
                                  <th className="py-2 px-4 border-b border-border">Node</th>
                                  <th className="py-2 px-4 border-b border-border">Dist</th>
                                  <th className="py-2 px-4 border-b border-border">Prev</th>
                              </tr>
                          </thead>
                          <tbody>
                              {sampleNodes.map((node) => {
                                  let dist = currentStepData?.auxiliaryState?.distances?.[node.id];
                                  if (dist === Infinity) dist = "∞";

                                  let prev = currentStepData?.auxiliaryState?.previous?.[node.id];
                                  if (!prev) prev = "-";
                                  
                                  const isUnvisited = currentStepData?.auxiliaryState?.unvisited?.includes(node.id);
                                  
                                  return (
                                      <tr key={node.id} className={`${isUnvisited ? 'text-text-secondary' : 'text-emerald-400 bg-emerald-500/10 font-bold'} border-b border-border/50`}>
                                          <td className="py-2 px-4">{node.id}</td>
                                          <td className="py-2 px-4">{dist}</td>
                                          <td className="py-2 px-4">{prev}</td>
                                      </tr>
                                  )
                              })}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>

          <div className="flex-1 h-full">
            <GraphViz currentStepData={currentStepData} />
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
