"use client";

import { useEffect, useRef, useState } from "react";
import { HashTableViz } from "@/components/d3/HashTableViz";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import {
  createEmptyHashTableState,
  createInitialHashTableState,
  generateSingleHashTableSteps,
  HASH_TABLE_SIZE,
} from "@/lib/algorithms/data-structures/hashTable";
import { useVisualizerStore } from "@/lib/store/visualizerStore";

const HASH_TABLE_THEORY = {
  title: "Hash Table",
  description:
    "A Hash Table stores key-value pairs by running a key through a hash function and mapping it to a bucket index. This visualizer uses Separate Chaining, where collisions are stored as linked lists inside the same bucket.",
  descriptionHi:
    "Hash Table key-value pairs ko ek hash function ke through bucket index par map karta hai. Is visualizer mein Separate Chaining use ho rahi hai, jahan collision aane par same bucket ke andar linked list ban jaati hai.",
  analogy: {
    icon: "🗄️",
    title: "Smart Locker Room",
    titleHi: "Smart Locker Room",
    desc:
      "Imagine a locker room where the receptionist converts every person's name into a locker number. If two people end up with the same locker number, their items are stored in the same locker chain one after another. That's collision handling through chaining.",
    descHi:
      "Socho ek locker room hai jahan receptionist har naam ko calculation karke ek locker number deti hai. Agar do logon ka same locker number aa jaye, toh unka samaan usi locker chain mein ek ke baad ek rakh diya jaata hai. Isi ko collision handling with chaining kehte hain.",
  },
  readingTip: {
    en: "Hash Tables are the reason lookups feel instant in many systems: caches, routing tables, compiler symbol tables, and in-memory databases all depend on good hashing.",
    hi: "Hash Tables ki wajah se bahut systems mein lookup almost instant lagta hai: caches, routing tables, compiler symbol tables aur in-memory databases sab hashing par depend karte hain.",
  },
  quote: {
    en: '"A good hash table turns searching from a walk through data into a direct jump to the right neighborhood."',
    hi: '"Achha hash table searching ko lambi walk se hata kar seedha sahi mohalla dhoondhne jaisa bana deta hai."',
  },
  complexities: [
    { case: "Insert", time: "1 avg", space: "1", note: "Average O(1), worst case O(n) if many collisions land in one bucket." },
    { case: "Search", time: "1 avg", space: "1", note: "Bucket lookup is constant on average with a good hash distribution." },
    { case: "Delete", time: "1 avg", space: "1", note: "Delete is fast once the target bucket is identified." },
    { case: "Worst Case", time: "n", space: "n", note: "If all keys collide, a bucket behaves like a linked list." },
  ],
  pseudocode: `class HashTable:
  constructor(size):
    table = [ [] for _ in range(size) ]

  hash(key):
    total = 0
    for ch in key:
      total += ord(ch)
    return total % size

  insert(key, value):
    idx = hash(key)
    for pair in table[idx]:
      if pair.key == key:
        pair.value = value
        return
    table[idx].append({ key, value })

  search(key):
    idx = hash(key)
    for pair in table[idx]:
      if pair.key == key:
        return pair.value
    return null

  delete(key):
    idx = hash(key)
    remove pair with matching key from table[idx]`,
  useCases: [
    "Caching layers like Redis and Memcached.",
    "Database indexing and fast lookups.",
    "Compiler symbol tables for variables and functions.",
    "Deduplication and frequency counting.",
    "Session stores and authentication tokens.",
    "Routing tables and in-memory object maps.",
  ],
  useCasesHi: [
    "Redis aur Memcached jaise caching systems.",
    "Database indexing aur fast lookups.",
    "Compiler symbol tables for variables and functions.",
    "Duplicate detection aur frequency counting.",
    "Session stores aur auth tokens.",
    "Routing tables aur in-memory object maps.",
  ],
  howItWorks: {
    en: [
      { icon: "#️⃣", text: "Hashing: Convert the key into a numeric value using a deterministic function." },
      { icon: "%", text: "Bucket Index: Use modulo with table size to keep the result inside array bounds." },
      { icon: "📦", text: "Store: Jump directly to that bucket instead of scanning the whole dataset." },
      { icon: "🔗", text: "Collision Handling: If another key is already there, attach the new key-value pair in the same bucket chain." },
      { icon: "🔎", text: "Search/Delete: Recompute the same hash, jump to the same bucket, and scan only that short chain." },
    ],
    hi: [
      { icon: "#️⃣", text: "Hashing: Key ko ek deterministic function se numeric value mein badlo." },
      { icon: "%", text: "Bucket Index: Result ko table size se modulo karke array bounds ke andar rakho." },
      { icon: "📦", text: "Store: Pura data scan karne ke bajay seedha us bucket par jump karo." },
      { icon: "🔗", text: "Collision Handling: Agar bucket mein pehle se key ho, toh naya pair usi bucket chain mein add karo." },
      { icon: "🔎", text: "Search/Delete: Wahi hash dobara nikaalo, same bucket par jao, aur sirf us chain ko scan karo." },
    ],
  },
  example: {
    array: [],
    steps: [
      { desc: "Start with 7 empty buckets.", descHi: "Shuru mein 7 empty buckets hote hain.", array: [], highlight: [] },
      { desc: "Insert Alice: hash(Alice) maps to bucket 2, so Alice is stored there.", descHi: "Alice insert karne par hash(Alice) bucket 2 deta hai, toh Alice wahan store hoti hai.", array: [2], highlight: [0] },
      { desc: "Insert Bob: Bob also maps to bucket 2, so collision happens and Bob is chained after Alice.", descHi: "Bob bhi bucket 2 par aata hai, toh collision hota hai aur Bob Alice ke baad chain hota hai.", array: [2, 2], highlight: [1] },
      { desc: "Search Bob: compute same bucket, walk the short chain, and find Bob quickly.", descHi: "Bob search karne par same bucket milta hai, chhoti chain walk karke Bob mil jaata hai.", array: [2], highlight: [0] },
      { desc: "Delete Alice: go to bucket 2 and remove only the matching node from the chain.", descHi: "Alice delete karne ke liye bucket 2 par jaake sirf matching node hatai jaati hai.", array: [2], highlight: [0] },
    ],
  },
  code: {
    language: "JavaScript",
    content: `class HashTable {
  constructor(size = 7) {
    this.table = new Array(size).fill(null).map(() => []);
    this.size = size;
  }

  hash(key) {
    let total = 0;
    for (let i = 0; i < key.length; i++) {
        total += key.charCodeAt(i);
    }
    return total % this.size;
  }

  insert(key, value) {
    const idx = this.hash(key);
    const bucket = this.table[idx];
    
    // Check if key already exists
    for (let i = 0; i < bucket.length; i++) {
        if (bucket[i].key === key) {
        bucket[i].value = value;
        return;
        }
    }
    
    // Add new pair (handling collision via chaining)
    bucket.push({ key, value });
  }

  search(key) {
    const idx = this.hash(key);
    const bucket = this.table[idx];
    
    for (let pair of bucket) {
        if (pair.key === key) return pair.value;
    }
    return null;
  }
}`,
  },
  quiz: [
    {
      q: "What happens in a Hash Table when two keys produce the same hash index?",
      options: [
        "The first key is deleted",
        "A collision occurs and must be resolved",
        "The table size automatically doubles",
        "The second key is hashed again"
      ],
      answer: 1,
    },
    {
      q: "Which collision resolution technique is used in this visualizer?",
      options: [
        "Linear Probing",
        "Quadratic Probing",
        "Double Hashing",
        "Separate Chaining"
      ],
      answer: 3,
    },
    {
      q: "What is the average time complexity for searching in a Hash Table with a good hash distribution?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      answer: 0,
    },
  ],
};

export default function HashTablePage() {
  const [tableState, setTableState] = useState(createInitialHashTableState);
  const [inputKey, setInputKey] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputText, setInputText] = useState("Alice:25, Bob:30, Caleb:22");
  const [inputError, setInputError] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
    const initialTable = createInitialHashTableState();
    setAlgorithmId("hash-table");
    setSteps([
      {
        id: 0,
        type: "highlight",
        indices: [],
        values: { table: initialTable },
        description: `Hash Table loaded with ${HASH_TABLE_SIZE} buckets. Collisions are handled using separate chaining.`,
      },
    ]);

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
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentStepIndex, isPlaying, setIsPlaying, speed, stepForward, steps.length]);

  const runOperation = (
    operation:
      | { type: "insert"; key: string; value: string }
      | { type: "search"; key: string }
      | { type: "delete"; key: string }
  ) => {
    const { steps: nextSteps, nextTable } = generateSingleHashTableSteps(tableState, operation);
    resetVisualizer();
    setSteps(nextSteps);
    setTableState(nextTable);
    setTimeout(() => setIsPlaying(true), 50);
  };

  const handleInsert = () => {
    const key = inputKey.trim();
    const value = inputValue.trim();
    if (!key || !value) return;

    runOperation({ type: "insert", key, value });
    setInputKey("");
    setInputValue("");
  };

  const handleSearch = () => {
    const key = inputKey.trim();
    if (!key) return;
    runOperation({ type: "search", key });
  };

  const handleDelete = () => {
    const key = inputKey.trim();
    if (!key) return;
    runOperation({ type: "delete", key });
    setInputKey("");
  };

  const handleClear = () => {
    const emptyTable = createEmptyHashTableState();
    setTableState(emptyTable);
    resetVisualizer();
    setSteps([
      {
        id: 0,
        type: "highlight",
        indices: [],
        values: { table: emptyTable },
        description: "Hash Table cleared. All buckets are now empty.",
      },
    ]);
    setInputKey("");
    setInputValue("");
  };

  const handleRandomize = () => {
    const RANDOM_KEYS = ["User", "Admin", "Data", "Node", "Cache", "Token", "App", "Link"];
    const numItems = Math.floor(Math.random() * 4) + 5; // 5 to 8
    const pairs = [];
    for(let i=0; i<numItems; i++) {
        pairs.push({
            key: `${RANDOM_KEYS[Math.floor(Math.random() * RANDOM_KEYS.length)]}${Math.floor(Math.random() * 100)}`,
            value: String(Math.floor(Math.random() * 1000))
        });
    }
    
    let currentTable = createEmptyHashTableState();
    let allSteps: typeof steps = [
      {
        id: 0,
        type: "highlight",
        indices: [],
        values: { table: currentTable },
        description: `Randomizing ${numItems} entries...`,
      }
    ];

    for (const pair of pairs) {
      const { steps: newSteps, nextTable } = generateSingleHashTableSteps(currentTable, { type: "insert", key: pair.key, value: pair.value });
      const adjustedSteps = newSteps.map((step, idx) => ({ ...step, id: allSteps.length + idx }));
      allSteps = [...allSteps, ...adjustedSteps];
      currentTable = nextTable;
    }

    resetVisualizer();
    setSteps(allSteps);
    setTableState(currentTable);
    setInputText(pairs.map(p => `${p.key}:${p.value}`).join(", "));
    setTimeout(() => setIsPlaying(true), 50);
  };

  const handleApplyInput = () => {
    const parsedParams = inputText
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(entry => {
        const parts = entry.split(':');
        return {
          key: parts[0],
          value: parts[1] || String(Math.floor(Math.random() * 100))
        };
      });

    if (parsedParams.length === 0 || parsedParams.length > 15) {
      setInputError("Enter 1-15 pairs (e.g., Alice:25, Bob:30).");
      return;
    }
    setInputError("");
    
    let currentTable = createEmptyHashTableState();
    let allSteps: typeof steps = [
      {
        id: 0,
        type: "highlight",
        indices: [],
        values: { table: currentTable },
        description: `Inserting ${parsedParams.length} custom entries...`,
      }
    ];

    for (const pair of parsedParams) {
      const { steps: newSteps, nextTable } = generateSingleHashTableSteps(currentTable, { type: "insert", key: pair.key, value: pair.value });
      const adjustedSteps = newSteps.map((step, idx) => ({ ...step, id: allSteps.length + idx }));
      allSteps = [...allSteps, ...adjustedSteps];
      currentTable = nextTable;
    }

    resetVisualizer();
    setSteps(allSteps);
    setTableState(currentTable);
    setShowInputModal(false);
    setTimeout(() => setIsPlaying(true), 50);
  };

  const currentStepData = steps[currentStepIndex];
  const totalEntries = tableState.reduce((total, bucket) => total + bucket.length, 0);
  const activeBucket = currentStepData?.values?.hash;

  const formattedDescription = currentStepData?.description
    ? currentStepData.description.replace(/\[([^\]]+)\]/g, '<span class="text-[var(--lime-dark)] dark:text-lime font-bold">[$1]</span>') +
      `<span class="text-indigo-400 italic ml-2">(${ 
        currentStepData.type === "insert"
          ? "Insert"
          : currentStepData.type === "delete"
            ? "Delete"
            : currentStepData.type === "visit"
              ? "Chain Walk"
              : currentStepData.type === "done"
                ? "Done"
                : "Hashing"
      })</span>`
    : "Ready...";

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Hash Table (Separate Chaining)"
        description="Fast key-value lookup using hashing. Buckets are selected by a hash function, and collisions are resolved by storing multiple entries in a chain inside the same bucket."
        complexity={{ time: "1 avg", space: "n", difficulty: "Medium" }}
        controls={
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col xl:flex-row gap-3 items-center bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4">
              <div className="flex-1 w-full flex items-center gap-2">
                <input
                  type="text"
                  value={inputKey}
                  onChange={(event) => setInputKey(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      if (inputValue.trim()) handleInsert();
                      else handleSearch();
                    }
                  }}
                  placeholder="Key"
                  className="flex-1 min-w-[140px] bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-lime-600 dark:text-lime outline-none focus:border-indigo-500 transition-all font-mono"
                />
                <input
                  type="text"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleInsert();
                    }
                  }}
                  placeholder="Value"
                  className="flex-1 min-w-[140px] bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-cyan-600 dark:text-cyan-400 outline-none focus:border-indigo-500 transition-all font-mono"
                />
                <button
                  onClick={handleInsert}
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-lg whitespace-nowrap"
                >
                  Insert +
                </button>
              </div>

              <div className="w-full xl:w-auto flex gap-2">
                <button
                  onClick={handleSearch}
                  className="flex-1 xl:flex-none px-5 py-2.5 rounded-lg border border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold transition-colors shadow-sm whitespace-nowrap"
                >
                  Search
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 xl:flex-none px-5 py-2.5 rounded-lg border border-orange-500/50 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold transition-colors shadow-sm whitespace-nowrap"
                >
                  Delete
                </button>
                <button
                  onClick={handleClear}
                  className="flex-1 xl:flex-none px-5 py-2.5 rounded-lg bg-slate-200 dark:bg-[#252840] hover:bg-slate-300 dark:hover:bg-[#2f3352] text-slate-700 dark:text-slate-300 font-semibold transition-colors whitespace-nowrap"
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
              onRandomize={handleRandomize}
              onCustomInput={() => setShowInputModal(true)}
            />
          </div>
        }
        info={<TheoryCard {...HASH_TABLE_THEORY} />}
      >
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          <div className="absolute top-4 right-4 md:right-6 z-20 flex flex-col items-end gap-2 text-xs font-mono bg-white/80 dark:bg-[#0d0f1a]/80 backdrop-blur-sm p-2 rounded-lg border border-black/5 dark:border-white/5">
            <span className="text-black/40 dark:text-slate-500 uppercase tracking-[0.2em] font-bold text-[9px] md:text-[10px] mb-1">Table Status</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Buckets: {HASH_TABLE_SIZE}</span>
            <span className="text-lime-600 dark:text-lime font-bold">Entries: {totalEntries}</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-bold">Active: {typeof activeBucket === "number" ? `[${activeBucket}]` : "None"}</span>
          </div>

          <div className="absolute bottom-4 left-4 md:left-6 z-20 flex flex-wrap gap-3 text-[10px] font-mono bg-white/80 dark:bg-[#0d0f1a]/80 backdrop-blur-sm p-2 rounded-lg border border-black/5 dark:border-white/5">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>Normal Node</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#cbff5e] inline-block"></span>Active Bucket</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>Search</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block"></span>Delete</span>
          </div>

          <HashTableViz currentStepData={currentStepData} tableSize={HASH_TABLE_SIZE} />
        </div>

        {/* Custom Input Modal Overlay */}
        {showInputModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
             <div className="bg-[#14151f] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
                <h3 className="text-xl font-display text-white tracking-tight">Custom Hash Table Input</h3>
                <p className="text-sm font-light text-white/50">Enter comma-separated pairs like <code>Key:Value</code> (1-15 pairs).</p>
                <input
                  type="text"
                  autoFocus
                  value={inputText}
                  onChange={e => { setInputText(e.target.value); setInputError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleApplyInput()}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-lime outline-none focus:border-lime/50 transition-all font-mono"
                  placeholder="e.g. Alice:25, Bob:30, Caleb:22"
                />
                {inputError && <p className="text-[10px] text-red-400 uppercase tracking-widest">{inputError}</p>}
                
                <div className="flex justify-end gap-3 mt-4">
                   <button 
                     onClick={() => setShowInputModal(false)}
                     className="px-4 py-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white text-sm transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handleApplyInput}
                     className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg text-sm transition-colors"
                   >
                     Apply Data
                   </button>
                </div>
             </div>
          </div>
        )}
      </VisualizerFrame>
    </div>
  );
}
