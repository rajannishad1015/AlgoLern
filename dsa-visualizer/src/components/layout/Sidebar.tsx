"use client";

import { useState } from "react";
import { ChevronDown, Activity, Search, Shapes, ListTree, Network, Cpu, Home, Terminal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  {
    id: "sorting",
    label: "Sorting",
    icon: Activity,
    links: [
      { label: "Bubble Sort", href: "/sorting/bubble" },
      { label: "Selection Sort", href: "/sorting/selection" },
      { label: "Insertion Sort", href: "/sorting/insertion" },
      { label: "Merge Sort", href: "/sorting/merge" },
      { label: "Quick Sort", href: "/sorting/quick" },
      { label: "Heap Sort", href: "/sorting/heap" },
      { label: "Counting Sort", href: "/sorting/counting" },
      { label: "Radix Sort", href: "/sorting/radix" },
      { label: "Shell Sort", href: "/sorting/shell" },
    ],
  },
  {
    id: "searching",
    label: "Searching",
    icon: Search,
    links: [
      { label: "Linear Search", href: "/searching/linear" },
      { label: "Binary Search", href: "/searching/binary" },
      { label: "Jump Search", href: "/searching/jump" },
      { label: "Exponential Search", href: "/searching/exponential" },
      { label: "Interpolation Search", href: "/searching/interpolation" },
    ],
  },
  {
    id: "data-structures",
    label: "Data Structures",
    icon: Shapes,
    links: [
      { label: "Stack", href: "/data-structures/stack" },
      { label: "Queue", href: "/data-structures/queue" },
      { label: "Singly Linked List", href: "/data-structures/linked-list" },
      { label: "Doubly Linked List", href: "/data-structures/doubly-linked-list" },
      { label: "Circular Linked List", href: "/data-structures/circular-linked-list" },
      { label: "Hash Table", href: "/data-structures/hash-table" },
      { label: "Priority Queue", href: "/data-structures/priority-queue" },
      { label: "Deque", href: "/data-structures/deque" },
    ],
  },
  {
    id: "trees",
    label: "Trees",
    icon: ListTree,
    links: [
      { label: "Binary Search Tree", href: "/trees/bst" },
      { label: "DFS Traversals", href: "/trees/traversals" },
      { label: "AVL Tree", href: "/trees/avl" },
      { label: "Trie", href: "/trees/trie" },
      { label: "Segment Tree", href: "/trees/segment-tree" },
      { label: "Fenwick Tree (BIT)", href: "/trees/fenwick-tree" },
    ],
  },
  {
    id: "graphs",
    label: "Graphs",
    icon: Network,
    links: [
      { label: "BFS & DFS", href: "/graphs/traversals" },
      { label: "Dijkstra's", href: "/graphs/dijkstra" },
      { label: "Bellman-Ford", href: "/graphs/bellman-ford" },
      { label: "Floyd-Warshall", href: "/graphs/floyd-warshall" },
      { label: "Kruskal's MST", href: "/graphs/kruskal" },
      { label: "Prim's MST", href: "/graphs/prim" },
    ],
  },
  {
    id: "advanced",
    label: "Advanced",
    icon: Cpu,
    links: [
      { label: "DP — Fibonacci", href: "/advanced/fibonacci" },
      { label: "N-Queens", href: "/advanced/nqueens" },
      { label: "Greedy Activity Selection", href: "/advanced/greedy" },
      { label: "Sudoku Backtracking", href: "/advanced/sudoku" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const defaultOpen = sections
    .filter(s => s.links.some(l => l.href === pathname))
    .map(s => s.id);

  const [openSections, setOpenSections] = useState<string[]>(
    defaultOpen.length > 0 ? defaultOpen : ["sorting"]
  );

  const toggle = (id: string) =>
    setOpenSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );

  return (
    <aside className="w-[260px] h-full bg-white dark:bg-[#0a0d16] border-r border-black/10 dark:border-[#1e2233] flex flex-col hidden md:flex shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-black/10 dark:border-[#1e2233] shrink-0">
        <Link href="/" className="text-2xl font-display tracking-tight flex items-center group transition-transform hover:scale-[1.02]">
          <span className="bg-[var(--lime-dark)] dark:bg-lime text-black px-1.5 py-0 rounded-sm mr-1 dark:shadow-[0_0_15px_rgba(203,255,94,0.3)]">ALGO</span>
          <span className="text-black dark:text-white">LERN</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-hide px-4 py-8 flex flex-col gap-2">
        <Link
          href="/"
          className={`flex items-center gap-4 px-4 py-3 rounded-lg text-[11px] font-bold uppercase tracking-[0.2em] transition-all ${
            pathname === "/"
              ? "bg-[var(--lime-dark)] dark:bg-lime text-black dark:shadow-[0_0_20px_rgba(203,255,94,0.15)]"
              : "text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <Home size={16} />
          <span>Home</span>
        </Link>

        <div className="mt-8 mb-4 px-4 text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 dark:text-slate-600">// Curriculum</div>

        {sections.map(section => {
          const Icon = section.icon;
          const isOpen = openSections.includes(section.id);
          const hasActive = section.links.some(l => l.href === pathname);

          return (
            <div key={section.id} className="flex flex-col">
              <button
                onClick={() => toggle(section.id)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg text-[11px] font-bold uppercase tracking-[0.2em] transition-all group ${
                  hasActive ? "text-black dark:text-white bg-black/5 dark:bg-[#1a1d2e]" : "text-black/60 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-[#141627]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon size={16} className={hasActive ? "text-[var(--lime-dark)] dark:text-indigo-400" : "text-black/30 dark:text-slate-600 group-hover:text-black/60 dark:group-hover:text-slate-300"} />
                  <span>{section.label}</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""} text-black/30 dark:text-slate-600`}
                />
              </button>

              {isOpen && (
                <div className="flex flex-col mt-2 mb-2 ml-[1.125rem] border-l border-black/10 dark:border-[#2f3352] gap-1">
                  {section.links.map(link => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`pl-8 py-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-all relative ${
                          isActive
                            ? "text-indigo-500 dark:text-indigo-400"
                            : "text-black/50 dark:text-slate-500 hover:text-black dark:hover:text-slate-200"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-indigo-500 dark:bg-indigo-400" />
                        )}
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Persistence State */}
      <div className="p-6 border-t border-black/10 dark:border-[#1e2233] bg-black/[0.02] dark:bg-[#0d1020]">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-[var(--lime-dark)] dark:bg-emerald-400 dark:shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-[var(--lime-dark)] dark:bg-emerald-400 animate-ping opacity-75" />
            </div>
            <span className="text-[9px] text-black/50 dark:text-slate-400 uppercase tracking-[0.25em] font-bold">Engine: Active</span>
          </div>
          <Terminal size={12} className="text-black/20 dark:text-slate-600" />
        </div>
      </div>
    </aside>
  );
}
