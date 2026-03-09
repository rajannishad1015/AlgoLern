"use client";

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useTheme } from 'next-themes';
import { AlgorithmStep } from '@/lib/types/algorithm';

interface ArrayVizProps {
  data: number[];
  currentStepData: AlgorithmStep | undefined;
}

export function ArrayViz({ data, currentStepData }: ArrayVizProps) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [sortedIndices, setSortedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (currentStepData?.type === 'sorted' && currentStepData.indices) {
      setSortedIndices(prev => {
        const next = new Set(prev);
        currentStepData.indices!.forEach(i => next.add(i));
        return next;
      });
    } else if (!currentStepData) {
      setSortedIndices(new Set());
    }
  }, [currentStepData]);

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

      const svg = d3.select(svgEl)
        .attr('width', W)
        .attr('height', H);

      svg.selectAll('*').remove();

      const g = svg.append('g').attr('transform', `translate(${ml},${mt})`);

      // Scales
      const x = d3.scaleBand()
        .domain(d3.range(n).map(String))
        .range([0, iW])
        .paddingInner(0.28)
        .paddingOuter(0.12);

      const maxVal = d3.max(renderData) as number || 100;
      const y = d3.scaleLinear()
        .domain([0, maxVal * 1.08])
        .range([iH, 0]);

      const bw = x.bandwidth();

      // Draw bars
      renderData.forEach((val, i) => {
        const barX = x(String(i)) ?? 0;
        const barY = y(val);
        const barH = iH - barY;
        const col = getBarColor(i);
        const labelCol = getLabelColor(col);

        // Bar body
        g.append('rect')
          .attr('x', barX)
          .attr('y', barY)
          .attr('width', bw)
          .attr('height', barH)
          .attr('fill', col)
          .attr('rx', 5)
          .attr('ry', 5);

        // Glow filter for active bars
        if (col === '#cbff5e') {
          g.append('rect')
            .attr('x', barX - 2)
            .attr('y', barY - 2)
            .attr('width', bw + 4)
            .attr('height', barH + 4)
            .attr('fill', 'none')
            .attr('stroke', '#cbff5e')
            .attr('stroke-width', 1.5)
            .attr('stroke-opacity', 0.5)
            .attr('rx', 6);
        } else if (col === '#fb923c') {
          g.append('rect')
            .attr('x', barX - 2)
            .attr('y', barY - 2)
            .attr('width', bw + 4)
            .attr('height', barH + 4)
            .attr('fill', 'none')
            .attr('stroke', '#fb923c')
            .attr('stroke-width', 1.5)
            .attr('stroke-opacity', 0.5)
            .attr('rx', 6);
        }

        // Value label inside bar (near top)
        if (barH > 20) {
          const fontSize = Math.max(9, Math.min(14, Math.floor(bw / 3.5)));
          g.append('text')
            .attr('x', barX + bw / 2)
            .attr('y', barY + Math.min(20, barH / 2))
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', labelCol)
            .attr('font-size', `${fontSize}px`)
            .attr('font-weight', '700')
            .attr('font-family', 'monospace')
            .attr('pointer-events', 'none')
            .text(val);
        }

        // Index below bar
        g.append('text')
          .attr('x', barX + bw / 2)
          .attr('y', iH + 20)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', isDark ? '#94a3b8' : '#475569')
          .attr('font-size', '11px')
          .attr('font-weight', '700')
          .attr('font-family', 'monospace')
          .text(i);
      });
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
