"use client";

import { useEffect, useRef, useState } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateGraphTraversalSteps } from "@/lib/algorithms/graphs/graphTraversals";
import { GraphViz } from "@/components/d3/GraphViz";
import { ControlBar } from "@/components/visualizer/ControlBar";

// Sample static graph with coordinate mappings
const sampleNodes = [
  { id: 'A', label: 'A', x: 50, y: 15 },
  { id: 'B', label: 'B', x: 20, y: 40 },
  { id: 'C', label: 'C', x: 80, y: 40 },
  { id: 'D', label: 'D', x: 20, y: 75 },
  { id: 'E', label: 'E', x: 50, y: 60 },
  { id: 'F', label: 'F', x: 80, y: 75 },
];

const sampleEdges = [
  { id: 'e1', source: 'A', target: 'B', isDirected: false },
  { id: 'e2', source: 'A', target: 'C', isDirected: false },
  { id: 'e3', source: 'B', target: 'D', isDirected: false },
  { id: 'e4', source: 'B', target: 'E', isDirected: false },
  { id: 'e5', source: 'C', target: 'E', isDirected: false },
  { id: 'e6', source: 'C', target: 'F', isDirected: false },
];

export default function GraphTraversalsPage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [traversalType, setTraversalType] = useState<'BFS' | 'DFS'>('BFS');

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
    setAlgorithmId(`graph-traversal-${traversalType.toLowerCase()}`);
    const generatedSteps = generateGraphTraversalSteps(sampleNodes, sampleEdges, 'A', traversalType);
    setSteps(generatedSteps);

    return () => {
      resetVisualizer();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [traversalType, setSteps, resetVisualizer, setAlgorithmId]);

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
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-display font-bold text-text-primary">Graph Traversals</h1>
            <div className="flex gap-2">
                <button 
                  onClick={() => { resetVisualizer(); setTraversalType('BFS'); }}
                  className={`px-3 py-1 rounded text-sm ${traversalType === 'BFS' ? 'bg-accent-primary text-white' : 'bg-bg-card border border-border text-text-secondary hover:text-white'}`}
                >
                  BFS
                </button>
                <button 
                  onClick={() => { resetVisualizer(); setTraversalType('DFS'); }}
                  className={`px-3 py-1 rounded text-sm ${traversalType === 'DFS' ? 'bg-accent-primary text-white' : 'bg-bg-card border border-border text-text-secondary hover:text-white'}`}
                >
                  DFS
                </button>
            </div>
        </div>
        <p className="text-text-secondary max-w-3xl">
          {traversalType === 'BFS' ? "Breadth-First Search explodes outward evenly from the starting point using a Queue." : "Depth-First Search dives deeply along branches before backtracking using a Stack."} Starting traversal at node A.
        </p>
      </div>

      <div className="flex gap-4 min-h-[500px]">
          {/* Active Nodes/Queue Panel */}
          <div className="w-64 flex flex-col gap-4">
              <div className="bg-bg-card border border-border rounded-lg p-4 flex flex-col h-[240px]">
                  <h3 className="text-sm font-semibold text-text-muted uppercase mb-2">
                      {traversalType === 'BFS' ? 'Queue (Active)' : 'Stack (Active)'}
                  </h3>
                  <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-2">
                      {currentStepData?.auxiliaryState?.active.slice().reverse().map((nodeId: string, idx: number) => (
                           <div key={`${nodeId}-${idx}`} className="px-3 py-2 bg-bg-secondary rounded border border-border text-center font-mono">
                               {nodeId}
                           </div>
                      ))}
                      {!currentStepData?.auxiliaryState?.active?.length && (
                          <div className="text-sm text-text-muted italic text-center py-4">Empty</div>
                      )}
                  </div>
              </div>
              
              <div className="bg-bg-card border border-border rounded-lg p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-semibold text-text-muted uppercase mb-2">Result Order</h3>
                  <div className="flex-1 overflow-y-auto flex flex-wrap gap-2 content-start">
                      {currentStepData?.values?.result.map((nodeId: string, idx: number) => (
                           <div key={`res-${nodeId}-${idx}`} className="w-8 h-8 flex items-center justify-center bg-accent-success/20 text-emerald-400 rounded-full border border-emerald-500/30 font-mono text-sm">
                               {nodeId}
                           </div>
                      ))}
                  </div>
              </div>
          </div>

          <div className="flex-1 h-full">
            <GraphViz currentStepData={currentStepData} />
          </div>
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
