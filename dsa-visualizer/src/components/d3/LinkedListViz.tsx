"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AlgorithmStep } from '@/lib/types/algorithm';

interface LinkedListVizProps {
  currentStepData: AlgorithmStep | undefined;
}

export function LinkedListViz({ currentStepData }: LinkedListVizProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    let width = containerRef.current.clientWidth;
    let height = containerRef.current.clientHeight || 400;

    const svg = d3.select(svgRef.current);

    const listData: number[] = currentStepData?.values?.list || [];
    const pendingNewNode: number | undefined = currentStepData?.values?.newNode;

    const drawChart = () => {
      svg.selectAll("*").remove();
      svg.attr("width", width).attr("height", height);

      // Define Arrowhead Marker
      svg.append('defs').append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 8)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', 'var(--color-text-secondary)');

      const g = svg.append("g");

      const nodeWidth = 60;
      const nodeHeight = 40;
      const pointerWidth = 20; // Internal 'next' box width within the node
      const gap = 50; // Gap between nodes
      
      const startX = 50;
      const startY = height / 2 - nodeHeight / 2;

      // Draw Head Pointer
      if (listData.length > 0) {
          g.append("text")
             .attr("x", startX - 40)
             .attr("y", startY + nodeHeight / 2)
             .attr("dy", "0.35em")
             .text("Head")
             .attr("fill", "var(--color-text-secondary)")
             .attr("font-family", "var(--font-geist-mono)");
             
          g.append("line")
             .attr("x1", startX - 5)
             .attr("y1", startY + nodeHeight / 2)
             .attr("x2", startX - 2)
             .attr("y2", startY + nodeHeight / 2)
             .attr("stroke", "var(--color-text-secondary)")
             .attr("stroke-width", 2)
             .attr("marker-end", "url(#arrow)");
      } else {
           g.append("text")
             .attr("x", startX)
             .attr("y", startY + nodeHeight / 2)
             .attr("dy", "0.35em")
             .text("Head → NULL")
             .attr("fill", "var(--color-text-secondary)")
             .attr("font-family", "var(--font-geist-mono)");
      }

      // Group elements with D3 data binding
      const nodes = g.selectAll("g.ll-node")
        .data(listData, (d: any, i: number) => `node-${i}-${d}`);

      const nodeEnter = nodes.enter()
        .append("g")
        .attr("class", "ll-node")
        .attr("transform", (d, i) => `translate(${startX + i * (nodeWidth + gap)}, ${startY - 40})`) // Initial drop-in position
        .style("opacity", 0);

      // Data part of Node
      nodeEnter.append("rect")
        .attr("width", nodeWidth - pointerWidth)
        .attr("height", nodeHeight)
        .attr("fill", (d, i) => {
             if (currentStepData?.type === 'insert' && currentStepData.indices?.includes(i)) return 'var(--color-viz-path)';
             if (currentStepData?.type === 'visit' && currentStepData.indices?.includes(i)) return 'var(--color-viz-comparing)';
             if (currentStepData?.type === 'delete' && currentStepData.indices?.includes(i)) return 'var(--color-viz-swapping)';
             return 'var(--color-viz-default)';
        })
        .attr("stroke", "var(--color-border)")
        .attr("stroke-width", 2);

      // Pointer part of Node
      nodeEnter.append("rect")
        .attr("x", nodeWidth - pointerWidth)
        .attr("width", pointerWidth)
        .attr("height", nodeHeight)
        .attr("fill", "var(--color-bg-secondary)")
        .attr("stroke", "var(--color-border)")
        .attr("stroke-width", 2);

      // Text value
      nodeEnter.append("text")
        .attr("x", (nodeWidth - pointerWidth) / 2)
        .attr("y", nodeHeight / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(d => d)
        .attr("fill", "var(--color-text-primary)")
        .attr("font-size", "14px")
        .attr("font-family", "var(--font-geist-mono)")
        .attr("font-weight", "bold");
        
      // Dot in pointer box
      nodeEnter.append("circle")
        .attr("cx", nodeWidth - pointerWidth / 2)
        .attr("cy", nodeHeight / 2)
        .attr("r", 3)
        .attr("fill", "var(--color-text-primary)");

      // Connecting Arrows
      nodeEnter.each(function(d, i) {
          if (i < listData.length - 1) { // Not the last node
              d3.select(this).append("line")
                 .attr("class", "arrow-line")
                 .attr("x1", nodeWidth - pointerWidth / 2)
                 .attr("y1", nodeHeight / 2)
                 .attr("x2", nodeWidth + gap - 4) // End just before next node
                 .attr("y2", nodeHeight / 2)
                 .attr("stroke", "var(--color-text-primary)")
                 .attr("stroke-width", 2)
                 .attr("marker-end", "url(#arrow)");
          } else { // Last node points to NULL
              d3.select(this).append("text")
                 .attr("x", nodeWidth + gap / 2)
                 .attr("y", nodeHeight / 2)
                 .attr("dy", "0.35em")
                 .text("NULL")
                 .attr("fill", "var(--color-text-secondary)")
                 .attr("font-size", "12px")
                 .attr("font-family", "var(--font-geist-mono)")
                 .attr("opacity", 0)
                 .transition().duration(400)
                 .attr("opacity", 1);
                 
              d3.select(this).append("line")
                 .attr("class", "arrow-line")
                 .attr("x1", nodeWidth - pointerWidth / 2)
                 .attr("y1", nodeHeight / 2)
                 .attr("x2", nodeWidth + gap / 2 - 5) 
                 .attr("y2", nodeHeight / 2)
                 .attr("stroke", "var(--color-text-primary)")
                 .attr("stroke-width", 2)
                 .attr("marker-end", "url(#arrow)");
          }
      });

      const mergeNodes = nodeEnter.merge(nodes as any);
      
      mergeNodes.transition()
        .duration(400)
        .ease(d3.easeCubicOut)
        .style("opacity", 1)
        .attr("transform", (d, i) => `translate(${startX + i * (nodeWidth + gap)}, ${startY})`);

      // Update colors
      mergeNodes.select("rect:first-child")
        .transition()
        .duration(300)
        .attr("fill", (d, i) => {
             if (currentStepData?.type === 'insert' && currentStepData.indices?.includes(i)) return 'var(--color-viz-path)';
             if (currentStepData?.type === 'visit' && currentStepData.indices?.includes(i)) return 'var(--color-viz-comparing)';
             if (currentStepData?.type === 'delete' && currentStepData.indices?.includes(i)) return 'var(--color-viz-swapping)';
             return 'var(--color-viz-default)';
        });

      // Show pending new node hovering if it exists
      if (pendingNewNode !== undefined && currentStepData?.type === 'highlight' && listData.length >= 0) {
          const ghostG = g.append("g")
            .attr("transform", `translate(${startX + listData.length * (nodeWidth + gap)}, ${startY - 80})`);
            
          ghostG.append("rect")
            .attr("width", nodeWidth)
            .attr("height", nodeHeight)
            .attr("rx", 4)
            .attr("stroke-dasharray", "4")
            .attr("fill", "transparent")
            .attr("stroke", "var(--color-accent-primary)")
            .attr("stroke-width", 2);
            
          ghostG.append("text")
            .attr("x", nodeWidth / 2)
            .attr("y", nodeHeight / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .text(pendingNewNode)
            .attr("fill", "var(--color-accent-primary)")
            .attr("font-size", "14px")
            .attr("font-family", "var(--font-geist-mono)");
            
          ghostG.append("text")
            .attr("x", nodeWidth / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .text("Creating Node...")
            .attr("fill", "var(--color-text-muted)")
            .attr("font-size", "12px");
      }

      nodes.exit()
        .transition()
        .duration(400)
        .attr("transform", (d, i) => {
             // Drop out to bottom
             return `translate(${startX + i * (nodeWidth + gap)}, ${startY + 60})`;
        })
        .style("opacity", 0)
        .remove();

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
  }, [currentStepData]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[400px] relative flex bg-bg-card rounded-lg border border-border overflow-hidden overflow-x-auto"
    >
      <svg ref={svgRef} className="w-full h-full block min-w-[800px]" />
    </div>
  );
}
