"use client";

import Link from "next/link";
import { MoveLeft, Monitor, Layers, Database, Globe } from "lucide-react";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";

export default function SystemDesignPlaceholder() {
  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="System Design (Coming Soon)"
        description="We are building an interactive architect's canvas to visualize large scale system architectures, load balancers, and distributed databases."
        complexity={{ time: "N/A", space: "N/A", difficulty: "Expert" }}
        controls={
          <Link 
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg"
          >
            <MoveLeft size={18} />
            Back to Algorithms
          </Link>
        }
      >
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto gap-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-500/10 border-2 border-dashed border-indigo-500/30 flex items-center justify-center animate-pulse">
              <Monitor size={48} className="text-indigo-400 opacity-50" />
            </div>
            <div className="absolute -top-4 -right-4 bg-[var(--lime-dark)] dark:bg-lime text-black font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
              Coming Q2 2026
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-display tracking-tight text-black dark:text-white">
              The Architect&apos;s <span className="text-indigo-500">Playground.</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Moving beyond data structures. Visualize how data flows through microservices, 
              how Redis caches interact with PostgreSQL, and how Load Balancers distribute traffic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
            {[
              { icon: Layers, title: "Microservices", desc: "API Gateways & Service Mesh" },
              { icon: Database, title: "Databases", desc: "Replication & Sharding" },
              { icon: Globe, title: "CDN & Edge", desc: "Latency & Content Delivery" },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 border border-black/5 dark:border-white/5">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <feature.icon size={24} />
                </div>
                <div>
                  <div className="text-sm font-bold text-black dark:text-white">{feature.title}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs font-mono text-slate-500 mt-8 border-t border-black/5 dark:border-white/5 pt-8 w-full">
            ESTIMATED COMPLETION: 85% · BETA ACCESS SOON
          </div>
        </div>
      </VisualizerFrame>
    </div>
  );
}
