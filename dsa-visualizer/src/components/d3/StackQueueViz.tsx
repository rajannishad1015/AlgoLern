"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from 'next-themes';
import { AlgorithmStep } from '@/lib/types/algorithm';

interface StackQueueVizProps {
  currentStepData: AlgorithmStep | undefined;
  layout: 'vertical' | 'horizontal'; // vertical for Stack, horizontal for Queue
}

const easeSnap = d3.easeBackOut.overshoot(1.2);

export function StackQueueViz({ currentStepData, layout }: StackQueueVizProps) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    let width = containerRef.current.clientWidth;
    let height = containerRef.current.clientHeight || 400;
    const isDark = resolvedTheme !== 'light';

    const svg = d3.select(svgRef.current);
    const renderData: number[] = currentStepData?.values?.array || [];

    const drawChart = () => {
      svg.attr("width", width).attr("height", height);

      // Persistent defs for gradients
      let defs = svg.select<SVGDefsElement>('defs');
      if (defs.empty()) defs = svg.append('defs');

      const makeGradient = (id: string, topColor: string, bottomColor: string) => {
        let grad = defs.select<SVGLinearGradientElement>(`#${id}`);
        if (grad.empty()) {
          grad = defs.append('linearGradient')
            .attr('id', id)
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '0%').attr('y2', '100%');
          grad.append('stop').attr('offset', '0%').attr('stop-color', topColor).attr('stop-opacity', 1);
          grad.append('stop').attr('offset', '100%').attr('stop-color', bottomColor).attr('stop-opacity', 1);
        }
      };
      
      makeGradient('sq-grad-lime',   '#d4ff7a', '#a8d43a');
      makeGradient('sq-grad-orange', '#fdba74', '#ea6d0a');
      makeGradient('sq-grad-indigo', '#a5b4fc', '#6366f1');
      makeGradient('sq-grad-default-dark', '#6b7db8', '#3b4a77');
      makeGradient('sq-grad-default-light', '#b0bcd1', '#718096');

      const getGradientId = (type: string | undefined, indices: number[] | undefined, i: number) => {
        if (indices?.includes(i)) {
          if (type === 'insert') return 'url(#sq-grad-lime)';
          if (type === 'delete') return 'url(#sq-grad-orange)';
        }
        return 'url(#sq-grad-indigo)'; // default uniform color for items in DS
      };

      const getStrokeColor = (type: string | undefined, indices: number[] | undefined, i: number) => {
        if (indices?.includes(i)) {
          if (type === 'insert') return '#cbff5e';
          if (type === 'delete') return '#fb923c';
        }
        return isDark ? '#818cf8' : '#6366f1';
      };

      let g = svg.select<SVGGElement>('.root-group');
      if (g.empty()) g = svg.append('g').attr('class', 'root-group');

      const boxW = layout === 'vertical' ? 120 : 70;
      const boxH = layout === 'vertical' ? 50 : 70;
      const padding = 12;
      const totalElements = renderData.length;

      type NodeData = { id: string, val: number, i: number, x: number, y: number };
      
      const nodesData: NodeData[] = renderData.map((val, i) => {
        let x = 0, y = 0;
        if (layout === 'vertical') {
          // Bottom up
          const totalHeight = totalElements * boxH + (totalElements - 1) * padding;
          const invertedIndex = totalElements - 1 - i;
          y = Math.max(0, height - 60 - invertedIndex * (boxH + padding));
          x = width / 2 - boxW / 2;
        } else {
          // Left to right
          const totalWidth = totalElements * boxW + (totalElements - 1) * padding;
          const leftMargin = Math.max(80, (width - totalWidth) / 2);
          x = leftMargin + i * (boxW + padding);
          y = height / 2 - boxH / 2 + 20;
        }
        return { id: `node-${val}-${i}`, val, i, x, y };
      });

      const nodes = g.selectAll<SVGGElement, NodeData>("g.node").data(nodesData, d => d.id);

      // ENTER
      const nodeEnter = nodes.enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", (d) => {
            if (layout === 'vertical') {
                return `translate(${d.x}, ${-boxH - 20})`; // Fall from above
            } else {
                return `translate(${width + boxW}, ${d.y})`; // Slide from right
            }
        });

      // Glow Ring
      nodeEnter.append("rect")
        .attr("class", "glow-box")
        .attr("x", -4).attr("y", -4)
        .attr("width", boxW + 8).attr("height", boxH + 8)
        .attr("rx", 10).attr("ry", 10)
        .attr("fill", "none")
        .attr("stroke-width", 3).attr("stroke-opacity", 0.8)
        .attr("stroke", (d) => getStrokeColor(currentStepData?.type, currentStepData?.indices, d.i))
        .style("opacity", 0);

      // Main Box
      nodeEnter.append("rect")
        .attr("class", "main-box")
        .attr("width", boxW)
        .attr("height", boxH)
        .attr("rx", 8).attr("ry", 8)
        .attr("fill", (d) => getGradientId(currentStepData?.type, currentStepData?.indices, d.i))
        .style("opacity", 0);

      // Value Text
      nodeEnter.append("text")
        .attr("class", "val-text")
        .attr("x", boxW / 2).attr("y", boxH / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(d => d.val)
        .attr("fill", d => {
          if (currentStepData?.indices?.includes(d.i) && currentStepData.type === 'insert') return '#111827';
          return '#ffffff';
        })
        .attr("font-size", "20px")
        .attr("font-family", "monospace")
        .attr("font-weight", "bold");
        
      // Index Label side
      nodeEnter.append("text")
        .attr("class", "idx-text")
        .attr("x", layout === 'vertical' ? -15 : boxW / 2)
        .attr("y", layout === 'vertical' ? boxH / 2 : boxH + 20)
        .attr("dy", layout === 'vertical' ? "0.35em" : "0")
        .attr("text-anchor", layout === 'vertical' ? "end" : "middle")
        .text(d => layout === 'vertical' ? `[${d.i}]` : d.i)
        .attr("fill", isDark ? '#64748b' : '#94a3b8')
        .attr("font-size", "12px")
        .attr("font-family", "monospace")
        .attr("font-weight", "bold");

      // UPDATE
      const nodeUpdate = nodeEnter.merge(nodes);

      nodeUpdate.transition()
        .duration(400)
        .ease(easeSnap)
        .attr("transform", d => `translate(${d.x}, ${d.y})`);

      nodeUpdate.select(".main-box")
        .transition().duration(400)
        .attr("fill", (d) => getGradientId(currentStepData?.type, currentStepData?.indices, d.i))
        .style("opacity", 1);
        
      nodeUpdate.select(".glow-box")
        .transition().duration(400)
        .attr("stroke", (d) => getStrokeColor(currentStepData?.type, currentStepData?.indices, d.i))
        .style("opacity", (d) => currentStepData?.indices?.includes(d.i) ? 1 : 0);

      nodeUpdate.select(".val-text")
        .transition().duration(400)
        .attr("fill", d => {
          if (currentStepData?.indices?.includes(d.i) && currentStepData.type === 'insert') return '#111827';
          return '#ffffff';
        });

      // EXIT
      nodes.exit()
        .transition()
        .duration(300)
        .attr("transform", d => {
             if (layout === 'vertical') {
                 return `translate(${(d as NodeData).x}, ${-boxH - 20})`; // Pop goes UP
             } else {
                 return `translate(${-boxW - 20}, ${(d as NodeData).y})`; // Dequeue goes LEFT
             }
        })
        .style("opacity", 0)
        .remove();

      // Pointers (Top / Front / Rear)
      let pointerG = svg.select<SVGGElement>(".pointers");
      if (pointerG.empty()) pointerG = svg.append("g").attr("class", "pointers");
      pointerG.selectAll("*").remove(); // clear and rebuild based on length
      
      if (totalElements > 0) {
          if (layout === 'vertical') {
              const topY = height - 60 - totalElements * (boxH + padding);
              pointerG.append("text")
                  .attr("x", width / 2 + boxW / 2 + 25)
                  .attr("y", topY + boxH + padding + boxH/2)
                  .attr("dy", "0.35em")
                  .text("← Top")
                  .attr("fill", isDark ? '#a5b4fc' : '#6366f1')
                  .attr("font-family", "monospace")
                  .attr("font-weight", "bold")
                  .attr("font-size", "14px")
                  .style("opacity", 0)
                  .transition().duration(400).style("opacity", 1);
          } else {
              const totalWidth = totalElements * boxW + (totalElements - 1) * padding;
              const leftMargin = Math.max(80, (width - totalWidth) / 2);
              
              pointerG.append("text")
                  .attr("x", leftMargin + boxW / 2)
                  .attr("y", height / 2 - boxH / 2 - 5)
                  .attr("text-anchor", "middle")
                  .text("Front ↓")
                  .attr("fill", isDark ? '#a5b4fc' : '#6366f1')
                  .attr("font-family", "monospace")
                  .attr("font-weight", "bold")
                  .attr("font-size", "14px");
                  
              pointerG.append("text")
                  .attr("x", leftMargin + (totalElements - 1) * (boxW + padding) + boxW / 2)
                  .attr("y", height / 2 + boxH / 2 + 35)
                  .attr("text-anchor", "middle")
                  .text("↑ Rear")
                  .attr("fill", isDark ? '#a5b4fc' : '#6366f1')
                  .attr("font-family", "monospace")
                  .attr("font-weight", "bold")
                  .attr("font-size", "14px");
          }
      }
    };

    drawChart();

    const resizeObserver = new ResizeObserver(() => drawChart());
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [currentStepData, layout, resolvedTheme]);

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      <svg ref={svgRef} className="block w-full h-full" />
    </div>
  );
}
