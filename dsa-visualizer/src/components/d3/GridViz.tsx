"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AlgorithmStep } from '@/lib/types/algorithm';

interface GridVizProps {
  currentStepData: AlgorithmStep | undefined;
  type: 'dp-1d' | 'chessboard'; // Handles either a 1D Array grid or 2D Chessboard
  size: number;
}

export function GridViz({ currentStepData, type, size }: GridVizProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    let width = containerRef.current.clientWidth;
    let height = containerRef.current.clientHeight || 500;

    const svg = d3.select(svgRef.current);

    const drawChart = () => {
      svg.selectAll("*").remove();
      svg.attr("width", width).attr("height", height);

      const g = svg.append("g");

      if (type === 'dp-1d') {
          // DP 1D Array (Fibonacci)
          const data = currentStepData?.values?.dpArray || Array(size).fill(null);
          const cellWidth = Math.min(60, (width - 40) / size);
          const cellHeight = 60;
          
          const startX = (width - (size * cellWidth)) / 2;
          const startY = height / 2 - cellHeight / 2;

          const cells = g.selectAll("g.cell")
             .data(data);

          const cellGroup = cells.enter()
             .append("g")
             .attr("class", "cell")
             .attr("transform", (_d: any, i: number) => `translate(${startX + i * cellWidth}, ${startY})`);

          cellGroup.append("rect")
             .attr("width", cellWidth)
             .attr("height", cellHeight)
             .attr("fill", (d: any, i: number) => {
                 const idStr = String(i);
                 if (currentStepData?.type === 'highlight' && currentStepData.nodeIds?.includes(idStr)) return 'var(--color-viz-comparing)';
                 if (currentStepData?.type === 'update' && currentStepData.nodeIds?.includes(idStr)) return 'var(--color-viz-path)';
                 if (currentStepData?.type === 'visit' && currentStepData.nodeIds?.includes(idStr)) return 'var(--color-accent-primary)';
                 if (currentStepData?.type === 'done' && currentStepData.nodeIds?.includes(idStr)) return 'var(--color-viz-sorted)'; // Cache HIT
                 return d !== null ? 'var(--color-bg-hover)' : 'var(--color-bg-secondary)';
             })
             .attr("stroke", "var(--color-border)")
             .attr("stroke-width", 2);

          // Value inside cell
          cellGroup.append("text")
             .attr("x", cellWidth / 2)
             .attr("y", cellHeight / 2)
             .attr("dy", "0.35em")
             .attr("text-anchor", "middle")
             .attr("fill", "var(--color-text-primary)")
             .attr("font-family", "var(--font-geist-mono)")
             .attr("font-size", "16px")
             .attr("font-weight", "bold")
             .text((d: any) => d !== null ? d : "");

          // Index below cell
          cellGroup.append("text")
             .attr("x", cellWidth / 2)
             .attr("y", cellHeight + 20)
             .attr("text-anchor", "middle")
             .attr("fill", "var(--color-text-muted)")
             .attr("font-family", "var(--font-geist-mono)")
             .attr("font-size", "12px")
             .text((_d: any, i: number) => i);
             
      } else if (type === 'chessboard') {
          // N-Queens Chessboard layout
          const board = currentStepData?.values?.board || Array(size).fill(Array(size).fill(0));
          const testRow = currentStepData?.values?.rowIdx;
          const testCol = currentStepData?.values?.testCol;
          const conflict = currentStepData?.values?.conflictingPos; // {r, c}
          
          const maxBoardSize = Math.min(width - 40, height - 40);
          const cellSize = maxBoardSize / size;
          
          const startX = (width - maxBoardSize) / 2;
          const startY = (height - maxBoardSize) / 2;

          // Create a flat array for D3 to easily bind to cells
          const flatBoard = board.flatMap((row: number[], rIdx: number) => 
               row.map((val, cIdx) => ({ r: rIdx, c: cIdx, val }))
          );

          const cells = g.selectAll("g.square")
            .data(flatBoard, (d: any) => `${d.r}-${d.c}`);

          const cellGroup = cells.enter()
            .append("g")
            .attr("class", "square")
            .attr("transform", (d: any) => `translate(${startX + d.c * cellSize}, ${startY + d.r * cellSize})`);

          // Draw squares
          cellGroup.append("rect")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("fill", (d: any) => {
                const isBlack = (d.r + d.c) % 2 !== 0; // Standard chess alternating colors
                
                // Highlights
                if (testRow !== null && testCol !== null && testRow === d.r && testCol === d.c) {
                    if (currentStepData?.type === 'highlight') return 'var(--color-viz-swapping)'; // Conflict warning! RED
                    if (currentStepData?.type === 'visit') return 'var(--color-viz-comparing)'; // Testing... YELLOW
                    if (currentStepData?.type === 'delete') return 'var(--color-viz-swapping)'; // BACKTRACK RED
                }
                if (currentStepData?.type === 'insert' && testRow === d.r && testCol === d.c) return 'var(--color-viz-path)'; // Placed.
                if (conflict && conflict.r === d.r && conflict.c === d.c) return 'var(--color-viz-swapping)'; // Attacking queen highlight
                
                return isBlack ? 'var(--color-bg-hover)' : 'var(--color-bg-card)';
            })
            .attr("stroke", "var(--color-border)")
            .attr("stroke-width", 1);

          // Draw Queens
          cellGroup.append("text")
            .attr("x", cellSize / 2)
            .attr("y", cellSize / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .attr("font-size", `${cellSize * 0.6}px`)
            .text((d: any) => d.val === 1 ? "♕" : "");
            
          // Helper: Highlight active row being processed
          if (testRow !== null && testRow < size) {
               g.append("rect")
                 .attr("width", maxBoardSize)
                 .attr("height", cellSize)
                 .attr("x", startX)
                 .attr("y", startY + testRow * cellSize)
                 .attr("fill", "transparent")
                 .attr("stroke", "var(--color-accent-primary)")
                 .attr("stroke-width", 3)
                 .attr("stroke-dasharray", "8,4")
                 .attr("pointer-events", "none");
          }
      }

    };

    drawChart();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = entry.contentRect.width;
        height = entry.contentRect.height;
        drawChart();
      }
    });

    observer.observe(containerRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [currentStepData, size, type]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[500px] relative flex bg-bg-card rounded-lg border border-border overflow-hidden"
    >
      <svg ref={svgRef} className="w-full h-full block" />
    </div>
  );
}
