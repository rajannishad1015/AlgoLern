"use client";

import { useEffect, useRef, useState } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateTraversalSteps } from "@/lib/algorithms/trees/treeTraversals";
import { TreeViz } from "@/components/d3/TreeViz";
import { ControlBar } from "@/components/visualizer/ControlBar";

// A pre-constructed completely balanced tree for traversal demos
const sampleTree = {
    id: "root-1",
    value: 10,
    left: {
        id: "left-1",
        value: 5,
        left: { id: "leaf-1", value: 2, left: null, right: null },
        right: { id: "leaf-2", value: 8, left: null, right: null }
    },
    right: {
        id: "right-1",
        value: 15,
        left: { id: "leaf-3", value: 12, left: null, right: null },
        right: { id: "leaf-4", value: 20, left: null, right: null }
    }
};

type TraversalType = 'inorder' | 'preorder' | 'postorder';

export default function TraversalsPage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [traversalType, setTraversalType] = useState<TraversalType>('inorder');

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
    setAlgorithmId(`traversal-${traversalType}`);
    const generatedSteps = generateTraversalSteps(sampleTree, traversalType);
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
            <h1 className="text-3xl font-display font-bold text-text-primary">Tree DFS Traversals</h1>
            <div className="flex gap-2">
                <button 
                  onClick={() => { resetVisualizer(); setTraversalType('inorder'); }}
                  className={`px-3 py-1 rounded text-sm ${traversalType === 'inorder' ? 'bg-accent-primary text-white' : 'bg-bg-card border border-border text-text-secondary hover:text-white'}`}
                >
                  Inorder
                </button>
                <button 
                  onClick={() => { resetVisualizer(); setTraversalType('preorder'); }}
                  className={`px-3 py-1 rounded text-sm ${traversalType === 'preorder' ? 'bg-accent-primary text-white' : 'bg-bg-card border border-border text-text-secondary hover:text-white'}`}
                >
                  Preorder
                </button>
                <button 
                  onClick={() => { resetVisualizer(); setTraversalType('postorder'); }}
                  className={`px-3 py-1 rounded text-sm ${traversalType === 'postorder' ? 'bg-accent-primary text-white' : 'bg-bg-card border border-border text-text-secondary hover:text-white'}`}
                >
                  Postorder
                </button>
            </div>
        </div>
        <p className="text-text-secondary max-w-3xl">
          Visualizing Depth-First Search patterns. 
          {traversalType === 'inorder' && " Inorder (Left, Root, Right) processes nodes in sorted order for a BST."}
          {traversalType === 'preorder' && " Preorder (Root, Left, Right) is used to create a copy of the tree."}
          {traversalType === 'postorder' && " Postorder (Left, Right, Root) is used to delete the tree."}
        </p>
      </div>

      <div className="flex-1 min-h-[400px]">
        <TreeViz currentStepData={currentStepData} />
      </div>

      <div className="flex flex-col gap-3">
          <div className="bg-bg-card border border-border rounded-lg p-3 w-full overflow-hidden flex items-center gap-3">
            <span className="text-text-muted text-sm shrink-0">Result Output Array:</span>
            <div className="flex gap-2 flex-wrap min-h-[28px]">
               {currentStepData?.values?.result?.map((val: number, idx: number) => (
                  <span key={idx} className="bg-bg-hover text-text-primary px-2 py-1 rounded text-sm font-mono border border-border">
                      {val}
                  </span>
               ))}
               {!currentStepData?.values?.result?.length && <span className="text-text-muted text-sm italic py-1">[]</span>}
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
