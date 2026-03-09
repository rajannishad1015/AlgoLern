# DSA Learning & Visualization Platform — Complete PRD
### Product Requirements Document | Version 1.0
### Stack: Next.js 14 (App Router) + D3.js + Tailwind CSS + Framer Motion

---

## TABLE OF CONTENTS

1. [Product Vision](#1-product-vision)
2. [Target Audience](#2-target-audience)
3. [Tech Stack — Detailed](#3-tech-stack--detailed)
4. [Project Structure](#4-project-structure)
5. [Design System](#5-design-system)
6. [Pages & Routes](#6-pages--routes)
7. [Data Structures Coverage](#7-data-structures-coverage)
8. [Algorithms Coverage](#8-algorithms-coverage)
9. [Visualizer Engine — D3.js](#9-visualizer-engine--d3js)
10. [Component Library](#10-component-library)
11. [Animation System](#11-animation-system)
12. [State Management](#12-state-management)
13. [Content & Learning Flow](#13-content--learning-flow)
14. [Performance Requirements](#14-performance-requirements)
15. [Accessibility](#15-accessibility)
16. [Phase-wise Roadmap](#16-phase-wise-roadmap)
17. [File-by-File Implementation Guide](#17-file-by-file-implementation-guide)

---

## 1. PRODUCT VISION

**Name:** AlgoLens (or your preferred name)
**Tagline:** "See the logic. Understand the pattern."

A fully frontend-only, interactive DSA learning and visualization platform built with Next.js 14. No backend, no database, no auth. Pure learning experience where students can:
- Watch algorithms execute step-by-step with full animation
- Interact with custom inputs
- Read theory with complexity analysis
- Test understanding with embedded quizzes
- Navigate every major DS and Algorithm topic

**Core Philosophy:**
- Every concept has: Theory → Visual → Pseudocode → Complexity → Quiz
- No fluff. Dense, useful, beautiful.
- Visualizer is the hero. Not text.

---

## 2. TARGET AUDIENCE

| Segment | Description |
|---|---|
| Primary | CS students (B.Tech, BCA, BSc) preparing for placements |
| Secondary | Self-taught devs learning DSA for interviews (FAANG, product companies) |
| Tertiary | Teachers who want visual aids for classroom |

**User Goals:**
- Understand WHY an algorithm works, not just memorize steps
- See real-time execution with variable states
- Learn time/space complexity intuitively
- Revise quickly before interviews

---

## 3. TECH STACK — DETAILED

### Core Framework
```
Next.js 14 (App Router)
- Server Components where possible
- Client Components for all interactive visualizers
- No SSR needed for most pages (static export friendly)
- next/font for font optimization
- next/image for any graphics
```

### Visualization
```
D3.js v7
- SVG-based rendering for all data structures
- Custom force simulations for graphs
- Transition API for smooth animations
- Selection/Data Join pattern for reactive updates
- d3-hierarchy for trees
- d3-force for graph layout
- d3-scale for color mapping
- d3-shape for path/arc generation
```

### Styling
```
Tailwind CSS v3
- Custom design tokens in tailwind.config.ts
- Dark mode via class strategy
- CSS Variables for D3 color integration
- No UI library — fully custom components
```

### Animation (non-D3)
```
Framer Motion v11
- Page transitions
- Sidebar/drawer animations
- Card hover effects
- Step reveal animations in theory sections
```

### Syntax Highlighting
```
Prism.js OR Shiki
- Code blocks for pseudocode
- Code blocks for JS/Python/Java/C++ implementations
- Line highlighting support (highlight specific lines during animation steps)
```

### Icons
```
Lucide React
- Consistent icon system
- Tree-shakeable
```

### Utilities
```
clsx + tailwind-merge     → className utility
zustand                   → lightweight global state
immer                     → immutable state updates in zustand
use-debounce              → input debouncing
nanoid                    → unique IDs for nodes
```

### Dev Tools
```
TypeScript (strict mode)
ESLint + Prettier
Husky + lint-staged
```

### Deployment
```
Vercel (static export or edge runtime)
next.config.js → output: 'export' for pure static if needed
```

---

## 4. PROJECT STRUCTURE

```
dsa-visualizer/
│
├── app/                                    ← Next.js App Router
│   ├── layout.tsx                          ← Root layout (fonts, theme provider, sidebar)
│   ├── page.tsx                            ← Landing/Home page
│   ├── globals.css                         ← Global styles + CSS variables
│   │
│   ├── (visualizer)/                       ← Route group (shares visualizer layout)
│   │   ├── layout.tsx                      ← Visualizer layout (sidebar + content area)
│   │   │
│   │   ├── arrays/
│   │   │   └── page.tsx
│   │   ├── linked-list/
│   │   │   ├── page.tsx                    ← Singly Linked List
│   │   │   ├── doubly/page.tsx
│   │   │   └── circular/page.tsx
│   │   ├── stack/
│   │   │   └── page.tsx
│   │   ├── queue/
│   │   │   ├── page.tsx
│   │   │   ├── circular/page.tsx
│   │   │   └── priority/page.tsx
│   │   ├── trees/
│   │   │   ├── page.tsx                    ← Binary Tree
│   │   │   ├── bst/page.tsx
│   │   │   ├── avl/page.tsx
│   │   │   ├── red-black/page.tsx
│   │   │   ├── heap/page.tsx
│   │   │   ├── trie/page.tsx
│   │   │   ├── segment-tree/page.tsx
│   │   │   └── fenwick/page.tsx
│   │   ├── graphs/
│   │   │   ├── page.tsx                    ← Graph basics
│   │   │   ├── bfs/page.tsx
│   │   │   ├── dfs/page.tsx
│   │   │   ├── dijkstra/page.tsx
│   │   │   ├── bellman-ford/page.tsx
│   │   │   ├── floyd-warshall/page.tsx
│   │   │   ├── kruskal/page.tsx
│   │   │   ├── prim/page.tsx
│   │   │   ├── topological-sort/page.tsx
│   │   │   └── tarjan/page.tsx
│   │   ├── hashing/
│   │   │   └── page.tsx
│   │   ├── sorting/
│   │   │   ├── bubble/page.tsx
│   │   │   ├── selection/page.tsx
│   │   │   ├── insertion/page.tsx
│   │   │   ├── merge/page.tsx
│   │   │   ├── quick/page.tsx
│   │   │   ├── heap-sort/page.tsx
│   │   │   ├── counting/page.tsx
│   │   │   ├── radix/page.tsx
│   │   │   └── shell/page.tsx
│   │   ├── searching/
│   │   │   ├── linear/page.tsx
│   │   │   ├── binary/page.tsx
│   │   │   └── jump/page.tsx
│   │   ├── dynamic-programming/
│   │   │   ├── page.tsx                    ← DP intro + memoization table visual
│   │   │   ├── fibonacci/page.tsx
│   │   │   ├── knapsack/page.tsx
│   │   │   ├── lcs/page.tsx
│   │   │   ├── lis/page.tsx
│   │   │   ├── coin-change/page.tsx
│   │   │   ├── matrix-chain/page.tsx
│   │   │   └── edit-distance/page.tsx
│   │   ├── backtracking/
│   │   │   ├── n-queens/page.tsx
│   │   │   ├── sudoku/page.tsx
│   │   │   └── rat-in-maze/page.tsx
│   │   ├── greedy/
│   │   │   ├── activity-selection/page.tsx
│   │   │   ├── fractional-knapsack/page.tsx
│   │   │   └── huffman/page.tsx
│   │   ├── divide-and-conquer/
│   │   │   ├── binary-search/page.tsx
│   │   │   └── strassen/page.tsx
│   │   └── string-algorithms/
│   │       ├── kmp/page.tsx
│   │       ├── rabin-karp/page.tsx
│   │       └── z-algorithm/page.tsx
│   │
│   └── compare/
│       └── page.tsx                        ← Side-by-side algorithm comparison
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx                     ← Full navigation sidebar
│   │   ├── SidebarItem.tsx
│   │   ├── TopBar.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── BreadCrumb.tsx
│   │
│   ├── visualizer/
│   │   ├── VisualizerContainer.tsx         ← Wrapper: canvas + controls + info panel
│   │   ├── VisualizerCanvas.tsx            ← SVG container for D3
│   │   ├── ControlBar.tsx                  ← Play/Pause/Step/Reset/Speed
│   │   ├── StepInfo.tsx                    ← Current step description
│   │   ├── ComplexityBadge.tsx             ← Time/Space complexity display
│   │   └── InputPanel.tsx                  ← Custom input for user data
│   │
│   ├── d3/
│   │   ├── ArrayViz.tsx                    ← D3 array bars
│   │   ├── LinkedListViz.tsx               ← D3 nodes + arrows
│   │   ├── TreeViz.tsx                     ← D3 hierarchy tree
│   │   ├── GraphViz.tsx                    ← D3 force-directed graph
│   │   ├── StackViz.tsx                    ← D3 stack visualization
│   │   ├── QueueViz.tsx                    ← D3 queue visualization
│   │   ├── HashTableViz.tsx                ← D3 hash table buckets
│   │   ├── MatrixViz.tsx                   ← D3 matrix for DP tables
│   │   ├── HeapViz.tsx                     ← D3 heap (array + tree dual view)
│   │   └── TrieViz.tsx                     ← D3 Trie visualization
│   │
│   ├── content/
│   │   ├── TheoryPanel.tsx                 ← Theory text section
│   │   ├── PseudocodeBlock.tsx             ← Highlighted pseudocode
│   │   ├── CodeTabs.tsx                    ← JS/Python/Java/C++ tabs
│   │   ├── ComplexityTable.tsx             ← Big-O table
│   │   ├── QuizSection.tsx                 ← Inline quiz
│   │   └── UseCases.tsx                    ← Real-world use cases
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── Slider.tsx                      ← Speed slider
│       ├── Badge.tsx
│       ├── Tooltip.tsx
│       ├── Tabs.tsx
│       ├── Card.tsx
│       └── Modal.tsx
│
├── lib/
│   ├── algorithms/
│   │   ├── sorting/
│   │   │   ├── bubbleSort.ts               ← Returns array of steps
│   │   │   ├── mergeSort.ts
│   │   │   ├── quickSort.ts
│   │   │   └── ...all sorting algos
│   │   ├── graphs/
│   │   │   ├── bfs.ts
│   │   │   ├── dfs.ts
│   │   │   ├── dijkstra.ts
│   │   │   └── ...all graph algos
│   │   ├── trees/
│   │   │   ├── bstOperations.ts
│   │   │   ├── avlRotations.ts
│   │   │   ├── heapOperations.ts
│   │   │   └── ...
│   │   ├── dp/
│   │   │   ├── fibonacci.ts
│   │   │   ├── knapsack.ts
│   │   │   └── ...
│   │   └── strings/
│   │       ├── kmp.ts
│   │       └── ...
│   │
│   ├── types/
│   │   ├── algorithm.ts                    ← AlgorithmStep, StepType, VisualizerState
│   │   ├── graph.ts                        ← Node, Edge, GraphData
│   │   ├── tree.ts                         ← TreeNode, TreeData
│   │   └── common.ts
│   │
│   ├── hooks/
│   │   ├── useVisualizer.ts                ← Core playback engine hook
│   │   ├── useD3.ts                        ← D3 ref + resize observer
│   │   ├── useAnimationSpeed.ts
│   │   └── useKeyboardShortcuts.ts
│   │
│   ├── store/
│   │   └── visualizerStore.ts              ← Zustand global state
│   │
│   ├── content/
│   │   ├── arrays.ts                       ← Theory text, quiz questions, complexity
│   │   ├── linkedList.ts
│   │   ├── sorting.ts
│   │   └── ...one file per topic
│   │
│   └── utils/
│       ├── generateArray.ts                ← Random array generator
│       ├── generateGraph.ts                ← Random graph generator
│       ├── generateTree.ts
│       └── colorScale.ts                   ← D3 color utilities
│
├── public/
│   └── og-image.png
│
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

---

## 5. DESIGN SYSTEM

### Color Palette (Dark Theme Primary)
```css
/* globals.css */
:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #111118;
  --bg-card: #16161f;
  --bg-hover: #1e1e2a;

  --border: #2a2a3a;
  --border-active: #4a4a6a;

  --text-primary: #e8e8f0;
  --text-secondary: #8888aa;
  --text-muted: #555570;

  --accent-primary: #6366f1;     /* Indigo — primary CTA */
  --accent-secondary: #22d3ee;   /* Cyan — highlights */
  --accent-success: #4ade80;     /* Green — correct/done */
  --accent-warning: #fbbf24;     /* Yellow — current/active */
  --accent-danger: #f87171;      /* Red — swap/delete */
  --accent-purple: #a78bfa;      /* Purple — visited */

  /* D3 specific */
  --viz-default: #3b3b52;
  --viz-active: #6366f1;
  --viz-comparing: #fbbf24;
  --viz-swapping: #f87171;
  --viz-sorted: #4ade80;
  --viz-visited: #a78bfa;
  --viz-path: #22d3ee;
  --viz-source: #f97316;
  --viz-target: #ec4899;
}
```

### Typography
```
Display Font: "Space Grotesk" or "Syne" — headings, titles
Mono Font: "JetBrains Mono" — code, pseudocode, node labels
Body Font: "Inter" — theory text, descriptions

Font Scale:
- xs: 0.75rem
- sm: 0.875rem
- base: 1rem
- lg: 1.125rem
- xl: 1.25rem
- 2xl: 1.5rem
- 3xl: 1.875rem
- 4xl: 2.25rem (hero)
```

### Spacing System
```
Consistent 4px base unit
Sidebar width: 260px
TopBar height: 56px
ControlBar height: 64px
Canvas min-height: 400px
Content panel max-width: 760px
```

### Component States
Every interactive element has: default / hover / active / disabled / loading states defined.

---

## 6. PAGES & ROUTES

### `/` — Home/Landing Page
- Hero section: animated sorting visualization in background
- Feature highlights: what the platform covers
- Topic grid: all DS/Algo categories with icons
- Quick start CTA
- Stats: "X topics", "Y algorithms", "Z data structures"

### `/(visualizer)/layout.tsx` — Visualizer Shell
- Left sidebar (260px): full topic navigation tree, collapsible sections
- Top bar: current topic breadcrumb, theme toggle, keyboard shortcuts help
- Main area: split into Visualizer Zone (top) + Theory Zone (bottom/tab)
- Responsive: sidebar becomes drawer on mobile

### Each Visualizer Page Template
Every topic page follows this exact layout:

```
┌─────────────────────────────────────────────────┐
│  TOPIC HEADER: Name + short description + tags  │
├─────────────────────────────────────────────────┤
│                                                 │
│           VISUALIZER CANVAS (D3 SVG)            │
│                                                 │
├─────────────────────────────────────────────────┤
│  CONTROL BAR: ← Step | ▶ Play | Step → | Speed  │
│  INPUT PANEL: Custom input + Randomize button   │
├──────────────┬──────────────────────────────────┤
│  STEP LOG    │   CURRENT STEP EXPLANATION       │
│  (scrollable │   (what is happening right now)  │
│   list)      │                                  │
├──────────────┴──────────────────────────────────┤
│  TABS: [Theory] [Pseudocode] [Code] [Complexity]│
│        [Quiz] [Use Cases]                       │
├─────────────────────────────────────────────────┤
│  TAB CONTENT (changes per tab)                  │
└─────────────────────────────────────────────────┘
```

### `/compare` — Algorithm Comparison Page
- Select 2 algorithms from same category
- Side-by-side visualization running simultaneously
- Complexity comparison table below
- Performance race: which finishes first on same input

---

## 7. DATA STRUCTURES COVERAGE

### 7.1 Arrays
**Visualizer:** Horizontal bars / rectangles with index labels
**Operations to visualize:**
- Access by index (highlight)
- Insert at beginning / middle / end (shift animation)
- Delete (collapse animation)
- Update (flash animation)
- Linear search (scan highlight)
- Binary search (pointer movement)
**Theory content:**
- Memory layout, contiguous allocation
- Cache friendliness
- Row-major vs column-major (2D arrays)
- Dynamic arrays (amortized analysis)
**Complexity table:**
- Access O(1), Search O(n), Insert O(n), Delete O(n)

### 7.2 Linked List (Singly)
**Visualizer:** Nodes (circles) connected by arrows
**Operations:**
- Insert at head / tail / position (animation: node creation → pointer update)
- Delete by value / position (node fade → pointer redirect)
- Traverse (cursor moving node to node)
- Search (highlight traversal)
- Reverse (in-place pointer flip animation)
- Detect cycle (Floyd's algorithm — two pointer animation)
**Theory:** Nodes, pointers, memory allocation

### 7.3 Doubly Linked List
**Visualizer:** Nodes with prev + next arrows
**Operations:** Same + bidirectional traverse, insert/delete O(1) with reference
**Theory:** Advantages over singly, use in browser history, deque

### 7.4 Circular Linked List
**Visualizer:** Nodes in circle formation, last → first arrow
**Operations:** Traverse (shows circular nature), Josephus problem visualization

### 7.5 Stack
**Visualizer:** Vertical stack of blocks, push from top, pop from top
**Operations:**
- Push (block slides in from top)
- Pop (top block slides out)
- Peek (highlight top)
- Check empty/full
**Applications visual:**
- Function call stack (recursive calls shown)
- Balanced parentheses check (step-by-step)
- Infix → Postfix conversion

### 7.6 Queue (Simple)
**Visualizer:** Horizontal queue, enqueue right, dequeue left
**Operations:** Enqueue, Dequeue, Front, Rear, isEmpty
**Applications:** BFS queue visualization, task scheduler

### 7.7 Circular Queue
**Visualizer:** Circular array with front/rear pointers
**Operations:** Wrap-around animation, full vs empty condition

### 7.8 Priority Queue (Min/Max Heap)
**Visualizer:** Array + heap tree dual view (both update simultaneously)
**Operations:** Insert (heapify-up), Delete (heapify-down), Peek
**Theory:** Min-heap vs max-heap property

### 7.9 Deque (Double-Ended Queue)
**Visualizer:** Bidirectional insertion/deletion
**Operations:** insertFront, insertRear, deleteFront, deleteRear

### 7.10 Hash Table
**Visualizer:** Array of buckets, hash function animation (key → index), collision chains
**Operations:**
- Insert: show hash function → index → place (or chain)
- Search: show rehashing → compare
- Delete: show removal from chain
- Collision handling: Separate Chaining (linked list visual) + Open Addressing (probe sequence)
**Theory:** Hash functions, load factor, rehashing, collision resolution strategies

### 7.11 Binary Tree
**Visualizer:** D3 tree layout, animated node insertion
**Operations:**
- Insert, Delete
- Inorder / Preorder / Postorder traversal (node highlight sequence)
- Level-order traversal
- Height, diameter calculation (highlight path)
- Mirror/flip animation

### 7.12 Binary Search Tree (BST)
**Visualizer:** Same as BT with BST property highlight
**Operations:**
- Insert (show comparison path)
- Search (show comparison path, highlight found node)
- Delete (3 cases: leaf, one child, two children — all animated)
- Inorder = sorted (demonstrate with highlight + sorted array showing)
- Successor / Predecessor

### 7.13 AVL Tree
**Visualizer:** Show balance factor on each node, rotation animation
**Operations:**
- Insert (show unbalanced → rotation → balanced)
- LL / LR / RL / RR rotations (each has dedicated step-by-step)
- Delete + rebalance

### 7.14 Red-Black Tree
**Visualizer:** Colored nodes (red/black), nil leaves shown
**Operations:**
- Insert + recoloring + rotations
- Delete cases
- Color balance property demonstration

### 7.15 Heap
**Visualizer:** Array bars + heap tree (both synchronized)
**Operations:**
- Build heap (heapify from bottom)
- Extract max/min
- Increase/Decrease key
- Heap sort step-by-step

### 7.16 Trie
**Visualizer:** D3 tree with character labels on edges, end-of-word marking
**Operations:**
- Insert word (path highlight, new node creation)
- Search word (path traversal, found/not found)
- Delete word
- Prefix search / Autocomplete (highlight all matching paths)
- Count words with prefix

### 7.17 Segment Tree
**Visualizer:** Array + segment tree structure, range highlight
**Operations:**
- Build (bottom-up construction animation)
- Range Query (show which nodes contribute)
- Point Update (path highlight from leaf to root)
- Range Update with lazy propagation

### 7.18 Fenwick Tree (BIT)
**Visualizer:** Array with responsible range indicators
**Operations:**
- Update (show path using lowbit)
- Prefix sum query (show path)
- Side-by-side with naive prefix sum for comparison

### 7.19 Graph
**Visualizer:** D3 force-directed graph, draggable nodes
**Representations:**
- Adjacency Matrix (matrix visual)
- Adjacency List (list visual)
- Toggle between both representations
**Properties:**
- Directed vs Undirected toggle
- Weighted edges (edge labels)
- Connected / Disconnected
- Custom graph builder: add/remove nodes and edges

---

## 8. ALGORITHMS COVERAGE

### 8.1 Sorting Algorithms

| Algorithm | Visualizer Type | Best | Avg | Worst | Space |
|---|---|---|---|---|---|
| Bubble Sort | Bar chart | O(n) | O(n²) | O(n²) | O(1) |
| Selection Sort | Bar chart | O(n²) | O(n²) | O(n²) | O(1) |
| Insertion Sort | Bar chart | O(n) | O(n²) | O(n²) | O(1) |
| Merge Sort | Split-merge animation | O(n log n) | O(n log n) | O(n log n) | O(n) |
| Quick Sort | Partition animation | O(n log n) | O(n log n) | O(n²) | O(log n) |
| Heap Sort | Heap + bar dual | O(n log n) | O(n log n) | O(n log n) | O(1) |
| Counting Sort | Frequency array visual | O(n+k) | O(n+k) | O(n+k) | O(k) |
| Radix Sort | Digit-by-digit buckets | O(nk) | O(nk) | O(nk) | O(n+k) |
| Shell Sort | Gap sequence visual | O(n log n) | O(n log²n) | O(n²) | O(1) |

**Sorting Visualizer Special Features:**
- Bar height = value, width = uniform
- Color states: default / comparing / swapping / sorted
- Comparison counter + swap counter live display
- Sound option (tone pitch = bar height)
- Array size slider (5 to 100 elements)
- Speed slider (0.5x to 10x)

### 8.2 Searching Algorithms

**Linear Search:**
- Array visualization, pointer scan left to right
- Highlight current, mark found

**Binary Search:**
- Array (sorted), left/mid/right pointers
- Show search space shrinking
- Iterative + Recursive views

**Jump Search:**
- Show block jumping, then linear within block

**Interpolation Search:**
- Show formula-based position calculation

**Exponential Search:**
- Show doubling step + binary search phase

### 8.3 Graph Algorithms

**BFS:**
- Queue visualization alongside graph
- Level-by-level coloring
- Show discovery order

**DFS:**
- Stack visualization alongside graph
- Backtracking animation (edge color change)
- Discovery/finish timestamps

**Dijkstra's:**
- Distance table updates live
- Priority queue shown
- Shortest path highlight at end

**Bellman-Ford:**
- Edge relaxation iterations
- Negative cycle detection visualization

**Floyd-Warshall:**
- Matrix animation (show how [i][k][j] updates)

**Kruskal's MST:**
- Edge sorting animation
- Union-Find merge animation
- MST edges highlighted in order

**Prim's MST:**
- Greedy expansion from start node
- Priority queue shown

**Topological Sort:**
- DFS-based: show finish order
- Kahn's: in-degree table + queue

**Tarjan's SCC:**
- Low-link values on nodes
- SCC groups highlighted with colors

**Cycle Detection:**
- Directed (DFS + back edge)
- Undirected (Union-Find)

### 8.4 Dynamic Programming

Each DP topic has:
1. Naive recursive tree (exponential — show overlap)
2. Memoization (top-down) — table filling with lookup
3. Tabulation (bottom-up) — table fill animation
4. Optimal substructure highlight

**Topics:**
- Fibonacci (recursive tree + memo + table)
- 0/1 Knapsack (2D DP table fill)
- Fractional Knapsack (greedy, not DP — contrast shown)
- Longest Common Subsequence (2D table + backtrack path)
- Longest Increasing Subsequence (array + DP array)
- Coin Change (1D table fill, min coins)
- Matrix Chain Multiplication (triangle DP table)
- Edit Distance (2D table + backtrace)
- Rod Cutting (table fill)
- Egg Drop Problem
- Palindrome Partitioning

### 8.5 Backtracking

**N-Queens:**
- Chessboard visual
- Show placement → conflict → backtrack
- Count of solutions

**Sudoku Solver:**
- Grid visual
- Cell fill → constraint check → backtrack

**Rat in a Maze:**
- Grid with walls
- Path exploration + backtrack animation

**Subset Sum / Permutations / Combinations:**
- Decision tree visualization

### 8.6 Greedy Algorithms

**Activity Selection:**
- Timeline bars, greedy selection animation

**Huffman Encoding:**
- Frequency table → priority queue → tree build → code assignment

**Fractional Knapsack:**
- Sort by ratio, fill animation

**Job Scheduling:**
- Gantt chart visualization

### 8.7 Divide & Conquer

**Binary Search:** (also in searching)
**Merge Sort:** (also in sorting)
**Strassen's Matrix Multiplication:** Sub-matrix visual
**Closest Pair of Points:** Plane with points, divide line

### 8.8 String Algorithms

**KMP:**
- Failure function table build
- Pattern matching with skip animation

**Rabin-Karp:**
- Hash window sliding animation
- Hash collision handling

**Z-Algorithm:**
- Z-array build visualization

**Longest Palindromic Substring (Manacher's):**
- Center expansion visualization

---

## 9. VISUALIZER ENGINE — D3.js

### Core Architecture

```typescript
// lib/types/algorithm.ts

export type StepType =
  | 'compare'
  | 'swap'
  | 'highlight'
  | 'insert'
  | 'delete'
  | 'visit'
  | 'path'
  | 'sorted'
  | 'update'
  | 'done';

export interface AlgorithmStep {
  id: number;
  type: StepType;
  indices?: number[];           // For array-based
  nodeIds?: string[];           // For tree/graph
  edgeIds?: string[];           // For graph edges
  values?: Record<string, any>; // Any additional state
  description: string;          // Human-readable explanation
  codeLine?: number;            // Which pseudocode line is active
  auxiliaryState?: any;         // Queue, stack, table state snapshot
}

export interface VisualizerState {
  steps: AlgorithmStep[];
  currentStep: number;
  isPlaying: boolean;
  speed: number; // ms per step
  inputData: any;
}
```

### Algorithm Step Generator Pattern
```typescript
// lib/algorithms/sorting/bubbleSort.ts

export function generateBubbleSortSteps(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const a = [...arr];
  const n = a.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        id: steps.length,
        type: 'compare',
        indices: [j, j + 1],
        description: `Comparing ${a[j]} and ${a[j+1]}`,
        codeLine: 4,
      });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({
          id: steps.length,
          type: 'swap',
          indices: [j, j + 1],
          values: { array: [...a] },
          description: `Swapping ${a[j+1]} and ${a[j]}`,
          codeLine: 6,
        });
      }
    }
    steps.push({
      id: steps.length,
      type: 'sorted',
      indices: [n - i - 1],
      description: `Element ${a[n-i-1]} is now in its correct position`,
    });
  }
  return steps;
}
```

### useVisualizer Hook
```typescript
// lib/hooks/useVisualizer.ts
// Manages play/pause/step/speed/reset
// Returns: currentStep, isPlaying, play, pause, stepForward, stepBack, reset, setSpeed
// Uses setInterval with speed-controlled timing
// Cleans up on unmount
```

### D3 Canvas Pattern
```typescript
// Every D3 component uses this pattern:
// 1. useRef for SVG element
// 2. useEffect with D3 data join
// 3. Transitions for state changes
// 4. Resize observer for responsiveness
// 5. Cleanup on unmount
```

---

## 10. COMPONENT LIBRARY

### ControlBar Props
```typescript
interface ControlBarProps {
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
}
```

**UI:** Progress bar showing step position, speed dropdown (0.25x / 0.5x / 1x / 2x / 5x / 10x), keyboard shortcut hints (Space = play/pause, ← → = step)

### InputPanel
- Sorting: comma-separated numbers or randomize
- Trees: comma-separated values to insert in order
- Graph: adjacency list text input or visual builder
- Arrays: direct value input

### PseudocodeBlock
- Numbered lines
- Active line highlight (synced with currentStep.codeLine)
- Copy button
- Language: pseudocode only (not real code)

### CodeTabs
- Tabs: JavaScript / Python / Java / C++
- Prism.js syntax highlighting
- Copy button per tab
- All 4 language implementations for every algorithm

### ComplexityTable
```typescript
interface ComplexityEntry {
  case: 'Best' | 'Average' | 'Worst';
  time: string;
  space: string;
  note?: string;
}
```

### QuizSection
- 3-5 MCQ questions per topic
- Immediate feedback (correct/incorrect with explanation)
- No scoring saved (stateless)

---

## 11. ANIMATION SYSTEM

### D3 Transitions
```typescript
// Color transitions: 300ms ease
// Position transitions: 500ms ease-in-out
// Opacity transitions: 200ms linear
// Scale transitions: 300ms spring (custom)

// Active step highlighting: stroke + glow effect
// Completed: fill change + no transition
// Default: instant color restore after step
```

### Framer Motion
Used for:
- Sidebar open/close (x: -260 → 0)
- Tab content switch (opacity + y: 10 → 0)
- Card hover (scale: 1 → 1.02, shadow increase)
- Page enter (opacity 0 → 1, y: 20 → 0, 400ms)
- Step info text (key-based re-render with animate presence)

### Visual Feedback Rules
```
Comparing elements   → Yellow border + yellow fill
Swapping elements    → Red fill, scale up briefly
Sorted/Final         → Green fill (permanent for that step)
Currently visiting   → Indigo fill + pulse ring
Visited (BFS/DFS)    → Purple fill (stays until reset)
Path found           → Cyan fill
Source node          → Orange fill
Target node          → Pink fill
Default              → --viz-default color
```

---

## 12. STATE MANAGEMENT

### Zustand Store
```typescript
// lib/store/visualizerStore.ts

interface VisualizerStore {
  // Playback
  steps: AlgorithmStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number;

  // Input
  inputData: any;
  algorithmId: string;

  // Actions
  setSteps: (steps: AlgorithmStep[]) => void;
  setCurrentStep: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  setInputData: (data: any) => void;
  resetVisualizer: () => void;
  stepForward: () => void;
  stepBackward: () => void;
}
```

### Local State (per component)
- Tab selection (useState)
- Tooltip visibility (useState)
- Modal open/close (useState)
- Input field values (useState + useDebounce)

### No Global Persistence
No localStorage, no cookies. All state resets on page navigation. This is intentional for simplicity.

---

## 13. CONTENT & LEARNING FLOW

### Content Structure Per Topic
```typescript
// lib/content/[topic].ts

export const topicContent = {
  title: string;
  shortDescription: string;    // 1 line for topic grid
  description: string;         // 2-3 para intro
  keyPoints: string[];         // Bullet list of important concepts
  applications: string[];      // Real-world uses
  complexity: ComplexityEntry[];
  pseudocode: string;
  implementations: {
    javascript: string;
    python: string;
    java: string;
    cpp: string;
  };
  quiz: QuizQuestion[];
  relatedTopics: string[];     // Links to related pages
}
```

### Learning Flow Per Page
1. User lands on topic page
2. Sees pre-loaded default visualization (default input, paused)
3. Can hit Play to see default demo OR enter custom input
4. Below visualizer: Theory tab (default open)
5. Can switch to Pseudocode tab → Code tab → Complexity → Quiz
6. Quiz at end reinforces learning

### Navigation Structure (Sidebar)
```
📁 Data Structures
  ├── Arrays
  ├── Linked Lists
  │   ├── Singly
  │   ├── Doubly
  │   └── Circular
  ├── Stack
  ├── Queue
  │   ├── Simple
  │   ├── Circular
  │   ├── Priority
  │   └── Deque
  ├── Hashing
  └── Trees
      ├── Binary Tree
      ├── BST
      ├── AVL Tree
      ├── Red-Black Tree
      ├── Heap
      ├── Trie
      ├── Segment Tree
      └── Fenwick Tree

📁 Algorithms
  ├── Sorting
  │   ├── Bubble Sort
  │   ├── Selection Sort
  │   ├── Insertion Sort
  │   ├── Merge Sort
  │   ├── Quick Sort
  │   ├── Heap Sort
  │   ├── Counting Sort
  │   ├── Radix Sort
  │   └── Shell Sort
  ├── Searching
  │   ├── Linear Search
  │   ├── Binary Search
  │   └── Jump Search
  ├── Graph Algorithms
  │   ├── BFS
  │   ├── DFS
  │   ├── Dijkstra
  │   ├── Bellman-Ford
  │   ├── Floyd-Warshall
  │   ├── Kruskal's MST
  │   ├── Prim's MST
  │   ├── Topological Sort
  │   └── Tarjan's SCC
  ├── Dynamic Programming
  │   ├── Fibonacci
  │   ├── 0/1 Knapsack
  │   ├── LCS
  │   ├── LIS
  │   ├── Coin Change
  │   ├── Matrix Chain
  │   └── Edit Distance
  ├── Backtracking
  │   ├── N-Queens
  │   ├── Sudoku Solver
  │   └── Rat in a Maze
  ├── Greedy
  │   ├── Activity Selection
  │   ├── Huffman Coding
  │   └── Fractional Knapsack
  └── String Algorithms
      ├── KMP
      ├── Rabin-Karp
      └── Z-Algorithm

📁 Comparisons
  └── Compare Algorithms
```

---

## 14. PERFORMANCE REQUIREMENTS

| Metric | Target |
|---|---|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Lighthouse Score | > 90 |
| Bundle size (initial JS) | < 150KB gzipped |
| D3 animation frame rate | 60fps |

### Optimization Strategies
- Dynamic import all D3 visualizer components (`next/dynamic` with ssr: false)
- D3.js imported only in client components
- Framer Motion tree-shaken (import specific components)
- All algorithm step generators run synchronously in Web Worker (for large inputs)
- SVG elements recycled with D3 data join (no unnecessary DOM creation)
- React.memo on all visualizer components
- useMemo for step generation (only re-run on input change)

---

## 15. ACCESSIBILITY

- All interactive elements keyboard focusable
- Keyboard shortcuts: Space (play/pause), ← → (step), R (reset)
- Color not the only differentiator — shapes/patterns for colorblind users
- ARIA labels on all SVG elements
- Screen reader description of current step (aria-live region)
- Sufficient color contrast (WCAG AA minimum)
- Reduced motion support (`prefers-reduced-motion` — disable animations, show final state)
- Focus trap in modals

---

## 16. PHASE-WISE ROADMAP

### Phase 1 — Foundation (Week 1-2)
- [ ] Next.js 14 project setup with TypeScript + Tailwind
- [ ] Design system: CSS variables, color palette, typography
- [ ] Layout: sidebar + topbar + content area
- [ ] Home page
- [ ] Zustand store + useVisualizer hook
- [ ] ControlBar component
- [ ] Array visualizer (D3 bars)
- [ ] Bubble Sort + Insertion Sort (with steps)

### Phase 2 — Sorting Complete (Week 3)
- [ ] All 9 sorting algorithms with step generators
- [ ] Merge Sort split-merge visual
- [ ] Quick Sort partition visual
- [ ] Sort comparison page
- [ ] Speed slider, array size slider
- [ ] Comparison counter + swap counter

### Phase 3 — Linear Data Structures (Week 4)
- [ ] Linked List visualizer (singly, doubly, circular)
- [ ] Stack visualizer + applications
- [ ] Queue visualizer (simple + circular)
- [ ] Priority Queue (heap-based)

### Phase 4 — Trees (Week 5-6)
- [ ] Binary Tree + BST (D3 hierarchy)
- [ ] AVL with rotations
- [ ] Heap (dual view)
- [ ] Trie
- [ ] Segment Tree + Fenwick Tree

### Phase 5 — Graphs (Week 7)
- [ ] Graph builder (D3 force-directed)
- [ ] BFS + DFS
- [ ] Dijkstra + Bellman-Ford
- [ ] MST (Kruskal + Prim)
- [ ] Topological Sort + Tarjan's

### Phase 6 — Advanced Algorithms (Week 8-9)
- [ ] DP visualizations (table fill animations)
- [ ] Backtracking (N-Queens, Sudoku)
- [ ] Greedy algorithms
- [ ] String algorithms

### Phase 7 — Polish (Week 10)
- [ ] All theory content written
- [ ] All 4 language implementations
- [ ] Quiz sections
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Accessibility audit
- [ ] SEO meta tags
- [ ] Deploy to Vercel

---

## 17. FILE-BY-FILE IMPLEMENTATION GUIDE

### Priority Order for Development

**Day 1:**
1. `npx create-next-app@latest dsa-visualizer --typescript --tailwind --app`
2. Install: `d3 framer-motion zustand immer lucide-react clsx tailwind-merge nanoid`
3. Setup `globals.css` with all CSS variables
4. Setup `tailwind.config.ts` with custom colors referencing CSS vars
5. Create `lib/types/algorithm.ts` — all TypeScript types

**Day 2:**
6. `components/layout/Sidebar.tsx` — static nav structure
7. `app/(visualizer)/layout.tsx` — shell layout
8. `components/visualizer/ControlBar.tsx`
9. `lib/store/visualizerStore.ts`
10. `lib/hooks/useVisualizer.ts`

**Day 3:**
11. `lib/algorithms/sorting/bubbleSort.ts` — step generator
12. `components/d3/ArrayViz.tsx` — D3 bar chart with color states
13. `app/(visualizer)/sorting/bubble/page.tsx` — wire everything together
14. Test end-to-end: input → steps → animation → controls

**Day 4-5:** Remaining sort algorithms + sort pages

**Day 6+:** Follow phase roadmap above

---

### Key Implementation Notes

**D3 + React Integration:**
Always use `useRef` for the SVG container. Run all D3 code inside `useEffect`. Depend on `[steps, currentStepIndex]`. Clear previous D3 state at top of effect. Never let React and D3 both control the same DOM elements.

**Step Generator Philosophy:**
Every algorithm function takes raw input and returns `AlgorithmStep[]`. It is PURE — no side effects, no state. The hook consumes steps, the D3 component renders based on current step. Clean separation.

**Responsive SVG:**
Use `viewBox` not fixed width/height. Add a ResizeObserver to update the SVG dimensions. D3 scales should re-compute on resize.

**Mobile:**
Sidebar becomes a slide-over drawer on < 768px. ControlBar stacks vertically on < 480px. Canvas scrollable horizontally for large graphs.

---

*PRD Version 1.0 | DSA Visualizer Platform | Frontend-Only | Next.js 14 + D3.js*
*Total Topics: ~60+ | Total Algorithms: ~40+ | Total Pages: ~55+*