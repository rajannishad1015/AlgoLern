"use client";

import { ReactNode } from "react";

interface VisualizerFrameProps {
  title: string;
  description: string;
  complexity?: {
    time: string;
    space: string;
    difficulty: string;
  };
  children: ReactNode;
  controls?: ReactNode;
  info?: ReactNode;
}

export function VisualizerFrame({ title, description, complexity, children, controls, info }: VisualizerFrameProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8 flex flex-col gap-4 md:gap-6 min-h-full font-body">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6 pb-4 border-b border-black/10 dark:border-[#2a2d3e]">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-black dark:text-white tracking-wide">
            {title}
          </h1>
          <p className="text-black/60 dark:text-slate-400 text-sm max-w-xl leading-relaxed">
            {description}
          </p>
        </div>

        {complexity && (
          <div className="flex items-center gap-3 shrink-0 mt-2 md:mt-0">
            <div className="px-4 py-1.5 rounded-md bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 text-[10px] md:text-xs font-bold uppercase tracking-wider border border-emerald-500/25">
              {complexity.difficulty}
            </div>
            <div className="px-4 py-1.5 rounded-md bg-black/5 dark:bg-[#1e2035] text-black dark:text-slate-200 text-xs md:text-sm font-mono font-bold border border-black/10 dark:border-[#2f3352]">
              O({complexity.time})
            </div>
          </div>
        )}
      </div>

      {/* Main Visualizer Stage */}
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Chart Area — fixed height so it never resizes on algorithm step */}
        <div className="relative bg-white dark:bg-[#0d0f1a] rounded-xl border border-black/10 dark:border-[#252840] shadow-xl overflow-hidden flex flex-col">
          {/* Fixed-height canvas zone */}
          <div className="h-[300px] md:h-[420px] relative overflow-hidden">
            {children}
          </div>

          {/* Controls docked at bottom inside card */}
          {controls && (
            <div className="bg-white dark:bg-[#111428] border-t border-black/10 dark:border-[#252840] px-4 py-4 md:px-6 md:py-5 shrink-0">
              {controls}
            </div>
          )}
        </div>

        {/* Theory / Info area */}
        <div className="flex flex-col gap-4">
          {info}
        </div>
      </div>
    </div>
  );
}
