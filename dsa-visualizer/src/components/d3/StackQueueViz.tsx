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
    // Calculate max capacity for the visual container
    // We'll set a visual cap of 8 elements, but it expands if data > 8
    const visualCapacity = Math.max(8, renderData.length + 1);

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

      // Configuration
      const boxW = layout === 'vertical' ? 140 : 70;
      const boxH = layout === 'vertical' ? 45 : 80;
      const padding = 8;
      
      const totalElements = renderData.length;

      // Draw Container Background (Layer 0)
      let bgGroup = svg.select<SVGGElement>('.bg-group');
      if (bgGroup.empty()) bgGroup = svg.append('g').attr('class', 'bg-group');
      bgGroup.selectAll("*").remove();

      // Draw Container Foreground (over the elements) (Layer 2)
      // The elements themselves will be Layer 1
      
      const strokeColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)";
      const bgFill = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";
      const containerGlow = isDark ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.05)";

      if (layout === 'vertical') {
          // Stack Beaker (Open Top, Closed Bottom)
          // Width based on boxW + some padding
          const beakerW = boxW + 20;
          const beakerH = visualCapacity * (boxH + padding) + 20;
          const beakerX = width / 2 - beakerW / 2;
          const beakerY = height - 60 - beakerH;

          // Back wall
          bgGroup.append("rect")
             .attr("x", beakerX)
             .attr("y", beakerY)
             .attr("width", beakerW)
             .attr("height", beakerH)
             .attr("fill", bgFill)
             .attr("rx", 6);
          
          // Container Outline (Left, Bottom, Right) - using a path
          const pathD = `M ${beakerX} ${beakerY} 
                         L ${beakerX} ${beakerY + beakerH - 10} 
                         Q ${beakerX} ${beakerY + beakerH} ${beakerX + 10} ${beakerY + beakerH} 
                         L ${beakerX + beakerW - 10} ${beakerY + beakerH} 
                         Q ${beakerX + beakerW} ${beakerY + beakerH} ${beakerX + beakerW} ${beakerY + beakerH - 10} 
                         L ${beakerX + beakerW} ${beakerY}`;
                         
          bgGroup.append("path")
             .attr("d", pathD)
             .attr("fill", "none")
             .attr("stroke", strokeColor)
             .attr("stroke-width", 4)
             .attr("stroke-linecap", "round");
             
          // Subtle glow behind beaker
          bgGroup.append("rect")
             .attr("x", beakerX - 20)
             .attr("y", beakerY - 20)
             .attr("width", beakerW + 40)
             .attr("height", beakerH + 40)
             .attr("fill", containerGlow)
             .attr("filter", "blur(20px)")
             .attr("pointer-events", "none");
             
          // Stack specific labels
          bgGroup.append("text")
             .attr("x", width / 2)
             .attr("y", beakerY + beakerH + 25)
             .attr("text-anchor", "middle")
             .text("STACK BOTTOM")
             .attr("font-family", "monospace")
             .attr("font-size", "12px")
             .attr("font-weight", "bold")
             .attr("fill", isDark ? "#475569" : "#94a3b8")
             .attr("letter-spacing", "0.2em");
      } else {
          // Queue Tube (Open Left, Open Right)
          const tubeW = Math.max(width * 0.8, visualCapacity * (boxW + padding) + 40);
          const tubeH = boxH + 20;
          const tubeX = width / 2 - tubeW / 2;
          const tubeY = height / 2 - tubeH / 2;
          
          // Back wall
          bgGroup.append("rect")
             .attr("x", tubeX)
             .attr("y", tubeY)
             .attr("width", tubeW)
             .attr("height", tubeH)
             .attr("fill", bgFill);
             
          // Top Line
          bgGroup.append("line")
             .attr("x1", tubeX).attr("y1", tubeY)
             .attr("x2", tubeX + tubeW).attr("y2", tubeY)
             .attr("stroke", strokeColor)
             .attr("stroke-width", 4)
             .attr("stroke-linecap", "round");
             
          // Bottom Line
          bgGroup.append("line")
             .attr("x1", tubeX).attr("y1", tubeY + tubeH)
             .attr("x2", tubeX + tubeW).attr("y2", tubeY + tubeH)
             .attr("stroke", strokeColor)
             .attr("stroke-width", 4)
             .attr("stroke-linecap", "round");
             
          // Subtle glow behind tube
          bgGroup.append("rect")
             .attr("x", tubeX - 20)
             .attr("y", tubeY - 20)
             .attr("width", tubeW + 40)
             .attr("height", tubeH + 40)
             .attr("fill", containerGlow)
             .attr("filter", "blur(20px)")
             .attr("pointer-events", "none");
             
          // Queue specific labels
          bgGroup.append("text")
             .attr("x", tubeX - 20)
             .attr("y", tubeY + tubeH / 2)
             .attr("dy", "0.3em")
             .attr("text-anchor", "end")
             .text("FRONT (OUT) ←")
             .attr("font-family", "monospace")
             .attr("font-size", "12px")
             .attr("font-weight", "bold")
             .attr("fill", isDark ? "#475569" : "#94a3b8")
             .attr("letter-spacing", "0.1em");
             
          bgGroup.append("text")
             .attr("x", tubeX + tubeW + 20)
             .attr("y", tubeY + tubeH / 2)
             .attr("dy", "0.3em")
             .attr("text-anchor", "start")
             .text("← REAR (IN)")
             .attr("font-family", "monospace")
             .attr("font-size", "12px")
             .attr("font-weight", "bold")
             .attr("fill", isDark ? "#475569" : "#94a3b8")
             .attr("letter-spacing", "0.1em");
      }

      // Draw Elements (Layer 1)
      let g = svg.select<SVGGElement>('.root-group');
      if (g.empty()) {
          // ensure elements are appended AFTER background
          g = svg.append('g').attr('class', 'root-group');
      }

      type NodeData = { id: string, val: number, i: number, x: number, y: number };
      
      const nodesData: NodeData[] = renderData.map((val, i) => {
        let x = 0, y = 0;
        if (layout === 'vertical') {
          // Bottom up
          const invertedIndex = totalElements - 1 - i;
          y = (height - 60 - 10 - boxH) - invertedIndex * (boxH + padding); // -10 to pad from bottom of beaker
          x = width / 2 - boxW / 2;
        } else {
          // Left to right - Queue
          // Index 0 (Front) is on the left
          const tubeW = Math.max(width * 0.8, visualCapacity * (boxW + padding) + 40);
          const tubeX = width / 2 - tubeW / 2;
          
          x = tubeX + 20 + i * (boxW + padding); // +20 padding from inside of tube
          y = height / 2 - boxH / 2;
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
                return `translate(${d.x}, ${-boxH * 2})`; // Fall from high above
            } else {
                return `translate(${width + boxW * 2}, ${d.y})`; // Slide from far right
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
        .attr("rx", 6).attr("ry", 6)
        .attr("fill", (d) => getGradientId(currentStepData?.type, currentStepData?.indices, d.i))
        .style("opacity", 0);
        
      // Inner highlight for 3D glassy look
      nodeEnter.append("rect")
        .attr("class", "glass-highlight")
        .attr("x", 0).attr("y", 0)
        .attr("width", boxW)
        .attr("height", boxH / 3) // top reflection
        .attr("rx", 6)
        .attr("fill", "url(#sq-grad-glass)")
        .style("opacity", 0.3);
        
      // Add a simple white-to-transparent gradient for the glass effect if not exists
      let glassGrad = defs.select<SVGLinearGradientElement>('#sq-grad-glass');
      if (glassGrad.empty()) {
          glassGrad = defs.append('linearGradient').attr('id', 'sq-grad-glass').attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
          glassGrad.append('stop').attr('offset', '0%').attr('stop-color', '#ffffff').attr('stop-opacity', 0.8);
          glassGrad.append('stop').attr('offset', '100%').attr('stop-color', '#ffffff').attr('stop-opacity', 0);
      }

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
        .attr("x", layout === 'vertical' ? -25 : boxW / 2)
        .attr("y", layout === 'vertical' ? boxH / 2 : boxH + 20)
        .attr("dy", layout === 'vertical' ? "0.35em" : "0")
        .attr("text-anchor", layout === 'vertical' ? "end" : "middle")
        .text(d => layout === 'vertical' ? `idx ${d.i}` : d.i)
        .attr("fill", isDark ? '#64748b' : '#94a3b8')
        .attr("font-size", "10px")
        .attr("font-family", "monospace")
        .attr("font-weight", "bold")
        .attr("text-transform", "uppercase");

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
                 return `translate(${(d as NodeData).x}, ${-boxH * 2})`; // Pop goes UP
             } else {
                 return `translate(${-boxW * 2}, ${(d as NodeData).y})`; // Dequeue goes FAR LEFT
             }
        })
        .style("opacity", 0)
        .remove();

      // Pointers (Layer 3 - Above everything)
      let pointerG = svg.select<SVGGElement>(".pointers");
      if (pointerG.empty()) pointerG = svg.append("g").attr("class", "pointers");
      pointerG.selectAll("*").remove(); 
      
      if (totalElements > 0) {
          if (layout === 'vertical') {
              // Top pointer
              const yPos = (height - 60 - 10 - boxH) - (totalElements - 1) * (boxH + padding);
              pointerG.append("text")
                  .attr("x", width / 2 + boxW / 2 + 35)
                  .attr("y", yPos + boxH / 2)
                  .attr("dy", "0.35em")
                  .text("← Top")
                  .attr("fill", isDark ? '#a5b4fc' : '#6366f1')
                  .attr("font-family", "monospace")
                  .attr("font-weight", "bold")
                  .attr("font-size", "14px")
                  .style("opacity", 0)
                  .transition().duration(400).style("opacity", 1);
          } else {
              // Queue pointer highlight over the tube
              const tubeW = Math.max(width * 0.8, visualCapacity * (boxW + padding) + 40);
              const tubeX = width / 2 - tubeW / 2;
              
              const frontX = tubeX + 20; // Index 0
              const rearX = frontX + (totalElements - 1) * (boxW + padding); // Last Index
              const pointerY = height / 2 - boxH / 2;
              
              pointerG.append("text")
                  .attr("x", frontX + boxW / 2)
                  .attr("y", pointerY - 15)
                  .attr("text-anchor", "middle")
                  .text("Front ↓")
                  .attr("fill", isDark ? '#a5b4fc' : '#6366f1')
                  .attr("font-family", "monospace")
                  .attr("font-weight", "bold")
                  .attr("font-size", "12px");
                  
              pointerG.append("text")
                  .attr("x", rearX + boxW / 2)
                  .attr("y", pointerY + boxH + 35)
                  .attr("text-anchor", "middle")
                  .text("↑ Rear")
                  .attr("fill", isDark ? '#a5b4fc' : '#6366f1')
                  .attr("font-family", "monospace")
                  .attr("font-weight", "bold")
                  .attr("font-size", "12px");
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
      {/* Decorative blurred background blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
      <svg ref={svgRef} className="block w-full h-full relative z-10" />
    </div>
  );
}
