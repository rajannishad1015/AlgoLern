"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateDLLSteps, DLLNode } from "@/lib/algorithms/data-structures/doublyLinkedList";
import { ControlBar } from "@/components/visualizer/ControlBar";

function DLLViz({ nodes }: { nodes: DLLNode[] }) {
  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted font-mono text-sm">
        NULL ← [ empty ] → NULL
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-0 flex-wrap p-4 h-full">
      <div className="px-3 py-2 text-xs font-mono text-text-muted">NULL</div>
      {nodes.map((node, i) => (
        <div key={node.id} className="flex items-center">
          {/* Prev arrow */}
          <div className="flex flex-col items-center text-indigo-400 text-xs font-mono mx-1">
            <span>←</span>
            <span className="text-[9px]">prev</span>
          </div>
          {/* Node */}
          <div className="flex flex-col items-center bg-bg-card border-2 border-accent-primary rounded-lg p-1 min-w-[60px]">
            <div className="text-xs text-text-muted font-mono">[{i}]</div>
            <div className="text-lg font-bold text-text-primary font-mono">{node.value}</div>
            <div className="text-[9px] text-text-muted font-mono">{node.id.slice(0, 8)}</div>
          </div>
          {/* Next arrow */}
          <div className="flex flex-col items-center text-emerald-400 text-xs font-mono mx-1">
            <span>→</span>
            <span className="text-[9px]">next</span>
          </div>
        </div>
      ))}
      <div className="px-3 py-2 text-xs font-mono text-text-muted">NULL</div>
    </div>
  );
}

export default function DoublyLinkedListPage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [inputValue, setInputValue] = useState("10");
  const [currentNodes, setCurrentNodes] = useState<DLLNode[]>([]);

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  // Move defaultOps outside to prevent recreations
  const defaultOps: { type: 'insertHead' | 'insertTail'; value: number }[] = [
    { type: 'insertTail', value: 10 },
    { type: 'insertTail', value: 20 },
    { type: 'insertTail', value: 30 },
    { type: 'insertHead', value: 5 },
    { type: 'insertTail', value: 40 },
  ];

  useEffect(() => {
    setAlgorithmId("doubly-linked-list");
    const generatedSteps = generateDLLSteps(defaultOps);
    setSteps(generatedSteps);
    return () => { resetVisualizer(); if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetVisualizer, setAlgorithmId, setSteps]);

  // Derived state instead of duplicating into local state via effect
  const currentStepData = steps[currentStepIndex];
  const currentNodesDisplay = currentStepData?.values?.nodes ? (currentStepData.values.nodes as DLLNode[]) : [];

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (currentStepIndex < steps.length - 1) stepForward();
        else { setIsPlaying(false); if (timerRef.current) clearInterval(timerRef.current); }
      }, speed);
    } else if (timerRef.current) { clearInterval(timerRef.current); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, currentStepIndex, steps.length, speed, stepForward, setIsPlaying]);

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 gap-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary">Doubly Linked List</h1>
          <p className="text-text-secondary mt-1">Each node holds references to both its next and previous nodes, enabling bidirectional traversal.</p>
        </div>
        <div className="flex gap-4 bg-bg-card p-4 rounded-xl border border-border items-center">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-text-muted font-mono uppercase tracking-wider">Node Value</span>
            <input
              type="number"
              className="w-24 bg-bg-secondary border border-border rounded px-2 py-1 text-sm text-text-primary font-mono"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => {
                const val = parseInt(inputValue);
                if (!isNaN(val)) {
                  const ops = [...defaultOps, { type: 'insertTail' as const, value: val }];
                  const generatedSteps = generateDLLSteps(ops);
                  resetVisualizer();
                  setSteps(generatedSteps);
                }
              }}
              className="px-3 py-1 bg-accent-primary hover:opacity-90 text-white text-xs rounded font-medium"
            >
              Insert Tail
            </button>
            <button
              onClick={() => {
                const val = parseInt(inputValue);
                if (!isNaN(val)) {
                  const ops = [...defaultOps, { type: 'insertHead' as const, value: val }];
                  const generatedSteps = generateDLLSteps(ops);
                  resetVisualizer();
                  setSteps(generatedSteps);
                }
              }}
              className="px-3 py-1 bg-bg-secondary hover:bg-bg-hover border border-border text-text-primary text-xs rounded font-medium"
            >
              Insert Head
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[300px] bg-bg-card border border-border rounded-xl overflow-auto">
        <DLLViz nodes={currentNodesDisplay} />
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs font-mono">
        <span className="flex items-center gap-1"><span className="text-indigo-400">←</span> prev pointer</span>
        <span className="flex items-center gap-1"><span className="text-emerald-400">→</span> next pointer</span>
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
