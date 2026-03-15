"use client";

import { useEffect, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateBellmanFordSteps } from "@/lib/algorithms/graphs/bellmanFord";
import { GraphViz } from "@/components/d3/GraphViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { GraphNode, GraphEdge } from "@/lib/types/algorithm";
import { AlertTriangle } from "lucide-react";

// ─── Graph ─────────────────────────────────────────────────────────────────
const nodes: GraphNode[] = [
  { id:"A", label:"A", x:50, y:8  },
  { id:"B", label:"B", x:15, y:38 },
  { id:"C", label:"C", x:82, y:35 },
  { id:"D", label:"D", x:10, y:75 },
  { id:"E", label:"E", x:50, y:65 },
  { id:"F", label:"F", x:82, y:72 },
];
// Includes a negative edge to show Bellman-Ford's strength over Dijkstra
const edges: GraphEdge[] = [
  { id:"e1", source:"A", target:"B", weight:6,  isDirected:true },
  { id:"e2", source:"A", target:"C", weight:7,  isDirected:true },
  { id:"e3", source:"B", target:"D", weight:5,  isDirected:true },
  { id:"e4", source:"B", target:"E", weight:8,  isDirected:true },
  { id:"e5", source:"B", target:"C", weight:8,  isDirected:true },
  { id:"e6", source:"C", target:"E", weight:-3, isDirected:true },
  { id:"e7", source:"D", target:"E", weight:-2, isDirected:true },
  { id:"e8", source:"E", target:"F", weight:9,  isDirected:true },
];
const START = "A";

const THEORY = {
  title: "Bellman-Ford Algorithm",
  description: "Bellman-Ford finds the shortest paths from a source node even when the graph contains negative weight edges. It relaxes all edges N-1 times (N = nodes), can detect negative cycles, but is slower than Dijkstra at O(VE).",
  descriptionHi: "Bellman-Ford negative weight edges wale graphs mein bhi shortest path dhundhta hai. Saari edges N-1 baar relax karta hai. Negative cycles bhi detect kar sakta hai. Dijkstra se slow hai (O(VE)), par zyada capable!",
  complexities: [
    { case:"Time",  time:"O(V × E)", space:"O(V)", note:"Relaxes all edges V-1 times" },
    { case:"Space", time:"O(V)",     space:"O(V)", note:"Stores distance & previous arrays" },
  ],
  useCases: ["Networks with negative latency/cost edges","Currency arbitrage detection via negative cycles","Routing protocols like RIP (Routing Info Protocol)","fallback when Dijkstra can't be used (negative edges)"],
  useCasesHi: ["Negative latency/cost wale networks","Currency arbitrage detection via negative cycles","Routing protocols jaise RIP","Jab Dijkstra safe na ho (negative edges hoon)"],
  analogy: {
    icon:"🔄",
    title:"Repeated Rumor Spreading",
    titleHi:"Baar Baar Afwah Phailana",
    desc:"Imagine spreading rumored costs through a group. In each round, everyone tells their neighbors: 'I heard you can reach my destination for this cost.' After N-1 rounds, all shortest costs are known. Bellman-Ford does exactly this — N-1 rounds of telling everyone.",
    descHi:"Socho ek group mein rumors phailana. Har round mein sab apne neighbors ko batate hain: 'main yahan tak itni cost mein pahunch sakta hun.' N-1 rounds ke baad sab shortest costs maloom. Bellman-Ford exactly yahi karta hai.",
  },
  howItWorks: {
    en: [
      { icon:"0️⃣", text:"Initialize dist[source]=0, dist[all others]=∞." },
      { icon:"🔄", text:"For N-1 iterations: for every edge (u→v, w), if dist[u]+w < dist[v], relax: dist[v] = dist[u]+w." },
      { icon:"🎯", text:"Early exit: if no edge was relaxed in an iteration, algorithm is done." },
      { icon:"⚠️", text:"After N-1 iterations, do one more pass. If any edge can still be relaxed → negative cycle detected!" },
    ],
    hi: [
      { icon:"0️⃣", text:"dist[source]=0, dist[baaki sab]=∞." },
      { icon:"🔄", text:"N-1 iterations ke liye: har edge (u→v, w) ke liye, agar dist[u]+w < dist[v], relax karo." },
      { icon:"🎯", text:"Early exit: agar koi edge relax na hui iteration mein, algorithm done." },
      { icon:"⚠️", text:"N-1 iterations ke baad ek aur pass. Koi edge relax hui → negative cycle hai!" },
    ],
  },
  readingTip:{ en:"Watch each edge being checked (highlighted). Red edge = being relaxed now. Distance table updates when a shorter path is found. ⚠️ banner appears if a negative cycle is detected.", hi:"Har edge ko check hote dekho. Red edge = abhi relax ho raha. Distance table update hoti hai jab shorter path mile. ⚠️ banner aata hai agar negative cycle detect ho." },
  quote:{ en:'"Bellman-Ford is slower than Dijkstra — but it handles what Dijkstra cannot: negative edges."', hi:'"Bellman-Ford Dijkstra se slow hai — lekin woh karna handle karta hai jo Dijkstra nahi kar sakta: negative edges."' },
  pseudocode:`function bellmanFord(nodes, edges, src):
    dist = {all: ∞}; dist[src] = 0

    repeat N-1 times:
        for each edge (u, v, weight):
            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight

    // Negative cycle check
    for each edge (u, v, weight):
        if dist[u] + weight < dist[v]:
            return "Negative cycle detected!"

    return dist`,
  code:{ language:"java", content:`int[] dist = new int[V];
Arrays.fill(dist, Integer.MAX_VALUE);
dist[src] = 0;

for (int i = 1; i < V; i++) {        // N-1 iterations
    for (int[] e : edges) {           // All edges
        int u = e[0], v = e[1], w = e[2];
        if (dist[u] != Integer.MAX_VALUE && dist[u]+w < dist[v])
            dist[v] = dist[u] + w;
    }
}
// Check for negative cycle
for (int[] e : edges) {
    int u = e[0], v = e[1], w = e[2];
    if (dist[u] != Integer.MAX_VALUE && dist[u]+w < dist[v])
        System.out.println("Negative cycle!");
}` },
  quiz:[
    { q:"Bellman-Ford can handle which type of edges that Dijkstra cannot?", options:["Self-loops","Negative weight edges","Undirected edges","Heavy edges"], answer:1 },
    { q:"How many times does Bellman-Ford relax all edges?", options:["E times","V times","V-1 times","(V+E) times"], answer:2 },
    { q:"What indicates a negative cycle in Bellman-Ford?", options:["No path found","An additional relaxation possible after V-1 iterations","Zero-weight path discovered","Infinite loop in adjacency list"], answer:1 },
  ],
};

export default function BellmanFordPage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { steps, currentStepIndex, isPlaying, speed, setSteps, setIsPlaying, setSpeed, stepForward, stepBackward, resetVisualizer, setAlgorithmId } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("bellman-ford");
    setSteps(generateBellmanFordSteps(nodes, edges, START));
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
  const dist         = currentStep?.auxiliaryState?.distances ?? {};
  const prev         = currentStep?.auxiliaryState?.previous  ?? {};
  const hasNegCycle  = currentStep?.values?.negCycle === true;

  const stepDesc = currentStep?.description ?? "Bellman-Ford ready — press Play!";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Bellman-Ford Algorithm"
        description="Shortest paths from a source — works with negative edge weights. Detects negative cycles. O(VE) time."
        complexity={{ time: "V × E", space: "V", difficulty: "Hard" }}
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
          <div className="w-48 shrink-0 flex flex-col gap-3">
            <div className="flex-1 bg-[#111428] border border-white/5 rounded-xl p-3 flex flex-col">
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">Distances from {START}</p>
              <div className="flex flex-col gap-1 overflow-auto">
                {nodes.map(n => {
                  const d   = dist[n.id];
                  const p   = prev[n.id];
                  const act = currentStep?.nodeIds?.includes(n.id);
                  const inf = d === undefined || d === Infinity || d === null;
                  return (
                    <div key={n.id} className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                      act ? "border-indigo-400/50 bg-indigo-500/15 text-indigo-200"
                      : inf ? "border-white/5 bg-transparent text-slate-600"
                      : "border-white/8 bg-white/5 text-slate-300"
                    }`}>
                      <span className="font-bold">{n.id}</span>
                      <span>{inf ? "∞" : d}</span>
                      {p && <span className="text-slate-500 text-[9px]">← {p}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Negative cycle warning */}
            {hasNegCycle && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/15 border border-red-500/40 rounded-xl text-red-400 text-xs font-mono">
                <AlertTriangle size={14}/> Negative cycle!
              </div>
            )}

            {/* Edge weights note */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-[9px] font-mono text-amber-400">
              ⚡ This graph has a negative weight edge (C→E: −3) to show Bellman-Ford's true power!
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
