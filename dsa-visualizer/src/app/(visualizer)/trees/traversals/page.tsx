"use client";

import { useEffect, useRef, useState } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateTraversalSteps } from "@/lib/algorithms/trees/treeTraversals";
import { TreeViz } from "@/components/d3/TreeViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { ListTree, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

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
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Tree DFS Traversals"
        description="Depth-First Search elegantly navigates deep into branches before backtracking. It forms the backbone of numerous tree algorithms, from pathfinding to memory cleanup."
        complexity={{ time: 'O(n)', space: 'O(h)', difficulty: 'Medium' }}
        controls={
          <div className="flex flex-col gap-4 w-full">
            {/* Action Center */}
            <div className="flex flex-col xl:flex-row gap-4 xl:items-center bg-white/5 dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-2xl p-4 md:p-5 backdrop-blur-sm shadow-xl shadow-black/5 justify-between w-full">
              
              {/* Traversal Selector Buttons */}
              <div className="flex gap-2 w-full xl:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar shrink-0">
                <button
                  onClick={() => { resetVisualizer(); setTraversalType('preorder'); }}
                  className={`group relative flex items-center justify-center gap-2 px-5 md:px-6 py-3 rounded-xl font-bold transition-all active:scale-95 border whitespace-nowrap ${traversalType === 'preorder' ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/50 shadow-[0_0_15px_rgba(251,146,60,0.2)]' : 'bg-orange-500/5 text-orange-600/70 dark:text-orange-500/60 border-orange-500/20 hover:bg-orange-500/10'}`}
                >
                  <ArrowDownToLine size={18} /> <span className="text-sm md:text-base">Pre-order</span>
                </button>
                <button
                  onClick={() => { resetVisualizer(); setTraversalType('inorder'); }}
                  className={`group relative flex items-center justify-center gap-2 px-5 md:px-6 py-3 rounded-xl font-bold transition-all active:scale-95 border whitespace-nowrap ${traversalType === 'inorder' ? 'bg-[#cbff5e]/20 text-[#658721] dark:text-[#cbff5e] border-[#658721]/50 dark:border-[#cbff5e]/50 shadow-[0_0_15px_rgba(203,255,94,0.2)]' : 'bg-[#cbff5e]/10 text-[#658721]/80 dark:text-[#cbff5e]/60 border-[#658721]/20 hover:bg-[#cbff5e]/20 dark:border-[#cbff5e]/20'}`}
                >
                  <ListTree size={18} /> <span className="text-sm md:text-base">In-order</span>
                </button>
                <button
                  onClick={() => { resetVisualizer(); setTraversalType('postorder'); }}
                  className={`group relative flex items-center justify-center gap-2 px-5 md:px-6 py-3 rounded-xl font-bold transition-all active:scale-95 border whitespace-nowrap ${traversalType === 'postorder' ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-indigo-500/5 text-indigo-600/70 dark:text-indigo-500/60 border-indigo-500/20 hover:bg-indigo-500/10'}`}
                >
                  <ArrowUpFromLine size={18} /> <span className="text-sm md:text-base">Post-order</span>
                </button>
              </div>

              {/* Output Array Box */}
              <div className="flex-1 min-w-[300px] w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-5 py-3 flex items-start gap-4 overflow-hidden relative min-h-[58px]">
                <div className="flex flex-col justify-center h-full pt-1.5 shrink-0">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Result</span>
                  <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px]">Array</span>
                </div>
                
                <div className="flex gap-2 flex-wrap min-h-[32px] overflow-y-auto w-full max-h-[100px] content-start">
                  {currentStepData?.values?.result?.map((val: number, idx: number) => (
                    <span 
                      key={idx} 
                      className={`px-3 py-1.5 rounded-lg text-sm font-bold font-mono border shadow-sm transition-all animate-in zoom-in duration-300 ${
                        traversalType === 'preorder' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/40' :
                        traversalType === 'inorder' ? 'bg-[#f4ffdc] dark:bg-[#cbff5e]/10 text-[#658721] dark:text-[#cbff5e] border-[#cbff5e] dark:border-[#cbff5e]/30' :
                        'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/40'
                      }`}
                    >
                        {val}
                    </span>
                  ))}
                  {!currentStepData?.values?.result?.length && <span className="text-slate-400 dark:text-slate-500 text-sm italic py-1.5">Waiting for Traversal...</span>}
                </div>
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
        }
      >
        <div className="relative w-full h-full flex flex-col overflow-hidden">
          <div className="flex-1 w-full relative">
            <TreeViz currentStepData={currentStepData} />
          </div>
        </div>
      </VisualizerFrame>
    </div>
  );
}
