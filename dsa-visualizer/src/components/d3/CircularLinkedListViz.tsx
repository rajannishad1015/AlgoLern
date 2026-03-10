"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from 'next-themes';
import { AlgorithmStep } from '@/lib/types/algorithm';

interface CircularLinkedListVizProps {
  currentStepData: AlgorithmStep | undefined;
}

export function CircularLinkedListViz({ currentStepData }: CircularLinkedListVizProps) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 450;
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
    setupMarker('cll-arrow', arrowDefault);
    setupMarker('cll-arrow-active', arrowActive);
    setupMarker('cll-arrow-delete', arrowDelete);
    setupMarker('cll-arrow-head', isDark ? '#a5b4fc' : '#4f46e5');
    setupMarker('cll-arrow-tail', isDark ? '#fdba74' : '#ea6d0a');
    setupMarker('cll-arrow-circular', isDark ? '#c084fc' : '#9333ea');

    const makeGrad = (id: string, c1: string, c2: string) => {
      if (defs.select(`#${id}`).empty()) {
        const g = defs.append('linearGradient').attr('id', id)
          .attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '100%');
        g.append('stop').attr('offset', '0%').attr('stop-color', c1);
        g.append('stop').attr('offset', '100%').attr('stop-color', c2);
      }
    };
    makeGrad('cll-g-default', '#818cf8', '#4f46e5');
    makeGrad('cll-g-insert',  '#a8d43a', '#cbff5e');
    makeGrad('cll-g-delete',  '#ea6d0a', '#fdba74');
    makeGrad('cll-g-visit',   '#d97706', '#fcd34d');

    const getGrad = (i: number) => {
      if (activeIndices.includes(i)) {
        if (stepType === 'insert')  return 'url(#cll-g-insert)';
        if (stepType === 'delete')  return 'url(#cll-g-delete)';
        if (stepType === 'visit')   return 'url(#cll-g-visit)';
      }
      return 'url(#cll-g-default)';
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
      if (activeIndices.includes(i) && (stepType === 'insert' || stepType === 'visit')) return '#111827';
      return '#fff';
    };

    // ─── LAYOUT ────────────────────────────────────────────────────────
    const dataW  = 52;
    const ptrW   = 32;
    const nodeW  = dataW + ptrW; // 84
    const nodeH  = 52;
    const gap    = 45;
    const n      = listData.length;
    const totalW = n > 0 ? n * nodeW + (n - 1) * gap : 0;
    const startX = n > 0 ? Math.max(70, (width - totalW) / 2) : width / 2 - 42;
    const cy     = height / 2; // vertical center

    // ─── LAYERS ────────────────────────────────────────────────────────
    ['cll-layer-bg', 'cll-layer-conn', 'cll-layer-nodes', 'cll-layer-labels'].forEach(cls => {
      if (svg.select(`.${cls}`).empty()) svg.append('g').attr('class', cls);
    });
    const connLayer  = svg.select<SVGGElement>('.cll-layer-conn');
    const nodesLayer = svg.select<SVGGElement>('.cll-layer-nodes');
    const labelLayer = svg.select<SVGGElement>('.cll-layer-labels');
    labelLayer.selectAll('*').remove();

    type ND = { id: string; val: number; i: number; x: number; y: number };
    const nodesData: ND[] = listData.map((val, i) => ({
      id: `nd-${val}-${i}`, val, i,
      x: startX + i * (nodeW + gap), y: cy,
    }));

    // ─── CONNECTIONS (Standard NEXT arrows) ────────────────────────────
    type CD = { id: string; sx: number; sy: number; tx: number; ty: number; active: boolean; isDelete: boolean };
    const connData: CD[] = nodesData.slice(0, -1).map((nd, i) => ({
      id: `conn-${nd.id}`,
      sx: nd.x + nodeW - ptrW / 2, sy: nd.y,
      tx: nodesData[i+1].x - 4,    ty: nodesData[i+1].y,
      active:   stepType === 'visit'  && (activeIndices.includes(nd.i) || activeIndices.includes(nd.i + 1)),
      isDelete: stepType === 'delete' && activeIndices.includes(nd.i + 1),
    }));

    const conns = connLayer.selectAll<SVGGElement, CD>('g.cll-conn').data(connData, d => d.id);
    const connEnter = conns.enter().append('g').attr('class', 'cll-conn');
    
    connEnter.append('line').attr('class', 'cll-line')
      .attr('x1', d => d.sx).attr('y1', d => d.sy).attr('x2', d => d.sx).attr('y2', d => d.sy)
      .attr('stroke-width', 2).attr('opacity', 0);

    const connMerge = connEnter.merge(conns);
    connMerge.select('.cll-line')
      .transition().duration(350).ease(d3.easeCubicOut)
      .attr('x1', d => d.sx).attr('y1', d => d.sy).attr('x2', d => d.tx).attr('y2', d => d.ty)
      .attr('stroke', d => d.active ? arrowActive : d.isDelete ? arrowDelete : arrowDefault)
      .attr('marker-end', d => d.active ? 'url(#cll-arrow-active)' : d.isDelete ? 'url(#cll-arrow-delete)' : 'url(#cll-arrow)')
      .attr('opacity', 1);

    conns.exit().transition().duration(250).attr('opacity', 0).remove();

    // ─── CIRCULAR CONNECTION (TAIL -> HEAD) ─────────────────────────────
    // Draw a curved line from the last node's NEXT pointer back to the first node's left edge
    const circConn = connLayer.selectAll('.cll-circ-conn').data(n > 0 ? [n] : []);
    
    const circEnter = circConn.enter().append('g').attr('class', 'cll-circ-conn');
    circEnter.append('path').attr('class', 'cll-circ-path')
      .attr('fill', 'none').attr('stroke-width', 2.5).attr('stroke-dasharray', '5,5')
      .attr('opacity', 0);
      
    const circMerge = circEnter.merge(circConn as any);
    
    if (n > 0) {
      const first = nodesData[0];
      const last = nodesData[n - 1];
      
      const sx = last.x + nodeW - ptrW / 2; // Tail's pointer circle
      const sy = last.y;                    // Vertical center of node
      const tx = first.x - 4;               // Head's left edge
      const ty = first.y;                   // Vertical center of head node
      
      const drop = 85; 
      const r = 20;
      const rx = sx + 30; // Right extension
      const lx = tx - 30; // Left extension
      
      let pathString = `M ${sx},${sy} `;
      pathString += `L ${rx - r},${sy} `;                     // Move right
      pathString += `Q ${rx},${sy} ${rx},${sy + r} `;         // Curve down
      pathString += `L ${rx},${sy + drop - r} `;              // Move down
      pathString += `Q ${rx},${sy + drop} ${rx - r},${sy + drop} `; // Curve left
      pathString += `L ${lx + r},${sy + drop} `;              // Move left under nodes
      pathString += `Q ${lx},${sy + drop} ${lx},${sy + drop - r} `; // Curve up
      pathString += `L ${lx},${ty + r} `;                     // Move up
      pathString += `Q ${lx},${ty} ${lx + r},${ty} `;         // Curve right
      pathString += `L ${tx},${ty}`;                          // Move right to target

      const activeColor = isDark ? '#c084fc' : '#9333ea';

      circMerge.select('.cll-circ-path')
        .transition().duration(400)
        .attr('d', pathString)
        .attr('stroke', activeColor)
        .attr('marker-end', 'url(#cll-arrow-circular)')
        .attr('opacity', (stepType === 'visit' || stepType === 'delete') ? 0.3 : 1);
    }
    
    circConn.exit().transition().duration(250).attr('opacity', 0).remove();


    // ─── NODES ─────────────────────────────────────────────────────────
    const nodes = nodesLayer.selectAll<SVGGElement, ND>('g.cll-node').data(nodesData, d => d.id);

    const nodeEnter = nodes.enter().append('g').attr('class', 'cll-node')
      .attr('transform', d => {
        if (stepType === 'insert') {
          if (d.i === 0 && listData.length === (activeIndices[0] ?? -1) + 1) return `translate(${d.x - 90}, ${d.y}) scale(0.4)`;
          return `translate(${d.x}, ${d.y - 120}) scale(0.5)`;
        }
        return `translate(${d.x}, ${d.y}) scale(0.5)`;
      })
      .style('opacity', 0);

    // Glow
    nodeEnter.append('rect').attr('class', 'cll-glow')
      .attr('x', -5).attr('y', -nodeH / 2 - 5)
      .attr('width', nodeW + 10).attr('height', nodeH + 10)
      .attr('rx', 11).attr('fill', 'none')
      .attr('stroke-width', 2.5).attr('stroke-opacity', 0.9)
      .attr('stroke', d => getStroke(d.i)).style('opacity', 0);

    // Pointer block (Right)
    nodeEnter.append('rect').attr('class', 'cll-ptr')
      .attr('x', dataW - 10).attr('y', -nodeH / 2)
      .attr('width', ptrW + 10).attr('height', nodeH).attr('rx', 8)
      .attr('fill', isDark ? '#1e2438' : '#e2e8f0')
      .attr('stroke', isDark ? '#2f3352' : '#cbd5e1').attr('stroke-width', 1.5);

    // Data block (Left)
    nodeEnter.append('rect').attr('class', 'cll-body')
      .attr('x', 0).attr('y', -nodeH / 2)
      .attr('width', dataW).attr('height', nodeH).attr('rx', 8).attr('ry', 8)
      .attr('fill', d => getGrad(d.i));

    // Divider
    nodeEnter.append('rect').attr('x', dataW).attr('y', -nodeH / 2 + 3).attr('width', 1.5).attr('height', nodeH - 6).attr('fill', isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)');

    // Glass shine
    nodeEnter.append('rect')
      .attr('x', 2).attr('y', -nodeH / 2 + 2).attr('width', dataW - 4).attr('height', nodeH / 3).attr('rx', 4).attr('fill', 'rgba(255,255,255,0.18)');

    // Text
    nodeEnter.append('text').attr('class', 'cll-val')
      .attr('x', dataW / 2).attr('y', 0).attr('dy', '0.35em').attr('text-anchor', 'middle')
      .attr('font-family', 'monospace').attr('font-weight', 'bold').attr('font-size', '18px')
      .attr('fill', d => getTextColor(d.i)).text(d => d.val);

    // Pointer Dot
    nodeEnter.append('circle').attr('cx', dataW + ptrW / 2).attr('cy', 0).attr('r', 3.5).attr('fill', arrowDefault);

    // Index
    nodeEnter.append('text').attr('class', 'cll-idx')
      .attr('x', nodeW / 2).attr('y', nodeH / 2 + 16).attr('text-anchor', 'middle')
      .attr('font-family', 'monospace').attr('font-size', '10px').attr('font-weight', 'bold')
      .attr('fill', isDark ? '#334155' : '#94a3b8').text(d => `[${d.i}]`);

    // Entrance
    nodeEnter.transition().duration(420).ease(d3.easeBackOut.overshoot(1.4))
      .attr('transform', d => `translate(${d.x}, ${d.y}) scale(1)`).style('opacity', 1);

    const nodeMerge = nodeEnter.merge(nodes);
    nodeMerge.transition().duration(380).ease(d3.easeCubicInOut)
      .attr('transform', d => `translate(${d.x}, ${d.y}) scale(1)`).style('opacity', 1);

    nodeMerge.select('.cll-body').transition().duration(380).attr('fill', d => getGrad(d.i));
    nodeMerge.select('.cll-glow').transition().duration(380).attr('stroke', d => getStroke(d.i))
      .style('opacity', d => activeIndices.includes(d.i) ? 1 : 0);
    nodeMerge.select('.cll-val').transition().duration(380).attr('fill', d => getTextColor(d.i));
    nodeMerge.select('.cll-idx').text(d => `[${d.i}]`);

    // Exit
    nodes.exit()
      .transition().duration(320).ease(d3.easeCubicIn)
      .attr('transform', (d: any) => {
        const isHead = d.i === 0;
        return `translate(${isHead ? d.x - 100 : d.x + 100}, ${d.y - 60}) scale(0.3)`;
      })
      .style('opacity', 0).remove();

    // ─── LABELS (HEAD, TAIL) ───────────────────────────────────────────
    if (n > 0) {
      // HEAD above 0th
      const headX = nodesData[0].x + dataW / 2;
      const headG = labelLayer.append('g').attr('transform', `translate(${headX}, ${cy - 70})`).style('opacity', 0);
      headG.append('text').attr('text-anchor', 'middle')
        .attr('font-family', 'monospace').attr('font-size', '11px').attr('font-weight', '800')
        .attr('letter-spacing', '0.15em').attr('fill', isDark ? '#818cf8' : '#4f46e5').text('HEAD');
      headG.append('line').attr('x1', 0).attr('y1', 5).attr('x2', 0).attr('y2', 28)
        .attr('stroke', isDark ? '#818cf8' : '#4f46e5').attr('stroke-width', 1.8)
        .attr('marker-end', 'url(#cll-arrow-head)');
      headG.transition().duration(300).delay(100).style('opacity', 1);

      // TAIL below nth
      const tailX = nodesData[n - 1].x + dataW / 2;
      const tailG = labelLayer.append('g').attr('transform', `translate(${tailX}, ${cy - 70})`).style('opacity', 0);
      tailG.append('text').attr('text-anchor', 'middle')
        .attr('font-family', 'monospace').attr('font-size', '11px').attr('font-weight', '800')
        .attr('letter-spacing', '0.15em').attr('fill', isDark ? '#fdba74' : '#ea6d0a').text('TAIL');
      tailG.append('line').attr('x1', 0).attr('y1', 5).attr('x2', 0).attr('y2', 28)
        .attr('stroke', isDark ? '#fdba74' : '#ea6d0a').attr('stroke-width', 1.8)
        .attr('marker-end', 'url(#cll-arrow-tail)');
      tailG.transition().duration(300).delay(150).style('opacity', 1);

    } else {
      labelLayer.append('text').attr('x', width / 2).attr('y', height / 2).attr('dy', '0.35em').attr('text-anchor', 'middle')
        .attr('font-family', 'monospace').attr('font-size', '16px').attr('font-weight', 'bold')
        .attr('fill', isDark ? '#334155' : '#cbd5e1')
        .text('EMPTY CIRCULAR LIST');
    }

    // ─── PENDING GHOST NODE ────────────────────────────────────────────
    if (pendingNode !== undefined && stepType === 'highlight') {
      const ghostX = n === 0 ? startX : nodesData[n - 1].x + nodeW + gap;
      const ghostY = cy - 100;
      const ghostG = labelLayer.append('g').attr('transform', `translate(${ghostX}, ${ghostY}) scale(0.8)`).style('opacity', 0);
      ghostG.append('rect').attr('y', -nodeH/2).attr('width', nodeW).attr('height', nodeH).attr('rx', 8)
        .attr('fill', 'rgba(203,255,94,0.06)').attr('stroke', '#cbff5e')
        .attr('stroke-width', 2).attr('stroke-dasharray', '5 3');
      ghostG.append('text').attr('x', nodeW / 2).attr('y', 0).attr('dy', '0.35em').attr('text-anchor', 'middle')
        .attr('font-family', 'monospace').attr('font-size', '17px').attr('font-weight', 'bold').attr('fill', '#cbff5e').text(pendingNode);
      ghostG.append('text').attr('x', nodeW / 2).attr('y', -nodeH/2 - 14).attr('text-anchor', 'middle')
        .attr('font-family', 'monospace').attr('font-size', '10px').attr('font-weight', 'bold')
        .attr('fill', isDark ? '#94a3b8' : '#64748b').attr('letter-spacing', '0.1em').text('NEW NODE');
      ghostG.transition().duration(350).ease(d3.easeBackOut.overshoot(1.2))
        .attr('transform', `translate(${ghostX}, ${ghostY}) scale(1)`).style('opacity', 1);
    }

  }, [currentStepData, resolvedTheme]);

  return (
    <div className="w-full h-full relative overflow-hidden" ref={containerRef}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-48 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
      <svg ref={svgRef} className="block w-full h-full relative z-10" />
    </div>
  );
}
