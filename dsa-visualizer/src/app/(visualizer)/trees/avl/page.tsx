"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateAVLTreeSteps } from "@/lib/algorithms/trees/avlTree";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { Plus, Trash2 } from "lucide-react";

interface AVLNodeData {
  value: number;
  height: number;
  left: string | null;
  right: string | null;
}

type NodeMap = Record<string, AVLNodeData>;

const AVL_THEORY = {
  title: "AVL Tree",
  description: "An AVL Tree is a self-balancing Binary Search Tree. Guaranteeing a balance factor of -1, 0, or 1 at every node, it prevents the degraded O(n) line-structure possible in a standard BST by performing tree rotations (Left/Right) whenever an insertion unbalances a subtree.",
  descriptionHi: "AVL ट्री एक सेल्फ-बैलेंसिंग बाइनरी सर्च ट्री है। यह हर नोड पर बैलेंस फैक्टर को -1, 0, या 1 बनाए रखता है, जिससे ट्री कभी भी एक सीधी लाइन में विकृत नहीं होता है और हमेशा तेजी से खोज की गारंटी देता है।",
  complexities: [
    { case: "Insertion", time: "O(log n)", space: "O(n)", note: "Plus up to 2 rotations" },
    { case: "Search", time: "O(log n)", space: "O(n)", note: "Guaranteed" },
    { case: "Deletion", time: "O(log n)", space: "O(n)", note: "May require multiple rotations" },
  ],
  useCases: [
    "In-memory sorts and sets",
    "Database indexing systems requiring strong worst-case bounds",
    "Frequent lookups on balanced ordered datasets"
  ],
  useCasesHi: [
    "इन-मेमोरी सेट (in-memory sets)",
    "डेटाबेस इंडेक्सिंग (Database Indexing)",
    "ऐसे सिस्टम जहां 'worst-case' गारंटी महत्वपूर्ण हो"
  ],
  analogy: {
    icon: "book",
    title: "A Balanced Mobile / Chandelier",
    titleHi: "संतुलित झूमर (Balanced Chandelier)",
    desc: "Imagine a hanging mobile or a crystal chandelier. If you keep clipping heavy weights onto one side, it aggressively tilts. To fix it, you move the central knot to balance the arms. AVL rotations are exactly that—readjusting the central 'knot' over to keep both sides vertically aligned.",
    descHi: "कल्पना करें कि एक झूमर (chandelier) है। यदि आप एक तरफ भारी वजन लगाते हैं, तो वह झुक जाएगा। उसे ठीक करने के लिए आप बीच की गाँठ को खिसकाते हैं। AVL ट्री के rotations बिल्कुल वैसे ही ट्री को 'सीधा' करते हैं।"
  },
  pseudocode: `function insert(node, key):
    // 1. Normal BST insertion
    if node is NULL: 
        return new Node(key)
    if key < node.key:
        node.left = insert(node.left, key)
    else if key > node.key:
        node.right = insert(node.right, key)
        
    // 2. Update height
    node.height = 1 + max(height(node.left), height(node.right))
    
    // 3. Get the balance factor
    balance = height(node.left) - height(node.right)
    
    // 4. Rebalance with rotations if unbalanced
    // Left Left Case
    if balance > 1 and key < node.left.key:
        return rightRotate(node)
    // Right Right Case
    if balance < -1 and key > node.right.key:
        return leftRotate(node)
    // Left Right Case
    if balance > 1 and key > node.left.key:
        node.left = leftRotate(node.left)
        return rightRotate(node)
    // Right Left Case
    if balance < -1 and key < node.right.key:
        node.right = rightRotate(node.right)
        return leftRotate(node)
        
    return node`,
  code: {
    language: "java",
    content: `class Node {
    int key, height;
    Node left, right;
    Node(int d) {
        key = d;
        height = 1;
    }
}

class AVLTree {
    Node root;

    int height(Node N) {
        if (N == null) return 0;
        return N.height;
    }

    int getBalance(Node N) {
        if (N == null) return 0;
        return height(N.left) - height(N.right);
    }

    Node rightRotate(Node y) {
        Node x = y.left;
        Node T2 = x.right;

        // Perform rotation
        x.right = y;
        y.left = T2;

        // Update heights
        y.height = Math.max(height(y.left), height(y.right)) + 1;
        x.height = Math.max(height(x.left), height(x.right)) + 1;

        return x;
    }

    Node leftRotate(Node x) {
        Node y = x.right;
        Node T2 = y.left;

        // Perform rotation
        y.left = x;
        x.right = T2;

        // Update heights
        x.height = Math.max(height(x.left), height(x.right)) + 1;
        y.height = Math.max(height(y.left), height(y.right)) + 1;

        return y;
    }
}`
  },
  quiz: [
    {
      q: "What defines the 'balance factor' in an AVL tree?",
      options: [
        "Height of root minus number of leaf nodes",
        "Number of elements in the left subtree vs right subtree",
        "Height of left subtree minus height of right subtree",
        "The depth of the deepest leaf"
      ],
      answer: 2
    },
    {
      q: "Which rotation case occurs if the balance factor is > 1 and the new value is greater than the left child's value?",
      options: [
        "Left-Left (LL) Case",
        "Right-Right (RR) Case",
        "Left-Right (LR) Case",
        "Right-Left (RL) Case"
      ],
      answer: 2
    }
  ]
};

// Recursive HTML tree renderer specific to this AVL algorithm representation
function AVLNodeComponent({
  id, nodes, activeIds
}: {
  id: string | null;
  nodes: NodeMap;
  activeIds: string[];
}) {
  if (!id || !nodes[id]) return null;
  const node = nodes[id];
  const isActive = activeIds.includes(id);
  const balance = (node.left && nodes[node.left] ? nodes[node.left].height : 0)
    - (node.right && nodes[node.right] ? nodes[node.right].height : 0);

  return (
    <div className="flex flex-col items-center gap-0">
      <div className="flex items-end">
        {/* Left subtree connector */}
        {node.left && <div className="w-px h-6 bg-border translate-x-3 -translate-y-1 origin-bottom rotate-[-30deg]" />}
      </div>
      <div className="flex gap-4 items-start">
        {/* Left child */}
        <div className="mt-8">
          <AVLNodeComponent id={node.left} nodes={nodes} activeIds={activeIds} />
        </div>

        {/* Current node */}
        <div className="flex flex-col items-center gap-1">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-mono font-bold border-2 text-sm transition-all shadow-sm ${
              isActive
                ? 'border-indigo-400 bg-indigo-400/20 text-indigo-400 shadow-indigo-400/30'
                : Math.abs(balance) > 1
                ? 'border-red-400 bg-red-400/10 text-red-400 shadow-red-400/20'
                : 'border-border bg-bg-card text-text-primary'
            }`}
          >
            {node.value}
          </div>
          <span className={`text-[9px] font-mono px-1 rounded ${
            Math.abs(balance) > 1 ? 'text-bg-primary bg-red-400 font-bold' : 'text-text-muted bg-border'
          }`}>
            bf:{balance} h:{node.height}
          </span>
        </div>

        {/* Right child */}
        <div className="mt-8 relative">
          {/* Right subtree connector */}
          {node.right && <div className="absolute top-0 right-1/2 w-px h-6 bg-border -translate-x-0 -translate-y-9 origin-bottom rotate-[30deg]" />}
          <AVLNodeComponent id={node.right} nodes={nodes} activeIds={activeIds} />
        </div>
      </div>
    </div>
  );
}

const defaultValues = [30, 20, 40, 10, 25, 35, 50, 5, 15];

export default function AVLTreePage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [treeState, setTreeState] = useState<{ root: string | null; nodes: NodeMap }>({ root: null, nodes: {} });
  
  const [inputValue, setInputValue] = useState("");
  const [operations, setOperations] = useState<number[]>(defaultValues);

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("avl-tree");
    const generatedSteps = generateAVLTreeSteps(operations);
    setSteps(generatedSteps);
    return () => { 
        if (timerRef.current) clearInterval(timerRef.current); 
    };
  }, [operations, setAlgorithmId, setSteps]);

  useEffect(() => {
    const step = steps[currentStepIndex];
    if (step?.values) {
      setTreeState(step.values as { root: string | null; nodes: NodeMap });
    }
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

  const handleClear = () => {
    setOperations([]);
    resetVisualizer();
  };

  const handleInsert = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setOperations(prev => [...prev, val]);
    setInputValue("");
    setIsPlaying(true);
  };

  const currentStepData = steps[currentStepIndex];
  const activeIds = currentStepData?.nodeIds ?? [];

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="AVL Tree"
        description="A self-balancing Binary Search Tree where the heights of the two child subtrees of any node differ by at most one. Upon insertion, if this balance factor gets violated, tree rotations automatically repair it."
        complexity={{ time: 'log n', space: 'n', difficulty: 'Hard' }}
        controls={
          <div className="flex flex-col gap-4 w-full">
            {/* Action Center */}
            <div className="flex flex-col md:flex-row gap-3 items-center bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4">
              <div className="flex-1 w-full flex items-center gap-2">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleInsert();
                  }}
                  placeholder="Enter a value to insert..."
                  className="flex-1 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition-all font-mono"
                />
                <button
                  onClick={handleInsert}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-lg"
                  title="Insert Node"
                >
                  <Plus size={18} /> <span className="hidden sm:inline">Insert</span>
                </button>
              </div>

              <div className="w-full md:w-auto">
                <button
                  onClick={handleClear}
                  className="w-full md:w-auto flex justify-center items-center gap-2 px-6 py-2.5 rounded-lg border border-red-500/50 hover:bg-red-500/10 text-red-600 dark:text-red-400 font-semibold transition-colors shadow-sm"
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
                setOperations(defaultValues);
                resetVisualizer();
              }}
              onSpeedChange={setSpeed}
              isPlaying={isPlaying}
              currentStep={currentStepIndex}
              totalSteps={steps.length}
              speed={speed}
            />
          </div>
        }
      >
        <div className="relative w-full h-full min-h-[450px] flex flex-col items-center">
          {/* Step description overlay */}
          <div className="absolute top-4 left-4 right-4 z-10 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider border border-amber-400/20 bg-amber-400/10 text-amber-400 shadow-sm">
                {currentStepData?.type || "INIT"}
              </span>
              <span className="font-mono text-sm text-slate-700 dark:text-slate-300 drop-shadow-sm truncate">
                {currentStepData?.description || "Ready to insert values..."}
              </span>
            </div>
            {/* Legend */}
            <div className="flex gap-4 text-[10px] font-mono mt-1 opacity-80 pl-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-indigo-400 bg-indigo-400/20 inline-block"></span> Active
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-red-400 bg-red-400/10 inline-block"></span> Unbalanced (|bf| &gt; 1)
              </span>
            </div>
          </div>

          <div className="flex-1 w-full bg-transparent overflow-auto flex items-start justify-center pt-24 pb-12">
            {treeState.root ? (
              <AVLNodeComponent id={treeState.root} nodes={treeState.nodes} activeIds={activeIds} />
            ) : (
              <div className="text-text-muted font-mono text-sm m-auto opacity-50">AVL Tree is empty</div>
            )}
          </div>
        </div>
      </VisualizerFrame>

      <TheoryCard
        title={AVL_THEORY.title}
        description={AVL_THEORY.description}
        descriptionHi={AVL_THEORY.descriptionHi}
        complexities={AVL_THEORY.complexities}
        pseudocode={AVL_THEORY.pseudocode}
        useCases={AVL_THEORY.useCases}
        useCasesHi={AVL_THEORY.useCasesHi}
        analogy={AVL_THEORY.analogy}
        code={AVL_THEORY.code}
        quiz={AVL_THEORY.quiz}
      />
    </div>
  );
}
