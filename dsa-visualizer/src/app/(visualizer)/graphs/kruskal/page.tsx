"use client";

import { useEffect, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateKruskalSteps } from "@/lib/algorithms/graphs/kruskal";
import { GraphViz } from "@/components/d3/GraphViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { GraphNode, GraphEdge } from "@/lib/types/algorithm";
import { CheckCircle2, XCircle } from "lucide-react";

// ─── Graph ─────────────────────────────────────────────────────────────────
const nodes: GraphNode[] = [
  { id:"A", label:"A", x:50, y:8  },
  { id:"B", label:"B", x:15, y:38 },
  { id:"C", label:"C", x:82, y:35 },
  { id:"D", label:"D", x:8,  y:72 },
  { id:"E", label:"E", x:48, y:62 },
  { id:"F", label:"F", x:82, y:70 },
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

const THEORY = {
  title: "Kruskal's Algorithm (MST)",
  description: "Kruskal's algorithm finds the Minimum Spanning Tree (MST) of a weighted undirected graph. It sorts all edges by weight, then greedily adds each edge that does NOT form a cycle — using Union-Find to check cycle formation.",
  descriptionHi: "Kruskal's algorithm weighted undirected graph ka Minimum Spanning Tree (MST) dhundhta hai. Saari edges weight ke hisaab se sort karta hai, phir greedy banke wo edges add karta hai jo cycle na banayein — Union-Find se cycle check karta hai.",
  complexities: [
    { case:"Sorting",    time:"O(E log E)", space:"O(E)", note:"Dominant step — sorting all edges" },
    { case:"Union-Find", time:"O(E α(V))",  space:"O(V)", note:"α = inverse Ackermann, near O(1)" },
    { case:"Overall",    time:"O(E log E)", space:"O(V)", note:"E log E dominates" },
  ],
  useCases:["Network design (minimum cable to connect cities)","Cluster analysis in machine learning","Image segmentation (grouping pixels)","Approximating NP-hard problems (TSP)"],
  useCasesHi:["Network design (minimum cable se cities connect karna)","Machine learning mein cluster analysis","Image segmentation (pixels group karna)","NP-hard problems ko approximate karna (TSP)"],
  analogy:{
    icon:"🪩",
    title:"Cheapest Wire Shopping",
    titleHi:"Sabse Sasta Wire Kharidna",
    desc:"You need to connect 7 cities with cables. You have a list of all possible cable lengths. Buy the shortest cable first. Then the next shortest — but skip any cable that would create a loop (since you already connected those cities via other cables).",
    descHi:"7 cities ko cables se connect karna hai. Tumhare paas sab possible cable lengths ki list hai. Pehle sabse chhota cable kharido. Phir next shortest — lekin skip karo wo cable jo loop banaye.",
  },
  howItWorks:{
    en:[
      { icon:"🗂️", text:"Sort all edges in ascending order of weight." },
      { icon:"🔗", text:"Process each edge in order. Use Union-Find to check if adding this edge creates a cycle." },
      { icon:"✅", text:"If no cycle: add edge to MST, union the two components." },
      { icon:"❌", text:"If cycle: reject this edge, move to next." },
      { icon:"🏁", text:"Stop when MST has V-1 edges (spanning tree is complete)." },
    ],
    hi:[
      { icon:"🗂️", text:"Saari edges weight ke ascending order mein sort karo." },
      { icon:"🔗", text:"Har edge process karo. Union-Find se check karo ki cycle banega ya nahi." },
      { icon:"✅", text:"Cycle nahi: edge ko MST mein daalo, do components union karo." },
      { icon:"❌", text:"Cycle hai: is edge ko reject karo, next pe jao." },
      { icon:"🏁", text:"Ruko jab MST mein V-1 edges ho jaayen (spanning tree complete)." },
    ],
  },
  readingTip:{ en:"Green edge = accepted into MST. Gray/dim edge = rejected (would form a cycle). Watch the MST edges panel on the left grow as the algorithm progresses. Total weight decreases toward the minimum.", hi:"Green edge = MST mein accepted. Gray/dim edge = rejected (cycle banata). Left mein MST edges panel dekhو — grow karta hai. Total weight minimum ki taraf jaata hai." },
  quote:{ en:'"Kruskal sorts the mess of all edges and pieces together the cheapest connected network."', hi:'"Kruskal saari edges ka confusion sort karta hai aur sabse sasta connected network piece karta hai."' },
  pseudocode:`function kruskal(graph):
    sortedEdges = sort(graph.edges, by weight ascending)
    parent = {each node → itself}  // Union-Find init
    mst = []

    for edge (u, v, w) in sortedEdges:
        if find(u) != find(v):   // no cycle
            mst.append(edge)
            union(u, v)
        if len(mst) == V-1: break

    return mst`,
  code:{ language:"java", content:`// Kruskal using Union-Find
Collections.sort(edges, (a,b) -> a.weight - b.weight);

int[] parent = new int[V];
for (int i = 0; i < V; i++) parent[i] = i;

List<int[]> mst = new ArrayList<>();
for (int[] e : edges) {
    int pu = find(parent, e[0]);
    int pv = find(parent, e[1]);
    if (pu != pv) {
        mst.add(e);
        parent[pu] = pv;
        if (mst.size() == V - 1) break;
    }
}` },
  quiz:[
    { q:"What data structure does Kruskal use to detect cycles?", options:["Stack","Queue","Union-Find (Disjoint Set)","Visited array"], answer:2 },
    { q:"Kruskal's time complexity is dominated by?", options:["Union-Find operations","Edge sorting","BFS scan","DFS scan"], answer:1 },
    { q:"A Minimum Spanning Tree of V nodes has exactly how many edges?", options:["V","V-1","V+1","E"], answer:1 },
  ],
};

export default function KruskalPage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { steps, currentStepIndex, isPlaying, speed, setSteps, setIsPlaying, setSpeed, stepForward, stepBackward, resetVisualizer, setAlgorithmId } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("kruskal");
    setSteps(generateKruskalSteps(nodes, edges));
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
  const mstEdgeIds   = (currentStep?.values?.mstEdges ?? []) as string[];
  const totalWeight  = currentStep?.values?.totalWeight ?? 0;
  const isAccepted   = currentStep?.type === "path";
  const isRejected   = currentStep?.type === "highlight" && currentStep.edgeIds?.length;

  // Inject mstEdgeIds into the step for GraphViz to use (via values.edges — GraphViz uses values.edges)
  // We need to pass nodes and edges to currentStepData.values
  const stepForViz = currentStep ? {
    ...currentStep,
    values: { nodes, edges, mstEdges: mstEdgeIds },
    // GraphViz uses edgeIds for highlighting active edge; make MST edges "done" would need custom component
    // We'll override edgeIds with mstEdgeIds when type is 'done'
    edgeIds: currentStep.type === "done" ? mstEdgeIds : currentStep.edgeIds,
  } : undefined;

  const stepDesc = currentStep?.description ?? "Kruskal ready — press Play!";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Kruskal's Algorithm"
        description="Finds the Minimum Spanning Tree by greedily picking the lightest edge that doesn't form a cycle, using Union-Find."
        complexity={{ time: "E log E", space: "V", difficulty: "Medium" }}
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
          {/* MST panel */}
          <div className="w-48 shrink-0 flex flex-col gap-3">
            <div className="flex-1 bg-[#111428] border border-white/5 rounded-xl p-3 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">MST Edges</p>
                <span className="text-[9px] font-mono text-emerald-400 font-bold">W={totalWeight}</span>
              </div>
              <div className="flex flex-col gap-1 overflow-auto flex-1">
                {mstEdgeIds.length === 0 ? (
                  <div className="text-xs text-slate-600 italic text-center py-2">None yet</div>
                ) : (
                  mstEdgeIds.map(eid => {
                    const e = edges.find(x => x.id === eid);
                    if (!e) return null;
                    return (
                      <div key={eid} className="flex items-center justify-between px-2 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-xs font-mono">
                        <span className="text-emerald-300 font-bold">{e.source}—{e.target}</span>
                        <span className="text-emerald-400">w:{e.weight}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Accept/Reject indicator */}
            {isAccepted && (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs font-mono">
                <CheckCircle2 size={13}/> Edge accepted!
              </div>
            )}
            {isRejected && !isAccepted && currentStep?.type === "highlight" && (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-red-500/15 border border-red-500/40 rounded-xl text-red-400 text-xs font-mono">
                <XCircle size={13}/> Cycle — rejected
              </div>
            )}
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
