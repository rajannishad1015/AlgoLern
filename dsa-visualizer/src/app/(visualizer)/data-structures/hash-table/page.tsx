"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateHashTableSteps, HashTableState } from "@/lib/algorithms/data-structures/hashTable";
import { ControlBar } from "@/components/visualizer/ControlBar";

const TABLE_SIZE = 7;

function HashTableViz({ table, highlightBucket }: { table: HashTableState; highlightBucket?: number }) {
  return (
    <div className="grid gap-2 p-4 h-full overflow-y-auto">
      {table.map((bucket, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors border ${
            highlightBucket === i ? 'border-accent-primary bg-accent-primary/10' : 'border-border bg-bg-secondary'
          }`}
        >
          <div className="w-8 h-8 rounded-md bg-bg-card border border-border flex items-center justify-center text-xs font-mono font-bold text-text-muted shrink-0">
            {i}
          </div>
          <div className="flex gap-2 flex-wrap">
            {bucket.length === 0 ? (
              <span className="text-xs font-mono text-text-muted">empty</span>
            ) : (
              bucket.map((entry, j) => (
                <div key={j} className="flex items-center gap-1 bg-bg-card border border-border rounded px-2 py-1">
                  <span className="text-xs font-mono text-accent-secondary">&quot;{entry.key}&quot;</span>
                  <span className="text-text-muted text-xs">→</span>
                  <span className="text-xs font-mono text-text-primary">&quot;{entry.value}&quot;</span>
                </div>
              ))
            )}
          </div>
          {bucket.length > 1 && (
            <span className="ml-auto text-xs text-amber-400 font-mono">⚠ collision chain ({bucket.length})</span>
          )}
        </div>
      ))}
    </div>
  );
}

const defaultOps: { type: 'insert' | 'search' | 'delete'; key: string; value?: string }[] = [
  { type: 'insert', key: 'name', value: 'Alice' },
  { type: 'insert', key: 'age', value: '25' },
  { type: 'insert', key: 'city', value: 'Delhi' },
  { type: 'insert', key: 'lang', value: 'TypeScript' },
  { type: 'search', key: 'age' },
  { type: 'delete', key: 'city' },
  { type: 'insert', key: 'mane', value: 'Bob' }, // deliberate collision example
];

export default function HashTablePage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [tableState, setTableState] = useState<HashTableState>(Array.from({ length: TABLE_SIZE }, () => []));
  const [highlightBucket, setHighlightBucket] = useState<number | undefined>();

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  const defaultOps: { type: 'insert' | 'search' | 'delete'; key: string; value?: string }[] = [
    { type: 'insert', key: 'name', value: 'Alice' },
    { type: 'insert', key: 'age', value: '25' },
    { type: 'insert', key: 'city', value: 'Delhi' },
    { type: 'insert', key: 'lang', value: 'TypeScript' },
    { type: 'search', key: 'age' },
    { type: 'delete', key: 'city' },
    { type: 'insert', key: 'mane', value: 'Bob' }, // deliberate collision example
  ];

  useEffect(() => {
    setAlgorithmId("hash-table");
    const generatedSteps = generateHashTableSteps(TABLE_SIZE, defaultOps);
    setSteps(generatedSteps);
    return () => { resetVisualizer(); if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetVisualizer, setAlgorithmId, setSteps]);

  const currentStepData = steps[currentStepIndex];

  // Derived state instead of effect synced
  const tableStateDisplay = currentStepData?.values?.table ? (currentStepData.values.table as HashTableState) : Array.from({ length: TABLE_SIZE }, () => []);
  const highlightBucketDisplay = currentStepData?.indices?.[0] !== undefined ? currentStepData.indices[0] : undefined;

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
          <h1 className="text-3xl font-display font-bold text-text-primary">Hash Table</h1>
          <p className="text-text-secondary mt-1">
            Maps keys to values using a hash function. Collisions are handled via <strong>chaining</strong> (linked list per bucket).
          </p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-3 text-xs font-mono text-text-muted">
          Table Size: <span className="text-accent-primary font-bold">{TABLE_SIZE}</span> buckets
        </div>
      </div>

      <div className="flex-1 min-h-[350px] bg-bg-card border border-border rounded-xl overflow-hidden">
        <HashTableViz table={tableState} highlightBucket={highlightBucket} />
      </div>

      <div className="bg-bg-card border border-border rounded-lg p-4">
        <p className="text-text-primary font-mono text-sm">{currentStepData?.description || "Ready to visualize..."}</p>
        {currentStepData?.values?.foundValue && (
          <div className="mt-2 text-xs font-mono bg-emerald-500/10 border border-emerald-500/30 p-2 rounded text-emerald-400">
            ✓ Found: {String(currentStepData.values.foundValue)}
          </div>
        )}
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
