"use client";

import { useEffect, useRef, useState } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateBSTSteps, BSTOperation } from "@/lib/algorithms/trees/bstOperations";
import { TreeViz } from "@/components/d3/TreeViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { Search, Plus, Trash2, ListTree, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

const BST_THEORY = {
  title: "Binary Search Tree",
  description: "A Binary Search Tree (BST) is a node-based data structure where each node has at most two children. The left child's value is strictly less than its parent's, and the right child's value is strictly greater.",
  descriptionHi: "बाइनरी सर्च ट्री (BST) एक ऐसा ट्री है जहां बायां बच्चा पैरेंट से छोटा और दायां बच्चा पैरेंट से बड़ा होता है। यह डेटा को तेजी से खोजने में मदद करता है।",
  complexities: [
    { case: "Best Time", time: "O(log n)", space: "O(n)", note: "Perfectly balanced tree" },
    { case: "Average Time", time: "O(log n)", space: "O(n)", note: "Randomly built tree" },
    { case: "Worst Time", time: "O(n)", space: "O(n)", note: "Skewed tree (like a linked list)" },
  ],
  useCases: [
    "Dynamic sorting",
    "Maintaining a constantly changing dataset in order",
    "Finding closest elements and range queries"
  ],
  useCasesHi: [
    "डेटा को dynamically सॉर्टेड रखना",
    "लगातार बदलते डेटासेट को आर्डर में मेन्टेन करना",
    "रेंज क्वेरीज़ (range queries) और नज़दीकी एलिमेंट्स खोजना"
  ],
  analogy: {
    icon: "book",
    title: "Looking up a Word in a Dictionary",
    titleHi: "डिक्शनरी में एक शब्द खोजना",
    desc: "You open the dictionary to the middle. If your word comes before the middle page, you ignore the second half entirely. You repeat this halving process—exactly what a BST does during a search.",
    descHi: "जब आप डिक्शनरी के बीच में खोलते हैं, और आपका शब्द पहले आता है, तो आप बाकी आधा हिस्सा छोड़ देते हैं और वही प्रक्रिया दोहराते हैं। BST बिल्कुल ऐसे ही काम करता है।"
  },
  pseudocode: `function search(node, key):
    if node is NULL or node.value == key:
        return node
        
    if node.value > key:
        return search(node.left, key)
        
    return search(node.right, key)

function insert(node, key):
    if node is NULL:
        return new Node(key)
        
    if key < node.value:
        node.left = insert(node.left, key)
    else if key > node.value:
        node.right = insert(node.right, key)
        
    return node`,
  code: {
    language: "javascript",
    content: `class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BST {
  constructor() {
    this.root = null;
  }

  insert(value) {
    const newNode = new Node(value);
    if (!this.root) {
      this.root = newNode;
      return;
    }
    
    let current = this.root;
    while (true) {
      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          return;
        }
        current = current.left;
      } else if (value > current.value) {
        if (!current.right) {
          current.right = newNode;
          return;
        }
        current = current.right;
      } else {
        return; // duplicates ignored
      }
    }
  }

  search(value) {
    let current = this.root;
    while (current) {
      if (value === current.value) return true;
      if (value < current.value) current = current.left;
      else current = current.right;
    }
    return false;
  }
}`
  },
  quiz: [
    {
      q: "What is the worst-case time complexity of inserting a node into a BST?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      answer: 2,
    },
    {
      q: "Which condition must hold true for EVERY node in a valid Binary Search Tree?",
      options: [
        "Left child > Parent > Right child",
        "Left child < Parent < Right child",
        "Parent > Both Children",
        "No specific order required"
      ],
      answer: 1,
    }
  ]
};

const defaultOps: BSTOperation[] = [
  { type: 'insert', value: 50 },
  { type: 'insert', value: 30 },
  { type: 'insert', value: 70 },
  { type: 'insert', value: 20 },
  { type: 'insert', value: 40 },
  { type: 'insert', value: 60 },
  { type: 'insert', value: 80 },
];

export default function BSTPage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [operations, setOperations] = useState<BSTOperation[]>(defaultOps);

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
    setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("bst");
    const generatedSteps = generateBSTSteps(operations);
    setSteps(generatedSteps);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [operations, setSteps, setAlgorithmId]);

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
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, steps.length, speed, stepForward, setIsPlaying]);

  const handleClear = () => {
    setOperations([]);
    resetVisualizer();
  };

  const handleInsert = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setOperations(prev => [...prev, { type: 'insert', value: val }]);
    setInputValue("");
    setIsPlaying(true);
  };

  const handleSearch = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setOperations(prev => [...prev, { type: 'search', value: val }]);
    setInputValue("");
    setIsPlaying(true);
  };

  const handleInorder = () => {
    setOperations(prev => [...prev, { type: 'inorder' }]);
    setIsPlaying(true);
  };

  const handlePreorder = () => {
    setOperations(prev => [...prev, { type: 'preorder' }]);
    setIsPlaying(true);
  };

  const handlePostorder = () => {
    setOperations(prev => [...prev, { type: 'postorder' }]);
    setIsPlaying(true);
  };

  const currentStepData = steps[currentStepIndex];

  // Map step type to custom coloring
  let stepColor = "text-emerald-400";
  let stepBg = "bg-emerald-400/10 border-emerald-400/20";
  let stepDot = "bg-emerald-400";
  
  if (currentStepData?.type === 'visit' || currentStepData?.type === 'path') {
    stepColor = "text-orange-400";
    stepBg = "bg-orange-400/10 border-orange-400/20";
    stepDot = "bg-orange-400";
  } else if (currentStepData?.type === 'insert') {
    stepColor = "text-[#cbff5e]";
    stepBg = "bg-[#cbff5e]/10 border-[#cbff5e]/20";
    stepDot = "bg-[#cbff5e]";
  }

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Binary Search Tree"
        description="A tree data structure where the left child is always strictly smaller than the parent, and the right child is exclusively greater. Provides rapid logarithmic access for search and insert operations."
        complexity={{ time: 'log n', space: 'n', difficulty: 'Easy' }}
        controls={
          <div className="flex flex-col gap-4 w-full">
            {/* Action Center */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white/5 dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-2xl p-5 backdrop-blur-sm shadow-xl shadow-black/5">
              <div className="flex-1 w-full flex items-center gap-3">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleInsert();
                  }}
                  placeholder="Enter a value..."
                  className="flex-1 bg-black/5 dark:bg-black/60 border border-black/10 dark:border-white/10 rounded-xl px-5 py-3 text-sm outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono"
                />
                <button
                  onClick={handleInsert}
                  className="group relative flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all active:scale-95 shadow-lg shadow-indigo-600/20 overflow-hidden"
                  title="Insert Node"
                >
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <Plus size={18} className="relative z-10" /> <span className="relative z-10 hidden sm:inline">Insert</span>
                </button>
                <button
                  onClick={handleSearch}
                  className="group relative flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all active:scale-95 shadow-lg shadow-emerald-600/20 overflow-hidden"
                  title="Search Node"
                >
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <Search size={18} className="relative z-10" /> <span className="relative z-10 hidden sm:inline">Search</span>
                </button>
              </div>

              <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar shrink-0">
                <button
                  onClick={handlePreorder}
                  className="group relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold transition-all active:scale-95 border border-orange-500/20 whitespace-nowrap"
                  title="Pre-order Traversal"
                >
                  <ArrowDownToLine size={16} /> <span className="text-sm">Pre-order</span>
                </button>
                <button
                  onClick={handleInorder}
                  className="group relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#cbff5e]/10 hover:bg-[#cbff5e]/20 text-[#658721] dark:text-[#cbff5e] font-bold transition-all active:scale-95 border border-[#658721]/20 dark:border-[#cbff5e]/20 whitespace-nowrap"
                  title="In-order Traversal"
                >
                  <ListTree size={16} /> <span className="text-sm">In-order</span>
                </button>
                <button
                  onClick={handlePostorder}
                  className="group relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold transition-all active:scale-95 border border-indigo-500/20 whitespace-nowrap"
                  title="Post-order Traversal"
                >
                  <ArrowUpFromLine size={16} /> <span className="text-sm">Post-order</span>
                </button>
              </div>

              <div className="w-full md:w-auto border-t md:border-t-0 md:border-l border-black/10 dark:border-white/10 pt-4 md:pt-0 md:pl-4">
                <button
                  onClick={handleClear}
                  className="w-full md:w-auto flex justify-center items-center gap-2 px-7 py-3 rounded-xl border border-red-500/30 hover:bg-red-500 hover:text-white dark:text-red-400 font-bold transition-all active:scale-95 shadow-sm"
                  title="Clear Tree"
                >
                  <Trash2 size={18} /> <span className="hidden sm:inline">Clear</span>
                </button>
              </div>
            </div>

            <ControlBar
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onStepForward={stepForward}
              onStepBackward={stepBackward}
              onReset={() => {
                setOperations(defaultOps);
                resetVisualizer();
              }}
              onSpeedChange={setSpeed}
              isPlaying={isPlaying}
              currentStep={currentStepIndex}
              totalSteps={steps.length}
              speed={speed}
              stepDescription={currentStepData?.description}
            />
          </div>
        }
      >
        <div className="relative w-full h-full flex flex-col overflow-hidden">
          <div className="flex-1 w-full relative">
            <TreeViz currentStepData={currentStepData} />
          </div>
        </div>
      </VisualizerFrame>

      <TheoryCard
        title={BST_THEORY.title}
        description={BST_THEORY.description}
        descriptionHi={BST_THEORY.descriptionHi}
        complexities={BST_THEORY.complexities}
        pseudocode={BST_THEORY.pseudocode}
        useCases={BST_THEORY.useCases}
        useCasesHi={BST_THEORY.useCasesHi}
        analogy={BST_THEORY.analogy}
        code={BST_THEORY.code}
        quiz={BST_THEORY.quiz}
      />
    </div>
  );
}
