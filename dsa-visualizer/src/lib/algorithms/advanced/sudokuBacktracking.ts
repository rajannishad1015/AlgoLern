import { AlgorithmStep } from '@/lib/types/algorithm';

export type Board = (number | 0)[][];

export function generateSudokuSteps(initialBoard: Board): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const board: Board = initialBoard.map(row => [...row]);

  steps.push({
    id: steps.length,
    type: 'highlight',
    indices: [],
    values: { board: board.map(r => [...r]), cell: null, num: null, action: 'start' },
    description: `Starting Sudoku Backtracking. Find each empty cell (0), try digits 1–9, backtrack if stuck.`,
  });

  function isValid(b: Board, row: number, col: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (b[row][i] === num || b[i][col] === num) return false;
    }
    const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++)
      for (let c = bc; c < bc + 3; c++)
        if (b[r][c] === num) return false;
    return true;
  }

  function solve(b: Board): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (b[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(b, row, col, num)) {
              b[row][col] = num;
              steps.push({
                id: steps.length,
                type: 'visit',
                indices: [row * 9 + col],
                values: { board: b.map(r => [...r]), cell: [row, col], num, action: 'place' },
                description: `Place ${num} at (${row + 1},${col + 1}). Valid: no conflict in row, column, or 3×3 box.`,
              });
              if (solve(b)) return true;
              b[row][col] = 0;
              steps.push({
                id: steps.length,
                type: 'compare',
                indices: [row * 9 + col],
                values: { board: b.map(r => [...r]), cell: [row, col], num, action: 'backtrack' },
                description: `Backtrack! No valid number works at (${row + 1},${col + 1}) after trying ${num}. Erase and go back.`,
              });
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  solve(board);

  steps.push({
    id: steps.length,
    type: 'done',
    indices: [],
    values: { board: board.map(r => [...r]), cell: null, num: null, action: 'done' },
    description: `Sudoku solved! Backtracking explored all valid paths to find the unique solution.`,
  });

  return steps;
}

export function generateDefaultBoard(): Board {
  // Classic easy Sudoku puzzle
  return [
    [5,3,0, 0,7,0, 0,0,0],
    [6,0,0, 1,9,5, 0,0,0],
    [0,9,8, 0,0,0, 0,6,0],

    [8,0,0, 0,6,0, 0,0,3],
    [4,0,0, 8,0,3, 0,0,1],
    [7,0,0, 0,2,0, 0,0,6],

    [0,6,0, 0,0,0, 2,8,0],
    [0,0,0, 4,1,9, 0,0,5],
    [0,0,0, 0,8,0, 0,7,9],
  ];
}
