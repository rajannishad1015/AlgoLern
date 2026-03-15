"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateTrieSteps } from "@/lib/algorithms/trees/trie";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { Plus, Search, XCircle, Trash2, Shuffle } from "lucide-react";

interface TrieNodeData {
  id: string;
  char: string;
  children: Record<string, string>;
  isEnd: boolean;
  parent: string | null;
}
type TrieMap = Record<string, TrieNodeData>;

// ─── D3-style recursive Trie renderer ────────────────────────────────────────
function TrieNodeViz({
  id, nodes, activeIds, depth = 0,
}: { id: string; nodes: TrieMap; activeIds: string[]; depth?: number }) {
  const node = nodes[id];
  if (!node) return null;
  const isActive  = activeIds.includes(id);
  const isEnd     = node.isEnd && depth > 0;
  const childIds  = Object.values(node.children).filter(c => nodes[c]);

  const ringColor = isActive && isEnd
    ? "border-emerald-400 bg-emerald-500/30 shadow-[0_0_16px_rgba(52,211,153,0.5)]"
    : isActive
    ? "border-indigo-400 bg-indigo-500/30 shadow-[0_0_16px_rgba(99,102,241,0.5)]"
    : isEnd
    ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-300"
    : "border-[rgba(255,255,255,0.12)] bg-[#1e2035] text-slate-300";

  const label = depth === 0 ? "·" : node.char.toUpperCase();

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex flex-col items-center">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-mono font-bold text-sm border-2 transition-all duration-300 ${ringColor}`}>
          {label}
        </div>
        {isEnd && (
          <span className="absolute -bottom-3 text-[8px] font-bold px-1 rounded bg-emerald-500 text-black tracking-wider">
            END
          </span>
        )}
      </div>

      {childIds.length > 0 && (
        <div className="relative flex gap-3 mt-7 pt-2">
          {/* vertical stem */}
          <div className="absolute top-0 left-1/2 w-px h-3 -translate-x-px -translate-y-3 bg-white/10" />
          {/* horizontal bar */}
          {childIds.length > 1 && (
            <div className="absolute top-0 h-px bg-white/10" style={{ left: "10%", right: "10%", top: "0px" }} />
          )}

          {childIds.map(cid => (
            <div key={cid} className="flex flex-col items-center relative">
              <div className="absolute top-0 w-px h-3 bg-white/10 -translate-y-3" />
              {/* edge label */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-white/30">
                {nodes[cid]?.char.toUpperCase()}
              </div>
              <TrieNodeViz id={cid} nodes={nodes} activeIds={activeIds} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Theory ───────────────────────────────────────────────────────────────────
const THEORY = {
  title: "Trie (Prefix Tree)",
  description: "A Trie (pronounced 'try') is a tree-like data structure where each path from root to a node represents a prefix. It is incredibly efficient for string operations — search, insert, and delete all take O(L) time where L is the string length, regardless of how many words are stored.",
  descriptionHi: "Trie ek tree-shaped data structure hai jisme root se kisi bhi node tak ka raasta ek prefix represent karta hai. String operations — insert, search, delete — sab O(L) mein hote hain, jahan L word ki length hai. Dictionary mein kitne bhi words ho, speed same rehti hai!",
  complexities: [
    { case: "Insertion",   time: "O(L)", space: "O(L)", note: "L = length of the word being inserted" },
    { case: "Search",      time: "O(L)", space: "O(1)", note: "Blazing fast prefix matching" },
    { case: "Deletion",    time: "O(L)", space: "O(1)", note: "Prunes leaf nodes bottom-up" },
  ],
  useCases: [
    "Autocomplete & type-ahead suggestions (Google, phones)",
    "Spell checkers and dictionary lookups",
    "IP routing — longest prefix matching",
    "Word games like Boggle or crossword solvers",
  ],
  useCasesHi: [
    "Autocomplete & type-ahead suggestions (Google, phone keyboard)",
    "Spell checker aur dictionary implementations",
    "IP routing — longest prefix matching",
    "Word games jaise Boggle ya crossword solvers",
  ],
  analogy: {
    icon: "🗄️",
    title: "A Nested Filing Cabinet",
    titleHi: "Nested Folders wali Filing Cabinet",
    desc: "Imagine a cabinet with 26 drawers (A-Z). You open 'C', inside are more drawers for the 2nd letter. Open 'A', then 'T' — and you have found 'CAT'! A Trie is exactly this: nested letter folders sharing common prefixes.",
    descHi: "Socho ek cabinet hai jisme 26 drawers hain (A-Z). 'C' kholte ho, andar 2nd letter ke aur drawers hain. 'A' kholte ho, phir 'T' — 'CAT' mil gaya! Trie bilkul aise hi kaam karta hai — common prefix share karne wale nested folders.",
  },
  howItWorks: {
    en: [
      { icon: "🌱", text: "Start at root (empty node). Every word starts here." },
      { icon: "🔡", text: "For each character, follow existing child or create a new node." },
      { icon: "🏁", text: "Mark the last character's node as 'end of word' (the END badge)." },
      { icon: "🔍", text: "Search: follow characters top-down. Miss any → word not found. Reach end node marked END → found!" },
      { icon: "✂️", text: "Delete: unmark END. Then prune any leaf nodes that are now unused, bottom-up." },
    ],
    hi: [
      { icon: "🌱", text: "Root se shuru karo (empty node). Har word yahi se start hota hai." },
      { icon: "🔡", text: "Har character ke liye — existing child follow karo ya naya node banao." },
      { icon: "🏁", text: "Last character ke node ko 'end of word' mark karo (END badge dikhta hai)." },
      { icon: "🔍", text: "Search: characters follow karo upar se neeche. Koi miss → word nahi hai. END node mila → word found!" },
      { icon: "✂️", text: "Delete: END unmark karo. Phir unused leaf nodes ko bottom-up prune karo." },
    ],
  },
  readingTip: {
    en: "Watch the active node (blue glow) travel down character by character. When it hits a green END badge, the word is stored there. Try inserting 'app' and 'apple' — see how they share the same 'a-p-p' path!",
    hi: "Active node (blue glow) ko dekho jo step-by-step neeche travel karta hai. Jab green END badge milta hai, wahan word store hai. 'app' aur 'apple' dono insert karke dekho — dono 'a-p-p' path share karte hain!",
  },
  quote: {
    en: '"A Trie doesn\'t search through words — it navigates through letters."',
    hi: '"Trie words mein search nahi karta — woh letters mein navigate karta hai."',
  },
  pseudocode: `function insert(root, word):
    curr = root
    for each char in word:
        if char not in curr.children:
            curr.children[char] = new TrieNode()
        curr = curr.children[char]
    curr.isEndOfWord = true

function search(root, word):
    curr = root
    for each char in word:
        if char not in curr.children:
            return false   // word not found
        curr = curr.children[char]
    return curr.isEndOfWord

function delete(root, word):
    traverse to end of word
    unmark isEndOfWord = false
    prune leaf nodes bottom-up (if no children and not end of another word)`,
  code: {
    language: "java",
    content: `class TrieNode {
    TrieNode[] ch = new TrieNode[26];
    boolean isEnd = false;
}

class Trie {
    TrieNode root = new TrieNode();

    void insert(String word) {
        TrieNode cur = root;
        for (char c : word.toCharArray()) {
            int i = c - 'a';
            if (cur.ch[i] == null) cur.ch[i] = new TrieNode();
            cur = cur.ch[i];
        }
        cur.isEnd = true;
    }

    boolean search(String word) {
        TrieNode cur = root;
        for (char c : word.toCharArray()) {
            int i = c - 'a';
            if (cur.ch[i] == null) return false;
            cur = cur.ch[i];
        }
        return cur.isEnd;
    }

    boolean startsWith(String prefix) {
        TrieNode cur = root;
        for (char c : prefix.toCharArray()) {
            int i = c - 'a';
            if (cur.ch[i] == null) return false;
            cur = cur.ch[i];
        }
        return true;
    }
}`,
  },
  example: {
    array: [] as number[],
    steps: [
      { desc: 'Insert "cat": root → c → a → t (marked END). 3 new nodes created.', descHi: '"cat" insert: root → c → a → t (END mark). 3 naye nodes bane.', array: [], highlight: [] },
      { desc: 'Insert "car": root → c → a (shared!) → r (marked END). Only 1 new node.', descHi: '"car" insert: root → c → a (shared!) → r (END). Sirf 1 naya node!', array: [], highlight: [] },
      { desc: 'Search "cat": follow c→a→t. Node is END → FOUND ✓', descHi: '"cat" search: c→a→t follow karo. Node END hai → FOUND ✓', array: [], highlight: [] },
      { desc: 'Search "ca": follow c→a. Node is NOT END → not a stored word (just a prefix).', descHi: '"ca" search: c→a. Node END nahi hai → stored word nahi (sirf prefix).', array: [], highlight: [] },
    ],
  },
  quiz: [
    {
      q: 'Insert "car" and "cat" into an empty Trie. How many nodes are created (excluding root)?',
      options: ["6", "4", "5", "3"],
      answer: 1,
    },
    {
      q: "What is the time complexity of searching a word of length L in a Trie with N words?",
      options: ["O(N)", "O(N × L)", "O(L)", "O(log N)"],
      answer: 2,
    },
    {
      q: "What does the END badge on a node signify?",
      options: ["Node has no children", "A complete word ends at this node", "Node is at the deepest level", "Node was recently deleted"],
      answer: 1,
    },
  ],
};

const defaultOps: { type: "insert" | "search" | "delete"; word: string }[] = [
  { type: "insert", word: "apple" },
  { type: "insert", word: "app" },
  { type: "insert", word: "apply" },
  { type: "insert", word: "apt" },
  { type: "insert", word: "bat" },
  { type: "search", word: "app" },
  { type: "search", word: "bat" },
];

const RANDOM_WORDS = ["cat","car","card","care","bat","ball","bad","can","cap","cut","dog","dot","do","door","bit","big"];

export default function TriePage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [trieState, setTrieState] = useState<{ root: string; nodes: TrieMap } | null>(null);
  const [inputValue, setInputValue]   = useState("");
  const [operations, setOperations]   = useState(defaultOps);
  const [opMode, setOpMode]           = useState<"insert" | "search" | "delete">("insert");

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("trie");
    setSteps(generateTrieSteps(operations));
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [operations, setAlgorithmId, setSteps]);

  useEffect(() => {
    const step = steps[currentStepIndex];
    if (step?.values) setTrieState(step.values as { root: string; nodes: TrieMap });
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

  const clean = (v: string) => v.trim().toLowerCase().replace(/[^a-z]/g, "");

  const handleOp = () => {
    const val = clean(inputValue);
    if (!val) return;
    setOperations(prev => [...prev, { type: opMode, word: val }]);
    setInputValue("");
    setIsPlaying(true);
  };

  const handleRandomize = () => {
    const picks = RANDOM_WORDS.sort(() => Math.random() - 0.5).slice(0, 5);
    const ops = picks.map(w => ({ type: "insert" as const, word: w }));
    ops.push({ type: "search", word: picks[0] });
    setOperations(ops);
    resetVisualizer();
    setTimeout(() => setIsPlaying(true), 50);
  };

  const currentStep = steps[currentStepIndex];
  const activeIds   = currentStep?.nodeIds ?? [];
  const nodeCount   = trieState?.nodes ? Object.keys(trieState.nodes).length - 1 : 0;

  const modeColors = {
    insert: "bg-indigo-600 hover:bg-indigo-500 text-white",
    search: "bg-emerald-600 hover:bg-emerald-500 text-white",
    delete: "bg-red-600/80 hover:bg-red-500 text-white",
  };

  const stepDesc = currentStep?.description
    ? currentStep.description
        .replace(/"([^"]+)"/g, '<span class="text-[#cbff5e] font-bold">"$1"</span>')
        .replace(/✓/g, '<span class="text-emerald-400">✓</span>')
    : "Trie ready — koi word insert/search/delete karo!";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Trie (Prefix Tree)"
        description="A tree where every path from root spells a prefix. Insert, search, and delete any word in O(L) time — where L is just the word length."
        complexity={{ time: "L", space: "ΣWORD", difficulty: "Medium" }}
        controls={
          <div className="flex flex-col gap-4 w-full">
            {/* Op mode selector + input */}
            <div className="flex flex-col md:flex-row gap-3 bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4">
              {/* Mode tabs */}
              <div className="flex gap-1 bg-black/10 dark:bg-black/30 rounded-lg p-1 shrink-0">
                {(["insert","search","delete"] as const).map(m => (
                  <button key={m} onClick={() => setOpMode(m)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${opMode === m ? modeColors[m] : "text-slate-500 hover:text-white"}`}>
                    {m}
                  </button>
                ))}
              </div>

              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text" value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleOp()}
                  placeholder={`Word to ${opMode}...`}
                  className="flex-1 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition-all font-mono"
                />
                <button onClick={handleOp}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-lg text-sm ${modeColors[opMode]}`}>
                  {opMode === "insert" ? <Plus size={16}/> : opMode === "search" ? <Search size={16}/> : <XCircle size={16}/>}
                  <span className="hidden sm:inline capitalize">{opMode}</span>
                </button>
              </div>

              <button onClick={() => { setOperations([]); resetVisualizer(); }}
                className="flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg border border-red-500/40 hover:bg-red-500/10 text-red-400 font-semibold transition-colors text-sm shrink-0">
                <Trash2 size={15}/> <span className="hidden sm:inline">Clear</span>
              </button>
            </div>

            <ControlBar
              onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)}
              onStepForward={stepForward} onStepBackward={stepBackward}
              onReset={() => { setOperations(defaultOps); resetVisualizer(); }}
              onSpeedChange={setSpeed} isPlaying={isPlaying}
              currentStep={currentStepIndex} totalSteps={steps.length} speed={speed}
              stepDescription={stepDesc} onRandomize={handleRandomize}
            />
          </div>
        }
        info={<TheoryCard {...THEORY} />}
      >
        <div className="w-full h-full relative overflow-hidden">
          {/* Header overlay */}
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center gap-2 pointer-events-none">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest border ${
              currentStep?.type === "insert" ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
              : currentStep?.type === "sorted" || currentStep?.type === "done" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : currentStep?.type === "compare" || currentStep?.type === "visit" ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
              : currentStep?.type === "delete" ? "border-red-500/40 bg-red-500/10 text-red-300"
              : "border-white/10 bg-white/5 text-slate-400"
            }`}>{currentStep?.type ?? "init"}</span>
            <span className="text-[11px] font-mono text-slate-400 truncate">{currentStep?.description ?? "Ready..."}</span>
          </div>

          {/* Legend */}
          <div className="absolute bottom-3 right-3 z-10 flex gap-3 text-[9px] font-mono pointer-events-none">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"/>Active</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>End of word</span>
            <span className="text-white/20">Nodes: {nodeCount}</span>
          </div>

          {/* Trie canvas */}
          <div className="w-full h-full overflow-auto flex items-start justify-center pt-14 pb-8 px-4">
            {trieState?.root && trieState.nodes[trieState.root] ? (
              <TrieNodeViz id={trieState.root} nodes={trieState.nodes} activeIds={activeIds} />
            ) : (
              <div className="m-auto text-slate-600 font-mono text-sm">
                Trie is empty — insert a word to start!
              </div>
            )}
          </div>
        </div>
      </VisualizerFrame>
    </div>
  );
}
