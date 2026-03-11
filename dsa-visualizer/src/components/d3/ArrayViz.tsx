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

// Slight overshoot then settle — feels snappy without jank
const easeBar = d3.easeBackOut.overshoot(1.1);

export function ArrayViz({ data, currentStepData }: ArrayVizProps) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

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
    const tooltipEl = tooltipRef.current;
    if (!container || !svgEl || !tooltipEl || !data || data.length === 0) return;

    const isDark = resolvedTheme !== 'light';

    const getBarColor = (index: number): string => {
      const isHighlightedNode = currentStepData?.indices?.includes(index) || currentStepData?.nodeIds?.includes(index.toString());
      if (isHighlightedNode) {
        switch (currentStepData?.type) {
          case 'compare':   return '#cbff5e'; // Lime
          case 'swap':      return '#fb923c'; // Orange
          case 'update':    return '#fb923c'; // Orange
          case 'sorted':    return '#818cf8'; // Indigo
          case 'highlight': return '#cbff5e'; // Lime
          case 'visit':     return '#fde047'; // Yellow
          case 'done':      return '#10b981'; // Emerald (Found)
          case 'not_found': return '#ef4444'; // Red (Not Found)
          default:          return '#cbff5e';
        }
      }
      if (sortedIndices.has(index)) return '#818cf8';
      return isDark ? '#4f5b8a' : '#94a3b8';
    };

    const isActive = (col: string) => 
      col === '#cbff5e' || col === '#fb923c' || col === '#fde047' || col === '#10b981' || col === '#ef4444';

    const getLabelColor = (barColor: string): string => {
      if (barColor === '#cbff5e') return '#111827';
      return '#ffffff';
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

      const svg = d3.select(svgEl).attr('width', W).attr('height', H);

      // Persistent defs for gradients
      let defs = svg.select<SVGDefsElement>('defs');
      if (defs.empty()) defs = svg.append('defs');

      // Gradient for active bar (lime)
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
      makeGradient('grad-lime',   '#d4ff7a', '#a8d43a');
      makeGradient('grad-orange', '#fdba74', '#ea6d0a');
      makeGradient('grad-indigo', '#a5b4fc', '#6366f1');
      makeGradient('grad-default-dark', '#6b7db8', '#3b4a77');
      makeGradient('grad-default-light', '#b0bcd1', '#718096');

      const getGradientId = (col: string) => {
        if (col === '#cbff5e') return 'url(#grad-lime)';
        if (col === '#fb923c') return 'url(#grad-orange)';
        if (col === '#818cf8') return 'url(#grad-indigo)';
        return isDark ? 'url(#grad-default-dark)' : 'url(#grad-default-light)';
      };

      // Root group
      let g = svg.select<SVGGElement>('.root-group');
      if (g.empty()) g = svg.append('g').attr('class', 'root-group');
      g.attr('transform', `translate(${ml},${mt})`);

      const x = d3.scaleBand()
        .domain(d3.range(n).map(String))
        .range([0, iW])
        .paddingInner(0.28)
        .paddingOuter(0.12);

      const maxVal = d3.max(renderData.filter(v => v > 0)) as number || 100;
      const y = d3.scaleLinear().domain([0, maxVal * 1.08]).range([iH, 0]);
      const bw = x.bandwidth();

      let barsLayer = g.select<SVGGElement>('.bars-layer');
      if (barsLayer.empty()) barsLayer = g.append('g').attr('class', 'bars-layer');

      type BarNode = {
        id: string; val: number; i: number;
        barX: number; barY: number; barH: number;
        col: string; labelCol: string; active: boolean;
      };

      const dataNodes: BarNode[] = renderData.map((val, i) => {
        const col = getBarColor(i);
        return {
          id: `bar-${i}`, val, i,
          barX: x(String(i)) ?? 0,
          barY: y(Math.max(val, 0)),
          barH: iH - y(Math.max(val, 0)),
          col,
          labelCol: getLabelColor(col),
          active: isActive(col),
        };
      });

      const barGroups = barsLayer
        .selectAll<SVGGElement, BarNode>('.bar-group')
        .data(dataNodes, d => d.id);

      // ─── ENTER ───────────────────────────────────────────────
      const barEnter = barGroups.enter()
        .append('g')
        .attr('class', 'bar-group')
        .attr('cursor', 'pointer')
        .attr('transform', d => `translate(${d.barX}, ${iH})`); // start from bottom

      // Placeholder
      barEnter.append('rect').attr('class', 'placeholder')
        .attr('y', 0).attr('width', bw).attr('height', 6)
        .attr('fill', 'none')
        .attr('stroke', isDark ? '#334155' : '#cbd5e1')
        .attr('stroke-width', 2).attr('stroke-dasharray', '4,3').attr('rx', 2)
        .style('opacity', 0);

      // Bar body
      barEnter.append('rect').attr('class', 'bar-body')
        .attr('y', 0).attr('width', bw).attr('height', 0)
        .attr('fill', d => getGradientId(d.col))
        .attr('rx', 6).attr('ry', 6)
        .style('opacity', 0);

      // Glow ring
      barEnter.append('rect').attr('class', 'bar-glow')
        .attr('x', -3).attr('y', -3).attr('width', bw + 6).attr('height', 0)
        .attr('fill', 'none').attr('stroke-width', 2).attr('stroke-opacity', 0.7)
        .attr('rx', 8).style('opacity', 0);

      // Value label
      const fontSize = Math.max(9, Math.min(14, Math.floor(bw / 3.5)));
      barEnter.append('text').attr('class', 'bar-label')
        .attr('x', bw / 2).attr('y', -8)
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
        .attr('font-size', `${fontSize}px`).attr('font-weight', '700')
        .attr('font-family', 'monospace').attr('pointer-events', 'none')
        .style('opacity', 0);

      // Index label
      barEnter.append('text').attr('class', 'bar-index')
        .attr('x', bw / 2).attr('y', iH - 0 + 20)
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
        .attr('fill', isDark ? '#94a3b8' : '#475569')
        .attr('font-size', '11px').attr('font-weight', '700')
        .attr('font-family', 'monospace');

      // Hover interactions
      barEnter
        .on('mouseover', function(event, d) {
          if (d.val <= 0) return;
          // Lift bar slightly
          d3.select(this).raise()
            .transition().duration(120).ease(d3.easeQuadOut)
            .attr('transform', `translate(${d.barX}, -4)`);
          // Show tooltip
          tooltipEl.style.opacity = '1';
          tooltipEl.style.transform = 'translateY(-4px)';
          tooltipEl.innerHTML = `<span style="color:#94a3b8;font-size:10px">IDX ${d.i}</span><br/><span style="font-size:16px;font-weight:700">${d.val}</span>`;
          const rect = svgEl.getBoundingClientRect();
          const absX = rect.left + d.barX + ml + bw / 2;
          const absY = rect.top + d.barY + mt - 12;
          tooltipEl.style.left = `${absX - tooltipEl.offsetWidth / 2}px`;
          tooltipEl.style.top  = `${absY - tooltipEl.offsetHeight}px`;
        })
        .on('mousemove', function(event, d) {
          const rect = svgEl.getBoundingClientRect();
          const absX = rect.left + d.barX + ml + bw / 2;
          const absY = rect.top + d.barY + mt - 12;
          tooltipEl.style.left = `${absX - tooltipEl.offsetWidth / 2}px`;
          tooltipEl.style.top  = `${absY - tooltipEl.offsetHeight}px`;
        })
        .on('mouseout', function(event, d) {
          d3.select(this)
            .transition().duration(180).ease(d3.easeQuadOut)
            .attr('transform', `translate(${d.barX}, 0)`);
          tooltipEl.style.opacity = '0';
        });

      // ─── STAGGERED ENTRANCE ANIMATION ──────────────────────
      barEnter.each(function(d, idx) {
        const grp = d3.select(this);
        const delay = idx * 35;

        grp.transition().delay(delay).duration(400).ease(d3.easeCubicOut)
          .attr('transform', `translate(${d.barX}, 0)`);

        grp.select<SVGRectElement>('.bar-body')
          .transition().delay(delay).duration(400).ease(easeBar)
          .attr('y', d.barY).attr('height', d.barH)
          .style('opacity', d.val > 0 ? 1 : 0);

        grp.select<SVGTextElement>('.bar-label')
          .text(d.val > 0 ? String(d.val) : '')
          .attr('fill', d.barH > 20 ? d.labelCol : (isDark ? '#e2e8f0' : '#334155'))
          .attr('y', d.barH > 20 ? d.barY + Math.min(20, d.barH / 2) : d.barY - 10)
          .transition().delay(delay + 120).duration(240)
          .style('opacity', 1);
      });

      // ─── UPDATE (merge) ──────────────────────────────────────
      const barUpdate = barEnter.merge(barGroups);

      barUpdate.on('mouseout', function(event, d) {
        d3.select(this)
          .transition().duration(180).ease(d3.easeQuadOut)
          .attr('transform', `translate(${d.barX}, 0)`);
        tooltipEl.style.opacity = '0';
      });

      // Smooth X slide
      barUpdate.transition().duration(speedDuration).ease(d3.easeCubicOut)
        .attr('transform', d => `translate(${d.barX}, 0)`);

      // Bar body — easeBack for snappy spring feel
      barUpdate.select<SVGRectElement>('.bar-body')
        .transition().duration(speedDuration).ease(easeBar)
        .attr('y', d => d.barY)
        .attr('width', bw)
        .attr('height', d => d.barH)
        .attr('fill', d => getGradientId(d.col))
        .style('opacity', d => d.val > 0 ? 1 : 0);

      // Glow ring — SAME duration & easing as bar body so they stay in sync
      barUpdate.select<SVGRectElement>('.bar-glow')
        .transition().duration(speedDuration).ease(easeBar)
        .attr('y', d => d.barY - 3)
        .attr('width', bw + 6)
        .attr('height', d => d.barH + 6)
        .attr('stroke', d => d.active ? d.col : 'none')
        .style('opacity', d => (d.val > 0 && d.active) ? 1 : 0);

      // Value label
      barUpdate.select<SVGTextElement>('.bar-label')
        .text(d => d.val > 0 ? String(d.val) : '')
        .transition().duration(speedDuration).ease(d3.easeCubicOut)
        .attr('x', bw / 2)
        .attr('y', d => d.barH > 20 ? d.barY + Math.min(20, d.barH / 2) : d.barY - 10)
        .attr('fill', d => d.barH > 20 ? d.labelCol : (isDark ? '#e2e8f0' : '#334155'))
        .style('opacity', 1);

      // Index label
      barUpdate.select<SVGTextElement>('.bar-index')
        .attr('x', bw / 2)
        .attr('y', iH + 20)
        .text(d => String(d.i));

      barGroups.exit()
        .transition().duration(200).style('opacity', 0).remove();
    };

    drawChart();
    const observer = new ResizeObserver(() => drawChart());
    observer.observe(container);
    return () => observer.disconnect();
  }, [data, currentStepData, sortedIndices, resolvedTheme]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg ref={svgRef} className="block w-full h-full" />
      {/* Floating tooltip */}
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 0.15s ease, transform 0.15s ease',
          zIndex: 50,
          background: 'rgba(13,15,26,0.92)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          padding: '6px 12px',
          textAlign: 'center',
          color: '#f1f5f9',
          fontFamily: 'monospace',
          fontSize: '13px',
          lineHeight: '1.5',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          minWidth: '52px',
        }}
      />
    </div>
  );
}
