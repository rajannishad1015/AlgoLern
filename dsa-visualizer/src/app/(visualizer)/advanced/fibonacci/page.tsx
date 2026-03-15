"use client";

import { useEffect, useRef, useState } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateFibonacciDPSteps } from "@/lib/algorithms/advanced/fibonacciDP";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { TheoryCard } from "@/components/visualizer/TheoryCard";

// ─── Theory ────────────────────────────────────────────────────────────────
const THEORY = {
  title: "Fibonacci with Dynamic Programming",
  description: "Dynamic Programming (DP) solves problems by breaking them into overlapping sub-problems and storing results to avoid recomputation. The Fibonacci sequence is the perfect introduction: fib(n) = fib(n-1) + fib(n-2), and with memoization, each value is computed only once — reducing complexity from O(2ⁿ) to O(n).",
  descriptionHi: "Dynamic Programming bade problems ko overlapping sub-problems mein todta hai aur results store karta hai — dobara compute nahi karta. Fibonacci perfect example hai: fib(n) = fib(n-1) + fib(n-2). Memoization se complexity O(2ⁿ) se O(n) ho jaati hai!",
  complexities: [
    { case: "Naive Recursion", time: "O(2ⁿ)", space: "O(n)", note: "Exponential — completely impractical for n>40" },
    { case: "Top-Down (Memo)", time: "O(n)",  space: "O(n)", note: "Each fib(i) computed exactly once, cached" },
    { case: "Bottom-Up (Tab)", time: "O(n)",  space: "O(1)", note: "Only keep last 2 values, O(1) space!" },
  ],
  useCases: [
    "Foundation of all DP — teaches the core concepts",
    "Coin change, knapsack, and LCS build on this pattern",
    "Fibonacci in nature: flower petals, spiral shells",
    "Financial modelling with recursive growth patterns",
  ],
  useCasesHi: [
    "Sab DP topics ka foundation — core concepts sikhata hai",
    "Coin change, knapsack, LCS sab isi pattern pe build hain",
    "Nature mein Fibonacci: flower petals, spiral shells",
    "Financial modelling mein recursive growth patterns",
  ],
  analogy: {
    icon: "📒",
    title: "A Notepad for Expensive Answers",
    titleHi: "Mehnge Answers ke liye Notepad",
    desc: "Imagine being asked 'what is 57×83?' repeatedly. The first time, you calculate it slowly. After that, you just read it from your notepad. Memoization is your notepad — once fib(5) is computed, any future call to fib(5) just reads the answer instantly.",
    descHi: "Socho tumse baar baar '57×83 kya hai?' pucha jaye. Pehli baar dheerey calculate karo. Baad mein notepad se padhte ho. Memoization wahi notepad hai — fib(5) ek baar compute hua, baad mein sab calls instantly answer leti hain.",
  },
  howItWorks: {
    en: [
      { icon: "📋", text: "Create a memo cache array of size n+1, initialized to null." },
      { icon: "🔍", text: "Call fib(n). Check cache first. If it's there (yellow glow) — return instantly! ✨" },
      { icon: "🔀", text: "Cache miss: recurse into fib(n-1) and fib(n-2) separately." },
      { icon: "💾", text: "When result is ready, store it in cache[n] (purple glow)." },
      { icon: "✅", text: "Future calls to fib(n) skip all recursion and return cached value." },
    ],
    hi: [
      { icon: "📋", text: "n+1 size ka memo cache array banao, null se initialize karo." },
      { icon: "🔍", text: "fib(n) call karo. Pehle cache check karo. Wahan hai (yellow glow) → instantly return! ✨" },
      { icon: "🔀", text: "Cache miss: fib(n-1) aur fib(n-2) mein recursively jao." },
      { icon: "💾", text: "Result ready hone pe cache[n] mein store karo (purple glow)." },
      { icon: "✅", text: "Future calls fib(n) ke liye sari recursion skip hoti hai." },
    ],
  },
  readingTip: {
    en: "Watch the cache array at the top. Blue = currently computing. Yellow = cache HIT (instant return!). Purple = just stored in cache. The call stack panel shows the recursion depth live. Count how many times each sub-problem gets solved — it should be exactly once!",
    hi: "Top mein cache array dekho. Blue = abhi compute ho raha. Yellow = cache HIT (instant return!). Purple = abhi cache mein store hua. Call stack panel recursion depth live dikhata hai. Har sub-problem kitni baar solve hua — exactly once hona chahiye!",
  },
  quote: {
    en: '"Dynamic Programming is remembering answers to sub-problems to avoid solving them again."',
    hi: '"Dynamic Programming sub-problems ke answers yaad rakhna hai taaki unhe dubara solve na karna pade."',
  },
  pseudocode: `// Top-Down (Memoization)
memo = {}
function fib(n):
    if n in memo: return memo[n]  // Cache HIT ✨
    if n <= 1: return n           // Base case
    result = fib(n-1) + fib(n-2)
    memo[n] = result              // Store in cache
    return result

// Bottom-Up (Tabulation) — O(1) space
function fibTab(n):
    if n <= 1: return n
    a, b = 0, 1
    for i in range(2, n+1):
        a, b = b, a + b
    return b`,
  code: {
    language: "java",
    content: `// Top-Down (Memoization)
int[] memo = new int[n + 1];
Arrays.fill(memo, -1);

int fib(int n) {
    if (memo[n] != -1) return memo[n]; // Cache HIT
    if (n <= 1) return n;
    return memo[n] = fib(n - 1) + fib(n - 1);
}

// Bottom-Up (Tabulation) — O(1) space
int fibDP(int n) {
    if (n <= 1) return n;
    int a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        int c = a + b; a = b; b = c;
    }
    return b;
}`,
  },
  quiz: [
    {
      q: "Naive recursive Fibonacci has what time complexity?",
      options: ["O(n)", "O(n log n)", "O(2ⁿ)", "O(n²)"],
      answer: 2,
    },
    {
      q: "What does a Cache HIT mean in memoized Fibonacci?",
      options: [
        "The value was already computed and is returned instantly",
        "A collision in the hash table",
        "The base case was reached",
        "Two recursive calls were made",
      ],
      answer: 0,
    },
    {
      q: "Bottom-up Fibonacci tabulation achieves what space complexity?",
      options: ["O(n)", "O(n²)", "O(log n)", "O(1)"],
      answer: 3,
    },
  ],
};

// ─── Recursive call tree visualization ─────────────────────────────────────
function FibCallTree({ n, currentN }: { n: number; currentN: number | null }) {
  // Build tree structure for display
  interface FibNode { label: string; children: FibNode[] }
  const buildTree = (k: number, maxDepth: number): FibNode => {
    if (maxDepth === 0 || k <= 1) return { label: `f(${k})`, children: [] };
    return { label: `f(${k})`, children: [buildTree(k - 1, maxDepth - 1), buildTree(k - 2, maxDepth - 1)] };
  };
  const tree = buildTree(n, n <= 5 ? n : 4);

  const renderNode = (node: FibNode, depth: number): React.ReactNode => {
    const isActive = node.label === `f(${currentN})`;
    return (
      <div key={`${node.label}-${depth}`} className="flex flex-col items-center gap-2">
        <div className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold border-2 transition-all duration-300 ${
          isActive ? "border-indigo-400 bg-indigo-500/30 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]"
          : "border-white/10 bg-[#1e2035] text-slate-400"
        }`}>{node.label}</div>
        {node.children.length > 0 && (
          <div className="flex gap-4 relative">
            <div className="absolute top-0 left-1/2 w-px h-2 bg-white/10 -translate-x-px -translate-y-2" />
            {node.children.length > 1 && (
              <div className="absolute top-0 h-px bg-white/10" style={{ left: "10%", right: "10%", top: "0" }} />
            )}
            {node.children.map((child, i) => (
              <div key={i} className="flex flex-col items-center relative">
                <div className="absolute top-0 left-1/2 w-px h-2 bg-white/10 -translate-x-px -translate-y-2" />
                {renderNode(child, depth + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="overflow-auto flex justify-center pb-2">
      {renderNode(tree, 0)}
    </div>
  );
}

const DEFAULT_N = 7;

export default function FibonacciDPPage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [n, setN] = useState(DEFAULT_N);

  const { steps, currentStepIndex, isPlaying, speed, setSteps, setIsPlaying, setSpeed, stepForward, stepBackward, resetVisualizer, setAlgorithmId } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("dp-fibonacci");
    setSteps(generateFibonacciDPSteps(n));
    return () => { resetVisualizer(); if (timerRef.current) clearInterval(timerRef.current); };
  }, [n]);

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
  const dpArray     = (currentStep?.values?.dpArray ?? []) as (number | null)[];
  const currentN    = currentStep?.values?.currentN as number | null ?? null;
  const stepType    = currentStep?.type ?? "highlight";
  const cacheHits   = steps.slice(0, currentStepIndex + 1).filter(s => s.type === "done" && s.description?.includes("CACHE HIT")).length;

  const stepDesc = currentStep?.description ?? "Fibonacci DP ready — press Play!";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Fibonacci (Dynamic Programming)"
        description="Top-down memoization reduces exponential O(2ⁿ) recursion to O(n) by caching each sub-result. Watch cache hits vs. cache misses in real time."
        complexity={{ time: "n", space: "n", difficulty: "Easy" }}
        controls={
          <div className="flex flex-col gap-4 w-full">
            {/* N selector */}
            <div className="flex items-center gap-4 bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-widest shrink-0">Compute fib(n) where n =</span>
              <input type="range" min={3} max={10} value={n} onChange={e => { resetVisualizer(); setN(Number(e.target.value)); }}
                className="flex-1 accent-indigo-500" />
              <span className="text-indigo-400 font-mono font-bold w-4 text-center">{n}</span>
            </div>

            <ControlBar
              onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)}
              onStepForward={stepForward} onStepBackward={stepBackward}
              onReset={resetVisualizer} onSpeedChange={setSpeed}
              isPlaying={isPlaying} currentStep={currentStepIndex}
              totalSteps={steps.length} speed={speed}
              stepDescription={stepDesc}
            />
          </div>
        }
        info={<TheoryCard {...THEORY} />}
      >
        <div className="w-full h-full flex flex-col gap-4 p-4 overflow-auto">
          {/* Status bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest border transition-all ${
              stepType === "done"     ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : stepType === "update"  ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
              : stepType === "visit"   ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
              : "border-white/10 bg-white/5 text-slate-400"
            }`}>{stepType}</span>
            {currentN !== null && (
              <span className="text-sm font-mono text-slate-300">
                Computing: <span className="text-indigo-400 font-bold">fib({currentN})</span>
              </span>
            )}
            <span className="ml-auto text-xs font-mono text-slate-500">
              Cache hits: <span className="text-yellow-400 font-bold">{cacheHits}</span>
            </span>
          </div>

          {/* Cache array */}
          <div className="bg-[#111428] border border-white/5 rounded-xl p-4">
            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-3">Memoization Cache dp[0..{n}]</p>
            <div className="flex gap-2 flex-wrap">
              {dpArray.map((val, i) => {
                const isActive   = currentN === i;
                const isCacheHit = isActive && stepType === "done";
                const isStored   = isActive && stepType === "update";
                const hasValue   = val !== null && val !== undefined;
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-mono text-slate-600">n={i}</span>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-sm border-2 transition-all duration-300 ${
                      isCacheHit ? "border-yellow-400 bg-yellow-400/20 text-yellow-200 shadow-[0_0_16px_rgba(250,204,21,0.5)]"
                      : isStored   ? "border-violet-400 bg-violet-500/20 text-violet-200 shadow-[0_0_16px_rgba(139,92,246,0.5)]"
                      : isActive   ? "border-indigo-400 bg-indigo-500/20 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                      : hasValue   ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border-white/8 bg-white/3 text-slate-700"
                    }`}>
                      {hasValue ? val : "·"}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-3 flex-wrap">
              {[
                { color: "border-indigo-400 bg-indigo-500/20", label: "Computing" },
                { color: "border-yellow-400 bg-yellow-400/20", label: "Cache HIT ⚡" },
                { color: "border-violet-400 bg-violet-500/20", label: "Just stored" },
                { color: "border-emerald-500/40 bg-emerald-500/10", label: "Cached" },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded border-2 ${l.color}`} />
                  <span className="text-[9px] font-mono text-slate-500">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Call tree (only shown for small n) */}
          {n <= 8 && (
            <div className="bg-[#111428] border border-white/5 rounded-xl p-4">
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-3">
                Recursion Tree {n > 5 ? "(truncated to depth 4)" : ""}
              </p>
              <FibCallTree n={n} currentN={currentN} />
            </div>
          )}

          {/* Naive recursion comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3">
              <p className="text-[9px] font-mono text-red-400 uppercase tracking-widest mb-1">❌ Naive Recursion</p>
              <p className="text-xs font-mono text-slate-400">fib({n}) calls ≈ <span className="text-red-400 font-bold">{Math.round(Math.pow(1.618, n))}</span> function calls (O(2ⁿ))</p>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3">
              <p className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest mb-1">✓ With Memoization</p>
              <p className="text-xs font-mono text-slate-400">Only <span className="text-emerald-400 font-bold">{2 * n + 1}</span> unique calls needed (O(n))</p>
            </div>
          </div>
        </div>
      </VisualizerFrame>
    </div>
  );
}
