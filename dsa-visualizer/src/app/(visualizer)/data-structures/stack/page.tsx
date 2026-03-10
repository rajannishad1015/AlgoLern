"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { AlgorithmStep } from "@/lib/types/algorithm";
import { StackQueueViz } from "@/components/d3/StackQueueViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";

const MAX_CAPACITY = 12; // Visual limit before elements get too tiny

// ─── Generate steps for ONLY one operation at a time ─────────────────────────
function generateSingleStackSteps(
  currentStack: number[],
  op: { type: 'push'; value: number } | { type: 'pop' }
): { steps: AlgorithmStep[]; nextStack: number[] } {
  const stack = [...currentStack];
  const steps: AlgorithmStep[] = [];

  // Show current state as a starting point
  steps.push({
    id: 0, type: 'highlight', indices: [],
    values: { array: [...stack] },
    description: `Current stack has ${stack.length} element${stack.length !== 1 ? 's' : ''}.`,
  });

  if (op.type === 'push') {
    steps.push({
      id: 1, type: 'insert', indices: [stack.length],
      values: { array: [...stack, op.value] },
      description: `Pushing ${op.value} onto the TOP of the stack. (LIFO — Last In, First Out)`,
    });
    stack.push(op.value);
    steps.push({
      id: 2, type: 'done', indices: [],
      values: { array: [...stack] },
      description: `Push complete. ${op.value} is now on TOP. Stack size: ${stack.length}.`,
    });
  } else {
    if (stack.length === 0) {
      steps.push({
        id: 1, type: 'highlight', indices: [],
        values: { array: [] },
        description: `Stack is EMPTY — cannot pop (Stack Underflow Error).`,
      });
    } else {
      const popped = stack[stack.length - 1];
      steps.push({
        id: 1, type: 'delete', indices: [stack.length - 1],
        values: { array: [...stack] },
        description: `Popping TOP element: ${popped}. (LIFO — the last element pushed is the first to be removed.)`,
      });
      stack.pop();
      steps.push({
        id: 2, type: 'done', indices: [],
        values: { array: [...stack] },
        description: `Pop complete. ${popped} removed. Stack size: ${stack.length}.`,
      });
    }
  }

  return { steps, nextStack: stack };
}

export default function StackPage() {
  // Actual state of the stack (source of truth)
  const [stackArr, setStackArr] = useState<number[]>([10, 20, 30]);
  const [inputValue, setInputValue] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  // Initialize with the default stack state shown statically
  useEffect(() => {
    setAlgorithmId("stack");
    // Show the pre-loaded default stack as a single step
    setSteps([{
      id: 0, type: 'highlight', indices: [],
      values: { array: [...stackArr] },
      description: `Stack loaded with ${stackArr.length} elements. TOP is ${stackArr[stackArr.length - 1]}.`,
    }]);
    return () => {
      resetVisualizer();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (currentStepIndex < steps.length - 1) {
          stepForward();
        } else {
          setIsPlaying(false);
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, speed);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, currentStepIndex, steps.length, speed, stepForward, setIsPlaying]);

  const runOperation = (op: { type: 'push'; value: number } | { type: 'pop' }) => {
    const { steps: newSteps, nextStack } = generateSingleStackSteps(stackArr, op);
    // Reset to 0 first, THEN set new steps and play from the beginning
    resetVisualizer();
    setSteps(newSteps);
    setStackArr(nextStack);
    // Small timeout ensures state is flushed before play starts
    setTimeout(() => setIsPlaying(true), 50);
  };

  const handlePush = () => {
    const val = parseInt(inputValue);
    if (isNaN(val) || val < 0 || val > 999) return;
    if (stackArr.length >= MAX_CAPACITY) {
      // Show overflow message in the step info
      setSteps([{
        id: 0, type: 'highlight', indices: [],
        values: { array: [...stackArr] },
        description: `Stack Overflow! Maximum capacity of ${MAX_CAPACITY} elements reached. Pop some elements first.`,
      }]);
      setInputValue("");
      return;
    }
    setInputValue("");
    runOperation({ type: 'push', value: val });
  };

  const handlePop = () => {
    runOperation({ type: 'pop' });
  };

  const handleClear = () => {
    setStackArr([]);
    resetVisualizer();
    setSteps([{
      id: 0, type: 'highlight', indices: [],
      values: { array: [] },
      description: `Stack cleared. Empty stack — HEAD is NULL.`,
    }]);
  };

  const currentStepData = steps[currentStepIndex];

  const formattedDescription = currentStepData?.description
    ? currentStepData.description
        .replace(/\b(\d+)\b/g, '<span class="text-[var(--lime-dark)] dark:text-lime font-bold">$1</span>')
        + `<span class="text-indigo-400 italic ml-2">(${
            currentStepData.type === 'insert' ? 'Push ↑' :
            currentStepData.type === 'delete' ? 'Pop ↑' :
            currentStepData.type === 'done'   ? '✓ Done' : 'Viewing'
          })</span>`
    : "Ready...";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Stack (LIFO)"
        description="Last-In-First-Out Data Structure. Elements are added (pushed) to the top and removed (popped) from the top, just like a stack of plates."
        complexity={{ time: '1', space: 'n', difficulty: 'Easy' }}
        controls={
          <div className="flex flex-col gap-4 w-full">
            {/* Inline Action Row */}
            <div className="flex flex-col md:flex-row gap-3 items-center bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4">
              <div className="flex-1 w-full flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={999}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handlePush(); } }}
                  placeholder="Value to Push (0-999)"
                  className="flex-1 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-lime-600 dark:text-lime outline-none focus:border-indigo-500 transition-all font-mono"
                />
                <button
                  onClick={handlePush}
                  className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-lg"
                >
                  Push ↑
                </button>
              </div>

              <div className="w-full md:w-auto flex gap-2">
                <button
                  onClick={handlePop}
                  className="flex-1 md:flex-none px-6 py-2.5 rounded-lg border border-orange-500/50 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold transition-colors shadow-sm"
                >
                  Pop ↑
                </button>
                <button
                  onClick={handleClear}
                  className="flex-1 md:flex-none px-6 py-2.5 rounded-lg bg-slate-200 dark:bg-[#252840] hover:bg-slate-300 dark:hover:bg-[#2f3352] text-slate-700 dark:text-slate-300 font-semibold transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            <ControlBar
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onStepForward={stepForward}
              onStepBackward={stepBackward}
              onReset={resetVisualizer}
              onSpeedChange={setSpeed}
              isPlaying={isPlaying}
              currentStep={currentStepIndex}
              totalSteps={steps.length}
              speed={speed}
              stepDescription={formattedDescription}
            />
          </div>
        }
        info={
          <TheoryCard
            title="Stack"
            description="A Stack is a linear data structure that follows the LIFO (Last-In-First-Out) principle. This means the last element added to the stack will be the first one to be removed. It primarily supports two main operations: Push (add an item to the top) and Pop (remove the item from the top)."
            descriptionHi="Stack ek linear data structure hai jo LIFO (Last-In-First-Out) rule follow karta hai. Iska matlab jo aakhiri mein aayega, sabse pehle wahi jayega. Isme do main operations hote hain: Push (item ko top par rakhna) aur Pop (top se item nikaalna)."
            analogy={{
              icon: "🥞",
              title: "A Stack of Pancakes",
              titleHi: "Pancakes ka Dher",
              desc: "Think of a stack of pancakes. When the cook makes a new pancake, they place it on top of the pile (Push). When you want to eat one, you take the top pancake off the pile (Pop). You can't easily grab a pancake from the bottom without ruining the stack!",
              descHi: "Shaadiyon mein rakhi plates ke dher ke baare mein sochiye. Jab wahan plate rakhni hoti hai toh sabse upar rakhte hain (Push). Aur jab koi khana khaane ke liye plate uthaata hai, toh sabse upar wali hi uthaata hai (Pop). Beech se plate nikaalna mushkil hai!"
            }}
            readingTip={{
              en: "Stacks are heavily used under the hood in computer science — to manage function calls (the Call Stack) and for implementing undo features in text editors.",
              hi: "Computer science mein Stacks ka bahut use hota hai — jaise programs mein 'Call Stack' function calls ko manage karta hai, aur MS Word/Notepad mein 'Undo' feature bhi stack hi use karta hai."
            }}
            quote={{
              en: '"Stacks enforce perfect history: you must fully resolve the present before you can return to the past."',
              hi: '"Stacks history ko perfect rakhte hain: purani cheezon par wapas jaane ke liye pehle aaj ki (top) cheezon ko nipatana padta hai."'
            }}
            complexities={[
              { case: "Push", time: "1", space: "1", note: "Instant addition to the top." },
              { case: "Pop",  time: "1", space: "1", note: "Instant removal from the top." },
              { case: "Peek", time: "1", space: "1", note: "Viewing the top element." },
            ]}
            pseudocode={`class Stack:
  constructor():
    items = []
    
  push(element):
    items.append(element)
    
  pop():
    if not isEmpty():
      return items.removeLast()  # LIFO!
    else:
      return "Stack Underflow!"
      
  peek():
    return items[items.length - 1]
      
  isEmpty():
    return items.length == 0`}
            useCases={[
              "Undo/Redo features in applications.",
              "Browser History (Back button).",
              "Call Stack in programming languages (Recursion).",
              "Expression evaluation and syntax parsing (e.g. valid parentheses).",
            ]}
            useCasesHi={[
              "Apps mein Undo/Redo features ke liye.",
              "Browser mein 'Back' button ki history track karne ke liye.",
              "Programming mein functions aur recursion ko Call Stack mein manage karna.",
              "Math expressions check karne ke liye (jaise brackets sahi se close hue ya nahi)."
            ]}
            howItWorks={{
              en: [
                { icon: "📥", text: "Push: Place a new element strictly on top of the existing stack." },
                { icon: "📤", text: "Pop: Remove and return the element currently sitting at the absolute top. (LIFO: last one in, first one out!)" },
                { icon: "👀", text: "Peek/Top: Look at the top element without removing it." },
                { icon: "🚫", text: "Underflow: Trying to pop from an empty stack causes an error." }
              ],
              hi: [
                { icon: "📥", text: "Push: Naye element ko hamesha current elements ke sabse upar rakhna." },
                { icon: "📤", text: "Pop: Jo element sabse upar rakha hai use bahar nikaalna. (LIFO: jo aakhiri aaya, pehle jayega!)" },
                { icon: "👀", text: "Peek/Top: Upar wale element ko sirf dekhna, nikaalna nahi." },
                { icon: "🚫", text: "Underflow: Agar stack khali hai aur aap 'Pop' karte ho toh error aata hai." }
              ]
            }}
            example={{
              array: [],
              steps: [
                { desc: "Stack is initially empty.", descHi: "Shuru mein Stack bilkul khali hai.", array: [], highlight: [] },
                { desc: "PUSH 10: 10 is placed at the bottom (it's the only item, so also the TOP).", descHi: "PUSH 10: Ek plate aayi, 10 sbse niche rakha gaya.", array: [10], highlight: [0] },
                { desc: "PUSH 20: 20 is placed ON TOP of 10. 20 is now the TOP element.", descHi: "PUSH 20: 20 ko 10 ke bilkul upar rakha gaya. 20 ab TOP hai.", array: [10, 20], highlight: [1] },
                { desc: "PUSH 30: 30 is placed ON TOP of 20. 30 is now the TOP.", descHi: "PUSH 30: 30 ko upar rakha. Ab 30 'Top' element ban gaya.", array: [10, 20, 30], highlight: [2] },
                { desc: "POP: LIFO means we MUST remove the TOP element first. 30 is removed!", descHi: "POP: LIFO ka matlab hai sirf TOP (30) ko nikaala ja sakta hai, koi aur nahi!", array: [10, 20], highlight: [] },
                { desc: "PUSH 40: 40 lands on top of 20 (since 30 is gone).", descHi: "PUSH 40: Naya element aya toh wo 20 ke upar gaya.", array: [10, 20, 40], highlight: [2] },
              ]
            }}
          />
        }
      >
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          {/* Status Badge */}
          <div className="absolute top-4 right-4 md:right-6 z-20 flex flex-col items-end gap-2 text-xs font-mono bg-white/80 dark:bg-[#0d0f1a]/80 backdrop-blur-sm p-2 rounded-lg border border-black/5 dark:border-white/5">
            <span className="text-black/40 dark:text-slate-500 uppercase tracking-[0.2em] font-bold text-[9px] md:text-[10px] mb-1">Stack Status</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Size: {stackArr.length}</span>
            <span className="text-lime-600 dark:text-lime font-bold">
              TOP: {stackArr.length > 0 ? stackArr[stackArr.length - 1] : 'NULL'}
            </span>
          </div>
          <StackQueueViz currentStepData={currentStepData} layout="vertical" />
        </div>
      </VisualizerFrame>
    </div>
  );
}
