"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateAVLTreeSteps } from "@/lib/algorithms/trees/avlTree";
import { AVLTreeViz } from "@/components/d3/AVLTreeViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { Plus, Trash2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AVLNodeData {
  value: number;
  height: number;
  left: string | null;
  right: string | null;
}
type NodeMap = Record<string, AVLNodeData>;

function getBF(id: string, nodes: NodeMap): number {
  const n = nodes[id];
  if (!n) return 0;
  const lh = n.left && nodes[n.left] ? nodes[n.left].height : 0;
  const rh = n.right && nodes[n.right] ? nodes[n.right].height : 0;
  return lh - rh;
}

// ─── Theory ───────────────────────────────────────────────────────────────────
const AVL_THEORY = {
  title: "AVL Tree",
  description:
    "An AVL Tree is a self-balancing Binary Search Tree. It guarantees a balance factor of −1, 0, or +1 at every node, preventing the degraded O(n) worst-case of a plain BST by performing tree rotations (LL, RR, LR, RL) whenever an insertion unbalances a subtree.",
  descriptionHi:
    "AVL Tree ek self-balancing BST hai. Har node pe balance factor −1, 0, ya +1 rehta hai — agar koi insertion se tree tilt ho jaaye, toh rotations (LL, RR, LR, RL) automatically use theek kar deti hain. Plain BST ka O(n) worst-case yahan kabhi nahi aata.",
  complexities: [
    { case: "Insertion", time: "O(log n)", space: "O(n)", note: "Plus up to 2 rotations to rebalance" },
    { case: "Search",    time: "O(log n)", space: "O(n)", note: "Always guaranteed — tree stays balanced" },
    { case: "Deletion",  time: "O(log n)", space: "O(n)", note: "May trigger multiple rotations bottom-up" },
  ],
  useCases: [
    "In-memory sorted sets and maps",
    "Database indexing with strict worst-case bounds",
    "Frequent lookups on ordered, frequently changing datasets",
    "Language runtime symbol tables",
  ],
  useCasesHi: [
    "In-memory sorted sets aur maps ke liye perfect",
    "Database indexing jahan strict worst-case bound chahiye",
    "Aisi datasets jahan data frequently change hota ho aur fast lookup bhi chahiye",
    "Programming language runtime ke symbol tables",
  ],
  analogy: {
    icon: "⚖️",
    title: "A Balanced Mobile / Chandelier",
    titleHi: "Ek Balanced Chandelier (Jhootha Mobile)",
    desc: "Imagine a hanging mobile: if you clip heavy weights to one side it tilts. You fix it by shifting the centre knot. AVL rotations do exactly that — they readjust the 'pivot' node so both arms stay level.",
    descHi:
      "Ek hanging mobile socho — agar ek taraf heavy weights clip karo toh poora ek taraf jhuk jaata hai. Use theek karne ke liye centre ki gaanth ko khiskaate ho. AVL rotations bilkul wahi kaam karti hain — 'pivot' node ko adjust karke dono arm level rakhti hain.",
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

    // 3. Get balance factor
    balance = height(node.left) - height(node.right)

    // 4. Rebalance with rotations
    if balance > 1 and key < node.left.key:   // LL
        return rightRotate(node)
    if balance < -1 and key > node.right.key: // RR
        return leftRotate(node)
    if balance > 1 and key > node.left.key:   // LR
        node.left = leftRotate(node.left)
        return rightRotate(node)
    if balance < -1 and key < node.right.key: // RL
        node.right = rightRotate(node.right)
        return leftRotate(node)

    return node`,
  code: {
    language: "java",
    content: `class Node {
    int key, height;
    Node left, right;
    Node(int d) { key = d; height = 1; }
}

class AVLTree {
    Node root;

    int height(Node N) {
        return N == null ? 0 : N.height;
    }

    int getBalance(Node N) {
        return N == null ? 0 : height(N.left) - height(N.right);
    }

    Node rightRotate(Node y) {
        Node x = y.left, T2 = x.right;
        x.right = y;
        y.left = T2;
        y.height = Math.max(height(y.left), height(y.right)) + 1;
        x.height = Math.max(height(x.left), height(x.right)) + 1;
        return x;
    }

    Node leftRotate(Node x) {
        Node y = x.right, T2 = y.left;
        y.left = x;
        x.right = T2;
        x.height = Math.max(height(x.left), height(x.right)) + 1;
        y.height = Math.max(height(y.left), height(y.right)) + 1;
        return y;
    }
}`,
  },
  howItWorks: {
    en: [
      { icon: "🌲", text: "Insert: Follow BST rules — go left if smaller, right if larger, until an empty spot is found." },
      { icon: "📏", text: "Heights Updated: After placing the node, heights of every ancestor are recalculated bottom-up." },
      { icon: "⚖️", text: "Balance Factor: BF = height(left) − height(right). Every node must satisfy |BF| ≤ 1." },
      { icon: "🔄", text: "Rotations: LL → single right rotate. RR → single left rotate. LR/RL → two rotations each." },
      { icon: "✅", text: "Tree stays O(log n) tall always — no matter the insertion order." },
    ],
    hi: [
      { icon: "🌲", text: "Insert: BST rules follow karo — chhota hai toh left, bada hai toh right, tab tak jab tak empty spot na mile." },
      { icon: "📏", text: "Heights Update: Node place karne ke baad, har ancestor ki height bottom-up recalculate hoti hai." },
      { icon: "⚖️", text: "Balance Factor: BF = height(left) − height(right). Har node mein |BF| ≤ 1 rehna chahiye." },
      { icon: "🔄", text: "Rotations: LL → ek right rotate. RR → ek left rotate. LR/RL → do rotations lagte hain." },
      { icon: "✅", text: "Tree hamesha O(log n) height pe rehta hai — insertion order koi bhi ho." },
    ],
  },
  readingTip: {
    en: "Focus on the 'h' and 'bf' badges shown directly on each node in the visualization — the moment a BF hits ±2 you'll see the orange rotation ripple fire and the tree restructure in real-time.",
    hi: "Har node pe 'h' aur 'bf' badges dekho — jaise hi kisi node ka BF ±2 ho jaata hai, orange rotation ripple chalti hai aur tree real-time mein restructure hota hai. Game changer moment hota hai!",
  },
  quote: {
    en: '"In an AVL tree, every insertion is also a promise — a promise to stay balanced."',
    hi: '"AVL tree mein har insertion ek vaada bhi hai — balanced rehne ka vaada."',
  },
  example: {
    array: [] as number[],
    steps: [
      { desc: "Insert 30 → root. Height 1, BF = 0. Tree is balanced.",                     descHi: "30 insert → root ban gaya. Height 1, BF = 0. Tree balanced hai.", array: [], highlight: [] },
      { desc: "Insert 20 → left of 30. BF(30) = 1 — still within limit.",                  descHi: "20 insert → 30 ke left mein. BF(30) = 1 — abhi bhi limit ke andar.", array: [], highlight: [] },
      { desc: "Insert 10 → left of 20. BF(30) becomes 2 → LL case! Right rotate at 30.",   descHi: "10 insert karo → BF(30) = 2 ho gaya → LL case! 30 pe Right Rotate fire!", array: [], highlight: [] },
      { desc: "After rotation: 20 becomes new root, 10 left child, 30 right. All BF = 0.", descHi: "Rotation ke baad: 20 new root, 10 left, 30 right. Sab BF = 0. Perfect!", array: [], highlight: [] },
    ],
  },
  quiz: [
    {
      q: "AVL tree mein 'balance factor' kya hota hai?",
      options: [
        "Root ki height minus leaf nodes ki count",
        "Left aur right subtree mein elements ka difference",
        "Left subtree ki height minus right subtree ki height",
        "Deepest leaf ki depth",
      ],
      answer: 2,
    },
    {
      q: "Kaun sa rotation case fire hota hai jab BF > 1 ho aur inserted key left child ki value se badi ho?",
      options: ["LL (Right Rotate)", "RR (Left Rotate)", "LR (Left then Right Rotate)", "RL (Right then Left Rotate)"],
      answer: 2,
    },
    {
      q: "AVL tree mein search ki time complexity kya hai?",
      options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
      answer: 1,
    },
  ],
};

const defaultValues = [30, 20, 40, 10, 25, 35, 50, 5, 15];

export default function AVLTreePage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [operations, setOperations] = useState<number[]>(defaultValues);
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputText, setInputText] = useState("30, 20, 40, 10, 25, 35, 50, 5, 15");
  const [inputError, setInputError] = useState("");

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("avl-tree");
    const generatedSteps = generateAVLTreeSteps(operations);
    setSteps(generatedSteps);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [operations, setAlgorithmId, setSteps]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (currentStepIndex < steps.length - 1) stepForward();
        else { setIsPlaying(false); if (timerRef.current) clearInterval(timerRef.current); }
      }, speed);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, currentStepIndex, steps.length, speed, stepForward, setIsPlaying]);

  const handleClear = () => { setOperations([]); resetVisualizer(); };

  const handleInsert = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setOperations(prev => [...prev, val]);
    setInputValue("");
    setIsPlaying(true);
  };

  const handleRandomize = () => {
    const nums = Array.from({ length: 9 }, () => Math.floor(Math.random() * 90) + 5);
    const unique = [...new Set(nums)].slice(0, 9);
    setOperations(unique);
    resetVisualizer();
    setInputText(unique.join(", "));
    setTimeout(() => setIsPlaying(true), 50);
  };

  const handleApplyInput = () => {
    const vals = inputText.split(/[\s,]+/).filter(Boolean).map(Number).filter(n => !isNaN(n));
    if (vals.length === 0 || vals.length > 20) {
      setInputError("1 se 20 numbers enter karo (e.g. 30, 20, 40).");
      return;
    }
    setInputError("");
    setOperations([...new Set(vals)]);
    resetVisualizer();
    setShowInputModal(false);
    setTimeout(() => setIsPlaying(true), 50);
  };

  const currentStepData = steps[currentStepIndex];
  const avlData = currentStepData?.values as { root: string | null; nodes: NodeMap } | undefined;
  const nodeCount = avlData?.nodes ? Object.keys(avlData.nodes).length : 0;

  const isRotation =
    currentStepData?.type === "update" ||
    (currentStepData?.description?.toLowerCase().includes("rotation") ?? false);

  // Rotation type label
  const rotLabel = isRotation
    ? currentStepData?.description?.includes("Left rotation") ? "⟳ Left Rotate"
    : currentStepData?.description?.includes("Right rotation") ? "⟳ Right Rotate"
    : "⟳ Rotation"
    : null;

  // Step description with highlights
  const formattedDescription = currentStepData?.description
    ? currentStepData.description
        .replace(/(Left-Left|Right-Right|Left-Right|Right-Left)/gi, '<span class="text-orange-400 font-bold">$1</span>')
        .replace(/(rotation|Rotation)/g, '<span class="text-orange-400 font-bold">$1</span>')
        .replace(/\[([^\]]+)\]/g, '<span class="text-[#cbff5e] font-bold">[$1]</span>')
    : "Tree ready — Play karo ya koi value insert karo!";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="AVL Tree"
        description="A self-balancing BST that keeps the height difference between left and right subtrees ≤ 1 at every node via rotations — guaranteeing O(log n) for all operations."
        complexity={{ time: "log n", space: "n", difficulty: "Hard" }}
        controls={
          <div className="flex flex-col gap-4 w-full">
            {/* Action Row */}
            <div className="flex flex-col md:flex-row gap-3 items-center bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4">
              <div className="flex-1 w-full flex items-center gap-2">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleInsert(); }}
                  placeholder="Value insert karo..."
                  className="flex-1 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition-all font-mono"
                />
                <button
                  onClick={handleInsert}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-lg whitespace-nowrap"
                >
                  <Plus size={16} /> <span className="hidden sm:inline">Insert</span>
                </button>
              </div>
              <div className="w-full md:w-auto">
                <button
                  onClick={handleClear}
                  className="w-full md:w-auto flex justify-center items-center gap-2 px-5 py-2.5 rounded-lg border border-red-500/50 hover:bg-red-500/10 text-red-600 dark:text-red-400 font-semibold transition-colors shadow-sm whitespace-nowrap"
                >
                  <Trash2 size={16} /> <span className="hidden sm:inline">Clear</span>
                </button>
              </div>
            </div>

            <ControlBar
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onStepForward={stepForward}
              onStepBackward={stepBackward}
              onReset={() => { setOperations(defaultValues); resetVisualizer(); }}
              onSpeedChange={setSpeed}
              isPlaying={isPlaying}
              currentStep={currentStepIndex}
              totalSteps={steps.length}
              speed={speed}
              stepDescription={formattedDescription}
              onRandomize={handleRandomize}
              onCustomInput={() => setShowInputModal(true)}
            />
          </div>
        }
        info={<TheoryCard {...AVL_THEORY} />}
      >
        <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">

          {/* Rotation badge — only during rotation steps */}
          {rotLabel && (
            <div className="absolute top-3 right-3 z-20">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-mono bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse">
                {rotLabel}
              </span>
            </div>
          )}

          {/* D3 AVL-specific tree visualization */}
          <AVLTreeViz currentStepData={currentStepData} />
        </div>

        {/* Custom Input Modal */}
        {showInputModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#14151f] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
              <h3 className="text-xl font-display text-white tracking-tight">Custom AVL Values</h3>
              <p className="text-sm font-light text-white/50">
                Comma-separated numbers daalo — 1 se 20 values, duplicates ignore honge.
              </p>
              <input
                type="text"
                autoFocus
                value={inputText}
                onChange={e => { setInputText(e.target.value); setInputError(""); }}
                onKeyDown={e => e.key === "Enter" && handleApplyInput()}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-lime outline-none focus:border-indigo-400/50 transition-all font-mono"
                placeholder="e.g. 30, 20, 40, 10, 25"
              />
              {inputError && <p className="text-[10px] text-red-400 uppercase tracking-widest">{inputError}</p>}
              <div className="flex justify-end gap-3 mt-2">
                <button onClick={() => setShowInputModal(false)} className="px-4 py-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white text-sm transition-colors">Cancel</button>
                <button onClick={handleApplyInput} className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg text-sm transition-colors">Apply</button>
              </div>
            </div>
          </div>
        )}
      </VisualizerFrame>
    </div>
  );
}
