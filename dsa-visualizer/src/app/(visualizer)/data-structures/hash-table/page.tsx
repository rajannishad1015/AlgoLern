"use client";

import { useEffect, useState } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import {
  generateHashTableSteps,
  HashTableState,
} from "@/lib/algorithms/data-structures/hashTable";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { HashTableViz } from "@/components/d3/HashTableViz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Search } from "lucide-react";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { TheoryCard } from "@/components/visualizer/TheoryCard";

const TABLE_SIZE = 7;

const HASH_TABLE_THEORY = {
  en: {
    description:
      "A Hash Table is a data structure that implements an associative array abstract data type, a structure that can map keys to values. It uses a hash function to compute an index, also called a hash code, into an array of buckets or slots, from which the desired value can be found.",
    howItWorks: [
      "Hashing: A key is passed into a hash function to get an integer index.",
      "Modulo: The index is reduced to fit the array size (index % table_size).",
      "Storage: The key-value pair is stored at that specific bucket.",
      "Collisions: If two keys hash to the same bucket, it's called a collision. We use Separate Chaining (Linked Lists) to handle them here.",
    ],
    analogy:
      "Imagine a post office with PO Boxes (buckets). The Hash Function is the mail sorting machine. It looks at the ZIP code on your letter (the Key) and immediately knows exactly which PO Box number to drop it into. If multiple letters go to the same PO Box, the mailman just stacks them together (this stack is our Linked List / Collision Chain).",
    timeComplexity: {
      best: "O(1)",
      average: "O(1)",
      worst: "O(n)",
    },
    spaceComplexity: "O(n)",
    pseudocode: `class HashTable:
    def __init__(self, size):
        self.size = size
        self.table = [[] for _ in range(self.size)]
        
    def _hash(self, key):
        # Calculate sum of ASCII chars
        sum = 0
        for char in key:
            sum += ord(char)
        return sum % self.size
        
    def insert(self, key, value):
        idx = self._hash(key)
        # Check if key exists and update
        for i, kv in enumerate(self.table[idx]):
            if kv[0] == key:
                self.table[idx][i] = (key, value)
                return
        # Or append to the chain
        self.table[idx].append((key, value))
        
    def get(self, key):
        idx = self._hash(key)
        for kv in self.table[idx]:
            if kv[0] == key: return kv[1]
        return None`,
  },
  hi: {
    description:
      "Hash Table ek aisi data structure hai jo fast key-value lookups ke liye use hoti hai. Ek 'hash function' key ko ek integer array index mein convert karta hai jisse hum directly apne data tak pahunch sakte hain.",
    howItWorks: [
      "Hashing: Key ko ek function mein dalo jo ek number dega.",
      "Modulo: Us number ko table size se mod ('%') karo taaki index array limit ke andar rahe.",
      "Storage: Array ke us index (bucket) par jao aur value save kar do.",
      "Collisions: Agar do alag keys ka same index aa jaye usko collision bolte hain. Yahan hum uske liye har bucket mein 'Linked List' (Separate Chaining) maintain karte hain.",
    ],
    analogy:
      "Socho ek gym locker room hai. Hash Function wahan ka smart receptionist hai. Aap apna naam (Key) batate ho, aur receptionist ek calculation dimaag me karke turant aapko ek specific locker number deta hai. Agar ek locker mein do judwa bhaiyon ka samaan rakhna ho, toh dono bag locker ke andar ek ke piche ek rakh diye jate hain (Collision Chaining).",
    timeComplexity: {
      best: "O(1)",
      average: "O(1)",
      worst: "O(n) - agar saab me collisions ho",
    },
    spaceComplexity: "O(n)",
    pseudocode: `class HashTable:
    def __init__(self, size):
        self.size = size
        self.table = [[] for _ in range(self.size)] # Array of LinkedLists
        
    def _hash(self, key):
        total = 0
        for ch in key:
            total += ord(ch)
        return total % self.size
        
    def insert(self, key, value):
        idx = self._hash(key)
        for kv in self.table[idx]:
            if kv.key == key: 
                kv.value = value
                return
        self.table[idx].append(Node(key, value))`,
  },
};

type Operation = {
  type: "insert" | "search" | "delete";
  key: string;
  value?: string;
};

export default function HashTablePage() {
  const [opsList, setOpsList] = useState<Operation[]>([
    { type: "insert", key: "Alice", value: "25" },
    { type: "insert", key: "Bob", value: "30" },
    { type: "insert", key: "Caleb", value: "22" }, // Bob and Caleb often collide on small tables
  ]);

  const [inputKey, setInputKey] = useState("");
  const [inputValue, setInputValue] = useState("");

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
    setAlgorithmId("hash-table");
    const generatedSteps = generateHashTableSteps(TABLE_SIZE, opsList);
    setSteps(generatedSteps);
    resetVisualizer();
  }, [opsList, resetVisualizer, setAlgorithmId, setSteps]);

  const currentStepData = steps[currentStepIndex];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        if (currentStepIndex < steps.length - 1) stepForward();
        else setIsPlaying(false);
      }, speed);
    }
    return () => clearInterval(timer);
  }, [
    isPlaying,
    currentStepIndex,
    steps.length,
    speed,
    stepForward,
    setIsPlaying,
  ]);

  const handleQueueOp = (type: "insert" | "delete" | "search") => {
    if (!inputKey.trim()) return;
    if (type === "insert" && !inputValue.trim()) return;

    setOpsList([
      ...opsList,
      { type, key: inputKey.trim(), value: inputValue.trim() },
    ]);
    setInputKey("");
    if (type === "insert") setInputValue("");
    setTimeout(() => setIsPlaying(true), 100);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] flex-1 w-full max-w-7xl mx-auto p-4 gap-4">
      <div className="flex justify-between items-start flex-col sm:flex-row gap-2 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary">
            Hash Table
          </h1>
          <p className="text-text-secondary mt-1">
            Maps keys to values with{" "}
            <span className="text-accent-primary font-bold">O(1)</span> average
            time. Uses <strong>Separate Chaining</strong> for collisions.
          </p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-3 text-xs font-mono text-text-muted">
          Table Size:{" "}
          <span className="text-accent-primary font-bold">{TABLE_SIZE}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 mb-10">
        {/* Left Col - Viz */}
        <div className="w-full lg:w-[65%] flex flex-col gap-4">
          <VisualizerFrame
            title="Hash Table (Separate Chaining)"
            description={currentStepData?.description || "Ready"}
          >
            {/* INLINE CONTROLS */}
            <div className="flex gap-2 flex-wrap items-center bg-bg-card/80 backdrop-blur-md border border-border rounded-xl p-2 shadow-sm mb-2 w-fit relative z-20">
              <Input
                placeholder="Key"
                value={inputKey}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setInputKey(e.target.value)
                }
                className="w-24 h-9 bg-bg-secondary border-border"
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") handleQueueOp("insert");
                }}
              />
              <Input
                placeholder="Val"
                value={inputValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setInputValue(e.target.value)
                }
                className="w-20 h-9 bg-bg-secondary border-border"
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") handleQueueOp("insert");
                }}
              />
              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={() => handleQueueOp("insert")}
                  disabled={!inputKey || !inputValue}
                  className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                >
                  <Plus className="w-4 h-4 mr-1" /> Insert
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleQueueOp("search")}
                  disabled={!inputKey}
                  className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                >
                  <Search className="w-4 h-4 mr-1" /> Find
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQueueOp("delete")}
                  disabled={!inputKey}
                  className="hover:bg-red-500/10 hover:text-red-400"
                >
                  <Minus className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>
            </div>

            <HashTableViz
              currentStepData={currentStepData}
              tableSize={TABLE_SIZE}
            />
          </VisualizerFrame>

          <ControlBar
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onStepForward={stepForward}
            onStepBackward={stepBackward}
            onReset={() => {
              resetVisualizer();
              setOpsList([{ type: "insert", key: "Alice", value: "25" }]);
            }}
            onSpeedChange={setSpeed}
            isPlaying={isPlaying}
            currentStep={currentStepIndex}
            totalSteps={steps.length}
            speed={speed}
          />
        </div>

        {/* Right Col - Theory */}
        <div className="w-full lg:w-[35%] overflow-y-auto">
          <TheoryCard
            title="Hash Table"
            description={HASH_TABLE_THEORY.en.description}
            descriptionHi={HASH_TABLE_THEORY.hi.description}
            howItWorks={{
              en: HASH_TABLE_THEORY.en.howItWorks.map((text) => ({
                icon: "circle-dot",
                text,
              })),
              hi: HASH_TABLE_THEORY.hi.howItWorks.map((text) => ({
                icon: "circle-dot",
                text,
              })),
            }}
            analogy={{
              icon: "lock",
              title: "Locker Room",
              titleHi: "Locker Room",
              desc: HASH_TABLE_THEORY.en.analogy,
              descHi: HASH_TABLE_THEORY.hi.analogy,
            }}
            complexities={[
              {
                case: "Best",
                time: HASH_TABLE_THEORY.en.timeComplexity.best,
                space: HASH_TABLE_THEORY.en.spaceComplexity,
              },
              {
                case: "Average",
                time: HASH_TABLE_THEORY.en.timeComplexity.average,
                space: HASH_TABLE_THEORY.en.spaceComplexity,
              },
              {
                case: "Worst",
                time: HASH_TABLE_THEORY.en.timeComplexity.worst,
                space: HASH_TABLE_THEORY.en.spaceComplexity,
              },
            ]}
            useCases={[
              "Database indexing",
              "Caching (Memcached, Redis)",
              "Symbol tables in compilers",
            ]}
            useCasesHi={[
              "Database mein data dhoondhna",
              "Caching karna jaldi access ke liye",
              "Compilers mein variables track karna",
            ]}
            pseudocode={HASH_TABLE_THEORY.en.pseudocode}
          />
        </div>
      </div>
    </div>
  );
}
