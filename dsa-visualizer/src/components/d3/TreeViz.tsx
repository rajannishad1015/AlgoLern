"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AlgorithmStep, TreeNode } from '@/lib/types/algorithm';

interface TreeVizProps {
  currentStepData: AlgorithmStep | undefined;
}

// Convert our TreeNode format into a format d3.hierarchy loves
function convertToD3Hierarchy(node: TreeNode | null): any {
  if (!node) return null;
  const children = [];
  
  // We explicitly add null children to balance the D3 tree visual beautifully, 
  // so a single right child doesn't shift to the center.
  if (node.left || node.right) {
      if (node.left) children.push(convertToD3Hierarchy(node.left));
      else children.push({ id: `phantom-l-${node.id}`, isPhantom: true });
      
      if (node.right) children.push(convertToD3Hierarchy(node.right));
      else children.push({ id: `phantom-r-${node.id}`, isPhantom: true });
  }

  return {
    ...node,
    children: children.length > 0 ? children : undefined,
  };
}

export function TreeViz({ currentStepData }: TreeVizProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 500;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    
    const svg = d3.select(svgRef.current);
    
    // We get the tree from values.tree
    const rawTree: TreeNode | null = currentStepData?.values?.tree;

    const drawChart = () => {
      svg.selectAll("*").remove();
      svg.attr("width", width).attr("height", height);
      
      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
        
      if (!rawTree) {
         g.append("text")
          .attr("x", width/2 - margin.left)
          .attr("y", height/2)
          .attr("text-anchor", "middle")
          .attr("fill", "var(--color-text-muted)")
          .text("Tree is empty.");
         return;
      }

      const d3Data = convertToD3Hierarchy(rawTree);
      if (!d3Data) return;

      const root = d3.hierarchy(d3Data);
      
      // Calculate Tree layout
      const treeLayout = d3.tree()
        .size([width - margin.left - margin.right, height - margin.top - margin.bottom]);
        
      treeLayout(root);

      // Filter out phantom nodes (used only for spacing)
      const nodes = root.descendants().filter((d: any) => !d.data.isPhantom);
      const links = root.links().filter((d: any) => !d.target.data.isPhantom);

      // Draw Edges (Links)
      g.selectAll('.link')
        .data(links, (d: any) => d.target.data.id)
        .join('path')
        .attr('class', 'link')
        .attr('fill', 'none')
        .attr('stroke', (d: any) => {
            // Check if this edge is active in currentStepData
            const isLeft = d.target.data === d.source.data.left;
            const edgeId = isLeft ? `${d.source.data.id}-left` : `${d.source.data.id}-right`;
            
            if (currentStepData?.edgeIds?.includes(edgeId)) {
                 return 'var(--color-viz-path)'; // Highlight path
            }
            return 'var(--color-border)';
        })
        .attr('stroke-width', (d: any) => {
             const isLeft = d.target.data === d.source.data.left;
             const edgeId = isLeft ? `${d.source.data.id}-left` : `${d.source.data.id}-right`;
             return currentStepData?.edgeIds?.includes(edgeId) ? 4 : 2;
        })
        .attr('d', d3.linkVertical<any, any>()
            .x((d: any) => d.x as number)
            .y((d: any) => d.y as number) as any
        );

      // Draw Nodes
      const nodeElements = g.selectAll('.tree-node')
        .data(nodes, (d: any) => d.data.id);
        
      const nodeEnter = nodeElements.enter()
        .append('g')
        .attr('class', 'tree-node')
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
        .style("opacity", 0);
        
      const mergeNodes = nodeEnter.merge(nodeElements as any);
      
      mergeNodes.transition()
        .duration(400)
        .style("opacity", 1)
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);

      // Circle
      mergeNodes.selectAll("circle").remove();
      mergeNodes.append('circle')
        .attr('r', 20)
        .attr('fill', (d: any) => {
             if (currentStepData?.nodeIds?.includes(d.data.id)) {
                 if (currentStepData.type === 'visit') return 'var(--color-viz-comparing)';
                 if (currentStepData.type === 'insert') return 'var(--color-viz-swapping)';
                 if (currentStepData.type === 'done') return 'var(--color-viz-sorted)';
                 if (currentStepData.type === 'path') return 'var(--color-viz-path)';
                 return 'var(--color-accent-primary)';
             }
             return 'var(--color-bg-secondary)';
        })
        .attr('stroke', 'var(--color-border)')
        .attr('stroke-width', 2);

      // Value text
      mergeNodes.selectAll("text").remove();
      mergeNodes.append('text')
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('fill', (d: any) => {
            return currentStepData?.nodeIds?.includes(d.data.id) ? '#fff' : 'var(--color-text-primary)';
        })
        .style('font-family', 'var(--font-geist-mono)')
        .style('font-weight', 'bold')
        .text((d: any) => d.data.value);

      nodeElements.exit()
        .transition()
        .duration(300)
        .style("opacity", 0)
        .remove();
    };

    drawChart();

    const observer = new ResizeObserver(() => {
        drawChart();
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
    
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
