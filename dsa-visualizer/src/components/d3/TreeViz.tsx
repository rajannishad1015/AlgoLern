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
      const isDark = document.documentElement.classList.contains('dark');
      svg.attr("width", width).attr("height", height);
      
      let g = svg.select<SVGGElement>("g.main-group");
      if (g.empty()) {
        g = svg.append("g").attr("class", "main-group");
      }
      g.attr("transform", `translate(${margin.left},${margin.top})`);
        
      // --- DEFINITIONS FOR GLOW & GRADIENTS ---
      let defs = svg.select<SVGDefsElement>("defs");
      if (defs.empty()) defs = svg.append("defs");

      // Glow Filter
      let filter = defs.select<SVGFilterElement>("#node-glow");
      if (filter.empty()) {
        filter = defs.append("filter").attr("id", "node-glow").attr("x", "-30%").attr("y", "-30%").attr("width", "160%").attr("height", "160%");
        filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "blur");
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "blur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");
      }

      const makeGrad = (id: string, c1: string, c2: string) => {
        let grad = defs.select<SVGLinearGradientElement>(`#${id}`);
        if (grad.empty()) {
          grad = defs.append('linearGradient').attr('id', id).attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '100%');
          grad.append('stop').attr('offset', '0%').attr('stop-color', c1);
          grad.append('stop').attr('offset', '100%').attr('stop-color', c2);
        } else {
          grad.select('stop:first-child').attr('stop-color', c1);
          grad.select('stop:last-child').attr('stop-color', c2);
        }
      };

      makeGrad("grad-dark", "#1e293b", "#0f172a");
      makeGrad("grad-light", "#ffffff", "#f1f5f9");
      makeGrad("grad-visit", "#fdba74", "#ea6d0a"); // Orange
      makeGrad("grad-insert", "#d4ff7a", "#a8d43a"); // Lime
      makeGrad("grad-done", "#4ade80", "#16a34a"); // Emerald
      makeGrad("grad-path", "#a5b4fc", "#6366f1"); // Indigo

      // Drop Shadow Filter
      if (defs.select('#tree-shadow').empty()) {
        const sh = defs.append('filter').attr('id', 'tree-shadow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
        sh.append('feDropShadow').attr('dx', 0).attr('dy', 4).attr('stdDeviation', 6).attr('flood-color', 'rgba(0,0,0,0.3)');
      }

      if (!rawTree) {
         g.selectAll("*").remove();
         g.append("text")
          .attr("class", "empty-msg")
          .attr("x", (width - margin.left - margin.right)/2)
          .attr("y", (height - margin.top - margin.bottom)/2)
          .attr("text-anchor", "middle")
          .attr("fill", isDark ? "#475569" : "#94a3b8")
          .style("font-family", "var(--font-geist-mono)")
          .style("font-size", "15px")
          .style("font-weight", "500")
          .text("Tree is empty.");
         return;
      }
      
      g.selectAll(".empty-msg").remove();

      const d3Data = convertToD3Hierarchy(rawTree);
      if (!d3Data) return;

      const root = d3.hierarchy(d3Data);
      
      // Calculate Tree layout to fit container width/height
      const treeLayout = d3.tree()
        .size([width - margin.left - margin.right, height - margin.top - margin.bottom]);
        
      treeLayout(root);

      // Filter out phantom nodes (used only for spacing)
      const nodes = root.descendants().filter((d: any) => !d.data.isPhantom);
      const links = root.links().filter((d: any) => !d.target.data.isPhantom);

      // --- LINKS JOIN ---
      const linkElements = g.selectAll<SVGPathElement, d3.HierarchyLink<any>>('path.link')
        .data(links, (d: any) => `${d.source.data.id}-${d.target.data.id}`);

      // Custom link generator for smoother, curvier lines
      const linkGenerator = d3.linkVertical<any, any>()
        .x((d: any) => d.x as number)
        .y((d: any) => d.y as number);

      linkElements.enter()
        .append('path')
        .attr('class', 'link')
        .attr('fill', 'none')
        .attr('stroke', isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)')
        .attr('stroke-width', 2)
        .attr('d', (d: any) => {
            const o = { x: d.source.x, y: d.source.y };
            return linkGenerator({ source: o, target: o } as any);
        })
        .style("opacity", 0)
        .merge(linkElements as any)
        .transition()
        .duration(600)
        .ease(d3.easeBackOut.overshoot(1) as any)
        .style("opacity", 1)
        .attr('stroke', (d: any) => {
            const isLeft = d.target.data === d.source.data.left;
            const edgeId = isLeft ? `${d.source.data.id}-left` : `${d.source.data.id}-right`;
            
            if (currentStepData?.edgeIds?.includes(edgeId)) {
                 if (currentStepData.type === 'visit') return '#fb923c'; // Orange
                 if (currentStepData.type === 'done') return '#10b981'; // Emerald
                 if (currentStepData.type === 'path') return '#818cf8'; // Indigo
                 return '#cbff5e'; // Lime for insert
            }
            return isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
        })
        .attr('stroke-width', (d: any) => {
             const isLeft = d.target.data === d.source.data.left;
             const edgeId = isLeft ? `${d.source.data.id}-left` : `${d.source.data.id}-right`;
             return currentStepData?.edgeIds?.includes(edgeId) ? 4 : 2;
        })
        .style('filter', (d: any) => {
             const isLeft = d.target.data === d.source.data.left;
             const edgeId = isLeft ? `${d.source.data.id}-left` : `${d.source.data.id}-right`;
             return currentStepData?.edgeIds?.includes(edgeId) ? 'url(#node-glow)' : 'none';
        })
        .attr('d', linkGenerator as any);

      linkElements.exit()
        .transition()
        .duration(400)
        .ease(d3.easeBackIn.overshoot(1) as any)
        .style("opacity", 0)
        .attr('d', (d: any) => {
             const o = { x: d.source.x, y: d.source.y };
             return linkGenerator({ source: o, target: o } as any);
        })
        .remove();

      // --- NODES JOIN ---
      const nodeElements = g.selectAll<SVGGElement, d3.HierarchyNode<any>>('g.tree-node')
        .data(nodes, (d: any) => d.data.id);
        
      const nodeEnter = nodeElements.enter()
        .append('g')
        .attr('class', 'tree-node')
        .attr('cursor', 'pointer')
        // Start nodes EXACTLY at their parent's position for a true "pop out" effect
        .attr('transform', (d: any) => d.parent 
            ? `translate(${d.parent.x},${d.parent.y})` 
            : `translate(${d.x},${d.y - 40})`)
        .style("opacity", 0);

      // Circle Base
      nodeEnter.append('circle')
        .attr('class', 'bg-circle')
        .attr('r', 0) // Start with 0 radius for grow animation
        .attr('fill', isDark ? 'url(#grad-dark)' : 'url(#grad-light)')
        .attr('stroke', isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)')
        .attr('stroke-width', 2)
        .attr('filter', 'url(#tree-shadow)'); // Premium shadow

      // Inner Ring
      nodeEnter.append('circle')
        .attr('class', 'inner-ring')
        .attr('r', 0)
        .attr('fill', 'transparent')
        .attr('stroke', isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)')
        .attr('stroke-width', 1.5)
        .style('pointer-events', 'none');

      // Value text
      nodeEnter.append('text')
        .attr('dy', '0.32em')
        .attr('text-anchor', 'middle')
        .attr('fill', isDark ? '#f8fafc' : '#0f172a')
        .style('font-family', 'var(--font-geist-mono)')
        .style('font-weight', '700')
        .style('font-size', '0px')
        .style('pointer-events', 'none')
        .style('letter-spacing', '-0.5px')
        .text((d: any) => d.data.value);

      const nodeMerge = nodeEnter.merge(nodeElements as any);
      
      nodeMerge.transition()
        .duration(600) // Synchronized with links
        .ease(d3.easeBackOut.overshoot(1) as any) // Exact same bouncy easing as links
        .style("opacity", 1)
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);

      nodeMerge.select('circle.bg-circle')
        .transition()
        .duration(500)
        .ease(d3.easeBackOut.overshoot(1.5) as any)
        .attr('r', (d: any) => currentStepData?.nodeIds?.includes(d.data.id) ? 26 : 22)
        .attr('fill', (d: any) => {
             if (currentStepData?.nodeIds?.includes(d.data.id)) {
                 if (currentStepData.type === 'visit') return 'url(#grad-visit)';
                 if (currentStepData.type === 'insert') return 'url(#grad-insert)';
                 if (currentStepData.type === 'done') return 'url(#grad-done)';
                 if (currentStepData.type === 'path') return 'url(#grad-path)';
                 return 'url(#grad-insert)';
             }
             return isDark ? 'url(#grad-dark)' : 'url(#grad-light)';
        })
        .attr('stroke', (d: any) => {
             if (currentStepData?.nodeIds?.includes(d.data.id)) return 'rgba(255,255,255,0.6)';
             return isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
        });

      nodeMerge.select('circle.inner-ring')
        .transition()
        .duration(400)
        .attr('r', 18);

      nodeMerge.select('text')
        .transition()
        .duration(400)
        .style('font-size', '14px')
        .attr('fill', (d: any) => {
            return currentStepData?.nodeIds?.includes(d.data.id) 
              ? (currentStepData.type === 'visit' || currentStepData.type === 'done' || currentStepData.type === 'insert' ? '#111827' : '#fff')
              : isDark ? '#f8fafc' : '#0f172a';
        });

      nodeElements.exit()
        .transition()
        .duration(400)
        .ease(d3.easeBackIn.overshoot(1) as any)
        .style("opacity", 0)
        // Shrink node as it exits back into parent
        .attr("transform", (d: any) => d.parent ? `translate(${d.parent.x},${d.parent.y}) scale(0.5)` : `translate(${d.x},${d.y + 40}) scale(0.5)`)
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
      className="w-full h-full relative flex bg-transparent overflow-hidden"
    >
      <svg ref={svgRef} className="w-full h-full block" />
    </div>
  );
}
