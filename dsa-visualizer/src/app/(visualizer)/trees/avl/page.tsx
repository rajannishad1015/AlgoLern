"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateAVLTreeSteps } from "@/lib/algorithms/trees/avlTree";
import { ControlBar } from "@/components/visualizer/ControlBar";

interface AVLNodeData {
  value: number;
  height: number;
  left: string | null;
  right: string | null;
}

type NodeMap = Record<string, AVLNodeData>;

// Recursive tree renderer
function AVLNodeComponent({
  id, nodes, activeIds
}: {
  id: string | null;
  nodes: NodeMap;
  activeIds: string[];
}) {
  if (!id || !nodes[id]) return null;
  const node = nodes[id];
  const isActive = activeIds.includes(id);
  const balance = (node.left && nodes[node.left] ? nodes[node.left].height : 0)
    - (node.right && nodes[node.right] ? nodes[node.right].height : 0);

  return (
    <div className="flex flex-col items-center gap-0">
      <div className="flex items-end">
        {/* Left subtree connector */}
        {node.left && <div className="w-px h-6 bg-border translate-x-3 -translate-y-1 origin-bottom rotate-[-30deg]" />}
      </div>
      <div className="flex gap-4 items-start">
        {/* Left child */}
        <div className="mt-8">
          <AVLNodeComponent id={node.left} nodes={nodes} activeIds={activeIds} />
        </div>

        {/* Current node */}
        <div className="flex flex-col items-center gap-1">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-mono font-bold border-2 text-sm transition-all ${
              isActive
                ? 'border-accent-primary bg-accent-primary/20 text-text-primary shadow-lg shadow-accent-primary/30'
                : Math.abs(balance) > 1
                ? 'border-red-400 bg-red-500/10 text-red-400'
                : 'border-border bg-bg-card text-text-primary'
            }`}
          >
            {node.value}
          </div>
          <span className={`text-[9px] font-mono ${
            Math.abs(balance) > 1 ? 'text-red-400' : 'text-text-muted'
          }`}>
            bf:{balance} h:{node.height}
          </span>
        </div>

        {/* Right child */}
        <div className="mt-8">
          <AVLNodeComponent id={node.right} nodes={nodes} activeIds={activeIds} />
        </div>
      </div>
    </div>
  );
}

const defaultValues = [30, 20, 40, 10, 25, 35, 50, 5, 15];

export default function AVLTreePage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [treeState, setTreeState] = useState<{ root: string | null; nodes: NodeMap }>({ root: null, nodes: {} });

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("avl-tree");
    const generatedSteps = generateAVLTreeSteps(defaultValues);
    setSteps(generatedSteps);
    return () => { resetVisualizer(); if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    const step = steps[currentStepIndex];
    if (step?.values) {
      setTreeState(step.values as { root: string | null; nodes: NodeMap });
    }
  }, [currentStepIndex, steps]);

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
  const activeIds = currentStepData?.nodeIds ?? [];

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 gap-4">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary">AVL Tree</h1>
        <p className="text-text-secondary mt-1">
          A self-balancing BST. After every insertion, rotations (LL, RR, LR, RL) ensure the <strong>balance factor stays within [-1, 0, 1]</strong> at every node.
        </p>
      </div>

      {/* Legend */}
      <div className="flex gap-6 text-xs font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border-2 border-accent-primary inline-block"></span> Active node
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border-2 border-red-400 inline-block"></span> Unbalanced (|bf| &gt; 1)
        </span>
        <span className="text-text-muted">bf = balance factor, h = height</span>
      </div>

      <div className="flex-1 min-h-[400px] bg-bg-card border border-border rounded-xl overflow-auto flex items-start justify-center p-6">
        {treeState.root ? (
          <AVLNodeComponent id={treeState.root} nodes={treeState.nodes} activeIds={activeIds} />
        ) : (
          <div className="text-text-muted font-mono text-sm m-auto">Tree is empty</div>
        )}
      </div>

      <div className="bg-bg-card border border-border rounded-lg p-4 flex items-center gap-4">
        <span className="px-3 py-1 bg-accent-secondary/20 text-accent-secondary rounded font-mono text-sm border border-accent-secondary/30 uppercase shrink-0">
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
