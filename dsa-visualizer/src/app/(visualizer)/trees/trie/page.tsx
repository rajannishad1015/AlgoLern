"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateTrieSteps } from "@/lib/algorithms/trees/trie";
import { ControlBar } from "@/components/visualizer/ControlBar";

interface TrieNodeData {
  id: string;
  char: string;
  children: Record<string, string>;
  isEnd: boolean;
  parent: string | null;
}

type TrieMap = Record<string, TrieNodeData>;

function TrieNodeComponent({
  id, nodes, activeIds, depth = 0
}: {
  id: string;
  nodes: TrieMap;
  activeIds: string[];
  depth?: number;
}) {
  const node = nodes[id];
  if (!node) return null;
  const isActive = activeIds.includes(id);
  const children = Object.values(node.children).filter(cid => nodes[cid]);

  return (
    <div className="flex flex-col items-center">
      {/* Node circle */}
      <div className="flex flex-col items-center gap-0.5">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm border-2 transition-all ${
            depth === 0
              ? 'border-border bg-bg-secondary text-text-muted text-xs'
              : node.isEnd && isActive
              ? 'border-emerald-400 bg-emerald-400/20 text-emerald-400 shadow-lg'
              : node.isEnd
              ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-300'
              : isActive
              ? 'border-accent-primary bg-accent-primary/20 text-text-primary shadow-lg'
              : 'border-border bg-bg-card text-text-primary'
          }`}
        >
          {depth === 0 ? 'root' : node.char.toUpperCase()}
        </div>
        {node.isEnd && depth > 0 && (
          <div className="text-[8px] font-mono text-emerald-400">END</div>
        )}
      </div>

      {/* Children */}
      {children.length > 0 && (
        <div className="flex gap-3 mt-3 relative">
          {/* Connector line from parent center */}
          <div className="absolute top-0 left-1/2 w-px h-3 -translate-x-px -translate-y-3 bg-border" />
          {children.map(childId => (
            <div key={childId} className="flex flex-col items-center relative">
              <div className="w-px h-3 bg-border" />
              <TrieNodeComponent id={childId} nodes={nodes} activeIds={activeIds} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const defaultOps: { type: 'insert' | 'search' | 'delete'; word: string }[] = [
  { type: 'insert', word: 'apple' },
  { type: 'insert', word: 'app' },
  { type: 'insert', word: 'apply' },
  { type: 'insert', word: 'apt' },
  { type: 'insert', word: 'bat' },
  { type: 'search', word: 'app' },
  { type: 'search', word: 'ape' },
  { type: 'delete', word: 'app' },
];

export default function TriePage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [trieState, setTrieState] = useState<{ root: string; nodes: TrieMap } | null>(null);

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("trie");
    const generatedSteps = generateTrieSteps(defaultOps);
    setSteps(generatedSteps);
    return () => { resetVisualizer(); if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    const step = steps[currentStepIndex];
    if (step?.values) {
      setTrieState(step.values as { root: string; nodes: TrieMap });
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
        <h1 className="text-3xl font-display font-bold text-text-primary">Trie (Prefix Tree)</h1>
        <p className="text-text-secondary mt-1">
          A tree where each node represents a character. Words are spelled along root-to-leaf paths. Enables O(L) search, insert, and delete where L is word length.
        </p>
      </div>

      {/* Operations legend */}
      <div className="flex gap-3 flex-wrap text-xs font-mono">
        {defaultOps.map((op, i) => (
          <span
            key={i}
            className={`px-2 py-1 rounded border ${
              op.type === 'insert' ? 'border-accent-primary/50 bg-accent-primary/10 text-accent-primary' :
              op.type === 'search' ? 'border-amber-400/50 bg-amber-400/10 text-amber-400' :
              'border-red-400/50 bg-red-400/10 text-red-400'
            }`}
          >
            {op.type}("{op.word}")
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border-2 border-emerald-400 inline-block"></span> End of word
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border-2 border-accent-primary inline-block"></span> Active node
        </span>
      </div>

      <div className="flex-1 min-h-[380px] bg-bg-card border border-border rounded-xl overflow-auto flex items-start justify-center p-6">
        {trieState?.root && trieState.nodes[trieState.root] ? (
          <TrieNodeComponent
            id={trieState.root}
            nodes={trieState.nodes}
            activeIds={activeIds}
          />
        ) : (
          <div className="text-text-muted font-mono text-sm m-auto">Trie is empty</div>
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
