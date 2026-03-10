"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from 'next-themes';
import { AlgorithmStep } from '@/lib/types/algorithm';

interface LinkedListVizProps {
  currentStepData: AlgorithmStep | undefined;
}

export function LinkedListViz({ currentStepData }: LinkedListVizProps) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 420;
    const isDark = resolvedTheme !== 'light';

    const svg = d3.select(svgRef.current);
    svg.attr('width', width).attr('height', height);

    const listData: number[] = currentStepData?.values?.list || [];
    const pendingNode: number | undefined = currentStepData?.values?.newNode;
    const stepType = currentStepData?.type;
    const activeIndices = currentStepData?.indices || [];

    // ─── DEFS ──────────────────────────────────────────────────────────
    let defs = svg.select<SVGDefsElement>('defs');
    if (defs.empty()) defs = svg.append('defs');

    const setupMarker = (id: string, color: string) => {
      let m = defs.select<SVGMarkerElement>(`#${id}`);
      if (m.empty()) {
        m = defs.append('marker')
          .attr('id', id).attr('viewBox', '0 -5 10 10')
          .attr('refX', 7).attr('refY', 0)
          .attr('markerWidth', 5).attr('markerHeight', 5)
          .attr('orient', 'auto');
        m.append('path').attr('d', 'M0,-5L10,0L0,5');
      }
      m.select('path').attr('fill', color);
    };

    const arrowDefault = isDark ? '#475569' : '#94a3b8';
    const arrowActive  = '#cbff5e';
    const arrowDelete  = '#fb923c';
    setupMarker('ll-arrow', arrowDefault);
    setupMarker('ll-arrow-active', arrowActive);
    setupMarker('ll-arrow-delete', arrowDelete);
    setupMarker('ll-arrow-head', isDark ? '#a5b4fc' : '#4f46e5');

    const makeGrad = (id: string, c1: string, c2: string, angle = '100%') => {
      if (defs.select(`#${id}`).empty()) {
        const g = defs.append('linearGradient').attr('id', id)
          .attr('x1', '0%').attr('y1', '0%').attr('x2', angle).attr('y2', '0%');
        g.append('stop').attr('offset', '0%').attr('stop-color', c1);
        g.append('stop').attr('offset', '100%').attr('stop-color', c2);
      }
    };
    makeGrad('ll-g-default', '#818cf8', '#4f46e5');
    makeGrad('ll-g-insert',  '#a8d43a', '#cbff5e');
    makeGrad('ll-g-delete',  '#ea6d0a', '#fdba74');
    makeGrad('ll-g-visit',   '#d97706', '#fcd34d');
    makeGrad('ll-g-head',    '#6366f1', '#a5b4fc');

    const getGrad = (i: number) => {
      if (activeIndices.includes(i)) {
        if (stepType === 'insert')  return 'url(#ll-g-insert)';
        if (stepType === 'delete')  return 'url(#ll-g-delete)';
        if (stepType === 'visit')   return 'url(#ll-g-visit)';
      }
      return 'url(#ll-g-default)';
    };
    const getStroke = (i: number) => {
      if (activeIndices.includes(i)) {
        if (stepType === 'insert') return '#cbff5e';
        if (stepType === 'delete') return '#fb923c';
        if (stepType === 'visit')  return '#fcd34d';
      }
      return isDark ? '#6366f1' : '#818cf8';
    };
    const getTextColor = (i: number) => {
      if (activeIndices.includes(i) && (stepType === 'insert' || stepType === 'visit'))
        return '#111827';
      return '#fff';
    };

    // ─── LAYOUT ────────────────────────────────────────────────────────
    const nodeW    = 82;
    const nodeH    = 52;
    const ptrW     = 26;   // pointer box width on right of node
    const dataW    = nodeW - ptrW;
    const gap      = 56;   // inter-node gap
    const n        = listData.length;
    const totalW   = n > 0 ? n * nodeW + (n - 1) * gap : 0;
    const startX   = n > 0 ? Math.max(50, (width - totalW) / 2) : width / 2 - 40;
    const cy       = height / 2 - nodeH / 2; // vertical center

    // ─── LAYERS ────────────────────────────────────────────────────────
    ['ll-layer-bg', 'll-layer-conn', 'll-layer-nodes', 'll-layer-labels'].forEach(cls => {
      if (svg.select(`.${cls}`).empty()) svg.append('g').attr('class', cls);
    });
    const connLayer  = svg.select<SVGGElement>('.ll-layer-conn');
    const nodesLayer = svg.select<SVGGElement>('.ll-layer-nodes');
    const labelLayer = svg.select<SVGGElement>('.ll-layer-labels');
    labelLayer.selectAll('*').remove();   // labels always re-drawn

    type ND = { id: string; val: number; i: number; x: number; y: number };
    const nodesData: ND[] = listData.map((val, i) => ({
      id: `nd-${val}-${i}`,
      val, i,
      x: startX + i * (nodeW + gap),
      y: cy,
    }));

    // ─── CONNECTIONS ───────────────────────────────────────────────────
    type CD = { id: string; sx: number; sy: number; tx: number; ty: number; active: boolean; isDelete: boolean };
    const connData: CD[] = nodesData.slice(0, -1).map((nd, i) => ({
      id: `conn-${nd.id}`,
      sx: nd.x + nodeW - ptrW / 2,
      sy: nd.y + nodeH / 2,
      tx: nodesData[i + 1].x - 4,
      ty: nodesData[i + 1].y + nodeH / 2,
      active:   stepType === 'visit'  && (activeIndices.includes(nd.i) || activeIndices.includes(nd.i + 1)),
      isDelete: stepType === 'delete' && activeIndices.includes(nd.i + 1),
    }));

    const conn = connLayer.selectAll<SVGGElement, CD>('g.ll-conn').data(connData, d => d.id);

    // ENTER connections
    const connEnter = conn.enter().append('g').attr('class', 'll-conn');
    connEnter.append('line').attr('class', 'll-conn-line')
      .attr('x1', d => d.sx).attr('y1', d => d.sy)
      .attr('x2', d => d.sx).attr('y2', d => d.sy)  // start as zero-length
      .attr('stroke-width', 2.5).attr('opacity', 0);

    // UPDATE connections (merge enter + update)
    const connMerge = connEnter.merge(conn);
    connMerge.select('.ll-conn-line')
      .transition().duration(350).ease(d3.easeCubicOut)
      .attr('x1', d => d.sx).attr('y1', d => d.sy)
      .attr('x2', d => d.tx).attr('y2', d => d.ty)
      .attr('stroke', d => d.active ? arrowActive : d.isDelete ? arrowDelete : arrowDefault)
      .attr('marker-end', d => d.active ? 'url(#ll-arrow-active)' : d.isDelete ? 'url(#ll-arrow-delete)' : 'url(#ll-arrow)')
      .attr('opacity', 1);

    // EXIT connections
    conn.exit()
      .transition().duration(250).attr('opacity', 0).remove();

    // ─── NODES ─────────────────────────────────────────────────────────
    const nodes = nodesLayer.selectAll<SVGGElement, ND>('g.ll-node').data(nodesData, d => d.id);

    // ENTER nodes — drop from above for insert, slide from left for head insert
    const nodeEnter = nodes.enter().append('g').attr('class', 'll-node')
      .attr('transform', d => {
        if (stepType === 'insert') {
          // New head comes from the left, new tail from above
          if (d.i === 0 && listData.length === (activeIndices[0] ?? -1) + 1) {
            return `translate(${d.x - 80}, ${d.y}) scale(0.4)`;
          }
          return `translate(${d.x}, ${d.y - 120}) scale(0.5)`;
        }
        return `translate(${d.x}, ${d.y}) scale(0.5)`;
      })
      .style('opacity', 0);

    // Glow ring
    nodeEnter.append('rect').attr('class', 'll-glow')
      .attr('x', -5).attr('y', -5)
      .attr('width', nodeW + 10).attr('height', nodeH + 10)
      .attr('rx', 11).attr('fill', 'none')
      .attr('stroke-width', 2.5).attr('stroke-opacity', 0.9)
      .attr('stroke', d => getStroke(d.i)).style('opacity', 0);

    // Main node body (data section)
    nodeEnter.append('rect').attr('class', 'll-body')
      .attr('width', dataW).attr('height', nodeH)
      .attr('rx', 8).attr('ry', 8)
      .attr('fill', d => getGrad(d.i));

    // Pointer compartment
    nodeEnter.append('rect').attr('class', 'll-ptr')
      .attr('x', dataW).attr('y', 0)
      .attr('width', ptrW).attr('height', nodeH)
      .attr('rx', 8).attr('ry', 8)
      .attr('fill', isDark ? '#1e2438' : '#e2e8f0')
      .attr('stroke', isDark ? '#2f3352' : '#cbd5e1').attr('stroke-width', 1.5);

    // Divider line between data & pointer
    nodeEnter.append('rect')
      .attr('x', dataW).attr('y', 4)
      .attr('width', 1.5).attr('height', nodeH - 8)
      .attr('fill', isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)');

    // Glass shine
    nodeEnter.append('rect')
      .attr('x', 2).attr('y', 2)
      .attr('width', dataW - 4).attr('height', nodeH / 3)
      .attr('rx', 6).attr('fill', 'rgba(255,255,255,0.18)').style('pointer-events', 'none');

    // Value text
    nodeEnter.append('text').attr('class', 'll-val')
      .attr('x', dataW / 2).attr('y', nodeH / 2).attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('font-family', 'monospace').attr('font-weight', 'bold').attr('font-size', '17px')
      .attr('fill', d => getTextColor(d.i))
      .text(d => d.val);

    // Pointer dot
    nodeEnter.append('circle').attr('class', 'll-dot')
      .attr('cx', dataW + ptrW / 2).attr('cy', nodeH / 2)
      .attr('r', 4.5)
      .attr('fill', arrowDefault);

    // Index label below
    nodeEnter.append('text').attr('class', 'll-idx')
      .attr('x', nodeW / 2).attr('y', nodeH + 18)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'monospace').attr('font-size', '10px').attr('font-weight', 'bold')
      .attr('fill', isDark ? '#334155' : '#94a3b8')
      .text(d => `[${d.i}]`);

    // Animate entrance
    nodeEnter.transition().duration(420).ease(d3.easeBackOut.overshoot(1.4))
      .attr('transform', d => `translate(${d.x}, ${d.y}) scale(1)`)
      .style('opacity', 1);

    // UPDATE existing nodes — smooth slide to new positions
    const nodeMerge = nodeEnter.merge(nodes);
    nodeMerge.transition().duration(380).ease(d3.easeCubicInOut)
      .attr('transform', d => `translate(${d.x}, ${d.y}) scale(1)`)
      .style('opacity', 1);

    nodeMerge.select('.ll-body').transition().duration(380)
      .attr('fill', d => getGrad(d.i));

    nodeMerge.select('.ll-glow')
      .transition().duration(380)
      .attr('stroke', d => getStroke(d.i))
      .style('opacity', d => activeIndices.includes(d.i) ? 1 : 0);

    nodeMerge.select('.ll-val').transition().duration(380)
      .attr('fill', d => getTextColor(d.i));

    nodeMerge.select('.ll-idx').text(d => `[${d.i}]`);

    // EXIT nodes — fly up (head) or fly right (tail), shrink
    nodes.exit()
      .transition().duration(320).ease(d3.easeCubicIn)
      .attr('transform', (d: any) => {
        // exiting head goes left, exiting tail goes right
        const isHead = d.i === 0;
        const ex = isHead ? d.x - 90 : d.x + 90;
        return `translate(${ex}, ${d.y - 60}) scale(0.3)`;
      })
      .style('opacity', 0)
      .remove();

    // ─── LABELS ────────────────────────────────────────────────────────
    if (n > 0) {
      // HEAD arrow + label
      const headX = nodesData[0].x + dataW / 2;
      const headG = labelLayer.append('g')
        .attr('transform', `translate(${headX}, ${cy - 44})`).style('opacity', 0);
      headG.append('text')
        .attr('text-anchor', 'middle')
        .attr('font-family', 'monospace').attr('font-size', '11px').attr('font-weight', '800')
        .attr('letter-spacing', '0.15em')
        .attr('fill', isDark ? '#818cf8' : '#4f46e5')
        .text('HEAD');
      headG.append('line')
        .attr('x1', 0).attr('y1', 5).attr('x2', 0).attr('y2', 22)
        .attr('stroke', isDark ? '#818cf8' : '#4f46e5').attr('stroke-width', 1.8)
        .attr('marker-end', 'url(#ll-arrow-head)');
      headG.transition().duration(300).delay(100).style('opacity', 1);

      // NULL label after tail
      const lastNd = nodesData[n - 1];
      const nullX  = lastNd.x + nodeW + gap * 0.55;
      const nullG  = labelLayer.append('g')
        .attr('transform', `translate(${nullX}, ${cy + nodeH / 2})`).style('opacity', 0);
      nullG.append('line')
        .attr('x1', -(gap * 0.55 - ptrW / 2)).attr('y1', 0)
        .attr('x2', -12).attr('y2', 0)
        .attr('stroke', arrowDefault).attr('stroke-width', 2)
        .attr('marker-end', 'url(#ll-arrow)');
      nullG.append('rect')
        .attr('x', 0).attr('y', -12)
        .attr('width', 38).attr('height', 24).attr('rx', 5)
        .attr('fill', isDark ? 'rgba(239,68,68,0.12)' : 'rgba(220,38,38,0.08)')
        .attr('stroke', '#ef4444').attr('stroke-width', 1.2);
      nullG.append('text')
        .attr('x', 19).attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('font-family', 'monospace').attr('font-size', '11px').attr('font-weight', 'bold')
        .attr('fill', '#ef4444')
        .text('NULL');
      nullG.transition().duration(300).delay(200).style('opacity', 1);

    } else {
      // Empty state
      labelLayer.append('text')
        .attr('x', width / 2).attr('y', height / 2).attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('font-family', 'monospace').attr('font-size', '16px').attr('font-weight', 'bold')
        .attr('fill', isDark ? '#334155' : '#cbd5e1')
        .text('HEAD  →  NULL');
    }

    // ─── PENDING "NEW NODE" GHOST ───────────────────────────────────────
    if (pendingNode !== undefined && stepType === 'highlight') {
      const ghostX = n === 0 ? startX : nodesData[n - 1].x + nodeW + gap;
      const ghostY = cy - 90;
      const ghostG = labelLayer.append('g')
        .attr('transform', `translate(${ghostX}, ${ghostY}) scale(0.8)`).style('opacity', 0);

      // Pulsing dashed outline
      ghostG.append('rect')
        .attr('width', nodeW).attr('height', nodeH).attr('rx', 8)
        .attr('fill', 'rgba(203,255,94,0.06)').attr('stroke', '#cbff5e')
        .attr('stroke-width', 2).attr('stroke-dasharray', '5 3');
      ghostG.append('text')
        .attr('x', nodeW / 2).attr('y', nodeH / 2).attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('font-family', 'monospace').attr('font-size', '17px').attr('font-weight', 'bold')
        .attr('fill', '#cbff5e').text(pendingNode);
      ghostG.append('text')
        .attr('x', nodeW / 2).attr('y', -14)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'monospace').attr('font-size', '10px').attr('font-weight', 'bold')
        .attr('fill', isDark ? '#94a3b8' : '#64748b').attr('letter-spacing', '0.1em')
        .text('NEW NODE');

      ghostG.transition().duration(350).ease(d3.easeBackOut.overshoot(1.2))
        .attr('transform', `translate(${ghostX}, ${ghostY}) scale(1)`).style('opacity', 1);
    }

  }, [currentStepData, resolvedTheme]);

  return (
    <div className="w-full h-full relative overflow-hidden" ref={containerRef}>
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-40 bg-indigo-500/8 rounded-full blur-[70px] pointer-events-none" />
      <svg ref={svgRef} className="block w-full h-full relative z-10" />
    </div>
  );
}
