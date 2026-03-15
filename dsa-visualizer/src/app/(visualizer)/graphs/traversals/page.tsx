"use client";

import { useEffect, useRef, useState } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateGraphTraversalSteps } from "@/lib/algorithms/graphs/graphTraversals";
import { GraphViz } from "@/components/d3/GraphViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { TheoryCard } from "@/components/visualizer/TheoryCard";

// ─── Default Graph ─────────────────────────────────────────────────────────
const sampleNodes = [
  { id: "A", label: "A", x: 50, y: 8  },
  { id: "B", label: "B", x: 20, y: 35 },
  { id: "C", label: "C", x: 80, y: 35 },
  { id: "D", label: "D", x: 10, y: 70 },
  { id: "E", label: "E", x: 45, y: 65 },
  { id: "F", label: "F", x: 75, y: 70 },
  { id: "G", label: "G", x: 55, y: 88 },
];
const sampleEdges = [
  { id: "e1", source: "A", target: "B", isDirected: false },
  { id: "e2", source: "A", target: "C", isDirected: false },
  { id: "e3", source: "B", target: "D", isDirected: false },
  { id: "e4", source: "B", target: "E", isDirected: false },
  { id: "e5", source: "C", target: "E", isDirected: false },
  { id: "e6", source: "C", target: "F", isDirected: false },
  { id: "e7", source: "E", target: "G", isDirected: false },
  { id: "e8", source: "F", target: "G", isDirected: false },
];

// ─── Theory ────────────────────────────────────────────────────────────────
const BFS_THEORY = {
  title: "BFS — Breadth-First Search",
  description: "BFS explores a graph level by level using a Queue. It first visits all nodes at distance 1 from start, then distance 2, and so on. Guaranteed to find the shortest path (by hop count) in an unweighted graph.",
  descriptionHi: "BFS graph ko level by level explore karta hai Queue use karke. Pehle sab nodes visit karta hai jo start se 1 step door hain, phir 2 step, aur aage badhta hai. Unweighted graph mein shortest path guaranteed milta hai!",
  complexities: [
    { case: "Time",  time: "O(V + E)", space: "O(V)", note: "V = vertices, E = edges" },
    { case: "Space", time: "O(V)",     space: "O(V)", note: "Queue can hold up to V nodes" },
  ],
  useCases: ["Shortest path in unweighted graphs", "Level-order tree traversal", "Web crawlers, social network degree separation", "Finding all connected components"],
  useCasesHi: ["Unweighted graphs mein shortest path", "Level-order tree traversal", "Web crawlers, social network degree separation", "Connected components dhundhna"],
  analogy: {
    icon: "🌊",
    title: "Ripples in a Pond",
    titleHi: "Talab mein Laharein",
    desc: "Drop a stone in water — ripples spread outward uniformly in all directions, each ring reaching farther nodes at the same time. BFS works exactly like this, processing all nodes at distance 1 before distance 2.",
    descHi: "Paani mein patthar fenkte hai — laharein sab directions mein uniformly phailti hain. BFS bilkul aise hi kaam karta hai — pehle distance 1 ke sab nodes, phir distance 2.",
  },
  howItWorks: {
    en: [
      { icon: "🔵", text: "Add start node to Queue. Mark it visited." },
      { icon: "📤", text: "Dequeue front node. Process it (add to result)." },
      { icon: "🔎", text: "Check each unvisited neighbor — enqueue it and mark visited." },
      { icon: "🔁", text: "Repeat until Queue is empty. All reachable nodes are visited." },
    ],
    hi: [
      { icon: "🔵", text: "Start node ko Queue mein daalo. Visited mark karo." },
      { icon: "📤", text: "Front node dequeue karo. Process karo (result mein daalo)." },
      { icon: "🔎", text: "Har unvisited neighbor check karo — enqueue karo aur visited mark karo." },
      { icon: "🔁", text: "Jab tak Queue empty na ho, repeat karo." },
    ],
  },
  readingTip: { en: "Watch the Queue panel on the left. Blue glow = currently dequeued node. Green = added to result. BFS processes each level completely before going deeper.", hi: "Left mein Queue panel dekho. Blue glow = abhi process ho raha node. Green = result mein add. BFS ek poora level khatam karne ke baad hi aage badhta hai." },
  quote: { en: '"BFS is the algorithm that finds shortest paths — not by being smart, but by being thorough."', hi: '"BFS shortest path isliye nahi dhundh leta kyunki woh smart hai — balki isliye kyunki woh poora explore karta hai."' },
  pseudocode: `function BFS(graph, start):
    queue = [start]
    visited = {start}
    result = []

    while queue is not empty:
        node = queue.dequeue()   // take from front
        result.append(node)

        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.enqueue(neighbor)

    return result`,
  code: { language: "java", content: `// BFS using a Queue
Queue<String> queue = new LinkedList<>();
Set<String> visited = new HashSet<>();
queue.add(start);
visited.add(start);

while (!queue.isEmpty()) {
    String node = queue.poll();
    result.add(node);
    for (String neighbor : adj.get(node)) {
        if (!visited.contains(neighbor)) {
            visited.add(neighbor);
            queue.add(neighbor);
        }
    }
}` },
  quiz: [
    { q: "What data structure does BFS use?", options: ["Stack", "Queue", "Priority Queue", "Linked List"], answer: 1 },
    { q: "BFS finds the shortest path in which type of graph?", options: ["Weighted directed", "Unweighted", "Negative weight", "Dense weighted"], answer: 1 },
    { q: "If a graph has V vertices and E edges, what is BFS time complexity?", options: ["O(V²)", "O(E log V)", "O(V + E)", "O(V × E)"], answer: 2 },
  ],
};

const DFS_THEORY = {
  ...BFS_THEORY,
  title: "DFS — Depth-First Search",
  description: "DFS explores a graph by diving as deep as possible along one branch before backtracking using a Stack (or recursion). It's ideal for cycle detection, topological sorting, and connected components.",
  descriptionHi: "DFS ek branch mein jitna ho sake utna deep jaata hai phir backtrack karta hai Stack use karke. Cycle detection, topological sort, aur connected components ke liye perfect hai.",
  analogy: {
    icon: "🏔️",
    title: "Hiking & Backtracking",
    titleHi: "Hiking aur Backtracking",
    desc: "Imagine hiking a maze — you always take the first available path. When you hit a dead end, you backtrack to the last junction and try the next path. DFS explores one complete path before trying alternatives.",
    descHi: "Socho maze mein hiking — hamesha pehla rasta lete ho. Dead end mile toh last junction pe wapas aao aur next rasta try karo. DFS ek complete path explore karne ke baad alternatives try karta hai.",
  },
  pseudocode: `function DFS(graph, start):
    stack = [start]
    visited = {start}
    result = []

    while stack is not empty:
        node = stack.pop()       // take from top
        result.append(node)

        for neighbor in reversed(graph[node]):
            if neighbor not in visited:
                visited.add(neighbor)
                stack.push(neighbor)

    return result`,
  code: { language: "java", content: `// DFS using a Stack (iterative)
Deque<String> stack = new ArrayDeque<>();
Set<String> visited = new HashSet<>();
stack.push(start);
visited.add(start);

while (!stack.isEmpty()) {
    String node = stack.pop();
    result.add(node);
    for (String neighbor : adj.get(node)) {
        if (!visited.contains(neighbor)) {
            visited.add(neighbor);
            stack.push(neighbor);
        }
    }
}` },
  quiz: [
    { q: "What data structure does DFS (iterative) use?", options: ["Queue", "Stack", "Priority Queue", "Heap"], answer: 1 },
    { q: "DFS is ideal for which operation?", options: ["Shortest path in unweighted graph", "Cycle detection", "Level-order traversal", "Min-cost spanning tree"], answer: 1 },
    { q: "DFS time complexity for a graph with V vertices and E edges?", options: ["O(V)", "O(E)", "O(V + E)", "O(V log E)"], answer: 2 },
  ],
};

export default function GraphTraversalsPage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [traversalType, setTraversalType] = useState<"BFS" | "DFS">("BFS");

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId(`graph-${traversalType.toLowerCase()}`);
    setSteps(generateGraphTraversalSteps(sampleNodes, sampleEdges, "A", traversalType));
    return () => { resetVisualizer(); if (timerRef.current) clearInterval(timerRef.current); };
  }, [traversalType, setSteps, resetVisualizer, setAlgorithmId]);

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
  const auxState   = currentStep?.auxiliaryState;
  const theory     = traversalType === "BFS" ? BFS_THEORY : DFS_THEORY;
  const label      = traversalType === "BFS" ? "Queue" : "Stack";

  const stepDesc = currentStep?.description
    ? currentStep.description.replace(/node ([A-Z])/g, '<span class="text-indigo-300 font-bold">node $1</span>')
    : "Graph traversal ready — press Play!";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title={`Graph Traversals`}
        description="BFS explores level by level (Queue). DFS dives deep first (Stack). Both visit every reachable node in O(V+E) time."
        complexity={{ time: "V + E", space: "V", difficulty: "Medium" }}
        controls={
          <div className="flex flex-col gap-4 w-full">
            {/* BFS / DFS toggle */}
            <div className="flex gap-2 bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4">
              {(["BFS","DFS"] as const).map(t => (
                <button key={t} onClick={() => { resetVisualizer(); setTraversalType(t); }}
                  className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${traversalType === t ? "bg-indigo-600 text-white shadow-lg" : "bg-white/5 text-slate-400 hover:text-white"}`}>
                  {t} — {t === "BFS" ? "Breadth First" : "Depth First"}
                </button>
              ))}
            </div>

            <ControlBar
              onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)}
              onStepForward={stepForward} onStepBackward={stepBackward}
              onReset={() => resetVisualizer()} onSpeedChange={setSpeed}
              isPlaying={isPlaying} currentStep={currentStepIndex}
              totalSteps={steps.length} speed={speed}
              stepDescription={stepDesc}
            />
          </div>
        }
        info={<TheoryCard {...theory} />}
      >
        <div className="w-full h-full flex gap-3 p-3">
          {/* Side panel */}
          <div className="w-44 shrink-0 flex flex-col gap-3">
            {/* Queue/Stack */}
            <div className="flex-1 bg-[#111428] border border-white/5 rounded-xl p-3 flex flex-col overflow-hidden">
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">{label}</p>
              <div className="flex flex-col gap-1 overflow-y-auto">
                {(auxState?.active ?? []).length === 0 ? (
                  <div className="text-xs text-slate-600 italic text-center py-2">Empty</div>
                ) : (
                  (auxState?.active ?? []).slice().reverse().map((id: string, i: number) => (
                    <div key={`${id}-${i}`} className="px-3 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-center font-mono text-sm font-bold">
                      {id}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Result order */}
            <div className="flex-1 bg-[#111428] border border-white/5 rounded-xl p-3 flex flex-col overflow-hidden">
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">Result</p>
              <div className="flex flex-wrap gap-1 content-start">
                {(currentStep?.values?.result ?? []).map((id: string, i: number) => (
                  <div key={`r-${id}-${i}`}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold">
                    {i+1}:{id}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Graph */}
          <div className="flex-1 min-h-[380px]">
            <GraphViz currentStepData={currentStep} />
          </div>
        </div>
      </VisualizerFrame>
    </div>
  );
}
