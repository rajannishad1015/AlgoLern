"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AlgorithmStep } from '@/lib/types/algorithm';

interface StackQueueVizProps {
  currentStepData: AlgorithmStep | undefined;
  layout: 'vertical' | 'horizontal'; // vertical for Stack, horizontal for Queue
}

export function StackQueueViz({ currentStepData, layout }: StackQueueVizProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    let width = containerRef.current.clientWidth;
    let height = containerRef.current.clientHeight || 400;

    const svg = d3.select(svgRef.current);

    const renderData: number[] = currentStepData?.values?.array || [];

    const drawChart = () => {
      svg.selectAll("*").remove();
      
      svg.attr("width", width).attr("height", height);

      const g = svg.append("g");

      const boxSize = 60;
      const padding = 10;
      const totalElements = renderData.length;

      // Group elements with D3 data binding
      const nodes = g.selectAll("g.node")
        .data(renderData, (d: any, i: number) => `node-${layout}-${i}-${d}`); // Keys for smooth enter/exit

      const nodeEnter = nodes.enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", (d, i) => {
            if (layout === 'vertical') {
                // Stack pushes to the top logically, but visually building from bottom up is standard
                const startY = -boxSize; 
                const finalX = width / 2 - boxSize / 2;
                return `translate(${finalX}, ${startY})`;
            } else {
                // Queue pushes to the back (right)
                const startX = width + boxSize;
                const finalY = height / 2 - boxSize / 2;
                return `translate(${startX}, ${finalY})`;
            }
        });

      // Rectangle
      nodeEnter.append("rect")
        .attr("width", boxSize)
        .attr("height", boxSize)
        .attr("rx", 8)
        .attr("ry", 8)
        .attr("fill", (d, i) => {
             if (currentStepData?.type === 'insert' && currentStepData.indices?.includes(i)) {
                 return 'var(--color-viz-path)'; // Highlight new inserts
             }
             if (currentStepData?.type === 'delete' && currentStepData.indices?.includes(i)) {
                 return 'var(--color-viz-swapping)'; // Highlight deletes
             }
             return 'var(--color-viz-default)';
        })
        .attr("stroke", "var(--color-border)")
        .attr("stroke-width", 2);

      // Text value
      nodeEnter.append("text")
        .attr("x", boxSize / 2)
        .attr("y", boxSize / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(d => d)
        .attr("fill", "var(--color-text-primary)")
        .attr("font-size", "18px")
        .attr("font-family", "var(--font-geist-mono)")
        .attr("font-weight", "bold");

      // Merge and animate to final positions
      const mergeNodes = nodeEnter.merge(nodes as any);
      
      mergeNodes.transition()
        .duration(400)
        .ease(d3.easeCubicOut)
        .attr("transform", (d, i) => {
            if (layout === 'vertical') {
                // Building bottom-up. Index 0 is bottom.
                const totalHeight = totalElements * boxSize + (totalElements - 1) * padding;
                const topMargin = (height - totalHeight) / 2 + 40; // centered with offset
                
                // i=0 is bottom: Y is greatest. 
                // i=length-1 is top: Y is smallest.
                const invertedIndex = totalElements - 1 - i;
                const y = Math.max(0, height - 60 - invertedIndex * (boxSize + padding));
                const x = width / 2 - boxSize / 2;
                return `translate(${x}, ${y})`;
            } else {
                // Queue: index 0 is front (left), index N is back (right)
                const totalWidth = totalElements * boxSize + (totalElements - 1) * padding;
                const leftMargin = Math.max(40, (width - totalWidth) / 2);
                
                const x = leftMargin + i * (boxSize + padding);
                const y = height / 2 - boxSize / 2;
                return `translate(${x}, ${y})`;
            }
        });

      // Update colors on existing nodes in case type changed (e.g., highlighting for delete)
      mergeNodes.select("rect")
        .transition()
        .duration(300)
        .attr("fill", (d, i) => {
             if (currentStepData?.type === 'insert' && currentStepData.indices?.includes(i)) {
                 return 'var(--color-viz-path)'; 
             }
             if (currentStepData?.type === 'delete' && currentStepData.indices?.includes(i)) {
                 return 'var(--color-viz-swapping)'; 
             }
             return 'var(--color-viz-default)';
        });

      // Exiting nodes
      nodes.exit()
        .transition()
        .duration(400)
        .attr("transform", (d, i) => {
             if (layout === 'vertical') {
                 // Pop goes UP
                 const x = width / 2 - boxSize / 2;
                 return `translate(${x}, -${boxSize})`;
             } else {
                 // Dequeue goes LEFT
                 const y = height / 2 - boxSize / 2;
                 return `translate(-${boxSize}, ${y})`;
             }
        })
        .style("opacity", 0)
        .remove();

      // Add labels (Top/Bottom, Front/Rear)
      svg.selectAll(".pointers").remove();
      const pointerG = svg.append("g").attr("class", "pointers");
      
      if (totalElements > 0) {
          if (layout === 'vertical') {
              // Top pointer
              const topInvertedIndex = 0; // The last element is at the "top" mathematically
              const topY = height - 60 - totalElements * (boxSize + padding);
              pointerG.append("text")
                  .attr("x", width / 2 + boxSize / 2 + 20)
                  .attr("y", topY + boxSize + padding + boxSize/2)
                  .attr("dy", "0.35em")
                  .text("← Top")
                  .attr("fill", "var(--color-text-secondary)")
                  .attr("font-family", "var(--font-geist-mono)")
                  .style("opacity", 0)
                  .transition().duration(400).style("opacity", 1);
          } else {
              // Queue pointers
              const totalWidth = totalElements * boxSize + (totalElements - 1) * padding;
              const leftMargin = Math.max(40, (width - totalWidth) / 2);
              
              // Front
              pointerG.append("text")
                  .attr("x", leftMargin + boxSize / 2)
                  .attr("y", height / 2 + boxSize / 2 + 20)
                  .attr("text-anchor", "middle")
                  .text("↑ Front")
                  .attr("fill", "var(--color-text-secondary)")
                  .attr("font-family", "var(--font-geist-mono)");
                  
              // Rear
              pointerG.append("text")
                  .attr("x", leftMargin + (totalElements - 1) * (boxSize + padding) + boxSize / 2)
                  .attr("y", height / 2 - boxSize / 2 - 10)
                  .attr("text-anchor", "middle")
                  .text("Rear ↓")
                  .attr("fill", "var(--color-text-secondary)")
                  .attr("font-family", "var(--font-geist-mono)");
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
  }, [currentStepData, layout]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[400px] relative flex bg-bg-card rounded-lg border border-border overflow-hidden"
    >
      <svg ref={svgRef} className="w-full h-full block" />
    </div>
  );
}
