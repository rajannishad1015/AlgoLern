"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AlgorithmStep, GraphNode, GraphEdge } from '@/lib/types/algorithm';

interface GraphVizProps {
  currentStepData: AlgorithmStep | undefined;
  width?: number;
  height?: number;
}

// ─── Theme-safe color palette (no CSS variables) ──────────────────────────
const C = {
  bg:         '#0d0f1c',       // canvas bg
  edgeDefault:'#334155',       // slate-700
  edgeMST:    '#10b981',       // emerald-500 — MST edges
  edgeActive: '#6366f1',       // indigo-500 — currently examined edge
  edgeUpdate: '#f59e0b',       // amber-500 — being relaxed / updated
  edgeDone:   '#10b981',       // emerald-500 — shortest path / accepted
  nodeDefault:'#1e2035',       // dark slate
  nodeHighlight:'#6366f1',     // indigo
  nodeVisit:  '#f59e0b',       // amber — currently processing
  nodeInsert: '#8b5cf6',       // violet — just added to queue/mst
  nodeUpdate: '#f59e0b',       // amber — distance updated
  nodeDone:   '#10b981',       // emerald — finalized
  nodePath:   '#10b981',       // emerald
  nodeStroke: '#475569',       // slate-600
  nodeActiveStroke: '#818cf8', // indigo-400 glow
  weightBg:   '#1e2035',
  weightText: '#94a3b8',       // slate-400
  labelActive:'#ffffff',
  labelDefault:'#e2e8f0',      // slate-200
  arrowDefault:'#475569',
  arrowActive:'#6366f1',
};

export function GraphViz({ currentStepData }: GraphVizProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    let width  = containerRef.current.clientWidth;
    let height = containerRef.current.clientHeight || 500;

    const svg = d3.select(svgRef.current);

    const rawNodes: GraphNode[] = currentStepData?.values?.nodes || [];
    const rawEdges: GraphEdge[] = currentStepData?.values?.edges || [];

    const activeEdgeIds = currentStepData?.edgeIds ?? [];
    const activeNodeIds = currentStepData?.nodeIds ?? [];
    const stepType      = currentStepData?.type ?? 'highlight';

    const drawChart = () => {
      svg.selectAll('*').remove();
      svg.attr('width', width).attr('height', height);

      // ── Background ────────────────────────────────────────────────────
      svg.append('rect')
        .attr('width', width).attr('height', height)
        .attr('fill', C.bg);

      // ── Grid dots (subtle) ───────────────────────────────────────────
      const dotSpacing = 40;
      for (let gx = dotSpacing; gx < width; gx += dotSpacing) {
        for (let gy = dotSpacing; gy < height; gy += dotSpacing) {
          svg.append('circle').attr('cx', gx).attr('cy', gy).attr('r', 1).attr('fill', '#1e2a3a');
        }
      }

      const defs = svg.append('defs');

      // ── Arrow markers ─────────────────────────────────────────────────
      ['default', 'active', 'update', 'done'].forEach(kind => {
        const color = kind === 'active' ? C.arrowActive
          : kind === 'update' ? C.edgeUpdate
          : kind === 'done'   ? C.edgeDone
          : C.arrowDefault;

        defs.append('marker')
          .attr('id', `arrow-${kind}`)
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 26)
          .attr('refY', 0)
          .attr('markerWidth', 6)
          .attr('markerHeight', 6)
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M0,-5L10,0L0,5')
          .attr('fill', color);
      });

      // ── Glow filter ──────────────────────────────────────────────────
      const glowFilter = defs.append('filter').attr('id', 'glow');
      glowFilter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
      const glowMerge = glowFilter.append('feMerge');
      glowMerge.append('feMergeNode').attr('in', 'coloredBlur');
      glowMerge.append('feMergeNode').attr('in', 'SourceGraphic');

      const mapX = (x?: number) => x !== undefined ? (x / 100) * width  : width  / 2;
      const mapY = (y?: number) => y !== undefined ? (y / 100) * height : height / 2;

      // ── G layers ─────────────────────────────────────────────────────
      const edgesG   = svg.append('g');
      const weightsG = svg.append('g');
      const nodesG   = svg.append('g');

      // ── Edges ─────────────────────────────────────────────────────────
      rawEdges.forEach(e => {
        const src = rawNodes.find(n => n.id === e.source);
        const tgt = rawNodes.find(n => n.id === e.target);
        if (!src || !tgt) return;

        const x1 = mapX(src.x), y1 = mapY(src.y);
        const x2 = mapX(tgt.x), y2 = mapY(tgt.y);
        const isActive = activeEdgeIds.includes(e.id);

        let stroke = C.edgeDefault;
        let strokeW = 2;
        let markerKind = 'default';
        let opacity = 1;
        let useGlow = false;

        if (isActive) {
          if (stepType === 'update') { stroke = C.edgeUpdate;  markerKind = 'update'; strokeW = 3.5; useGlow = true; }
          else if (stepType === 'path' || stepType === 'done') { stroke = C.edgeDone; markerKind = 'done'; strokeW = 3.5; useGlow = true; }
          else { stroke = C.edgeActive; markerKind = 'active'; strokeW = 3; useGlow = true; }
        } else {
          opacity = 0.35;
        }

        edgesG.append('line')
          .attr('x1', x1).attr('y1', y1)
          .attr('x2', x2).attr('y2', y2)
          .attr('stroke', stroke)
          .attr('stroke-width', strokeW)
          .attr('stroke-linecap', 'round')
          .attr('stroke-opacity', opacity)
          .attr('filter', useGlow ? 'url(#glow)' : null)
          .attr('marker-end', e.isDirected ? `url(#arrow-${markerKind})` : null);
      });

      // ── Edge weights ──────────────────────────────────────────────────
      const hasWeights = rawEdges.some(e => e.weight !== undefined);
      if (hasWeights) {
        rawEdges.forEach(e => {
          if (e.weight === undefined) return;
          const src = rawNodes.find(n => n.id === e.source);
          const tgt = rawNodes.find(n => n.id === e.target);
          if (!src || !tgt) return;

          const cx = (mapX(src.x) + mapX(tgt.x)) / 2;
          const cy = (mapY(src.y) + mapY(tgt.y)) / 2 - 10;
          const isActive = activeEdgeIds.includes(e.id);

          const wg = weightsG.append('g').attr('transform', `translate(${cx},${cy})`);
          wg.append('rect')
            .attr('width', 26).attr('height', 18)
            .attr('x', -13).attr('y', -9).attr('rx', 5)
            .attr('fill', isActive ? C.edgeActive : C.weightBg)
            .attr('fill-opacity', isActive ? 0.9 : 0.85)
            .attr('stroke', isActive ? C.edgeActive : '#334155')
            .attr('stroke-width', 1.5);
          wg.append('text')
            .attr('text-anchor', 'middle').attr('dy', '0.35em')
            .attr('fill', isActive ? '#fff' : C.weightText)
            .attr('font-size', '11px').attr('font-weight', 'bold')
            .attr('font-family', 'monospace')
            .text(e.weight);
        });
      }

      // ── Nodes ─────────────────────────────────────────────────────────
      rawNodes.forEach(n => {
        const cx = mapX(n.x), cy = mapY(n.y);
        const isActive = activeNodeIds.includes(n.id);

        let fill   = C.nodeDefault;
        let stroke = C.nodeStroke;
        let strokeW = 2;
        let useGlow = false;

        if (isActive) {
          stroke  = C.nodeActiveStroke;
          strokeW = 3;
          useGlow = true;
          if      (stepType === 'visit')     { fill = C.nodeVisit; }
          else if (stepType === 'insert')    { fill = C.nodeInsert; }
          else if (stepType === 'update')    { fill = C.nodeUpdate; }
          else if (stepType === 'done')      { fill = C.nodeDone; }
          else if (stepType === 'path')      { fill = C.nodePath; }
          else if (stepType === 'compare')   { fill = '#e11d48'; stroke = '#fb7185'; } // rose
          else                               { fill = C.nodeHighlight; }
        }

        const ng = nodesG.append('g').attr('transform', `translate(${cx},${cy})`);

        // Outer glow ring for active nodes
        if (isActive) {
          ng.append('circle').attr('r', 28)
            .attr('fill', fill).attr('fill-opacity', 0.15)
            .attr('stroke', 'none');
        }

        // Node circle
        ng.append('circle')
          .attr('r', 22)
          .attr('fill', fill)
          .attr('stroke', stroke)
          .attr('stroke-width', strokeW)
          .attr('filter', useGlow ? 'url(#glow)' : null);

        // Label
        ng.append('text')
          .attr('dy', '0.35em').attr('text-anchor', 'middle')
          .attr('fill', isActive ? C.labelActive : C.labelDefault)
          .attr('font-size', '14px').attr('font-weight', 'bold')
          .attr('font-family', 'monospace')
          .text(n.label);
      });
    };

    drawChart();

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        width  = entry.contentRect.width;
        height = entry.contentRect.height;
        drawChart();
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [currentStepData]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[380px] relative rounded-xl overflow-hidden border border-white/8"
      style={{ background: C.bg }}
    >
      <svg ref={svgRef} className="w-full h-full block" />
    </div>
  );
}
