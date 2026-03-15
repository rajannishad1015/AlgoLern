"use client";

import { useEffect, useRef, useState } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { Board, generateSudokuSteps, generateDefaultBoard } from "@/lib/algorithms/advanced/sudokuBacktracking";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { TheoryCard } from "@/components/visualizer/TheoryCard";

function SudokuGrid({ board, cell, action, initialBoard }: {
  board: Board;
  cell: [number, number] | null;
  action: string | null;
  initialBoard: Board;
}) {
  return (
    <div className="grid gap-0.5 bg-white/10 p-1 rounded-xl border border-white/10 shadow-2xl" style={{ gridTemplateColumns: "repeat(9,1fr)", width: "min(90vw, 360px)", height: "min(90vw, 360px)" }}>
      {board.map((row, r) =>
        row.map((val, c) => {
          const isActive   = cell && cell[0] === r && cell[1] === c;
          const isOriginal = initialBoard[r][c] !== 0;
          const isPlace    = isActive && action === "place";
          const isBack     = isActive && action === "backtrack";
          const boxRow = Math.floor(r / 3), boxCol = Math.floor(c / 3);
          const boxShade = (boxRow + boxCol) % 2 === 0;

          return (
            <div
              key={`${r}-${c}`}
              className={`relative flex items-center justify-center rounded-sm transition-all duration-200 text-sm font-mono font-bold
                ${boxShade ? "bg-[#1a1c30]" : "bg-[#222440]"}
                ${isPlace  ? "bg-emerald-500/30 shadow-[inset_0_0_8px_rgba(52,211,153,0.6)]" : ""}
                ${isBack   ? "bg-rose-500/30 shadow-[inset_0_0_8px_rgba(239,68,68,0.6)] animate-pulse" : ""}
                ${c === 2 || c === 5 ? "border-r-2 border-r-indigo-500/40" : ""}
                ${r === 2 || r === 5 ? "border-b-2 border-b-indigo-500/40" : ""}
              `}
            >
              <span className={`
                ${isOriginal ? "text-white/90" : "text-indigo-300"}
                ${isPlace    ? "text-emerald-300 text-base" : ""}
                ${isBack     ? "text-rose-300" : ""}
                ${val === 0  ? "opacity-0" : ""}
              `}>
                {val !== 0 ? val : ""}
              </span>
              {isBack && val === 0 && (
                <span className="absolute inset-0 flex items-center justify-center text-rose-400 text-xs">↩</span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default function SudokuPage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const initialBoard = generateDefaultBoard();
  const [initBoard] = useState<Board>(initialBoard);

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("sudoku-backtracking");
    setSteps(generateSudokuSteps(initBoard.map(r => [...r])));
    return () => { resetVisualizer(); if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const vals = (currentStep?.values ?? {}) as { board?: Board; cell?: [number, number] | null; action?: string };
  const board: Board = vals.board ?? initBoard;
  const cell = vals.cell ?? null;
  const action = vals.action ?? null;

  const filledCells = board.flat().filter(v => v !== 0).length;
  const backtracking = action === "backtrack";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Sudoku — Backtracking"
        description="Watch a classic 9×9 Sudoku puzzle get solved through brute-force backtracking. The algorithm fills empty cells one by one, and backtracks when it hits a dead end."
        complexity={{ time: "9^(n²)", space: "n²", difficulty: "Hard" }}
        controls={
          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center gap-4 bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4">
              <div className="flex gap-4 text-xs font-mono">
                <span className="text-slate-500">Filled: <span className="text-white font-bold">{filledCells}/81</span></span>
                <span className={`font-bold ${backtracking ? "text-rose-400" : action === "done" ? "text-emerald-400" : "text-indigo-400"}`}>
                  {backtracking ? "↩ Backtracking" : action === "place" ? "✓ Placing" : action === "done" ? "✨ Solved!" : "Scanning..."}
                </span>
              </div>
            </div>
            <ControlBar
              onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)}
              onStepForward={stepForward} onStepBackward={stepBackward}
              onReset={resetVisualizer} onSpeedChange={setSpeed}
              isPlaying={isPlaying} currentStep={currentStepIndex}
              totalSteps={steps.length} speed={speed}
              stepDescription={currentStep?.description ?? "Press Play to watch backtracking solve Sudoku!"} />
          </div>
        }
        info={
          <TheoryCard
            title="Sudoku Backtracking"
            description="Sudoku is solved via Constraint-Based Backtracking: for each empty cell, try every digit 1–9. Skip any digit that violates row, column, or 3×3 box constraints. If no digit works, backtrack to the previous cell and try the next option. Repeat until the board is complete."
            descriptionHi="Sudoku Constraint-Based Backtracking se solve hota hai: har khali cell ke liye 1–9 digits try karo. Jo digit row, column, ya 3×3 box constraint violate kare, use skip karo. Koi digit kaam na kare toh pichli cell pe wapas jao aur next option try karo."
            analogy={{
              icon: "🧩",
              title: "Filling a Form with Rules",
              titleHi: "Rules ke Saath Form Fill Karna",
              desc: "Imagine filling a form where each box has strict rules. You try each option. If a rule is broken, you erase and try the next. If no option works, you go back to the previous box and try something different.",
              descHi: "Socho ek form bharna hai jisme har box ke strict rules hain. Har option try karo. Agar rule toot jaye, mita do aur next try karo. Koi option kaam na kare toh pichle box pe jao."
            }}
            readingTip={{
              en: "Green cell = digit placed. Red pulsing + ↩ = backtracking. White digits = original clues. Blue digits = algorithm-placed. Speed up to see the full solution faster!",
              hi: "Green cell = digit rakha gaya. Red pulsing + ↩ = backtracking. White digits = original clues. Blue digits = algorithm ne rakhe. Speed badhao puri solution jaldi dekhne ke liye!"
            }}
            complexities={[
              { case: "Time",  time: "9^(n²)", space: "n²", note: "Exponential in worst case." },
              { case: "Space", time: "n²",     space: "n²", note: "Board state stored." },
            ]}
            pseudocode={`function solve(board):
  for each empty cell (row, col):
    for num in 1..9:
      if isValid(board, row, col, num):
        board[row][col] = num
        if solve(board): return true
        board[row][col] = 0  // backtrack
    return false
  return true  // all cells filled`}
            useCases={[
              "Puzzle solving (Sudoku, crosswords, etc.).",
              "Constraint Satisfaction Problems (CSP).",
              "Generating valid Sudoku puzzles.",
              "Learning backtracking algorithm design.",
            ]}
            useCasesHi={[
              "Puzzle solving (Sudoku, crosswords, etc.).",
              "Constraint Satisfaction Problems (CSP).",
              "Valid Sudoku puzzles generate karna.",
              "Backtracking algorithm design seekhna.",
            ]}
            howItWorks={{
              en: [
                { icon: "🔍", text: "Scan for the first empty cell (value = 0)." },
                { icon: "🔢", text: "Try placing digits 1–9 one at a time." },
                { icon: "✅", text: "For each digit, check: no duplicate in same row, column, or 3×3 box." },
                { icon: "↩", text: "If no digit is valid, erase and backtrack to the previous cell." },
                { icon: "🏆", text: "If no empty cells remain, the puzzle is solved!" },
              ],
              hi: [
                { icon: "🔍", text: "Pehli khali cell (value = 0) dhoodho." },
                { icon: "🔢", text: "1–9 digits ek ek karke try karo." },
                { icon: "✅", text: "Har digit ke liye check karo: same row, column, ya 3×3 box mein duplicate nahi hai." },
                { icon: "↩", text: "Koi digit valid nahi hai toh mita do aur pichli cell pe wapas jao." },
                { icon: "🏆", text: "Koi khali cell nahi bachi matlab puzzle solve ho gaya!" },
              ]
            }}
            code={{
              language: "javascript",
              content: `function solve(board) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, r, c, num)) {
            board[r][c] = num;
            if (solve(board)) return true;
            board[r][c] = 0; // backtrack
          }
        }
        return false; // trigger backtrack
      }
    }
  }
  return true; // solved!
}`
            }}
            quiz={[
              {
                q: "Why does Sudoku use Backtracking instead of Greedy?",
                options: ["Greedy is too slow", "Local choices may invalidate future cells", "Backtracking uses less memory", "Greedy doesn't work on grids"],
                answer: 1,
              },
              {
                q: "When does Sudoku Backtracking 'backtrack'?",
                options: ["When a row is complete", "When no digit 1–9 is valid for a cell", "Every 9 cells", "When the board is half-filled"],
                answer: 1,
              },
              {
                q: "What are the three constraint checks in Sudoku?",
                options: ["Row, Column, Diagonal", "Row, Column, 3×3 Box", "Row, Box, Color", "Column, Diagonal, Box"],
                answer: 1,
              },
            ]}
          />
        }
      >
        <div className="w-full h-full flex flex-col items-center justify-center p-6 gap-6 overflow-auto">
          <div className="flex gap-6 flex-wrap justify-center text-center">
            {[
              { label: "Strategy", val: "Backtracking" },
              { label: "Empty cells", val: `${81 - filledCells}` },
              { label: "Step", val: `${currentStepIndex + 1}/${steps.length}` },
            ].map(({ label, val }) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{label}</span>
                <span className="text-lg font-bold font-mono text-white">{val}</span>
              </div>
            ))}
          </div>
          <SudokuGrid board={board} cell={cell} action={action} initialBoard={initBoard} />
          <div className="flex gap-4 text-[10px] font-mono text-slate-600">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500/30 rounded inline-block"/> Placing</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-rose-500/30 rounded inline-block"/> Backtracking</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-white/10 rounded inline-block"/><span className="text-white/70">Original</span></span>
            <span className="flex items-center gap-1"><span className="text-indigo-300 font-bold">■</span> Placed by algorithm</span>
          </div>
        </div>
      </VisualizerFrame>
    </div>
  );
}
