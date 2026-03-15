"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateSegmentTreeSteps } from "@/lib/algorithms/trees/segmentTree";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { Plus, Zap } from "lucide-react";

interface SegNode {
  id: string;
  start: number;
  end: number;
  sum: number;
  leftChild: string | null;
  rightChild: string | null;
}
type SegTree = Record<string, SegNode>;

// ─── Custom Segment Tree visualization ───────────────────────────────────────
function SegNodeViz({
  id, tree, activeIds, queryRange, depth = 0
}: {
  id: string | null;
  tree: SegTree;
  activeIds: string[];
  queryRange?: number[];
  depth?: number;
}) {
  if (!id || !tree[id]) return null;
  const node = tree[id];
  const isActive  = activeIds.includes(id);
  const inQuery   = queryRange != null && node.start >= queryRange[0] && node.end <= queryRange[1];
  const isLeaf    = node.start === node.end;

  const borderColor = isActive
    ? "border-indigo-400"
    : inQuery
    ? "border-emerald-400"
    : "border-white/10";
  const bg = isActive
    ? "bg-indigo-500/25 shadow-[0_0_16px_rgba(99,102,241,0.4)]"
    : inQuery
    ? "bg-emerald-500/15 shadow-[0_0_12px_rgba(52,211,153,0.3)]"
    : isLeaf
    ? "bg-[#1e2035]"
    : "bg-[#161828]";

  return (
    <div className="flex flex-col items-center min-w-0">
      {/* Node box */}
      <div className={`flex flex-col items-center justify-center px-2 py-1.5 min-w-[56px] rounded-xl border-2 font-mono transition-all duration-300 ${borderColor} ${bg}`}>
        <span className="text-[9px] text-slate-500 leading-none">[{node.start},{node.end}]</span>
        <span className={`text-base font-bold leading-tight mt-0.5 ${isActive ? "text-indigo-200" : inQuery ? "text-emerald-300" : "text-white"}`}>{node.sum}</span>
      </div>

      {/* Children */}
      {(node.leftChild || node.rightChild) && (
        <div className="flex gap-4 mt-6 relative">
          {/* stem */}
          <div className="absolute top-0 left-1/2 w-px h-4 -translate-x-px -translate-y-4 bg-white/10" />
          {/* horizontal */}
          <div className="absolute top-0 h-px bg-white/10" style={{ left: "10%", right: "10%", top: "0" }} />

          <div className="flex flex-col items-center relative">
            <div className="absolute top-0 left-1/2 w-px h-4 -translate-x-px -translate-y-4 bg-white/10" />
            <SegNodeViz id={node.leftChild} tree={tree} activeIds={activeIds} queryRange={queryRange} depth={depth + 1} />
          </div>
          <div className="flex flex-col items-center relative">
            <div className="absolute top-0 left-1/2 w-px h-4 -translate-x-px -translate-y-4 bg-white/10" />
            <SegNodeViz id={node.rightChild} tree={tree} activeIds={activeIds} queryRange={queryRange} depth={depth + 1} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Theory ───────────────────────────────────────────────────────────────────
const THEORY = {
  title: "Segment Tree",
  description: "A Segment Tree is a binary tree where each node stores aggregate information (sum, min, max) about a range of array elements. It enables O(log n) range queries AND point updates — much faster than the O(n) brute-force approach.",
  descriptionHi: "Segment Tree ek binary tree hai jisme har node ek range ke liye sum/min/max store karta hai. Range queries aur point updates dono O(log n) mein hoti hain. Brute force O(n) ka powerful upgrade!",
  complexities: [
    { case: "Build",        time: "O(n)",     space: "O(n)",    note: "Built bottom-up from the array" },
    { case: "Range Query",  time: "O(log n)", space: "O(1)",    note: "Sum/min/max on any subarray" },
    { case: "Point Update", time: "O(log n)", space: "O(1)",    note: "Change one element; ancestors update" },
  ],
  useCases: [
    "Range sum / min / max queries on large arrays",
    "Competitive programming range problems",
    "Database aggregations on intervals",
    "2D spatial queries (quadtrees extend this idea)",
  ],
  useCasesHi: [
    "Large arrays par range sum/min/max queries",
    "Competitive programming ke range problems",
    "Database mein interval aggregations",
    "2D spatial queries (quadtrees isi idea ka extension hain)",
  ],
  analogy: {
    icon: "🏗️",
    title: "A Manager Hierarchy",
    titleHi: "Manager Hierarchy",
    desc: "Imagine team leads who each handle a sub-team. Their manager knows the combined score (sum) of everyone below. When you ask for the total of any range, you only need to talk to the managers covering that range — not every individual.",
    descHi: "Socho team leads hote hain jo apni sub-team handle karte hain. Har manager apne neeche walo ka combined score (sum) jaanta hai. Koi bhi range ka total poochho — sirf us range ke managers se baat karo, har individual se nahi.",
  },
  howItWorks: {
    en: [
      { icon: "🔨", text: "Build: recursively split array into halves. Leaf nodes = individual elements. Internal nodes = sum of their children." },
      { icon: "📊", text: "Range Query: at each node, check if it is fully inside, fully outside, or partially overlapping the query range. Only partial nodes recurse further." },
      { icon: "✏️", text: "Point Update: go down to the leaf, change the value, then propagate the new sums all the way back to the root." },
      { icon: "⚡", text: "Each node covers exactly [start, end]. The root covers the entire array [0, n-1]." },
    ],
    hi: [
      { icon: "🔨", text: "Build: array ko recursively halves mein split karo. Leaf nodes = individual elements. Internal nodes = children ka sum." },
      { icon: "📊", text: "Range Query: har node pe check karo — fully inside, fully outside, ya partially overlap. Sirf partial nodes aage recurse karte hain." },
      { icon: "✏️", text: "Point Update: leaf tak jao, value change karo, phir new sums root tak propagate karo." },
      { icon: "⚡", text: "Har node [start, end] range cover karta hai. Root poori array [0, n-1] cover karta hai." },
    ],
  },
  readingTip: {
    en: "Blue = currently active node. Green = node completely inside the query range (its sum is used directly). Watch how only O(log n) nodes are visited during a query!",
    hi: "Blue = abhi active node. Green = node jo query range ke andar hai (iska sum directly use hota hai). Dekho ki sirf O(log n) nodes visit hote hain query mein!",
  },
  quote: {
    en: '"A Segment Tree turns an O(n) range problem into an O(log n) walk down a tree."',
    hi: '"Segment Tree O(n) range problem ko O(log n) tree walk mein convert kar deta hai."',
  },
  pseudocode: `function build(arr, node, start, end):
    if start == end:
        tree[node] = arr[start]
        return
    mid = (start + end) / 2
    build(arr, 2*node, start, mid)
    build(arr, 2*node+1, mid+1, end)
    tree[node] = tree[2*node] + tree[2*node+1]

function query(node, start, end, l, r):
    if r < start or end < l: return 0           // completely outside
    if l <= start and end <= r: return tree[node] // completely inside
    mid = (start + end) / 2
    leftSum  = query(2*node, start, mid, l, r)
    rightSum = query(2*node+1, mid+1, end, l, r)
    return leftSum + rightSum

function update(node, start, end, idx, val):
    if start == end:
        tree[node] = val; return
    mid = (start + end) / 2
    if idx <= mid: update(2*node, start, mid, idx, val)
    else:          update(2*node+1, mid+1, end, idx, val)
    tree[node] = tree[2*node] + tree[2*node+1]`,
  code: {
    language: "java",
    content: `class SegmentTree {
    int[] tree;
    int n;

    SegmentTree(int[] arr) {
        n = arr.length;
        tree = new int[4 * n];
        build(arr, 0, 0, n - 1);
    }

    void build(int[] arr, int node, int s, int e) {
        if (s == e) { tree[node] = arr[s]; return; }
        int mid = (s + e) / 2;
        build(arr, 2*node+1, s, mid);
        build(arr, 2*node+2, mid+1, e);
        tree[node] = tree[2*node+1] + tree[2*node+2];
    }

    int query(int node, int s, int e, int l, int r) {
        if (r < s || e < l) return 0;
        if (l <= s && e <= r) return tree[node];
        int mid = (s + e) / 2;
        return query(2*node+1, s, mid, l, r)
             + query(2*node+2, mid+1, e, l, r);
    }

    void update(int node, int s, int e, int idx, int val) {
        if (s == e) { tree[node] = val; return; }
        int mid = (s + e) / 2;
        if (idx <= mid) update(2*node+1, s, mid, idx, val);
        else            update(2*node+2, mid+1, e, idx, val);
        tree[node] = tree[2*node+1] + tree[2*node+2];
    }
}`,
  },
  example: {
    array: [1, 3, 5, 7, 9, 11],
    steps: [
      { desc: "Array: [1,3,5,7,9,11]. Build tree bottom-up: leaf nodes get individual values.", descHi: "Array: [1,3,5,7,9,11]. Bottom-up build: leaf nodes ko individual values milti hain.", array: [1,3,5,7,9,11], highlight: [] },
      { desc: "Internal node [0,5] = sum of left [0,2]=9 + right [3,5]=27 = 36.", descHi: "Internal node [0,5] = left [0,2]=9 + right [3,5]=27 = 36.", array: [1,3,5,7,9,11], highlight: [] },
      { desc: "Query sum(arr[1..3]): Visit [0,5] → partial. Go left [0,2] → partial. Go right [3,5] → partial.", descHi: "Query sum(arr[1..3]): [0,5] → partial. Left [0,2] → partial. Right [3,5] → partial.", array: [1,3,5,7,9,11], highlight: [1,2,3] },
      { desc: "Result = [1,1]=3 + [2,2]=5 + [3,3]=7 = 15. Only O(log n) nodes visited!", descHi: "Result = 3 + 5 + 7 = 15. Sirf O(log n) nodes visit hue!", array: [1,3,5,7,9,11], highlight: [1,2,3] },
    ],
  },
  quiz: [
    {
      q: "What is the time complexity of a range sum query in a Segment Tree?",
      options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
      answer: 1,
    },
    {
      q: "How much space does a Segment Tree need for an array of n elements?",
      options: ["O(n)", "O(2n)", "O(4n)", "O(n²)"],
      answer: 2,
    },
    {
      q: "If a node's range is completely outside the query range, what should be returned?",
      options: ["−∞", "The node's value", "0 (identity element)", "Recurse into both children"],
      answer: 2,
    },
  ],
};

// ─── Default data ─────────────────────────────────────────────────────────────
const defaultArr = [1, 3, 5, 7, 9, 11];
const defaultQueries = [
  { type: "query" as const, ql: 1, qr: 3 },
  { type: "query" as const, ql: 0, qr: 5 },
];
const defaultUpdates = [{ idx: 2, value: 10 }];

export default function SegmentTreePage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [treeState, setTreeState] = useState<{
    tree: SegTree; arr: number[]; queryRange?: number[]; queryResult?: number
  }>({ tree: {}, arr: [...defaultArr] });

  // Custom query input
  const [ql, setQl] = useState("1");
  const [qr, setQr] = useState("3");
  const [updateIdx, setUpdateIdx] = useState("2");
  const [updateVal, setUpdateVal] = useState("10");
  const [queries, setQueries] = useState(defaultQueries);
  const [updates, setUpdates] = useState(defaultUpdates);
  const [arr]    = useState(defaultArr);

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("segment-tree");
    setSteps(generateSegmentTreeSteps([...arr], queries, updates));
    return () => { resetVisualizer(); if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries, updates]);

  useEffect(() => {
    const step = steps[currentStepIndex];
    const vals = step?.values as { tree?: SegTree; arr?: number[]; queryRange?: number[]; queryResult?: number } | undefined;
    if (vals?.tree) setTreeState(vals as { tree: SegTree; arr: number[]; queryRange?: number[]; queryResult?: number });
  }, [currentStepIndex, steps]);

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
  const activeIds   = currentStep?.nodeIds ?? [];
  const treeNodes   = treeState.tree ? Object.values(treeState.tree) : [];
  const rootId      = treeNodes.find(n =>
    !treeNodes.some(m => m.leftChild === n.id || m.rightChild === n.id)
  )?.id ?? null;

  const handleAddQuery = () => {
    const l = parseInt(ql), r = parseInt(qr);
    if (isNaN(l) || isNaN(r) || l > r || l < 0 || r >= arr.length) return;
    setQueries(prev => [...prev, { type: "query" as const, ql: l, qr: r }]);
    setIsPlaying(true);
  };

  const handleAddUpdate = () => {
    const i = parseInt(updateIdx), v = parseInt(updateVal);
    if (isNaN(i) || isNaN(v) || i < 0 || i >= arr.length) return;
    setUpdates(prev => [...prev, { idx: i, value: v }]);
    setIsPlaying(true);
  };

  const stepDesc = currentStep?.description
    ? currentStep.description
        .replace(/\[(\d+),\s*(\d+)\]/g, '<span class="text-indigo-300 font-bold">[$1,$2]</span>')
        .replace(/(\d+) \+ (\d+) = (\d+)/g, '<span class="text-amber-300">$1 + $2 = <strong>$3</strong></span>')
    : "Segment Tree ready — add queries or updates!";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Segment Tree"
        description="A binary tree for O(log n) range sum queries and point updates. Each internal node stores the sum of its children's range."
        complexity={{ time: "log n", space: "4n", difficulty: "Hard" }}
        controls={
          <div className="flex flex-col gap-4 w-full">
            {/* Controls row */}
            <div className="flex flex-col md:flex-row gap-3 bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4">
              {/* Query inputs */}
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Range Query (0-indexed)</span>
                <div className="flex items-center gap-2">
                  <input type="number" value={ql} onChange={e => setQl(e.target.value)} placeholder="Left" min={0} max={arr.length-1}
                    className="w-16 bg-black/20 dark:bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-sm outline-none focus:border-indigo-500 font-mono text-center" />
                  <span className="text-slate-500 font-mono">...</span>
                  <input type="number" value={qr} onChange={e => setQr(e.target.value)} placeholder="Right" min={0} max={arr.length-1}
                    className="w-16 bg-black/20 dark:bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-sm outline-none focus:border-indigo-500 font-mono text-center" />
                  <button onClick={handleAddQuery}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors">
                    <Zap size={14} /> Query
                  </button>
                </div>
              </div>

              {/* Update inputs */}
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Point Update</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs font-mono shrink-0">arr[</span>
                  <input type="number" value={updateIdx} onChange={e => setUpdateIdx(e.target.value)} placeholder="idx" min={0} max={arr.length-1}
                    className="w-14 bg-black/20 dark:bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-sm outline-none focus:border-indigo-500 font-mono text-center" />
                  <span className="text-slate-500 text-xs font-mono shrink-0">] =</span>
                  <input type="number" value={updateVal} onChange={e => setUpdateVal(e.target.value)} placeholder="value"
                    className="w-16 bg-black/20 dark:bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-sm outline-none focus:border-indigo-500 font-mono text-center" />
                  <button onClick={handleAddUpdate}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold transition-colors">
                    <Plus size={14} /> Update
                  </button>
                </div>
              </div>
            </div>

            <ControlBar
              onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)}
              onStepForward={stepForward} onStepBackward={stepBackward}
              onReset={() => { resetVisualizer(); setQueries(defaultQueries); setUpdates(defaultUpdates); }}
              onSpeedChange={setSpeed} isPlaying={isPlaying}
              currentStep={currentStepIndex} totalSteps={steps.length} speed={speed}
              stepDescription={stepDesc}
            />
          </div>
        }
        info={<TheoryCard {...THEORY} />}
      >
        <div className="w-full h-full relative overflow-hidden">
          {/* Array bar at top */}
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center gap-2 pointer-events-none">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest shrink-0">arr:</span>
            <div className="flex gap-1 flex-wrap">
              {treeState.arr.map((v, i) => {
                const inQ = treeState.queryRange &&
                  i >= treeState.queryRange[0] && i <= treeState.queryRange[1];
                return (
                  <span key={i} className={`w-7 h-7 flex flex-col items-center justify-center rounded text-[10px] font-mono font-bold border transition-all ${
                    inQ ? "bg-indigo-500/30 border-indigo-400/50 text-indigo-200"
                        : "bg-white/5 border-white/10 text-slate-400"
                  }`}>{v}</span>
                );
              })}
            </div>
            {treeState.queryResult !== undefined && (
              <span className="ml-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
                Sum = {treeState.queryResult}
              </span>
            )}
          </div>

          {/* Legend */}
          <div className="absolute bottom-3 right-3 z-10 flex gap-3 text-[9px] font-mono pointer-events-none">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded border-2 border-indigo-400 inline-block"/>Active</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded border-2 border-emerald-400 inline-block"/>In query</span>
          </div>

          {/* Main tree canvas */}
          <div className="w-full h-full overflow-auto flex items-start justify-center pt-14 pb-8 px-4">
            {rootId ? (
              <SegNodeViz
                id={rootId}
                tree={treeState.tree}
                activeIds={activeIds}
                queryRange={treeState.queryRange}
              />
            ) : (
              <div className="m-auto text-slate-600 font-mono text-sm">Building tree...</div>
            )}
          </div>
        </div>
      </VisualizerFrame>
    </div>
  );
}
