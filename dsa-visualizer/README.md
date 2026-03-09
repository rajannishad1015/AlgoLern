# AlgoLens: Data Structure & Algorithm Visualizer 🚀

**AlgoLens** is a modern, highly interactive, and visually stunning web application designed to help students, developers, and educators understand complex Computer Science Data Structures and Algorithms through step-by-step mathematical visualization.

Built with performance and aesthetics in mind, this project serves as a showcase of utilizing deep React state management alongside D3.js data binding to create a deterministic, playback-controllable educational engine.

![AlgoLens Cover Image](https://via.placeholder.com/1200x600?text=AlgoLens+DSA+Visualizer)

## 🌟 Key Features

We have implemented an extensive library of visualizers, broken down into core computer science paradigms:

### 1. Sorting Algorithms

Visualize how arrays are manipulated and ordered in memory.

- **Bubble Sort**: Watching adjacent elements swap to "bubble" the largest to the top.
- **Insertion Sort**: Building a sorted subarray one element at a time.
- **Selection Sort**: Finding the global minimum and placing it at the front.
- **Quick Sort**: Divide and conquer using a pivot to partition arrays.
- **Merge Sort**: Splitting and merging arrays in a mathematically stable configuration.

### 2. Linear Data Structures

Understand foundational memory storage.

- **Stack (LIFO)**: Push and Pop operations visualized vertically.
- **Queue (FIFO)**: Enqueue and Dequeue operations mapped horizontally.
- **Linked Lists**: Node-and-pointer architecture with Head/Tail references.

### 3. Tree Structures

Navigate hierarchical data.

- **Binary Search Tree (BST)**: Insertion and search path visualizer using D3 tree layouts.
- **Tree Traversals**: DFS (Preorder, Inorder, Postorder) animations.

### 4. Graphs

Master adjacency and paths.

- **BFS & DFS**: Compare iterative Queue vs Stack traversals.
- **Dijkstra's Shortest Path**: Track cumulative distances across weighted edges with an active distance UI table.

### 5. Advanced Paradigms (DP & Backtracking)

Expose the "magic" underlying tough interview questions.

- **Fibonacci (Dynamic Programming)**: Visualizing Top-Down Memoization cache hits.
- **N-Queens (Backtracking)**: Placing queens on a generated chessboard recursively, detecting conflicts dynamically.

---

## 🛠️ Technology Stack

AlgoLens utilizes modern web technologies to achieve smooth frame rates and aesthetic interfaces:

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React server components)
- **Styling**: Vanilla CSS + [Tailwind CSS](https://tailwindcss.com/) for rapid component design, configured with a custom color palette (Glassmorphism, Dark Modes).
- **Visualization Engine**: [D3.js](https://d3js.org/) for mathematical, data-driven DOM manipulators ensuring stable chart layouts.
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) for global playback tracking (Play, Pause, Step-Forward, Step-Backward, Speed control).
- **Language**: TypeScript for absolute type safety traversing complex node/edge combinations.

---

## 🚀 Getting Started

Follow these steps to run AlgoLens locally on your machine.

### Prerequisites

- Node.js (v18.x or later)
- npm or yarn

### Installation Steps

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/yourusername/algo-lens.git
    cd algo-lens
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    ```

3.  **Run Development Server**

    ```bash
    npm run dev
    ```

4.  **View the Application**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Architecture & Engine Overview

The core mechanic of AlgoLens relies on a pattern called **Pre-computation Stepping**:

1.  Rather than using `setTimeout` interspersed within standard algorithm code, our engines run the _entire_ algorithm synchronously exactly once prior to visualization.
2.  During this execution, every state mutation (array swap, graph node visit, pointer movement) pushes a "snapshot object" (an `AlgorithmStep`) sequentially into an array.
3.  The React/Zustand UI is then hooked entirely to this array of steps. Pressing "Play" simply increments an index traversing the `steps` array, handing the slice of data off to D3 `useEffect` hooks.
4.  This allows instantaneous **Fast-Forwarding**, **Rewinding**, and **Speed Control** without tearing component state.

---

## 🌐 Deployment

The application is heavily optimized and strictly typed, ready for immediate deployment on platforms like [Vercel](https://vercel.com/) or Netlify.

```bash
# To generate a production build
npm run build

# To serve that build locally
npm run start
```

---

_Designed and Built by [Your Name] • Let's build a brighter visual future for CS education._
