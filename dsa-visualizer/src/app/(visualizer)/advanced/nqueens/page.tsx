"use client";

import { useEffect, useRef, useState } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateNQueensSteps } from "@/lib/algorithms/advanced/nQueens";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { Crown, ShieldAlert, XCircle } from "lucide-react";

// ─── Theory ────────────────────────────────────────────────────────────────
const THEORY = {
  title: "N-Queens Problem (Backtracking)",
  description: "The N-Queens puzzle is the problem of placing N chess queens on an N×N chessboard so that no two queens threaten each other. This means no two queens can share the same row, column, or diagonal. It is a classic example of Recursive Backtracking — a 'trial and error' approach where we explore a path until it fails, then backtrack to try a different way.",
  descriptionHi: "N-Queens problem mein N queens ko N×N board pe aise rakhna hota hai ki koi bhi queen dusri ko attack na kare (same row, column, ya diagonal mein nahi). Yeh Recursive Backtracking ka ek classic example hai — pehle ek rasta try karo, fail hone pe peeche aao aur dusra rasta lo.",
  complexities: [
    { case: "Time",  time: "O(N!)", space: "O(N²)", note: "Exponential — search space is huge" },
    { case: "Space", time: "O(N)",   space: "O(N)",  note: "Recursion depth is N" },
  ],
  useCases: [
    "Constraint Satisfaction Problems (CSP)",
    "VLSI testing & circuit board design",
    "Scheduling & resource allocation tasks",
    "Chess engine move evaluation (heuristics)",
  ],
  useCasesHi: [
    "Constraint Satisfaction Problems (CSP)",
    "VLSI testing aur circuit board design",
    "Scheduling aur resource allocation tasks",
    "Chess engine move evaluation",
  ],
  analogy: {
    icon: "🧩",
    title: "Solving a Maze",
    titleHi: "Ek Maze Solve Karna",
    desc: "Placing a queen is like entering a corridor in a maze. If you hit a wall (a conflict), you go back to the last intersection (backtrack) and try the next corridor. Backtracking 'remembers' where you chose wrong and avoids that entire path.",
    descHi: "Queen rakhna maze mein ek raste pe jaane jaisa hai. Agar raasta band hai (conflict), toh last intersection pe wapas aao (backtracking) aur naya raasta lo. Backtracking yaad rakhta hai ki kahan galti hui aur us raste ko avoid karta hai.",
  },
  howItWorks: {
    en: [
      { icon: "🏰", text: "Start in the leftmost column. Try placing a queen in each row of that column." },
      { icon: "🛡️", text: "Check if the position is safe from queens in previous columns." },
      { icon: "✅", text: "If safe, place the queen and move to the next column recursively." },
      { icon: "🔙", text: "If no safe row exists, BACKTRACK: remove the queen from the previous column and try its next row." },
      { icon: "🏁", text: "If all N queens are placed, a solution is found!" },
    ],
    hi: [
      { icon: "🏰", text: "Pehli column se shuru karo. Har row mein queen rakhne ki koshish karo." },
      { icon: "🛡️", text: "Check karo kya wo position pichli queens se safe hai." },
      { icon: "✅", text: "Agar safe hai, toh queen rakho aur next column pe jao." },
      { icon: "🔙", text: "Agar kisi row mein safe position nahi mili, toh BACKTRACK: pichli queen hatao aur uski next row try karo." },
      { icon: "🏁", text: "Jab N queens place ho jayein, solution mil gaya!" },
    ],
  },
  readingTip: {
    en: "Watch the board in real-time. Blue = Currently checking a cell. Green = Safe placement. Red with ⚠️ = CONFLICT with another queen. When a queen disappears, that's BACKTRACKING in action! Notice how the algorithm tries all rows in a column before giving up.",
    hi: "Board ko live dekho. Blue = Cell check ho raha hai. Green = Safe placement. Red + ⚠️ = Dusri queen se CONFLICT. Jab queen gayab ho jaye, toh woh BACKTRACKING hai! Dekho kaise algorithm ek column ki saari rows try karta hai haar maanne se pehle.",
  },
  quote: {
    en: '"Backtracking is like exploring all possible futures, and choosing only the one where you succeed."',
    hi: '"Backtracking sabhi possible futures ko explore karne jaisa hai, aur sirf usi ko chun-na jisme aap kamyab hoon."',
  },
  pseudocode: `function solve(col):
    if col >= N: return true // Success!
    
    for row in 0..N-1:
        if isSafe(row, col):
            placeQueen(row, col)
            if solve(col + 1): return true
            removeQueen(row, col) // BACKTRACK 🔙
            
    return false`,
  code: {
    language: "java",
    content: `boolean solve(int col) {
    if (col >= N) return true;
    for (int i = 0; i < N; i++) {
        if (isSafe(board, i, col)) {
            board[i][col] = 1;
            if (solve(col + 1)) return true;
            board[i][col] = 0; // BACKTRACK
        }
    }
    return false;
}`,
  },
  quiz: [
    {
      q: "N-Queens problem is a classic example of which technique?",
      options: ["Greedy", "Dynamic Programming", "Backtracking", "Divide and Conquer"],
      answer: 2,
    },
    {
      q: "For which N does the N-Queens problem have no solution?",
      options: ["N=1", "N=4", "N=2", "N=8"],
      answer: 2,
    },
    {
      q: "What is the time complexity of the N-Queens problem?",
      options: ["O(N log N)", "O(N²)", "O(N!)", "O(2ⁿ)"],
      answer: 2,
    },
  ],
};

// ─── Chessboard Visualization ─────────────────────────────────────────────
function Chessboard({ board, currentStep }: { board: number[][]; currentStep: any }) {
  const n = board.length;
  const testCol = currentStep?.values?.testCol;
  const rowIdx = currentStep?.values?.rowIdx;
  const conflict = currentStep?.values?.conflictingPos;

  return (
    <div 
      className="grid gap-1 bg-[#1a1b2e] p-2 rounded-xl border border-white/10 shadow-2xl"
      style={{ 
        gridTemplateColumns: `repeat(${n}, 1fr)`,
        width: "min(90vw, 400px)",
        height: "min(90vw, 400px)",
      }}
    >
      {board.map((row, r) => 
        row.map((val, c) => {
          const isDark = (r + c) % 2 === 1;
          const isChecking = testCol === c && rowIdx === r;
          const isConflict = conflict?.r === r && conflict?.c === c;
          const isConflictTest = r === rowIdx && c === testCol && currentStep?.type === "highlight" && currentStep?.values?.conflictingPos;
          const hasQueen = val === 1;

          return (
            <div 
              key={`${r}-${c}`}
              className={`relative flex items-center justify-center rounded-sm transition-all duration-300 border-2 ${
                isDark ? "bg-[#252841]" : "bg-[#303450]"
              } ${
                isChecking ? "border-indigo-400 bg-indigo-500/20 shadow-[inset_0_0_10px_rgba(129,140,248,0.5)]" 
                : isConflictTest ? "border-rose-500 bg-rose-500/20 animate-pulse"
                : isConflict ? "border-amber-400 bg-amber-400/20"
                : "border-transparent"
              }`}
            >
              <div className="absolute top-0.5 right-0.5 text-[8px] font-mono text-slate-600 opacity-20 pointer-events-none">
                {r},{c}
              </div>

              {hasQueen && (
                <div className="text-indigo-300 drop-shadow-[0_0_8px_rgba(165,180,252,0.8)] animate-in zoom-in-50 duration-300">
                  <Crown size={32} />
                </div>
              )}

              {isChecking && !hasQueen && (
                <div className="text-white/40 animate-bounce">
                  <Crown size={20} />
                </div>
              )}

              {isConflictTest && (
                <div className="text-rose-400 absolute inset-0 flex items-center justify-center">
                  <XCircle size={36} className="opacity-80" />
                </div>
              )}

              {isConflict && hasQueen && (
                <div className="absolute -top-1 -right-1 text-rose-500 bg-white rounded-full p-0.5 shadow-lg">
                  <ShieldAlert size={14} fill="currentColor" className="text-white" />
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default function NQueensPage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [n, setN] = useState(4); // Default 4 since it's the smallest interesting case

  const { 
    steps, 
    currentStepIndex, 
    isPlaying, 
    speed, 
    setSteps, 
    setIsPlaying, 
    setSpeed, 
    stepForward, 
    stepBackward, 
    resetVisualizer, 
    setAlgorithmId 
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("advanced-nqueens");
    setSteps(generateNQueensSteps(n));
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
  const board = (currentStep?.values?.board ?? Array.from({ length: n }, () => Array(n).fill(0))) as number[][];
  const stepType = currentStep?.type ?? "highlight";
  
  const placedQueens = board.flat().filter(q => q === 1).length;

  const stepDesc = currentStep?.description ?? "N-Queens ready — press Play!";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="N-Queens Backtracking"
        description="A beautiful visualization of the N-Queens constraint satisfaction puzzle. Watch the algorithm struggle, learn from conflicts, and backtrack to find a valid arrangement."
        complexity={{ time: "N!", space: "N", difficulty: "Hard" }}
        controls={
          <div className="flex flex-col gap-4 w-full">
            {/* Board size selector */}
            <div className="flex items-center gap-4 bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-widest shrink-0">Board Size N =</span>
              <div className="flex gap-2 flex-1">
                {[4, 5, 6, 8].map(size => (
                  <button
                    key={size}
                    onClick={() => { resetVisualizer(); setN(size); }}
                    className={`flex-1 py-2 rounded-lg font-mono text-sm font-bold transition-all ${
                      n === size ? "bg-indigo-600 text-white shadow-lg" : "bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    {size}x{size}
                  </button>
                ))}
              </div>
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
        <div className="w-full h-full flex flex-col items-center justify-center p-6 gap-8 overflow-auto">
          
          {/* Stats Bar */}
          <div className="flex gap-6 items-center">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Queens Placed</span>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-lg font-bold shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                <Crown size={18} /> {placedQueens} / {n}
              </div>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Action</span>
              <span className={`px-4 py-1.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider border transition-all ${
                stepType === "insert" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : stepType === "delete" ? "border-amber-500/40 bg-amber-500/10 text-amber-500 animate-pulse"
                : stepType === "visit" ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-400"
                : stepType === "done" ? "border-indigo-400 bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                : "border-white/10 bg-white/5 text-slate-400"
              }`}>{stepType === "delete" ? "Backtracking" : stepType}</span>
            </div>
          </div>

          {/* Solution found / No solution alerts */}
          <div className="h-6 flex items-center justify-center">
             {stepType === "done" && (
                <div className="text-emerald-400 font-bold flex items-center gap-2 animate-bounce">
                  ✨ SOLUTION FOUND! ✨
                </div>
             )}
             {currentStep?.description?.includes("No valid") && (
                <div className="text-rose-400 font-bold flex items-center gap-2 animate-shake">
                  ❌ NO SOLUTION FOUND FOR N={n} ❌
                </div>
             )}
          </div>

          <div className="bg-[#111428] p-8 rounded-[2rem] border border-white/5 shadow-inner">
            <Chessboard board={board} currentStep={currentStep} />
          </div>

          {/* Legend */}
          <div className="flex gap-6 mt-2 flex-wrap justify-center border-t border-white/5 pt-6 w-full max-w-md">
            {[
              { color: "bg-indigo-500/20 border-indigo-400 shadow-[inset_0_0_10px_rgba(129,140,248,0.5)]", label: "Checking" },
              { color: "bg-rose-500/20 border-rose-500", label: "Conflict! ⚠️" },
              { icon: <Crown size={14} className="text-indigo-300" />, label: "Placed Queen" },
              { icon: <ShieldAlert size={14} className="text-rose-500" />, label: "Attacker" },
            ].map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded border flex items-center justify-center text-[10px] ${l.color || "bg-[#252841] border-white/10"}`}>
                  {l.icon}
                </div>
                <span className="text-[10px] font-mono text-slate-500">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </VisualizerFrame>
    </div>
  );
}
