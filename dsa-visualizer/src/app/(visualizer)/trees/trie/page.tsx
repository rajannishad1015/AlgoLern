"use client";

import { useEffect, useState, useRef } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { generateTrieSteps } from "@/lib/algorithms/trees/trie";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { Plus, Search, Trash2, XCircle } from "lucide-react";

interface TrieNodeData {
  id: string;
  char: string;
  children: Record<string, string>;
  isEnd: boolean;
  parent: string | null;
}

type TrieMap = Record<string, TrieNodeData>;

const TRIE_THEORY = {
  title: "Trie (Prefix Tree)",
  description: "A Trie (pronounced 'try') is a tree-like data structure that proves highly efficient for solving problems related to strings. It stores characters at each node, where paths down the tree represent words or prefixes.",
  descriptionHi: "ट्राई (Trie) एक ट्री-जैसा डेटा स्ट्रक्चर है जो स्ट्रिंग्स (शब्दों) से संबंधित समस्याओं को हल करने में बहुत कुशल है। इसमें प्रत्येक नोड पर अक्षर (characters) स्टोर होते हैं, और ट्री में नीचे जाने वाला रास्ता एक शब्द या प्रिफिक्स (prefix) बनाता है।",
  complexities: [
    { case: "Insertion", time: "O(L)", space: "O(L)", note: "L is the length of the string" },
    { case: "Search (Word or Prefix)", time: "O(L)", space: "O(1)", note: "Fast prefix matching" },
    { case: "Deletion", time: "O(L)", space: "O(1)", note: "If word exists" },
  ],
  useCases: [
    "Autocomplete and type-ahead functions",
    "Spell checkers and dictionary implementations",
    "IP routing (Longest prefix matching)"
  ],
  useCasesHi: [
    "सर्च इंजनों में ऑटोकंप्लीट (Autocomplete)",
    "स्पेल चेकर्स (Spell Checkers) और डिक्शनरी",
    "आईपी राउटिंग (IP Routing)"
  ],
  analogy: {
    icon: "search",
    title: "A Filing Cabinet for Letters",
    titleHi: "अक्षरों के लिए फाइलिंग कैबिनेट",
    desc: "Think of a massive filing cabinet. The top drawer has 26 folders (A-Z). You open 'C', inside are more folders for the 2nd letter. You open 'A', then 'T'. You just found 'CAT'. A Trie organizes letters exactly like these nested folders, so you only look at the exact letters of your word.",
    descHi: "एक विशाल फाइलिंग कैबिनेट की कल्पना करें। पहले दराज में 26 फ़ोल्डर (A-Z) हैं। आप 'C' खोलते हैं, उसके अंदर दूसरे अक्षर के लिए और फ़ोल्डर हैं। फिर आप 'A' खोलते हैं, फिर 'T'। आपने 'CAT' खोज लिया। ट्राई बिल्कुल ऐसे ही काम करता है।"
  },
  pseudocode: `class TrieNode:
    children = {}
    isEndOfWord = false

function insert(root, word):
    currentNode = root
    for character in word:
        if character not in currentNode.children:
            currentNode.children[character] = new TrieNode()
        currentNode = currentNode.children[character]
    currentNode.isEndOfWord = true

function search(root, word):
    currentNode = root
    for character in word:
        if character not in currentNode.children:
            return false
        currentNode = currentNode.children[character]
    return currentNode.isEndOfWord`,
  code: {
    language: "java",
    content: `class TrieNode {
    TrieNode[] children = new TrieNode[26];
    boolean isEndOfWord = false;
}

class Trie {
    TrieNode root;

    Trie() {
        root = new TrieNode();
    }

    void insert(String word) {
        TrieNode curr = root;
        for (char c : word.toCharArray()) {
            int index = c - 'a';
            if (curr.children[index] == null) {
                curr.children[index] = new TrieNode();
            }
            curr = curr.children[index];
        }
        curr.isEndOfWord = true;
    }

    boolean search(String word) {
        TrieNode curr = root;
        for (char c : word.toCharArray()) {
            int index = c - 'a';
            if (curr.children[index] == null) {
                return false;
            }
            curr = curr.children[index];
        }
        return curr.isEndOfWord;
    }
}`
  },
  quiz: [
    {
      q: "If you insert 'car' and 'cat' into an empty Trie, how many nodes will be created (excluding the root)?",
      options: [
        "6",
        "4",
        "3",
        "2"
      ],
      answer: 1
    },
    {
      q: "What makes searching in a Trie potentially faster than a Binary Search Tree for strings?",
      options: [
        "A Trie uses less memory",
        "A Trie balances itself automatically",
        "Search time in a Trie is proportional to the word length (O(L)), not the number of words in the dictionary (O(log N))",
        "Binary Search Trees cannot store strings"
      ],
      answer: 2
    }
  ]
};

function TrieNodeComponent({
  id, nodes, activeIds, depth = 0
}: {
  id: string;
  nodes: TrieMap;
  activeIds: string[];
  depth?: number;
}) {
  const node = nodes[id];
  if (!node) return null;
  const isActive = activeIds.includes(id);
  const children = Object.values(node.children).filter(cid => nodes[cid]);

  return (
    <div className="flex flex-col items-center">
      {/* Node circle */}
      <div className="flex flex-col items-center gap-0.5 relative">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm border-2 transition-all shadow-sm ${
            depth === 0
              ? 'border-border bg-bg-secondary text-text-muted text-xs shadow-none'
              : node.isEnd && isActive
              ? 'border-emerald-400 bg-emerald-400/20 text-emerald-400 shadow-emerald-400/30'
              : node.isEnd
              ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-300'
              : isActive
              ? 'border-indigo-400 bg-indigo-400/20 text-indigo-400 shadow-indigo-400/30'
              : 'border-border bg-bg-card text-text-primary'
          }`}
        >
          {depth === 0 ? 'root' : node.char.toUpperCase()}
        </div>
        {node.isEnd && depth > 0 && (
          <div className="absolute top-[100%] mt-0.5 text-[8px] font-mono font-bold px-1 rounded bg-emerald-400 text-bg-primary tracking-wider">END</div>
        )}
      </div>

      {/* Children */}
      {children.length > 0 && (
        <div className="flex gap-4 mt-5 relative">
          {/* Main Connector line from parent */}
          <div className="absolute top-0 left-1/2 w-px h-5 -translate-x-px -translate-y-5 bg-border" />
          
          {/* Horizontal cross-bar bridging siblings */}
          {children.length > 1 && (
             <div className="absolute top-0 left-0 right-0 h-px bg-border -translate-y-5" style={{ 
                 // precise width tricky without measuring, but flex distributes evenly. Let's rely on standard connectors
                 marginLeft: '10%', marginRight: '10%' 
             }} />
          )}

          {children.map(childId => (
            <div key={childId} className="flex flex-col items-center relative">
              <div className="absolute top-0 w-px h-5 bg-border -translate-y-5" />
              <TrieNodeComponent id={childId} nodes={nodes} activeIds={activeIds} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const defaultOps: { type: 'insert' | 'search' | 'delete'; word: string }[] = [
  { type: 'insert', word: 'apple' },
  { type: 'insert', word: 'app' },
  { type: 'insert', word: 'apply' },
  { type: 'insert', word: 'apt' },
  { type: 'insert', word: 'bat' },
];

export default function TriePage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [trieState, setTrieState] = useState<{ root: string; nodes: TrieMap } | null>(null);
  
  const [inputValue, setInputValue] = useState("");
  const [operations, setOperations] = useState<{ type: 'insert' | 'search' | 'delete'; word: string }[]>(defaultOps);

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("trie");
    const generatedSteps = generateTrieSteps(operations);
    setSteps(generatedSteps);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [operations, setAlgorithmId, setSteps]);

  useEffect(() => {
    const step = steps[currentStepIndex];
    if (step?.values) {
      setTrieState(step.values as { root: string; nodes: TrieMap });
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

  const cleanInput = () => {
      return inputValue.trim().toLowerCase().replace(/[^a-z]/g, '');
  };

  const handleInsert = () => {
    const val = cleanInput();
    if (!val) return;
    setOperations(prev => [...prev, { type: 'insert', word: val }]);
    setInputValue("");
    setIsPlaying(true);
  };

  const handleSearch = () => {
    const val = cleanInput();
    if (!val) return;
    setOperations(prev => [...prev, { type: 'search', word: val }]);
    setInputValue("");
    setIsPlaying(true);
  };

  const handleDelete = () => {
    const val = cleanInput();
    if (!val) return;
    setOperations(prev => [...prev, { type: 'delete', word: val }]);
    setInputValue("");
    setIsPlaying(true);
  };

  const currentStepData = steps[currentStepIndex];
  const activeIds = currentStepData?.nodeIds ?? [];

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Trie (Prefix Tree)"
        description="A tree-like data structure where paths represent words. Perfect for blazing fast autocomplete and dictionary applications. Search time depends only on the length of the string, not the number of words stored."
        complexity={{ time: 'L', space: 'L', difficulty: 'Medium' }}
        controls={
          <div className="flex flex-col gap-4 w-full">
            {/* Action Center */}
            <div className="flex flex-col lg:flex-row gap-3 items-center bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4">
              <div className="flex-1 w-full flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleInsert();
                  }}
                  placeholder="Enter a word (a-z)..."
                  className="flex-1 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition-all font-mono"
                />
                
                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                    <button
                      onClick={handleInsert}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-lg text-sm"
                      title="Insert Word"
                    >
                      <Plus size={16} /> <span className="hidden sm:inline">Insert</span>
                    </button>
                    <button
                      onClick={handleSearch}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors shadow-lg text-sm"
                      title="Search Word"
                    >
                      <Search size={16} /> <span className="hidden sm:inline">Search</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-red-600/80 hover:bg-red-500/90 text-white font-semibold transition-colors shadow-lg text-sm"
                      title="Delete Word"
                    >
                      <XCircle size={16} /> <span className="hidden sm:inline">Delete</span>
                    </button>
                </div>
              </div>

              <div className="w-full lg:w-auto">
                <button
                  onClick={handleClear}
                  className="w-full lg:w-auto flex justify-center items-center gap-2 px-5 py-2.5 rounded-lg border border-red-500/50 hover:bg-red-500/10 text-red-600 dark:text-red-400 font-semibold transition-colors shadow-sm text-sm"
                  title="Clear Trie"
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
              onReset={() => {
                setOperations(defaultOps);
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
                {currentStepData?.description || "Ready to insert words..."}
              </span>
            </div>
            {/* Operations Trail History / Legend */}
            <div className="flex gap-4 text-[10px] font-mono mt-1 opacity-80 pl-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-indigo-400 bg-indigo-400/20 inline-block"></span> Active
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-emerald-400 bg-emerald-400/20 inline-block"></span> End of word
              </span>
            </div>
          </div>

          <div className="flex-1 w-full bg-transparent overflow-auto flex items-start justify-center pt-24 pb-12">
            {trieState?.root && trieState.nodes[trieState.root] ? (
              <TrieNodeComponent
                id={trieState.root}
                nodes={trieState.nodes}
                activeIds={activeIds}
              />
            ) : (
              <div className="text-text-muted font-mono text-sm m-auto opacity-50">Trie is empty</div>
            )}
          </div>
        </div>
      </VisualizerFrame>

      <TheoryCard
        title={TRIE_THEORY.title}
        description={TRIE_THEORY.description}
        descriptionHi={TRIE_THEORY.descriptionHi}
        complexities={TRIE_THEORY.complexities}
        pseudocode={TRIE_THEORY.pseudocode}
        useCases={TRIE_THEORY.useCases}
        useCasesHi={TRIE_THEORY.useCasesHi}
        analogy={TRIE_THEORY.analogy}
        code={TRIE_THEORY.code}
        quiz={TRIE_THEORY.quiz}
      />
    </div>
  );
}
