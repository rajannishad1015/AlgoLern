"use client";

import { useEffect, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateDijkstraSteps } from "@/lib/algorithms/graphs/dijkstra";
import { GraphViz } from "@/components/d3/GraphViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { GraphNode, GraphEdge } from "@/lib/types/algorithm";

// ─── Graph ─────────────────────────────────────────────────────────────────
const nodes: GraphNode[] = [
  { id: "A", label: "A", x:50, y:8  },
  { id: "B", label: "B", x:15, y:38 },
  { id: "C", label: "C", x:82, y:35 },
  { id: "D", label: "D", x:8,  y:72 },
  { id: "E", label: "E", x:48, y:62 },
  { id: "F", label: "F", x:80, y:72 },
];
const edges: GraphEdge[] = [
  { id:"e1", source:"A", target:"B", weight:4,  isDirected:false },
  { id:"e2", source:"A", target:"C", weight:2,  isDirected:false },
  { id:"e3", source:"B", target:"D", weight:5,  isDirected:false },
  { id:"e4", source:"B", target:"E", weight:10, isDirected:false },
  { id:"e5", source:"C", target:"E", weight:3,  isDirected:false },
  { id:"e6", source:"C", target:"F", weight:8,  isDirected:false },
  { id:"e7", source:"E", target:"D", weight:4,  isDirected:false },
  { id:"e8", source:"E", target:"F", weight:1,  isDirected:false },
];
const START = "A";

// ─── Theory ────────────────────────────────────────────────────────────────
const THEORY = {
  title: "Dijkstra's Algorithm",
  description: "Dijkstra finds the shortest paths from a source node to all other nodes in a weighted graph with non-negative edges. It uses a greedy min-priority approach: always extend the currently cheapest unvisited node.",
  descriptionHi: "Dijkstra ek weighted graph mein source se sabhi nodes tak shortest path dhundh ta hai (sirf non-negative weights ke saath). Greedy approach: hamesha sabse sasta unvisited node extend karo.",
  complexities: [
    { case:"With Min-Heap", time:"O((V+E) log V)", space:"O(V)", note:"Efficient for sparse graphs" },
    { case:"Naive Array",   time:"O(V²)",          space:"O(V)", note:"Works for dense graphs" },
  ],
  useCases: ["GPS navigation & Google Maps", "Network routing protocols (OSPF)", "Airline shortest-route finder", "Game pathfinding (A* extends Dijkstra)"],
  useCasesHi: ["GPS navigation & Google Maps", "Network routing protocols (OSPF)", "Airline shortest-route finder", "Game pathfinding (A* Dijkstra ka extension hai)"],
  analogy: {
    icon: "🗺️",
    title: "Spreading Ink on a Map",
    titleHi: "Map Par Ink Phailana",
    desc: "Pour ink at the source city. It spreads through roads at speeds proportional to road cost. Cities reached first are the cheapest to get to. Dijkstra is exactly this — it processes cities in order of their known minimum cost.",
    descHi: "Source city pe ink daalo. Woh roads ke through phailti hai — cost ke hisaab se speed. Pehle pahunche cities cheapest hain. Dijkstra exactly aise hi kaam karta hai.",
  },
  howItWorks: {
    en: [
      { icon: "0️⃣", text: "Set dist[source]=0, dist[all others]=∞. Add all nodes to unvisited set." },
      { icon: "📌", text: "Pick the unvisited node with minimum distance (current node)." },
      { icon: "🔗", text: "For each unvisited neighbor: if dist[current]+weight < dist[neighbor], update dist[neighbor]." },
      { icon: "✅", text: "Mark current as visited. Repeat until all visited or min distance is ∞." },
    ],
    hi: [
      { icon: "0️⃣", text: "dist[source]=0, dist[baaki sab]=∞. Sab nodes unvisited set mein." },
      { icon: "📌", text: "Unvisited nodes mein se minimum distance wala node choose karo." },
      { icon: "🔗", text: "Har unvisited neighbor ke liye: agar dist[current]+weight < dist[neighbor], update karo." },
      { icon: "✅", text: "Current ko visited mark karo. Tab tak repeat karo jab tak sab visited na ho." },
    ],
  },
  readingTip: { en:"Blue node = currently selected minimum. Orange edge = being relaxed. Green = shorter path found, distance updated. Distance table at left updates live.", hi:"Blue node = abhi select minimum. Orange edge = relax ho raha. Green = shorter path mila, distance update. Left mein distance table live update hoti hai." },
  quote: { en:'"Dijkstra does not explore all paths — it guides itself greedily toward the cheapest option every single step."', hi:'"Dijkstra sab paths explore nahi karta — woh greedy banke har step mein cheapest option choose karta hai."' },
  pseudocode: `function dijkstra(graph, start):
    dist = {all: Infinity}; dist[start] = 0
    visited = {}
    
    while unvisited nodes remain:
        u = unvisited node with min dist[u]
        if dist[u] == Infinity: break
        
        for (v, w) in neighbors of u:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                prev[v] = u
        
        visited.add(u)
    
    return dist, prev`,
  code: { language:"java", content:`// Simplified Dijkstra with adjacency list
int[] dist = new int[V];
Arrays.fill(dist, Integer.MAX_VALUE);
dist[src] = 0;
PriorityQueue<int[]> pq = new PriorityQueue<>((a,b)->a[1]-b[1]);
pq.add(new int[]{src, 0});

while (!pq.isEmpty()) {
    int[] cur = pq.poll();
    int u = cur[0], d = cur[1];
    if (d > dist[u]) continue;
    for (int[] edge : adj.get(u)) {
        int v = edge[0], w = edge[1];
        if (dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w;
            pq.add(new int[]{v, dist[v]});
        }
    }
}` },
  quiz: [
    { q:"Dijkstra fails when graph has…?", options:["Undirected edges","Negative weight edges","Many vertices","Cycles"], answer:1 },
    { q:"What is Dijkstra's time complexity with a Min-Heap?", options:["O(V²)","O(V+E)","O((V+E) log V)","O(E log E)"], answer:2 },
    { q:"Dijkstra uses which algorithmic paradigm?", options:["Divide & Conquer","Dynamic Programming","Greedy","Backtracking"], answer:2 },
  ],
};

export default function DijkstraPage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { steps, currentStepIndex, isPlaying, speed, setSteps, setIsPlaying, setSpeed, stepForward, stepBackward, resetVisualizer, setAlgorithmId } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("dijkstra");
    setSteps(generateDijkstraSteps(nodes, edges, START));
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

  const currentStep = steps[currentStepIndex];
  const dist       = currentStep?.auxiliaryState?.distances ?? {};
  const prev       = currentStep?.auxiliaryState?.previous ?? {};

  const stepDesc = currentStep?.description
    ? currentStep.description
        .replace(/node ([A-Z])/g, '<span class="text-indigo-300 font-bold">node $1</span>')
        .replace(/(\d+)\s*<\s*(\d+)/g, '<span class="text-emerald-300 font-bold">$1 &lt; $2</span>')
        .replace(/distance\s*(\d+)/gi, '<span class="text-amber-300 font-bold">distance $1</span>')
    : "Dijkstra ready — press Play!";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Dijkstra's Algorithm"
        description="Finds shortest paths from a source to all nodes in a weighted graph with non-negative edges. Always extends the cheapest unvisited node first."
        complexity={{ time: "(V+E) log V", space: "V", difficulty: "Medium" }}
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
        <div className="w-full h-full flex gap-3 p-3">
          {/* Distance table */}
          <div className="w-48 shrink-0 bg-[#111428] border border-white/5 rounded-xl p-3 flex flex-col">
            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">Distances from {START}</p>
            <div className="flex flex-col gap-1 flex-1 overflow-auto">
              {nodes.map(n => {
                const d   = dist[n.id];
                const p   = prev[n.id];
                const isAct = currentStep?.nodeIds?.includes(n.id);
                const inf   = d === undefined || d === Infinity || d === null;
                return (
                  <div key={n.id} className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border transition-all text-xs font-mono ${
                    isAct ? "border-indigo-400/50 bg-indigo-500/15 text-indigo-200"
                    : inf  ? "border-white/5 bg-white/3 text-slate-600"
                    :        "border-white/8 bg-white/5 text-slate-300"
                  }`}>
                    <span className="font-bold">{n.id}</span>
                    <span>{inf ? "∞" : d}</span>
                    {p && <span className="text-slate-500 text-[9px]">← {p}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Graph */}
          <div className="flex-1 min-h-[360px]">
            <GraphViz currentStepData={currentStep} />
          </div>
        </div>
      </VisualizerFrame>
    </div>
  );
}
