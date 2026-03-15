"use client";

import { useEffect, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generatePrimSteps } from "@/lib/algorithms/graphs/prim";
import { GraphViz } from "@/components/d3/GraphViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { GraphNode, GraphEdge } from "@/lib/types/algorithm";

// ─── Graph ─────────────────────────────────────────────────────────────────
const nodes: GraphNode[] = [
  { id:"A", label:"A", x:50, y:8  },
  { id:"B", label:"B", x:15, y:38 },
  { id:"C", label:"C", x:82, y:35 },
  { id:"D", label:"D", x:8,  y:72 },
  { id:"E", label:"E", x:48, y:62 },
  { id:"F", label:"F", x:82, y:72 },
  { id:"G", label:"G", x:48, y:88 },
];
const edges: GraphEdge[] = [
  { id:"e1",  source:"A", target:"B", weight:7,  isDirected:false },
  { id:"e2",  source:"A", target:"C", weight:8,  isDirected:false },
  { id:"e3",  source:"B", target:"D", weight:5,  isDirected:false },
  { id:"e4",  source:"B", target:"E", weight:9,  isDirected:false },
  { id:"e5",  source:"C", target:"E", weight:5,  isDirected:false },
  { id:"e6",  source:"C", target:"F", weight:6,  isDirected:false },
  { id:"e7",  source:"D", target:"E", weight:15, isDirected:false },
  { id:"e8",  source:"D", target:"G", weight:6,  isDirected:false },
  { id:"e9",  source:"E", target:"F", weight:8,  isDirected:false },
  { id:"e10", source:"E", target:"G", weight:11, isDirected:false },
  { id:"e11", source:"F", target:"G", weight:9,  isDirected:false },
];
const START = "A";

const THEORY = {
  title: "Prim's Algorithm (MST)",
  description: "Prim's algorithm grows a Minimum Spanning Tree one node at a time. Starting from a source, it always picks the cheapest edge connecting the MST to a node outside it — similar to Dijkstra's BFS-like expansion but for spanning trees.",
  descriptionHi: "Prim's algorithm ek ek node karte hue MST grow karta hai. Source se shuru karke, hamesha wo cheapest edge pick karta hai jo MST se bahar ke node ko connect kare — Dijkstra jaise hi, lekin spanning tree ke liye.",
  complexities: [
    { case:"With Min-Heap", time:"O((V+E) log V)", space:"O(V)", note:"Efficient for sparse graphs" },
    { case:"Naive Array",   time:"O(V²)",          space:"O(V)", note:"Good for dense graphs" },
  ],
  useCases:["Same as Kruskal — minimum cable layouts","LAN/WAN network design","Robot motion planning","Approximation of Traveling Salesman Problem"],
  useCasesHi:["Kruskal jaise — minimum cable layouts","LAN/WAN network design","Robot motion planning","Traveling Salesman Problem ka approximation"],
  analogy:{
    icon:"🌱",
    title:"Growing a Tree",
    titleHi:"Ek Ped Ugana",
    desc:"Plant a seed at the start node. The tree grows one branch at a time — always extending the cheapest available branch to an unexplored node. Unlike Kruskal, Prim always maintains a single connected sub-tree.",
    descHi:"Start node pe ek beej lagao. Ped ek branch ek time grow karta hai — hamesha cheapest available branch unexplored node ki taraf extend karta hai. Kruskal se alag, Prim hamesha ek connected sub-tree maintain karta hai.",
  },
  howItWorks:{
    en:[
      { icon:"0️⃣", text:"key[source]=0, key[all others]=∞. All nodes in a priority queue." },
      { icon:"📌", text:"Extract minimum key node u. Add it to MST. Add the edge connecting u to its parent into MST edges." },
      { icon:"🔗", text:"For each neighbor v of u not in MST: if edge(u,v).weight < key[v], update key[v]." },
      { icon:"🔁", text:"Repeat until all nodes are in the MST." },
    ],
    hi:[
      { icon:"0️⃣", text:"key[source]=0, key[baaki sab]=∞. Sab nodes priority queue mein." },
      { icon:"📌", text:"Minimum key node u extract karo. MST mein daalo. Us edge ko MST mein daalo." },
      { icon:"🔗", text:"u ke har neighbor v ke liye jo MST mein nahi: agar edge(u,v).weight < key[v], key[v] update karo." },
      { icon:"🔁", text:"Tab tak repeat karo jab tak sab nodes MST mein na ho jaayen." },
    ],
  },
  readingTip:{ en:"Blue node = currently added to MST. Orange edge = under consideration. Green edges = MST edges confirmed so far. Key values panel on left shows how candidate edges get updated.", hi:"Blue node = abhi MST mein add hua. Orange edge = consider ho raha. Green edges = MST edges confirmed. Left mein key values panel dekhta hai ki candidate edges kaise update hote hain." },
  quote:{ en:'"Kruskal thinks globally (sorts all edges). Prim thinks locally (always extends the nearest frontier)."', hi:'"Kruskal globally sochta hai (saari edges sort karta hai). Prim locally sochta hai (nearest frontier extend karta hai)."' },
  pseudocode:`function prim(graph, start):
    key = {all: ∞}; key[start] = 0
    parent = {all: null}
    mst = {}

    while unexplored nodes remain:
        u = node not in mst with min key[u]
        mst.add(u)

        for (v, weight) in neighbors of u:
            if v not in mst and weight < key[v]:
                key[v] = weight
                parent[v] = u

    return mst edges`,
  code:{ language:"java", content:`// Prim's with simple array approach
boolean[] inMST = new boolean[V];
int[] key = new int[V], parent = new int[V];
Arrays.fill(key, Integer.MAX_VALUE);
key[src] = 0; parent[src] = -1;

for (int i = 0; i < V - 1; i++) {
    int u = minKey(key, inMST); // pick min-key node
    inMST[u] = true;
    for (int[] edge : adj.get(u)) {
        int v = edge[0], w = edge[1];
        if (!inMST[v] && w < key[v]) {
            parent[v] = u;
            key[v] = w;
        }
    }
}` },
  quiz:[
    { q:"What does Prim's algorithm produce?", options:["Shortest paths","Maximum spanning tree","Minimum spanning tree","Topological order"], answer:2 },
    { q:"Prim's and Kruskal's produce the same result when?", options:["Graph is directed","Edge weights are unique","Graph is disconnected","No negative weights exist"], answer:1 },
    { q:"Prim's grows the MST how?", options:["By sorting all edges","One vertex at a time from a seed","One edge at a time from a sorted list","Using BFS on sorted neighbors"], answer:1 },
  ],
};

export default function PrimPage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { steps, currentStepIndex, isPlaying, speed, setSteps, setIsPlaying, setSpeed, stepForward, stepBackward, resetVisualizer, setAlgorithmId } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("prim");
    setSteps(generatePrimSteps(nodes, edges, START));
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
  const keyVals     = currentStep?.values?.key    ?? {};
  const inMST       = currentStep?.values?.inMST  ?? [];
  const mstEdgeIds  = (currentStep?.values?.mstEdges ?? []) as string[];
  const totalW      = edges.filter(e => mstEdgeIds.includes(e.id)).reduce((s, e) => s + (e.weight ?? 0), 0);

  const stepForViz = currentStep ? {
    ...currentStep,
    values: { nodes, edges },
    edgeIds: currentStep.type === "done" ? mstEdgeIds : currentStep.edgeIds,
  } : undefined;

  const stepDesc = currentStep?.description ?? "Prim's MST ready — press Play!";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Prim's Algorithm"
        description="Grows a Minimum Spanning Tree vertex by vertex from a seed. Always picks the cheapest edge connecting the MST frontier to a new node."
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
          {/* Side panel */}
          <div className="w-48 shrink-0 flex flex-col gap-3">
            {/* Key values */}
            <div className="flex-1 bg-[#111428] border border-white/5 rounded-xl p-3 flex flex-col">
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">Key Values</p>
              <div className="flex flex-col gap-1 overflow-auto">
                {nodes.map(n => {
                  const k    = keyVals[n.id];
                  const inT  = (inMST as string[]).includes(n.id);
                  const isAct = currentStep?.nodeIds?.includes(n.id);
                  const inf   = k === undefined || k === Infinity || k === null;
                  return (
                    <div key={n.id} className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                      inT   ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                      : isAct ? "border-indigo-400/50 bg-indigo-500/15 text-indigo-200"
                      : inf   ? "border-white/5 bg-transparent text-slate-600"
                      :         "border-white/8 bg-white/5 text-slate-300"
                    }`}>
                      <span className="font-bold">{n.id}</span>
                      <span>{inf ? "∞" : k}</span>
                      {inT && <span className="text-[9px] text-emerald-500">✓MST</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total */}
            <div className="bg-[#111428] border border-white/5 rounded-xl px-3 py-2.5 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">MST Weight</span>
              <span className="text-emerald-400 font-bold">{totalW}</span>
            </div>
          </div>

          {/* Graph */}
          <div className="flex-1 min-h-[360px]">
            <GraphViz currentStepData={stepForViz} />
          </div>
        </div>
      </VisualizerFrame>
    </div>
  );
}
