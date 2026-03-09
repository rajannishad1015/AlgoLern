"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateSegmentTreeSteps } from "@/lib/algorithms/trees/segmentTree";
import { ControlBar } from "@/components/visualizer/ControlBar";

interface SegNode {
  id: string;
  start: number;
  end: number;
  sum: number;
  leftChild: string | null;
  rightChild: string | null;
}

type SegTree = Record<string, SegNode>;

function SegTreeNode({
  id, tree, activeIds, queryRange
}: {
  id: string | null;
  tree: SegTree;
  activeIds: string[];
  queryRange?: number[];
}) {
  if (!id || !tree[id]) return null;
  const node = tree[id];
  const isActive = activeIds.includes(id);
  const inQuery = queryRange
    && node.start >= queryRange[0] && node.end <= queryRange[1];

  return (
    <div className="flex flex-col items-center gap-0">
      <div className="flex gap-2 items-start">
        {/* Left child */}
        {node.leftChild && (
          <div className="flex flex-col items-center mt-8">
            <SegTreeNode id={node.leftChild} tree={tree} activeIds={activeIds} queryRange={queryRange} />
          </div>
        )}

        {/* This node */}
        <div className="flex flex-col items-center gap-0.5">
          <div
            className={`flex flex-col items-center justify-center px-2 py-1 min-w-[56px] rounded-lg border-2 font-mono text-xs transition-all ${
              isActive
                ? 'border-accent-primary bg-accent-primary/20 text-text-primary shadow-md'
                : inQuery
                ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300'
                : 'border-border bg-bg-card text-text-primary'
            }`}
          >
            <span className="text-[10px] text-text-muted">[{node.start},{node.end}]</span>
            <span className="text-sm font-bold">{node.sum}</span>
          </div>
        </div>

        {/* Right child */}
        {node.rightChild && (
          <div className="flex flex-col items-center mt-8">
            <SegTreeNode id={node.rightChild} tree={tree} activeIds={activeIds} queryRange={queryRange} />
          </div>
        )}
      </div>
    </div>
  );
}

const initialArr = [1, 3, 5, 7, 9, 11];
const sampleQueries = [
  { type: 'query' as const, ql: 1, qr: 3 },
  { type: 'query' as const, ql: 0, qr: 5 },
];
const sampleUpdates = [{ idx: 2, value: 10 }];

export default function SegmentTreePage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [treeState, setTreeState] = useState<{
    tree: SegTree; arr: number[]; queryRange?: number[]; queryResult?: number
  }>({ tree: {}, arr: [...initialArr] });

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("segment-tree");
    const generatedSteps = generateSegmentTreeSteps([...initialArr], sampleQueries, sampleUpdates);
    setSteps(generatedSteps);
    return () => { resetVisualizer(); if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    const step = steps[currentStepIndex];
    if (step?.values) {
      setTreeState(step.values as { tree: SegTree; arr: number[]; queryRange?: number[]; queryResult?: number });
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
  const rootId = Object.values(treeState.tree).find(n => !Object.values(treeState.tree).some(m => m.leftChild === n.id || m.rightChild === n.id))?.id ?? null;

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 gap-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary">Segment Tree</h1>
          <p className="text-text-secondary mt-1">
            A tree for efficient <strong>range queries</strong> (sum, min, max) and <strong>point updates</strong> in O(log n).
          </p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-3 text-xs font-mono">
          <div className="text-text-muted mb-1">Input array:</div>
          <div className="flex gap-1">
            {treeState.arr.map((v, i) => (
              <span key={i} className="w-7 h-7 flex items-center justify-center bg-bg-secondary border border-border rounded text-text-primary font-bold">{v}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs font-mono">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 border-2 border-accent-primary rounded inline-block"></span> Active node</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 border-2 border-emerald-400 rounded inline-block"></span> Fully inside query</span>
        <span className="text-text-muted">Each node shows [range]: sum</span>
      </div>

      {/* Tree visualization */}
      <div className="flex-1 min-h-[380px] bg-bg-card border border-border rounded-xl overflow-auto flex items-start justify-center p-6">
        {rootId ? (
          <SegTreeNode
            id={rootId}
            tree={treeState.tree}
            activeIds={activeIds}
            queryRange={treeState.queryRange}
          />
        ) : (
          <div className="text-text-muted font-mono text-sm m-auto">Building tree...</div>
        )}
      </div>

      {treeState.queryResult !== undefined && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-emerald-400 font-mono text-sm">
          ✓ Query result: sum(arr[{treeState.queryRange?.[0]}..{treeState.queryRange?.[1]}]) = <strong>{treeState.queryResult}</strong>
        </div>
      )}

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
