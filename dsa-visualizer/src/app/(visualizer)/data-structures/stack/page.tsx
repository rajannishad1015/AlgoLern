"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateStackSteps } from "@/lib/algorithms/data-structures/stackOperations";
import { StackQueueViz } from "@/components/d3/StackQueueViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";

type StackOp = { type: 'push', value: number } | { type: 'pop' };

export default function StackPage() {
  const [operations, setOperations] = useState<StackOp[]>([
      { type: 'push', value: 10 },
      { type: 'push', value: 20 },
      { type: 'push', value: 30 },
      { type: 'pop' },
      { type: 'push', value: 40 },
  ]);
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { steps, currentStepIndex, isPlaying, speed, setSteps, setIsPlaying, setSpeed, stepForward, stepBackward, resetVisualizer, setAlgorithmId } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("stack");
    setSteps(generateStackSteps(operations));
    return () => { resetVisualizer(); if (timerRef.current) clearInterval(timerRef.current); };
  }, [operations, setSteps, resetVisualizer, setAlgorithmId]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (currentStepIndex < steps.length - 1) stepForward();
        else { setIsPlaying(false); if (timerRef.current) clearInterval(timerRef.current); }
      }, speed);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, currentStepIndex, steps.length, speed, stepForward, setIsPlaying]);

  const handlePush = () => {
    const val = parseInt(inputValue);
    if (isNaN(val) || val < 0 || val > 999) return;
    setOperations(prev => [...prev, { type: 'push', value: val }]);
    setInputValue("");
    resetVisualizer();
  };

  const handlePop = () => {
    setOperations(prev => [...prev, { type: 'pop' }]);
    resetVisualizer();
  };
  
  const handleClear = () => {
    setOperations([]);
    resetVisualizer();
  };

  const currentStepData = steps[currentStepIndex];

  const formattedDescription = currentStepData?.description
    ? currentStepData.description
        .replace(/\b(\d+)\b/g, '<span class="text-[var(--lime-dark)] dark:text-lime font-bold">$1</span>')
        + `<span class="text-indigo-400 italic ml-2">(Next: ${
            currentStepData.type === 'insert'    ? 'Push Complete' :
            currentStepData.type === 'delete'    ? 'Updating Stack' :
            currentStepData.type === 'update'    ? 'Pop Complete' :
            currentStepData.type === 'done'      ? 'All Ops Finished' : 'Run'
          })</span>`
    : "Waiting for operations...";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Stack (LIFO)"
        description="Last-In-First-Out Data Structure. Elements are added (pushed) to the top and removed (popped) from the top, just like a stack of plates."
        complexity={{ time: '1', space: 'n', difficulty: 'Easy' }}
        controls={
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
            // Overriding standard randomize/input with custom stack controls
            onRandomize={handleClear}
            hideRandomizeText="Clear Stack"
            onCustomInput={() => setShowInputModal(true)}
            customInputText="Add Operations"
          />
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
      return items.removeLast()
    else:
      return "Stack Underflow!"
      
  peek():
    if not isEmpty():
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
                { icon: "📤", text: "Pop: Remove and return the element currently sitting at the absolute top." },
                { icon: "👀", text: "Peek/Top: Look at the top element without removing it." },
                { icon: "🚫", text: "Underflow: Trying to pop from an empty stack causes an error." }
              ],
              hi: [
                { icon: "📥", text: "Push: Naye element ko hamesha current elements ke sabse upar rakhna." },
                { icon: "📤", text: "Pop: Jo element sabse upar rakha hai use bahar nikaalna." },
                { icon: "👀", text: "Peek/Top: Upar wale element ko sirf dekhna, nikaalna nahi." },
                { icon: "🚫", text: "Underflow: Agar stack khali hai aur aap 'Pop' karte ho toh error aata hai." }
              ]
            }}
            example={{
              array: [],
              steps: [
                { desc: "Stack is initially empty.", descHi: "Shuru mein Stack bilkul khali hai.", array: [], highlight: [] },
                { desc: "PUSH 10: 10 is placed at the bottom.", descHi: "PUSH 10: Ek plate aayi, 10 sbse niche rakha gaya.", array: [10], highlight: [0] },
                { desc: "PUSH 20: 20 is placed ON TOP of 10.", descHi: "PUSH 20: 20 ko 10 ke bilkul upar rakha gaya.", array: [10, 20], highlight: [1] },
                { desc: "PUSH 30: 30 is placed ON TOP of 20. 30 is now the Top element.", descHi: "PUSH 30: 30 ko upar rakha. Ab 30 'Top' element ban gaya.", array: [10, 20, 30], highlight: [2] },
                { desc: "POP: We want to remove an item. We MUST take the Top element, which is 30.", descHi: "POP: Humein item nikaalna hai. Toh hum sirf Top (30) ko hi nikaal sakte hain.", array: [10, 20], highlight: [] },
                { desc: "PUSH 40: 40 is placed ON TOP of 20 (since 30 is gone).", descHi: "PUSH 40: Naya element aya toh wo 20 ke upar gaya, kyuki 30 nikal chuka hai.", array: [10, 20, 40], highlight: [2] },
                { desc: "POP: 40 is removed.", descHi: "POP: 40 nikal gaya.", array: [10, 20], highlight: [] },
                { desc: "POP: 20 is removed. Only 10 is left.", descHi: "POP: 20 nikal gaya. Bas 10 bacha.", array: [10], highlight: [] },
              ]
            }}
          />
        }
      >
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          <div className="absolute top-4 right-4 md:right-6 z-20 flex flex-col items-end gap-2 text-xs font-mono bg-white/80 dark:bg-[#0d0f1a]/80 backdrop-blur-sm p-2 rounded-lg border border-black/5 dark:border-white/5">
            <span className="text-black/40 dark:text-slate-500 uppercase tracking-[0.2em] font-bold text-[9px] md:text-[10px] mb-1">Stack Status</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Step: {currentStepIndex}</span>
            <span className="text-lime-600 dark:text-lime font-bold">Size: {currentStepData?.values?.array?.length || 0}</span>
          </div>
          <StackQueueViz currentStepData={currentStepData} layout="vertical" />
        </div>

        {/* Custom Input Modal for Stack Operations */}
        {showInputModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-[#14151f] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
              <h3 className="text-xl font-display text-white tracking-tight">Stack Controls</h3>
              <p className="text-sm font-light text-white/50">Push a value to the top, or Pop the top value.</p>
              
              <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    autoFocus
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handlePush()}
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-lime outline-none focus:border-lime/50 transition-all font-mono"
                    placeholder="Enter number (0-999)"
                  />
                  <button onClick={handlePush} className="px-5 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg text-sm transition-colors font-bold uppercase tracking-wider">
                    Push
                  </button>
              </div>

              <div className="flex gap-2 items-center mt-2">
                  <button onClick={handlePop} className="flex-1 px-5 py-3 rounded-lg border border-orange-500/50 hover:bg-orange-500/20 text-orange-400 shadow-lg text-sm transition-colors font-bold uppercase tracking-wider">
                    Pop Top Element
                  </button>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10">
                 <p className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-bold">Queued Operations ({operations.length})</p>
                 <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto">
                    {operations.map((op, i) => (
                        <span key={i} className={`text-[10px] px-2 py-1 rounded font-mono ${op.type === 'push' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-orange-500/20 text-orange-300'}`}>
                            {op.type.toUpperCase()} {op.type === 'push' ? op.value : ''}
                        </span>
                    ))}
                 </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setShowInputModal(false)} className="px-4 py-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white text-sm transition-colors">
                  Close Engine
                </button>
              </div>
            </div>
          </div>
        )}
      </VisualizerFrame>
    </div>
  );
}
