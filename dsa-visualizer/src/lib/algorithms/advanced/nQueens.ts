import { AlgorithmStep } from '@/lib/types/algorithm';

// Creates an empty NxN board. 0 = empty, 1 = Queen
const createBoard = (n: number) => Array.from({ length: n }, () => Array(n).fill(0));
const copyBoard = (board: number[][]) => board.map(row => [...row]);

export function generateNQueensSteps(n: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const board = createBoard(n);
  
  steps.push({
    id: steps.length,
    type: 'highlight',
    values: { board: copyBoard(board), rowIdx: 0, conflictingPos: null },
    description: `Starting N-Queens Backtracking for a ${n}x${n} board. Initializing empty board.`,
  });

  function isSafe(board: number[][], row: number, col: number): { safe: boolean, conflictRow?: number, conflictCol?: number } {
    // Check column
    for (let i = 0; i < row; i++) {
      if (board[i][col] === 1) return { safe: false, conflictRow: i, conflictCol: col };
    }
    // Check upper left diagonal
    for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === 1) return { safe: false, conflictRow: i, conflictCol: j };
    }
    // Check upper right diagonal
    for (let i = row, j = col; i >= 0 && j < n; i--, j++) {
      if (board[i][j] === 1) return { safe: false, conflictRow: i, conflictCol: j };
    }
    return { safe: true };
  }

  function solve(row: number): boolean {
    if (row >= n) {
      steps.push({
        id: steps.length,
        type: 'done',
        values: { board: copyBoard(board), rowIdx: row, conflictingPos: null },
        description: `All ${n} Queens placed successfully! Found a valid arrangement.`,
      });
      return true; // We stop at the FIRST valid solution for this visualizer
    }

    for (let col = 0; col < n; col++) {
      steps.push({
          id: steps.length,
          type: 'visit',
          values: { board: copyBoard(board), rowIdx: row, testCol: col, conflictingPos: null },
          description: `Trying to place Queen at Row ${row}, Col ${col}. Checking safety...`,
      });

      const { safe, conflictRow, conflictCol } = isSafe(board, row, col);

      if (safe) {
        board[row][col] = 1; // Place queen
        steps.push({
            id: steps.length,
            type: 'insert',
            values: { board: copyBoard(board), rowIdx: row, testCol: col, conflictingPos: null },
            description: `Position (Row ${row}, Col ${col}) is safe. Queen placed. Moving to next row.`,
        });

        if (solve(row + 1)) return true;

        // BACKTRACK
        board[row][col] = 0; 
        steps.push({
            id: steps.length,
            type: 'delete',
            values: { board: copyBoard(board), rowIdx: row, testCol: col, conflictingPos: null },
            description: `Future rows led to a dead end. BACKTRACKING: Removing Queen from (Row ${row}, Col ${col}).`,
        });

      } else {
        steps.push({
            id: steps.length,
            type: 'highlight', // Conflict warning
            values: { board: copyBoard(board), rowIdx: row, testCol: col, conflictingPos: { r: conflictRow, c: conflictCol } },
            description: `CONFLICT: Position (Row ${row}, Col ${col}) is under attack from Queen at (Row ${conflictRow}, Col ${conflictCol}).`,
        });
      }
    }

    return false;
  }

  const success = solve(0);

  if (!success) {
      steps.push({
        id: steps.length,
        type: 'highlight',
        values: { board: copyBoard(board), rowIdx: null, conflictingPos: null },
        description: `No valid geometric solution exists for ${n} Queens on a ${n}x${n} board.`,
      });
  }

  return steps;
}
