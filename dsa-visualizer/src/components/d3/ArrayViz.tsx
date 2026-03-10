"use client";

import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { useTheme } from 'next-themes';
import { AlgorithmStep } from '@/lib/types/algorithm';
import { useVisualizerStore } from '@/lib/store/visualizerStore';

interface ArrayVizProps {
  data: number[];
  currentStepData: AlgorithmStep | undefined;
}

export function ArrayViz({ data, currentStepData }: ArrayVizProps) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { steps, currentStepIndex } = useVisualizerStore();

  const sortedIndices = useMemo(() => {
    const sorted = new Set<number>();
    if (!steps || steps.length === 0) return sorted;
    
    for (let i = 0; i <= currentStepIndex; i++) {
      const step = steps[i];
      if (step?.type === 'sorted' && step.indices) {
        step.indices.forEach((idx: number) => sorted.add(idx));
      }
    }
    return sorted;
  }, [steps, currentStepIndex]);

  useEffect(() => {
    const container = containerRef.current;
    const svgEl = svgRef.current;
    if (!container || !svgEl || !data || data.length === 0) return;

    const isDark = resolvedTheme !== 'light';

    // Always-visible color palette
    const getBarColor = (index: number): string => {
      if (currentStepData?.indices?.includes(index)) {
        switch (currentStepData.type) {
          case 'compare':   return '#cbff5e'; // Lime
          case 'swap':      return '#fb923c'; // Orange
          case 'update':    return '#fb923c'; // Orange
          case 'sorted':    return '#818cf8'; // Indigo
          case 'highlight': return '#cbff5e'; // Lime
        }
      }
      if (sortedIndices.has(index)) return '#818cf8'; // Indigo
      // Inactive — clearly visible on dark bg
      return isDark ? '#4f5b8a' : '#94a3b8';
    };

    const getLabelColor = (barColor: string): string => {
      if (barColor === '#cbff5e') return '#111827'; // Dark on lime
      return '#ffffff';                              // White on everything else
    };

    const renderData: number[] = currentStepData?.values?.array ?? data;
    const n = renderData.length;

    const drawChart = () => {
      const W = container.clientWidth;
      const H = container.clientHeight || 380;
      if (W === 0 || H === 0) return;

      const ml = 16, mr = 16, mt = 28, mb = 32;
      const iW = W - ml - mr;
      const iH = H - mt - mb;

      const speedDuration = useVisualizerStore.getState().speed * 0.8;

      // Declare svg, g, scales, bandwidth FIRST before any usage
      const svg = d3.select(svgEl)
        .attr('width', W)
        .attr('height', H);

      // Persistent root group — create once, reuse across draws
      let g = svg.select<SVGGElement>('.root-group');
      if (g.empty()) {
        g = svg.append('g').attr('class', 'root-group');
      }
      g.attr('transform', `translate(${ml},${mt})`);

      // Clear non-bar-layer children on resize (e.g. axis lines if added later)
      // Scales — must come before barsLayer and dataNodes
      const x = d3.scaleBand()
        .domain(d3.range(n).map(String))
        .range([0, iW])
        .paddingInner(0.28)
        .paddingOuter(0.12);

      const maxVal = d3.max(renderData.filter(v => v > 0)) as number || 100;
      const y = d3.scaleLinear()
        .domain([0, maxVal * 1.08])
        .range([iH, 0]);

      const bw = x.bandwidth();

      // Group for all bars — persisted across redraws
      let barsLayer = g.select<SVGGElement>('.bars-layer');
      if (barsLayer.empty()) {
        barsLayer = g.append('g').attr('class', 'bars-layer');
      }

      // Map data for enter/update/exit pattern
      const dataNodes = renderData.map((val, i) => ({
        id: `bar-${i}`,
        val,
        i,
        barX: x(String(i)) ?? 0,
        barY: y(Math.max(val, 0)),
        barH: iH - y(Math.max(val, 0)),
        col: getBarColor(i),
        labelCol: getLabelColor(getBarColor(i))
      }));

      // Bind data to groups
      const barGroups = barsLayer.selectAll<SVGGElement, (typeof dataNodes)[number]>('.bar-group')
        .data(dataNodes, d => d.id);

      // Enter phase
      const barEnter = barGroups.enter()
        .append('g')
        .attr('class', 'bar-group')
        .attr('transform', d => `translate(${d.barX}, 0)`);

      // Empty Slot Placeholder
      barEnter.append('rect')
        .attr('class', 'placeholder')
        .attr('y', iH - 6)
        .attr('width', bw)
        .attr('height', 6)
        .attr('fill', 'none')
        .attr('stroke', isDark ? '#334155' : '#cbd5e1')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,3')
        .attr('rx', 2)
        .style('opacity', d => d.val <= 0 ? 1 : 0);

      // Bar Body
      barEnter.append('rect')
        .attr('class', 'bar-body')
        .attr('y', d => d.barY)
        .attr('width', bw)
        .attr('height', d => d.barH)
        .attr('fill', d => d.col)
        .attr('rx', 5)
        .attr('ry', 5)
        .style('opacity', d => d.val > 0 ? 1 : 0);

      // Glow Rect (starts hidden)
      barEnter.append('rect')
        .attr('class', 'bar-glow')
        .attr('x', -2)
        .attr('y', d => d.barY - 2)
        .attr('width', bw + 4)
        .attr('height', d => d.barH + 4)
        .attr('fill', 'none')
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.5)
        .attr('rx', 6)
        .style('opacity', 0);

      // Label Text
      const fontSize = Math.max(9, Math.min(14, Math.floor(bw / 3.5)));
      barEnter.append('text')
        .attr('class', 'bar-label')
        .attr('x', bw / 2)
        .attr('y', d => d.barH > 20 ? d.barY + Math.min(20, d.barH / 2) : d.barY - 10)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', `${fontSize}px`)
        .attr('font-weight', '700')
        .attr('font-family', 'monospace')
        .attr('pointer-events', 'none')
        .attr('fill', d => d.barH > 20 ? d.labelCol : (isDark ? '#e2e8f0' : '#334155'))
        .text(d => d.val > 0 ? String(d.val) : '');

      // Index Text
      barEnter.append('text')
        .attr('class', 'bar-index')
        .attr('x', bw / 2)
        .attr('y', iH + 20)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', isDark ? '#94a3b8' : '#475569')
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .attr('font-family', 'monospace')
        .text(d => String(d.i));

      // Merge enter + existing into update selection
      const barUpdate = barEnter.merge(barGroups);

      // Smoothly animate group X position
      barUpdate.transition().duration(speedDuration).ease(d3.easeCubicOut)
        .attr('transform', d => `translate(${d.barX}, 0)`);

      // Placeholder visibility
      barUpdate.select<SVGRectElement>('.placeholder')
        .transition().duration(speedDuration)
        .attr('width', bw)
        .style('opacity', d => d.val <= 0 ? 1 : 0);

      // Animate bar height, position, and color
      barUpdate.select<SVGRectElement>('.bar-body')
        .transition().duration(speedDuration).ease(d3.easeCubicOut)
        .attr('y', d => d.barY)
        .attr('width', bw)
        .attr('height', d => d.barH)
        .attr('fill', d => d.col)
        .style('opacity', d => d.val > 0 ? 1 : 0);

      // Animate glow ring
      barUpdate.select<SVGRectElement>('.bar-glow')
        .transition().duration(speedDuration)
        .attr('y', d => d.barY - 2)
        .attr('width', bw + 4)
        .attr('height', d => d.barH + 4)
        .attr('stroke', d => (d.col === '#cbff5e' || d.col === '#fb923c') ? d.col : 'none')
        .style('opacity', d => (d.val > 0 && (d.col === '#cbff5e' || d.col === '#fb923c')) ? 1 : 0);

      // Animate value label position & color
      barUpdate.select<SVGTextElement>('.bar-label')
        .text(d => d.val > 0 ? String(d.val) : '')
        .transition().duration(speedDuration).ease(d3.easeCubicOut)
        .attr('x', bw / 2)
        .attr('y', d => d.barH > 20 ? d.barY + Math.min(20, d.barH / 2) : d.barY - 10)
        .attr('fill', d => d.barH > 20 ? d.labelCol : (isDark ? '#e2e8f0' : '#334155'));

      // Update index label
      barUpdate.select<SVGTextElement>('.bar-index')
        .attr('x', bw / 2)
        .text(d => String(d.i));

      barGroups.exit().remove();
    };

    drawChart();

    const observer = new ResizeObserver(() => drawChart());
    observer.observe(container);
    return () => observer.disconnect();
  }, [data, currentStepData, sortedIndices, resolvedTheme]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
    >
      <svg ref={svgRef} className="block w-full h-full" />
    </div>
  );
}
