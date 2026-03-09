"use client";

import { ReactNode } from "react";
import { Terminal, Maximize2, Share2, Info, Settings2 } from "lucide-react";

interface WorkbenchProps {
  title: string;
  category: string;
  description: string;
  children: ReactNode;
  status?: "idle" | "running" | "finished";
}

export function Workbench({ title, category, description, children, status = "idle" }: WorkbenchProps) {
  return (
    <div className="flex flex-col h-full w-full max-w-6xl mx-auto p-4 lg:p-6 gap-6">
      {/* Workbench Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
              {category}
            </span>
            <div className={`w-2 h-2 rounded-full ${
              status === 'running' ? 'bg-amber-500 animate-pulse' : 
              status === 'finished' ? 'bg-emerald-500' : 'bg-text-muted'
            }`} />
            <span className="text-[10px] text-text-muted font-mono uppercase tracking-tighter">
              {status === 'running' ? 'System Active' : status === 'finished' ? 'Process Complete' : 'System Ready'}
            </span>
          </div>
          <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">
            {title}
          </h1>
          <p className="text-text-secondary text-sm max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2">
           <button className="p-2.5 rounded-xl bg-bg-card border border-border text-text-secondary hover:text-text-primary hover:shadow-md transition-all shadow-sm">
            <Maximize2 size={18} />
           </button>
           <button className="p-2.5 rounded-xl bg-bg-card border border-border text-text-secondary hover:text-text-primary hover:shadow-md transition-all shadow-sm">
            <Settings2 size={18} />
           </button>
        </div>
      </div>

      {/* Main Lab Area */}
      <div className="relative group flex-1 min-h-[450px] w-full bg-bg-card rounded-2xl border border-border shadow-xl shadow-black/5 overflow-hidden flex flex-col">
          {/* Decorative Corner Gradients */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 blur-[80px] -mr-32 -mt-32 rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[80px] -ml-32 -mb-32 rounded-full pointer-events-none" />

          {/* Workbench Controls Header */}
          <div className="h-12 border-b border-border/60 bg-bg-primary/30 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
             <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                   <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/40" />
                   <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
                   <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                </div>
                <div className="h-4 w-px bg-border/60 mx-1" />
                <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted">
                   <Terminal size={12} />
                   <span>visualizer_main.exe</span>
                </div>
             </div>
             
             <div className="flex items-center gap-4 text-[10px] text-text-muted font-mono uppercase tracking-widest">
                <span>GPU Acceleration ON</span>
                <span className="text-accent-primary animate-pulse">●</span>
             </div>
          </div>

          {/* Actual Visualization Content */}
          <div className="flex-1 relative z-0 overflow-hidden">
             {children}
          </div>
      </div>
    </div>
  );
}
