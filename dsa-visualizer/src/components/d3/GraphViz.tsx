"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AlgorithmStep, GraphNode, GraphEdge } from '@/lib/types/algorithm';

interface GraphVizProps {
  currentStepData: AlgorithmStep | undefined;
  width?: number;
  height?: number;
}

export function GraphViz({ currentStepData }: GraphVizProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    let width = containerRef.current.clientWidth;
    let height = containerRef.current.clientHeight || 500;

    const svg = d3.select(svgRef.current);
    
    const rawNodes: GraphNode[] = currentStepData?.values?.nodes || [];
    const rawEdges: GraphEdge[] = currentStepData?.values?.edges || [];

    const drawChart = () => {
      svg.selectAll("*").remove();

      // Configure SVG
      svg.attr("width", width).attr("height", height);

      // Define Marker for Directed Graphs (if used later)
      svg.append('defs').append('marker')
        .attr('id', 'graph-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 22) // Offset for circle radius (20) + stroke
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', 'var(--color-text-secondary)');

      // G elements for layering: edges below nodes
      const edgesG = svg.append("g").attr("class", "edges");
      const nodesG = svg.append("g").attr("class", "nodes");
      const weightsG = svg.append("g").attr("class", "weights");

      // We assume nodes already have relatively scaled static x/y percentages or coordinates if we want perfect identical layouts.
      // E.g. x: 50 means 50%. Let's map percent to actual width/height.
      // If no static coordinates, fall back to a quick static circle or random scatter which might look messy, so rawNodes SHOULD provide x/y 0-100 values.
      const mapX = (x?: number) => x !== undefined ? (x / 100) * width : 0;
      const mapY = (y?: number) => y !== undefined ? (y / 100) * height : 0;

      // Draw Edges
      const edgesData = edgesG.selectAll("line")
        .data(rawEdges, (d: any) => d.id);

      edgesData.enter()
        .append("line")
        .attr("stroke", (d) => {
             if (currentStepData?.edgeIds?.includes(d.id)) {
                 if (currentStepData.type === 'update') return 'var(--color-viz-path)'; // Dijkstra update
                 return 'var(--color-accent-primary)';
             }
             if (currentStepData?.type === 'done' && currentStepData.edgeIds?.includes(d.id)) {
                 // The final path
                 return 'var(--color-viz-path)';
             }
             return 'var(--color-border)';
        })
        .attr("stroke-width", (d) => {
             return currentStepData?.edgeIds?.includes(d.id) ? 4 : 2;
        })
        .attr("x1", d => {
             const n = rawNodes.find(n => n.id === d.source);
             return mapX(n?.x);
        })
        .attr("y1", d => {
             const n = rawNodes.find(n => n.id === d.source);
             return mapY(n?.y);
        })
        .attr("x2", d => {
             const n = rawNodes.find(n => n.id === d.target);
             return mapX(n?.x);
        })
        .attr("y2", d => {
             const n = rawNodes.find(n => n.id === d.target);
             return mapY(n?.y);
        })
        .attr("marker-end", d => d.isDirected ? "url(#graph-arrow)" : "");
        
      // Draw edge weights
      const hasWeights = rawEdges.some(e => e.weight !== undefined);
      if (hasWeights) {
          const weightsData = weightsG.selectAll("g")
             .data(rawEdges, (d: any) => d.id);
             
          const wEnter = weightsData.enter()
             .append("g")
             .attr("transform", d => {
                 const src = rawNodes.find(n => n.id === d.source);
                 const tgt = rawNodes.find(n => n.id === d.target);
                 const x = (mapX(src?.x) + mapX(tgt?.x)) / 2;
                 const y = (mapY(src?.y) + mapY(tgt?.y)) / 2;
                 return `translate(${x}, ${y - 10})`;
             });
             
          // Add background to weight text for readability over edges
          wEnter.append("rect")
            .attr("width", 24)
            .attr("height", 16)
            .attr("x", -12)
            .attr("y", -8)
            .attr("rx", 4)
            .attr("fill", "var(--color-bg-card)")
            .attr("stroke", "var(--color-border)")
            .attr("stroke-width", 1);
            
          wEnter.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("fill", "var(--color-text-secondary)")
            .attr("font-size", "12px")
            .attr("font-family", "var(--font-geist-mono)")
            .attr("font-weight", "bold")
            .text(d => d.weight || "");
      }

      // Draw Nodes
      const nodesData = nodesG.selectAll("g")
        .data(rawNodes, (d: any) => d.id);

      const nodesEnter = nodesData.enter()
        .append("g")
        .attr("transform", d => `translate(${mapX(d.x)}, ${mapY(d.y)})`);

      nodesEnter.append("circle")
        .attr("r", 20)
        .attr("fill", d => {
             if (currentStepData?.nodeIds?.includes(d.id)) {
                 if (currentStepData.type === 'visit') return 'var(--color-viz-comparing)'; // Processing
                 if (currentStepData.type === 'insert') return 'var(--color-accent-secondary)'; // Added to ds
                 if (currentStepData.type === 'update') return 'var(--color-viz-path)'; // Distance updated
                 if (currentStepData.type === 'done') return 'var(--color-viz-sorted)'; // Finished handling
                 return 'var(--color-accent-primary)'; // Highlighting
             }
             // For Dijkstra, maybe styling based on unvisited set would be nice later.
             return 'var(--color-bg-secondary)';
        })
        .attr("stroke", "var(--color-border)")
        .attr("stroke-width", 2)
        .transition()
        .duration(300);

      nodesEnter.append("text")
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("fill", d => currentStepData?.nodeIds?.includes(d.id) ? '#ffffff' : 'var(--color-text-primary)')
        .attr("font-family", "var(--font-geist-mono)")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text(d => d.label);

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
      className="w-full h-full min-h-[500px] relative flex bg-bg-card rounded-lg border border-border overflow-hidden"
    >
      <svg ref={svgRef} className="w-full h-full block" />
    </div>
  );
}
