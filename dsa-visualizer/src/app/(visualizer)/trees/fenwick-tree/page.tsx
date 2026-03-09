"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateFenwickTreeSteps } from "@/lib/algorithms/trees/fenwickTree";
import { ControlBar } from "@/components/visualizer/ControlBar";

const initialArr = [3, 2, -1, 6, 5, 4, -3, 3];
const sampleQueries = [
  { type: 'query' as const, left: 2, right: 5 },
  { type: 'query' as const, left: 0, right: 7 },
];
const sampleUpdates = [{ idx: 3, delta: 6 }];

export default function FenwickTreePage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [bitState, setBitState] = useState<{
    bit: number[]; arr: number[]; queryResult?: number; queryRange?: number[]
  }>({ bit: new Array(initialArr.length + 1).fill(0), arr: [...initialArr] });
  const [activeIdx, setActiveIdx] = useState<number[]>([]);

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("fenwick-tree");
    const generatedSteps = generateFenwickTreeSteps([...initialArr], sampleQueries, sampleUpdates);
    setSteps(generatedSteps);
    return () => { resetVisualizer(); if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    const step = steps[currentStepIndex];
    if (step?.values) {
      setBitState(step.values as { bit: number[]; arr: number[]; queryResult?: number; queryRange?: number[] });
    }
    setActiveIdx(step?.indices ?? []);
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
  const n = initialArr.length;

  // For i in 1..n, show responsibility range using LSB
  const lsb = (x: number) => x & (-x);
  const getRange = (i: number) => [i - lsb(i) + 1, i]; // 1-indexed responsibility

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 gap-4">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary">Fenwick Tree (BIT)</h1>
        <p className="text-text-secondary mt-1">
          A Binary Indexed Tree supporting O(log n) <strong>prefix sum queries</strong> and <strong>point updates</strong> using clever bit manipulation (LSB trick).
        </p>
      </div>

      {/* Original array */}
      <div>
        <p className="text-xs font-mono text-text-muted mb-1 uppercase tracking-wider">Original Array (0-indexed)</p>
        <div className="flex gap-1">
          {bitState.arr.map((v, i) => (
            <div key={i} className={`flex flex-col items-center gap-0.5`}>
              <span className="text-[9px] font-mono text-text-muted">[{i}]</span>
              <div className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 font-mono font-bold text-sm transition-colors ${
                activeIdx.includes(i) ? 'border-accent-primary bg-accent-primary/20 text-text-primary' :
                bitState.queryRange && i >= bitState.queryRange[0] && i <= bitState.queryRange[1]
                  ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                  : 'border-border bg-bg-card text-text-primary'
              }`}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* BIT array */}
      <div>
        <p className="text-xs font-mono text-text-muted mb-1 uppercase tracking-wider">BIT Array (1-indexed)</p>
        <div className="flex gap-1">
          {/* BIT[0] is unused */}
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] font-mono text-text-muted">[0]</span>
            <div className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-border/30 bg-bg-secondary text-text-muted font-mono text-xs">—</div>
          </div>
          {bitState.bit.slice(1).map((v, i) => {
            const bitIdx = i + 1; // 1-indexed
            const [lo, hi] = getRange(bitIdx);
            const isActive = activeIdx.includes(bitIdx - 1);
            return (
              <div key={bitIdx} className="flex flex-col items-center gap-0.5 group">
                <span className="text-[9px] font-mono text-text-muted">[{bitIdx}]</span>
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 font-mono font-bold text-sm transition-colors cursor-default ${
                    isActive ? 'border-accent-primary bg-accent-primary/20 text-text-primary' : 'border-border bg-bg-card text-text-primary'
                  }`}
                  title={`Covers range [${lo - 1},${hi - 1}] (0-indexed), LSB=${lsb(bitIdx)}`}
                >
                  {v}
                </div>
                <span className="text-[9px] font-mono text-indigo-400">
                  [{lo - 1}..{hi - 1}]
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] font-mono text-text-muted mt-1">Each BIT[i] covers range shown in purple (0-indexed). Hover for LSB details.</p>
      </div>

      {/* Visualize prefix sum idea */}
      <div className="bg-bg-card border border-border rounded-xl p-4 grid grid-cols-2 gap-4 text-xs font-mono">
        <div>
          <p className="text-text-muted mb-2 uppercase tracking-wider text-[10px]">Query Traversal</p>
          <p className="text-text-secondary">To get prefix sum up to index i:</p>
          <p className="text-accent-primary mt-1">sum = 0</p>
          <p className="text-text-primary">while i &gt; 0:</p>
          <p className="text-text-primary pl-4">sum += BIT[i]</p>
          <p className="text-text-primary pl-4">i -= i &amp; (-i)</p>
        </div>
        <div>
          <p className="text-text-muted mb-2 uppercase tracking-wider text-[10px]">Update Traversal</p>
          <p className="text-text-secondary">To update index i by delta:</p>
          <p className="text-accent-primary mt-1">while i &lt;= n:</p>
          <p className="text-text-primary pl-4">BIT[i] += delta</p>
          <p className="text-text-primary pl-4">i += i &amp; (-i)</p>
        </div>
      </div>

      {bitState.queryResult !== undefined && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-emerald-400 font-mono text-sm">
          ✓ Query result: sum(arr[{bitState.queryRange?.[0]}..{bitState.queryRange?.[1]}]) = <strong>{bitState.queryResult}</strong>
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
