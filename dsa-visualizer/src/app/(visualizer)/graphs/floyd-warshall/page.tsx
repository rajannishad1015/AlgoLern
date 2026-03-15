"use client";

import { useEffect, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateFloydWarshallSteps } from "@/lib/algorithms/graphs/floydWarshall";
import { GraphViz } from "@/components/d3/GraphViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { GraphNode, GraphEdge } from "@/lib/types/algorithm";

// ─── Graph (directed, small for readability of matrix) ────────────────────
const nodes: GraphNode[] = [
  { id:"1", label:"1", x:50, y:10 },
  { id:"2", label:"2", x:15, y:55 },
  { id:"3", label:"3", x:85, y:55 },
  { id:"4", label:"4", x:50, y:85 },
];
const edges: GraphEdge[] = [
  { id:"e1", source:"1", target:"3", weight:3,  isDirected:true },
  { id:"e2", source:"1", target:"2", weight:8,  isDirected:true },
  { id:"e3", source:"2", target:"1", weight:4,  isDirected:true },
  { id:"e4", source:"3", target:"2", weight:-2, isDirected:true },
  { id:"e5", source:"4", target:"3", weight:7,  isDirected:true },
  { id:"e6", source:"4", target:"2", weight:2,  isDirected:true },
  { id:"e7", source:"3", target:"4", weight:3,  isDirected:true },
];

const THEORY = {
  title: "Floyd-Warshall Algorithm",
  description: "Floyd-Warshall computes shortest paths between ALL pairs of nodes in a weighted graph (directed or undirected), including negative edges. It uses dynamic programming: for each intermediate node k, check if routing through k is cheaper than the current known path.",
  descriptionHi: "Floyd-Warshall weighted graph ke SAARE pairs of nodes ke beech shortest path compute karta hai — negative edges ke saath bhi kaam karta hai. DP use karta hai: har intermediate node k ke liye check karo ki k se jaana current known path se sasta to nahi.",
  complexities: [
    { case:"Time",  time:"O(V³)", space:"O(V²)", note:"Three nested loops over all vertices" },
    { case:"Space", time:"O(V²)", space:"O(V²)", note:"V×V distance matrix" },
  ],
  useCases:["All-pairs shortest paths in dense graphs","Network diameter computation","Transitive closure of a graph","Detecting negative cycles (if dist[i][i] < 0)"],
  useCasesHi:["Dense graphs mein all-pairs shortest paths","Network diameter compute karna","Graph ki transitive closure","Negative cycles detect karna (agar dist[i][i] < 0)"],
  analogy:{
    icon:"🗓️",
    title:"Layover-by-Layover Routing",
    titleHi:"Layover-by-Layover Routing",
    desc:"To find cheapest flights between every pair of cities, use each city as a potential 'layover' city. Try: 'is going through city K cheaper than flying direct?' Do this for every K as layover, and after V rounds all cheapest routes are known.",
    descHi:"Har pair of cities ke beech cheapest flight dhundh ne ke liye, har city ko 'layover' city banao. Check karo: 'city K se jaana direct flight se sasta to nahi?' Har K ke liye yahi karo. V rounds ke baad sab cheapest routes mill jaate hain.",
  },
  howItWorks:{
    en:[
      { icon:"📐", text:"Initialize V×V matrix: dist[i][i]=0, dist[i][j]=edge weight if exists, else ∞." },
      { icon:"🔄", text:"For each intermediate node k (V iterations):" },
      { icon:"📌", text:"  For every pair (i,j): if dist[i][k] + dist[k][j] < dist[i][j], update dist[i][j]." },
      { icon:"✅", text:"After V iterations, dist[i][j] is the shortest path from i to j." },
      { icon:"⚠️", text:"If dist[i][i] < 0 for any i → negative cycle!" },
    ],
    hi:[
      { icon:"📐", text:"V×V matrix initialize karo: dist[i][i]=0, dist[i][j]=edge weight (ya ∞)." },
      { icon:"🔄", text:"Har intermediate node k ke liye (V iterations):" },
      { icon:"📌", text:"  Har pair (i,j) ke liye: agar dist[i][k] + dist[k][j] < dist[i][j], dist[i][j] update karo." },
      { icon:"✅", text:"V iterations ke baad dist[i][j] = shortest path from i to j." },
      { icon:"⚠️", text:"Agar dist[i][i] < 0 kisi i ke liye → negative cycle!" },
    ],
  },
  readingTip:{ en:"The distance matrix updates live. Blue cells = being compared using current intermediate node k. Orange cell = value just updated to a shorter path. The highlighted row and column correspond to node k.", hi:"Distance matrix live update hoti hai. Blue cells = current intermediate k use karke compare ho rahe. Orange cell = abhi shorter path mila aur value update hui. Highlighted row aur column node k ke hain." },
  quote:{ en:'"Floyd-Warshall answers every shortest-path question at once — at the cost of O(V³) time and O(V²) space."', hi:'"Floyd-Warshall ek saath sab shortest-path questions ka jawab deta hai — O(V³) time aur O(V²) space ki keemat par."' },
  pseudocode:`function floydWarshall(graph):
    dist = V×V matrix
    dist[i][i] = 0
    dist[i][j] = weight(i,j) if edge exists else ∞

    for k in vertices:              // intermediate node
        for i in vertices:
            for j in vertices:
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]

    return dist`,
  code:{ language:"java", content:`int[][] dist = new int[V][V];
// Initialize
for (int i = 0; i < V; i++)
    for (int j = 0; j < V; j++)
        dist[i][j] = (i == j) ? 0 : (graph[i][j] != 0 ? graph[i][j] : Integer.MAX_VALUE / 2);

// DP
for (int k = 0; k < V; k++)
    for (int i = 0; i < V; i++)
        for (int j = 0; j < V; j++)
            if (dist[i][k] + dist[k][j] < dist[i][j])
                dist[i][j] = dist[i][k] + dist[k][j];

// Negative cycle check
for (int i = 0; i < V; i++)
    if (dist[i][i] < 0) System.out.println("Neg cycle!");` },
  quiz:[
    { q:"What is Floyd-Warshall's time complexity?", options:["O(V log V)","O(V²)","O(V³)","O(V² log V)"], answer:2 },
    { q:"Floyd-Warshall is used to find?", options:["Single-source shortest paths","Minimum spanning tree","All-pairs shortest paths","Topological order"], answer:2 },
    { q:"Floyd-Warshall uses which technique?", options:["Greedy","Divide & Conquer","Dynamic Programming","Backtracking"], answer:2 },
  ],
};

export default function FloydWarshallPage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { steps, currentStepIndex, isPlaying, speed, setSteps, setIsPlaying, setSpeed, stepForward, stepBackward, resetVisualizer, setAlgorithmId } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("floyd-warshall");
    setSteps(generateFloydWarshallSteps(nodes, edges));
    return () => { resetVisualizer(); if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (currentStepIndex < steps.length - 1) stepForward();
        else { setIsPlaying(false); if (timerRef.current) clearInterval(timerRef.current); }
      }, speed);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, currentStepIndex, steps.length, speed, stepForward, setIsPlaying]);

  const currentStep  = steps[currentStepIndex];
  const matrix       = currentStep?.values?.matrix ?? {};
  const ids: string[]= (currentStep?.values?.ids ?? nodes.map(n => n.id)) as string[];
  const kNode        = currentStep?.values?.k as string | undefined;
  const activeI      = currentStep?.values?.u as string | undefined;
  const activeJ      = currentStep?.values?.v as string | undefined;

  // Create a stepForViz with nodes and edges injected for GraphViz
  const stepForViz = currentStep ? {
    ...currentStep,
    values: { nodes, edges },
  } : undefined;

  const stepDesc = currentStep?.description ?? "Floyd-Warshall ready — press Play!";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Floyd-Warshall Algorithm"
        description="Computes ALL-PAIRS shortest paths using dynamic programming. Works on directed/undirected graphs with negative edges (but no negative cycles). O(V³) time."
        complexity={{ time: "V³", space: "V²", difficulty: "Hard" }}
        controls={
          <ControlBar
            onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)}
            onStepForward={stepForward} onStepBackward={stepBackward}
            onReset={resetVisualizer} onSpeedChange={setSpeed}
            isPlaying={isPlaying} currentStep={currentStepIndex}
            totalSteps={steps.length} speed={speed}
            stepDescription={stepDesc}
          />
        }
        info={<TheoryCard {...THEORY} />}
      >
        <div className="w-full h-full flex flex-col gap-3 p-3">
          {/* Top row: graph + matrix side by side */}
          <div className="flex gap-3 flex-1 min-h-0">
            {/* Graph */}
            <div className="flex-1 min-h-[300px]">
              <GraphViz currentStepData={stepForViz} />
            </div>

            {/* Distance matrix */}
            <div className="bg-[#111428] border border-white/5 rounded-xl p-3 flex flex-col shrink-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Distance Matrix dist[i][j]</p>
                {kNode && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[9px] font-mono">k={kNode}</span>
                )}
              </div>

              {ids.length > 0 && (
                <div className="overflow-auto">
                  <table className="border-separate border-spacing-0.5 font-mono text-xs">
                    <thead>
                      <tr>
                        <th className="w-8 h-8 text-[9px] text-slate-600">i↓ j→</th>
                        {ids.map(j => (
                          <th key={j} className={`w-10 h-8 rounded-lg text-center text-[10px] font-bold transition-all ${
                            kNode === j ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/40"
                            : "text-slate-500"}`}>{j}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ids.map(i => (
                        <tr key={i}>
                          <td className={`w-8 h-8 rounded-lg text-center text-[10px] font-bold transition-all ${
                            kNode === i ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/40"
                            : "text-slate-500"}`}>{i}</td>
                          {ids.map(j => {
                            const val = matrix[i]?.[j];
                            const isActive = activeI === i && activeJ === j;
                            const isCompare = (activeI === i || activeJ === j) && kNode;
                            const isDiag   = i === j;
                            return (
                              <td key={j} className={`w-10 h-8 rounded-lg text-center font-mono transition-all duration-200 text-[11px] border ${
                                isActive   ? "bg-orange-500/30 border-orange-400/60 text-orange-200 font-bold shadow-[0_0_8px_rgba(251,146,60,0.4)]"
                                : isCompare ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
                                : isDiag   ? "bg-white/5 border-white/10 text-slate-500"
                                : val === "∞" ? "bg-transparent border-transparent text-slate-700"
                                : "bg-white/5 border-white/8 text-slate-300"
                              }`}>{val ?? "∞"}</td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Legend */}
              <div className="flex gap-2 mt-3 flex-wrap">
                <span className="flex items-center gap-1 text-[8px] font-mono text-slate-500"><span className="w-2 h-2 rounded bg-indigo-500/30 border border-indigo-500/40 inline-block"/>row/col of k</span>
                <span className="flex items-center gap-1 text-[8px] font-mono text-slate-500"><span className="w-2 h-2 rounded bg-orange-500/30 border border-orange-400/60 inline-block"/>updated cell</span>
              </div>
            </div>
          </div>
        </div>
      </VisualizerFrame>
    </div>
  );
}
