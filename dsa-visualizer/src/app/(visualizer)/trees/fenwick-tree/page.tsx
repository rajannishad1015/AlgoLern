"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateFenwickTreeSteps } from "@/lib/algorithms/trees/fenwickTree";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { Plus, Zap } from "lucide-react";

// ─── Theory ───────────────────────────────────────────────────────────────────
const THEORY = {
  title: "Fenwick Tree (BIT)",
  description: "A Fenwick Tree (Binary Indexed Tree) is a clever array-based structure that supports prefix sum queries and point updates both in O(log n) time using bit manipulation. It is much simpler to code than a Segment Tree and uses O(n) space.",
  descriptionHi: "Fenwick Tree (BIT) ek array-based structure hai jo bit manipulation (LSB trick) use karke prefix sum queries aur point updates dono O(log n) mein karta hai. Segment Tree se code karna asaan hai aur space O(n) hi lagta hai.",
  complexities: [
    { case: "Build",          time: "O(n log n)", space: "O(n)", note: "n individual updates of O(log n)" },
    { case: "Prefix Query",   time: "O(log n)",   space: "O(1)", note: "Sum from index 1 to i" },
    { case: "Point Update",   time: "O(log n)",   space: "O(1)", note: "Propagates via LSB jumps" },
  ],
  useCases: [
    "Competitive programming: prefix sums, inversions count",
    "Frequency/count arrays with dynamic updates",
    "2D Fenwick Trees for 2D range queries",
    "Order statistics (kth smallest element)",
  ],
  useCasesHi: [
    "Competitive programming: prefix sums, inversions count",
    "Dynamic updates ke saath frequency/count arrays",
    "2D Fenwick Trees for 2D range queries",
    "Order statistics (kth smallest element)",
  ],
  analogy: {
    icon: "🔢",
    title: "Binary Number Responsibilities",
    titleHi: "Binary Number Responsibilities",
    desc: "Each BIT index is responsible for a range whose size equals its lowest set bit (LSB). BIT[6] = BIT[110₂] → LSB=2, covers 2 elements [5,6]. To query prefix sum up to index i, follow i → i - LSB(i) → ... → 0.",
    descHi: "Har BIT index ki responsibility us range ki hoti hai jiska size uska lowest set bit (LSB) hai. BIT[6] = BIT[110₂] → LSB=2, 2 elements [5,6] cover karta hai. Prefix sum ke liye i → i - LSB(i) → ... → 0 follow karo.",
  },
  howItWorks: {
    en: [
      { icon: "🧮", text: "Internally 1-indexed. BIT[0] is unused (sentinel). Index i covers range [i - LSB(i) + 1, i]." },
      { icon: "🔍", text: "Prefix sum up to i: add BIT[i], then jump i = i - (i & -i). Repeat until i = 0." },
      { icon: "✏️", text: "Update index i by delta: add delta to BIT[i], then jump i = i + (i & -i). Repeat until i > n." },
      { icon: "📊", text: "Range query [L, R] = prefix(R) - prefix(L-1). Two prefix queries are all you need!" },
    ],
    hi: [
      { icon: "🧮", text: "Internally 1-indexed. BIT[0] unused hai. Index i, range [i - LSB(i) + 1, i] cover karta hai." },
      { icon: "🔍", text: "Prefix sum up to i: BIT[i] add karo, phir i = i - (i & -i). Tab tak jab i = 0." },
      { icon: "✏️", text: "Index i update: delta add karo BIT[i] mein, phir i = i + (i & -i). Tab tak jab i > n." },
      { icon: "📊", text: "Range query [L, R] = prefix(R) - prefix(L-1). Bas do prefix queries!" },
    ],
  },
  readingTip: {
    en: "The purple labels below each BIT cell show its 0-indexed responsibility range. Yellow = currently being read for query, orange = being updated. Follow the arrows formed by the LSB jumps!",
    hi: "Har BIT cell ke neeche purple label dikhata hai uska 0-indexed responsibility range. Yellow = query ke liye read ho raha hai, orange = update ho raha hai. LSB jumps ke arrows follow karo!",
  },
  quote: {
    en: '"The Fenwick Tree is proof that sometimes the cleverest solutions feel like magic."',
    hi: '"Fenwick Tree proof hai ki kabhi kabhi sabse clever solutions jaadu jaise lagte hain."',
  },
  pseudocode: `// 1-indexed BIT of size n
BIT = [0] * (n + 1)

function update(i, delta):  // add delta to index i
    while i <= n:
        BIT[i] += delta
        i += i & (-i)       // i's LSB jump upward

function prefix(i):          // sum from 1 to i (inclusive)
    s = 0
    while i > 0:
        s += BIT[i]
        i -= i & (-i)       // strip lowest set bit
    return s

function rangeQuery(l, r):   // sum from l to r (0-indexed)
    return prefix(r+1) - prefix(l)  // convert to 1-indexed`,
  code: {
    language: "java",
    content: `class BIT {
    int[] tree;
    int n;

    BIT(int n) {
        this.n = n;
        tree = new int[n + 1]; // 1-indexed
    }

    void update(int i, int delta) { // 1-indexed
        for (; i <= n; i += i & (-i))
            tree[i] += delta;
    }

    int prefix(int i) { // sum [1..i], 1-indexed
        int s = 0;
        for (; i > 0; i -= i & (-i))
            s += tree[i];
        return s;
    }

    int query(int l, int r) { // sum [l,r], 0-indexed
        return prefix(r + 1) - prefix(l);
    }
}`,
  },
  example: {
    array: [3, 2, -1, 6, 5, 4, -3, 3],
    steps: [
      { desc: "Array: [3,2,-1,6,5,4,-3,3]. Build BIT by inserting each element one by one.", descHi: "Array: [3,2,-1,6,5,4,-3,3]. Har element ek ek karke insert karo.", array: [3,2,-1,6,5,4,-3,3], highlight: [] },
      { desc: "BIT[4] covers arr[1..4] = 3+2+(−1)+6 = 10 (4 in binary = 100₂, LSB=4).", descHi: "BIT[4] = arr[1..4] = 3+2+(−1)+6 = 10. 4 = 100₂, LSB=4.", array: [3,2,-1,6,5,4,-3,3], highlight: [0,1,2,3] },
      { desc: "Query sum(arr[2..5]): prefix(6) - prefix(2) = (3+2-1+6+5+4) - (3+2) = 19 - 5 = 14.", descHi: "Query sum(arr[2..5]): prefix(6) - prefix(2) = 19 - 5 = 14.", array: [3,2,-1,6,5,4,-3,3], highlight: [2,3,4,5] },
    ],
  },
  quiz: [
    {
      q: "What does LSB (Lowest Set Bit) of an index i determine in a Fenwick Tree?",
      options: [
        "The depth of node i",
        "The size of the range BIT[i] is responsible for",
        "The parent of node i",
        "Whether i is odd or even",
      ],
      answer: 1,
    },
    {
      q: "How do you compute prefix(i) jump steps in a Fenwick Tree?",
      options: [
        "i = i + (i & -i)",
        "i = i - (i & -i)",
        "i = i / 2",
        "i = i - 1",
      ],
      answer: 1,
    },
    {
      q: "Range sum query from L to R (0-indexed) equals?",
      options: [
        "prefix(R) + prefix(L)",
        "prefix(R) - prefix(L)",
        "prefix(R+1) - prefix(L)",
        "prefix(R+1) + prefix(L+1)",
      ],
      answer: 2,
    },
  ],
};

// ─── Defaults ─────────────────────────────────────────────────────────────────
const defaultArr   = [3, 2, -1, 6, 5, 4, -3, 3];
const defaultQ     = [
  { type: "query" as const, left: 2, right: 5 },
  { type: "query" as const, left: 0, right: 7 },
];
const defaultUpd   = [{ idx: 3, delta: 6 }];

export default function FenwickTreePage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [bitState, setBitState] = useState<{
    bit: number[]; arr: number[]; queryResult?: number; queryRange?: number[];
  }>({ bit: new Array(defaultArr.length + 1).fill(0), arr: [...defaultArr] });
  const [activeIdx, setActiveIdx] = useState<number[]>([]);

  const [ql, setQl]           = useState("2");
  const [qr, setQr]           = useState("5");
  const [updIdx, setUpdIdx]   = useState("3");
  const [updDelta, setUpdDelta] = useState("6");
  const [queries, setQueries] = useState(defaultQ);
  const [updates, setUpdates] = useState(defaultUpd);

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("fenwick-tree");
    setSteps(generateFenwickTreeSteps([...defaultArr], queries, updates));
    return () => { resetVisualizer(); if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries, updates]);

  useEffect(() => {
    const step = steps[currentStepIndex];
    if (step?.values) setBitState(step.values as { bit: number[]; arr: number[]; queryResult?: number; queryRange?: number[] });
    setActiveIdx(step?.indices ?? []);
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

  const lsb      = (x: number) => x & (-x);
  const getRange = (i: number) => [i - lsb(i), i - 1]; // 0-indexed responsibility

  const n            = defaultArr.length;
  const currentStep  = steps[currentStepIndex];

  const handleAddQuery = () => {
    const l = parseInt(ql), r = parseInt(qr);
    if (isNaN(l) || isNaN(r) || l > r || l < 0 || r >= n) return;
    setQueries(prev => [...prev, { type: "query" as const, left: l, right: r }]);
    setIsPlaying(true);
  };

  const handleAddUpdate = () => {
    const i = parseInt(updIdx), d = parseInt(updDelta);
    if (isNaN(i) || isNaN(d) || i < 0 || i >= n) return;
    setUpdates(prev => [...prev, { idx: i, delta: d }]);
    setIsPlaying(true);
  };

  const stepDesc = currentStep?.description
    ? currentStep.description
        .replace(/BIT\[(\d+)\]/g, '<span class="text-indigo-300 font-bold">BIT[$1]</span>')
        .replace(/prefix\((\d+)\)/g, '<span class="text-amber-300 font-bold">prefix($1)</span>')
        .replace(/(= \d+)/g, '<span class="text-emerald-300 font-bold">$1</span>')
    : "BIT ready — add a query or update!";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Fenwick Tree (BIT)"
        description="A space-efficient array that supports O(log n) prefix sum queries and point updates using a clever bit manipulation trick — stripping the lowest set bit (LSB)."
        complexity={{ time: "log n", space: "n", difficulty: "Hard" }}
        controls={
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col md:flex-row gap-3 bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4">
              {/* Query */}
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Range Query (0-indexed)</span>
                <div className="flex items-center gap-2">
                  <input type="number" value={ql} onChange={e => setQl(e.target.value)} min={0} max={n-1} placeholder="Left"
                    className="w-16 bg-black/20 dark:bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-sm outline-none focus:border-indigo-500 font-mono text-center" />
                  <span className="text-slate-500 font-mono">...</span>
                  <input type="number" value={qr} onChange={e => setQr(e.target.value)} min={0} max={n-1} placeholder="Right"
                    className="w-16 bg-black/20 dark:bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-sm outline-none focus:border-indigo-500 font-mono text-center" />
                  <button onClick={handleAddQuery}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors">
                    <Zap size={14} /> Query
                  </button>
                </div>
              </div>

              {/* Update */}
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Point Update (delta)</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs font-mono shrink-0">arr[</span>
                  <input type="number" value={updIdx} onChange={e => setUpdIdx(e.target.value)} min={0} max={n-1} placeholder="idx"
                    className="w-14 bg-black/20 dark:bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-sm outline-none focus:border-indigo-500 font-mono text-center" />
                  <span className="text-slate-500 text-xs font-mono shrink-0">] +=</span>
                  <input type="number" value={updDelta} onChange={e => setUpdDelta(e.target.value)} placeholder="delta"
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
              onReset={() => { resetVisualizer(); setQueries(defaultQ); setUpdates(defaultUpd); }}
              onSpeedChange={setSpeed} isPlaying={isPlaying}
              currentStep={currentStepIndex} totalSteps={steps.length} speed={speed}
              stepDescription={stepDesc}
            />
          </div>
        }
        info={<TheoryCard {...THEORY} />}
      >
        <div className="w-full h-full flex flex-col gap-3 overflow-auto p-4 pt-3">

          {/* Original Array */}
          <div>
            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">Original Array (0-indexed)</p>
            <div className="flex gap-1.5 flex-wrap">
              {(bitState.arr ?? []).map((v, i) => {
                const inQ = bitState.queryRange && i >= bitState.queryRange[0] && i <= bitState.queryRange[1];
                const isAct = activeIdx.includes(i);
                return (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <span className="text-[9px] font-mono text-slate-500">[{i}]</span>
                    <div className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 font-mono font-bold text-sm transition-all duration-300 ${
                      isAct ? "border-amber-400 bg-amber-400/20 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.4)]"
                      : inQ ? "border-indigo-400/60 bg-indigo-500/10 text-indigo-300"
                      : "border-white/10 bg-[#1e2035] text-slate-300"
                    }`}>{v}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BIT Array */}
          <div>
            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">BIT Array (1-indexed) — each cell responsible for range shown below</p>
            <div className="flex gap-1.5 flex-wrap items-end">
              {/* BIT[0] is unused */}
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[9px] font-mono text-slate-600">[0]</span>
                <div className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-white/5 bg-[#111] text-slate-600 font-mono text-xs">—</div>
                <span className="text-[8px] font-mono text-transparent">—</span>
              </div>

              {(bitState.bit ?? []).slice(1).map((v, rawIdx) => {
                const bitIdx   = rawIdx + 1;
                const [lo, hi] = getRange(bitIdx);
                const isAct    = activeIdx.includes(bitIdx - 1);
                const sz       = lsb(bitIdx);
                // Bar height proportional to responsibility range
                const barH     = Math.min(2 + sz * 8, 40);

                return (
                  <div key={bitIdx} className="flex flex-col items-center gap-0.5">
                    <span className="text-[9px] font-mono text-slate-500">[{bitIdx}]</span>
                    <div
                      style={{ height: `${barH}px` }}
                      className={`w-10 flex items-center justify-center rounded-t-lg border-2 font-mono font-bold text-xs transition-all duration-300 ${
                        isAct ? "border-orange-400 bg-orange-400/30 text-orange-200 shadow-[0_0_12px_rgba(251,146,60,0.4)]"
                        : "border-white/10 bg-gradient-to-b from-indigo-500/30 to-indigo-900/20 text-slate-300"
                      }`}
                      title={`BIT[${bitIdx}] covers [${lo},${hi}] (0-indexed), LSB=${sz}`}
                    >
                      {v}
                    </div>
                    <span className="text-[8px] font-mono text-indigo-400/70">
                      {lo === hi ? `[${lo}]` : `[${lo}..${hi}]`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LSB info card */}
          <div className="grid grid-cols-2 gap-3 mt-1">
            <div className="bg-[#111428] border border-white/5 rounded-xl p-3 flex flex-col gap-1">
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Query Traversal</p>
              <p className="text-xs font-mono text-slate-400">prefix(i): add BIT[i], then <span className="text-indigo-300">i -= (i &amp; −i)</span></p>
            </div>
            <div className="bg-[#111428] border border-white/5 rounded-xl p-3 flex flex-col gap-1">
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Update Traversal</p>
              <p className="text-xs font-mono text-slate-400">update(i, Δ): BIT[i] += Δ, then <span className="text-orange-300">i += (i &amp; −i)</span></p>
            </div>
          </div>

          {/* Query result */}
          {bitState.queryResult !== undefined && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-300 font-mono text-sm font-bold">
              ✓ sum(arr[{bitState.queryRange?.[0]}..{bitState.queryRange?.[1]}]) = {bitState.queryResult}
            </div>
          )}
        </div>
      </VisualizerFrame>
    </div>
  );
}
