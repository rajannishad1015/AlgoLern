"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from 'next-themes';
import { AlgorithmStep } from '@/lib/types/algorithm';

interface DoublyLinkedListVizProps {
  currentStepData: AlgorithmStep | undefined;
}

export function DoublyLinkedListViz({ currentStepData }: DoublyLinkedListVizProps) {
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

    const setupMarker = (id: string, color: string, reverse = false) => {
      let m = defs.select<SVGMarkerElement>(`#${id}`);
      if (m.empty()) {
        m = defs.append('marker')
          .attr('id', id).attr('viewBox', '0 -5 10 10')
          .attr('refX', reverse ? 3 : 7).attr('refY', 0)
          .attr('markerWidth', 5).attr('markerHeight', 5)
          .attr('orient', 'auto');
        
        if (reverse) {
          m.append('path').attr('d', 'M10,-5L0,0L10,5'); // pointing left
        } else {
          m.append('path').attr('d', 'M0,-5L10,0L0,5'); // pointing right
        }
      }
      m.select('path').attr('fill', color);
    };

    const arrowDefault = isDark ? '#475569' : '#94a3b8';
    const arrowActive  = '#cbff5e';
    const arrowDelete  = '#fb923c';
    
    // Forward arrows (NEXT)
    setupMarker('dll-arrow', arrowDefault, false);
    setupMarker('dll-arrow-active', arrowActive, false);
    setupMarker('dll-arrow-delete', arrowDelete, false);
    
    // Backward arrows (PREV)
    setupMarker('dll-arrow-rev', arrowDefault, true);
    setupMarker('dll-arrow-rev-active', arrowActive, true);
    setupMarker('dll-arrow-rev-delete', arrowDelete, true);
    
    // Head/Tail labels marker
    setupMarker('dll-arrow-head', isDark ? '#a5b4fc' : '#4f46e5', false);
    setupMarker('dll-arrow-tail', isDark ? '#fdba74' : '#ea6d0a', false);

    const makeGrad = (id: string, c1: string, c2: string) => {
      if (defs.select(`#${id}`).empty()) {
        const g = defs.append('linearGradient').attr('id', id)
          .attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '0%');
        g.append('stop').attr('offset', '0%').attr('stop-color', c1);
        g.append('stop').attr('offset', '100%').attr('stop-color', c2);
      }
    };
    makeGrad('dll-g-default', '#818cf8', '#4f46e5');
    makeGrad('dll-g-insert',  '#a8d43a', '#cbff5e');
    makeGrad('dll-g-delete',  '#ea6d0a', '#fdba74');
    makeGrad('dll-g-visit',   '#d97706', '#fcd34d');

    const getGrad = (i: number) => {
      if (activeIndices.includes(i)) {
        if (stepType === 'insert')  return 'url(#dll-g-insert)';
        if (stepType === 'delete')  return 'url(#dll-g-delete)';
        if (stepType === 'visit')   return 'url(#dll-g-visit)';
      }
      return 'url(#dll-g-default)';
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
    const ptrW     = 22;   // pointer box width (need 2 of these)
    const dataW    = 52;   // central data width
    const nodeW    = ptrW + dataW + ptrW; // 22 + 52 + 22 = 96
    const nodeH    = 52;
    const gap      = 60;   // inter-node gap (needs to be large enough for 2 arrows)
    
    // Vertical offsets for NEXT vs PREV arrows so they don't overlap
    // NEXT goes from top half, PREV goes from bottom half
    const nextYOffset = -10;
    const prevYOffset = 10;
    
    const n        = listData.length;
    const totalW   = n > 0 ? n * nodeW + (n - 1) * gap : 0;
    const startX   = n > 0 ? Math.max(70, (width - totalW) / 2) : width / 2 - 48;
    const cy       = height / 2 - nodeH / 2; // vertical center

    // ─── LAYERS ────────────────────────────────────────────────────────
    ['dll-layer-bg', 'dll-layer-conn-next', 'dll-layer-conn-prev', 'dll-layer-nodes', 'dll-layer-labels'].forEach(cls => {
      if (svg.select(`.${cls}`).empty()) svg.append('g').attr('class', cls);
    });
    const nextConnLayer = svg.select<SVGGElement>('.dll-layer-conn-next');
    const prevConnLayer = svg.select<SVGGElement>('.dll-layer-conn-prev');
    const nodesLayer    = svg.select<SVGGElement>('.dll-layer-nodes');
    const labelLayer    = svg.select<SVGGElement>('.dll-layer-labels');
    labelLayer.selectAll('*').remove();

    type ND = { id: string; val: number; i: number; x: number; y: number };
    const nodesData: ND[] = listData.map((val, i) => ({
      id: `nd-${val}-${i}`, val, i,
      x: startX + i * (nodeW + gap), y: cy,
    }));

    // ─── CONNECTIONS (NEXT ARROWS) ─────────────────────────────────────
    type CD = { id: string; sx: number; sy: number; tx: number; ty: number; active: boolean; isDelete: boolean };
    const nextConnData: CD[] = nodesData.slice(0, -1).map((nd, i) => ({
      id: `next-${nd.id}`,
      sx: nd.x + nodeW - ptrW / 2,
      sy: nd.y + nodeH / 2 + nextYOffset,
      tx: nodesData[i + 1].x - 4,
      ty: nodesData[i + 1].y + nodeH / 2 + nextYOffset,
      active:   stepType === 'visit'  && (activeIndices.includes(nd.i) || activeIndices.includes(nd.i + 1)),
      isDelete: stepType === 'delete' && activeIndices.includes(nd.i + 1),
    }));

    const nextConn = nextConnLayer.selectAll<SVGGElement, CD>('g.dll-conn-next').data(nextConnData, d => d.id);
    const nextEnter = nextConn.enter().append('g').attr('class', 'dll-conn-next');
    nextEnter.append('line').attr('class', 'dll-next-line')
      .attr('x1', d => d.sx).attr('y1', d => d.sy).attr('x2', d => d.sx).attr('y2', d => d.sy)
      .attr('stroke-width', 2).attr('opacity', 0);

    const nextMerge = nextEnter.merge(nextConn);
    nextMerge.select('.dll-next-line')
      .transition().duration(350).ease(d3.easeCubicOut)
      .attr('x1', d => d.sx).attr('y1', d => d.sy).attr('x2', d => d.tx).attr('y2', d => d.ty)
      .attr('stroke', d => d.active ? arrowActive : d.isDelete ? arrowDelete : arrowDefault)
      .attr('marker-end', d => d.active ? 'url(#dll-arrow-active)' : d.isDelete ? 'url(#dll-arrow-delete)' : 'url(#dll-arrow)')
      .attr('opacity', 1);

    nextConn.exit().transition().duration(250).attr('opacity', 0).remove();

    // ─── CONNECTIONS (PREV ARROWS) ─────────────────────────────────────
    // Note: PREV arrow goes from node[i+1] back to node[i]
    const prevConnData: CD[] = nodesData.slice(0, -1).map((nd, i) => ({
      id: `prev-${nd.id}`,
      sx: nodesData[i + 1].x + ptrW / 2,
      sy: nodesData[i + 1].y + nodeH / 2 + prevYOffset,
      tx: nd.x + nodeW + 4,
      ty: nd.y + nodeH / 2 + prevYOffset,
      active:   stepType === 'visit'  && (activeIndices.includes(nd.i) || activeIndices.includes(nd.i + 1)),
      isDelete: stepType === 'delete' && activeIndices.includes(nd.i + 1),
    }));

    const prevConn = prevConnLayer.selectAll<SVGGElement, CD>('g.dll-conn-prev').data(prevConnData, d => d.id);
    const prevEnter = prevConn.enter().append('g').attr('class', 'dll-conn-prev');
    prevEnter.append('line').attr('class', 'dll-prev-line')
      .attr('x1', d => d.sx).attr('y1', d => d.sy).attr('x2', d => d.sx).attr('y2', d => d.sy)
      .attr('stroke-width', 2).attr('opacity', 0);

    const prevMerge = prevEnter.merge(prevConn);
    prevMerge.select('.dll-prev-line')
      .transition().duration(350).ease(d3.easeCubicOut)
      .attr('x1', d => d.sx).attr('y1', d => d.sy).attr('x2', d => d.tx).attr('y2', d => d.ty)
      .attr('stroke', d => d.active ? arrowActive : d.isDelete ? arrowDelete : arrowDefault)
      .attr('marker-end', d => d.active ? 'url(#dll-arrow-rev-active)' : d.isDelete ? 'url(#dll-arrow-rev-delete)' : 'url(#dll-arrow-rev)')
      .attr('opacity', 1);

    prevConn.exit().transition().duration(250).attr('opacity', 0).remove();


    // ─── NODES ─────────────────────────────────────────────────────────
    const nodes = nodesLayer.selectAll<SVGGElement, ND>('g.dll-node').data(nodesData, d => d.id);

    const nodeEnter = nodes.enter().append('g').attr('class', 'dll-node')
      .attr('transform', d => {
        if (stepType === 'insert') {
          if (d.i === 0 && listData.length === (activeIndices[0] ?? -1) + 1) return `translate(${d.x - 90}, ${d.y}) scale(0.4)`;
          return `translate(${d.x}, ${d.y - 120}) scale(0.5)`;
        }
        return `translate(${d.x}, ${d.y}) scale(0.5)`;
      })
      .style('opacity', 0);

    // Glow ring
    nodeEnter.append('rect').attr('class', 'dll-glow')
      .attr('x', -5).attr('y', -5)
      .attr('width', nodeW + 10).attr('height', nodeH + 10)
      .attr('rx', 11).attr('fill', 'none')
      .attr('stroke-width', 2.5).attr('stroke-opacity', 0.9)
      .attr('stroke', d => getStroke(d.i)).style('opacity', 0);

    // PREV Pointer compartment (Left Side)
    nodeEnter.append('rect').attr('class', 'dll-ptr-prev')
      .attr('x', 0).attr('y', 0)
      .attr('width', ptrW + 8).attr('height', nodeH) // +8 so it tucks under the main body
      .attr('rx', 8).attr('ry', 8)
      .attr('fill', isDark ? '#1e2438' : '#e2e8f0')
      .attr('stroke', isDark ? '#2f3352' : '#cbd5e1').attr('stroke-width', 1.5);

    // Main node body (Center data section) overlaps the inner edges of ptr boxes
    nodeEnter.append('rect').attr('class', 'dll-body')
      .attr('x', ptrW).attr('width', dataW).attr('height', nodeH)
      .attr('fill', d => getGrad(d.i));

    // NEXT Pointer compartment (Right Side)
    nodeEnter.append('rect').attr('class', 'dll-ptr-next')
      .attr('x', ptrW + dataW - 8).attr('y', 0)
      .attr('width', ptrW + 8).attr('height', nodeH)
      .attr('rx', 8).attr('ry', 8)
      .attr('fill', isDark ? '#1e2438' : '#e2e8f0')
      .attr('stroke', isDark ? '#2f3352' : '#cbd5e1').attr('stroke-width', 1.5);

    // Dividers
    nodeEnter.append('rect').attr('x', ptrW).attr('y', 4).attr('width', 1.5).attr('height', nodeH - 8).attr('fill', isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)');
    nodeEnter.append('rect').attr('x', ptrW + dataW - 1.5).attr('y', 4).attr('width', 1.5).attr('height', nodeH - 8).attr('fill', isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)');

    // Glass shine for data block
    nodeEnter.append('rect')
      .attr('x', ptrW + 2).attr('y', 2)
      .attr('width', dataW - 4).attr('height', nodeH / 3)
      .attr('rx', 4).attr('fill', 'rgba(255,255,255,0.18)').style('pointer-events', 'none');

    // Value text
    nodeEnter.append('text').attr('class', 'dll-val')
      .attr('x', ptrW + dataW / 2).attr('y', nodeH / 2).attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('font-family', 'monospace').attr('font-weight', 'bold').attr('font-size', '17px')
      .attr('fill', d => getTextColor(d.i)).text(d => d.val);

    // Pointer dots
    nodeEnter.append('circle').attr('cx', ptrW / 2).attr('cy', nodeH / 2 + prevYOffset).attr('r', 3).attr('fill', arrowDefault); // PREV dot
    nodeEnter.append('circle').attr('cx', ptrW + dataW + ptrW / 2).attr('cy', nodeH / 2 + nextYOffset).attr('r', 3).attr('fill', arrowDefault); // NEXT dot

    // Index label below
    nodeEnter.append('text').attr('class', 'dll-idx')
      .attr('x', nodeW / 2).attr('y', nodeH + 18)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'monospace').attr('font-size', '10px').attr('font-weight', 'bold')
      .attr('fill', isDark ? '#334155' : '#94a3b8').text(d => `[${d.i}]`);

    // Entrance Animation
    nodeEnter.transition().duration(420).ease(d3.easeBackOut.overshoot(1.4))
      .attr('transform', d => `translate(${d.x}, ${d.y}) scale(1)`).style('opacity', 1);

    // Update existing nodes
    const nodeMerge = nodeEnter.merge(nodes);
    nodeMerge.transition().duration(380).ease(d3.easeCubicInOut)
      .attr('transform', d => `translate(${d.x}, ${d.y}) scale(1)`).style('opacity', 1);

    nodeMerge.select('.dll-body').transition().duration(380).attr('fill', d => getGrad(d.i));
    nodeMerge.select('.dll-glow').transition().duration(380)
      .attr('stroke', d => getStroke(d.i))
      .style('opacity', d => activeIndices.includes(d.i) ? 1 : 0);
    nodeMerge.select('.dll-val').transition().duration(380).attr('fill', d => getTextColor(d.i));
    nodeMerge.select('.dll-idx').text(d => `[${d.i}]`);

    // Exit nodes
    nodes.exit()
      .transition().duration(320).ease(d3.easeCubicIn)
      .attr('transform', (d: any) => {
        const isHead = d.i === 0;
        return `translate(${isHead ? d.x - 100 : d.x + 100}, ${d.y - 60}) scale(0.3)`;
      })
      .style('opacity', 0).remove();

    // ─── LABELS (HEAD, tail, null) ─────────────────────────────────────
    if (n > 0) {
      // HEAD Label
      const headX = nodesData[0].x + ptrW + dataW / 2;
      const headG = labelLayer.append('g').attr('transform', `translate(${headX}, ${cy - 44})`).style('opacity', 0);
      headG.append('text').attr('text-anchor', 'middle')
        .attr('font-family', 'monospace').attr('font-size', '11px').attr('font-weight', '800')
        .attr('letter-spacing', '0.15em').attr('fill', isDark ? '#818cf8' : '#4f46e5').text('HEAD');
      headG.append('line').attr('x1', 0).attr('y1', 5).attr('x2', 0).attr('y2', 22)
        .attr('stroke', isDark ? '#818cf8' : '#4f46e5').attr('stroke-width', 1.8)
        .attr('marker-end', 'url(#dll-arrow-head)');
      headG.transition().duration(300).delay(100).style('opacity', 1);

      // TAIL Label
      const tailX = nodesData[n - 1].x + ptrW + dataW / 2;
      const tailG = labelLayer.append('g').attr('transform', `translate(${tailX}, ${cy + nodeH + 40})`).style('opacity', 0);
      tailG.append('text').attr('text-anchor', 'middle').attr('dy', '0.35em')
        .attr('font-family', 'monospace').attr('font-size', '11px').attr('font-weight', '800')
        .attr('letter-spacing', '0.15em').attr('fill', isDark ? '#fdba74' : '#ea6d0a').text('TAIL');
      tailG.append('line').attr('x1', 0).attr('y1', -15).attr('x2', 0).attr('y2', -30)
        .attr('stroke', isDark ? '#fdba74' : '#ea6d0a').attr('stroke-width', 1.8)
        .attr('marker-end', 'url(#dll-arrow-tail)');
      tailG.transition().duration(300).delay(150).style('opacity', 1);

      // NULL (Left Side from PREV of Head)
      const nullLeftX = nodesData[0].x - gap * 0.7;
      const nlGroup = labelLayer.append('g')
        .attr('transform', `translate(${nullLeftX}, ${cy + nodeH / 2 + prevYOffset})`).style('opacity', 0);
      nlGroup.append('rect').attr('x', -19).attr('y', -12).attr('width', 38).attr('height', 24).attr('rx', 5)
        .attr('fill', isDark ? 'rgba(239,68,68,0.12)' : 'rgba(220,38,38,0.08)')
        .attr('stroke', '#ef4444').attr('stroke-width', 1.2);
      nlGroup.append('text').attr('x', 0).attr('dy', '0.35em').attr('text-anchor', 'middle')
        .attr('font-family', 'monospace').attr('font-size', '10px').attr('font-weight', 'bold').attr('fill', '#ef4444').text('NULL');
      // Line backwards from head to NULL
      nlGroup.append('line').attr('x1', gap * 0.7).attr('y1', 0).attr('x2', 25).attr('y2', 0)
        .attr('stroke', arrowDefault).attr('stroke-width', 2).attr('marker-end', 'url(#dll-arrow-rev)');
      nlGroup.transition().duration(300).delay(200).style('opacity', 1);

      // NULL (Right Side from NEXT of Tail)
      const nullRightX = nodesData[n - 1].x + nodeW + gap * 0.7;
      const nrGroup = labelLayer.append('g')
        .attr('transform', `translate(${nullRightX}, ${cy + nodeH / 2 + nextYOffset})`).style('opacity', 0);
      nrGroup.append('rect').attr('x', -19).attr('y', -12).attr('width', 38).attr('height', 24).attr('rx', 5)
        .attr('fill', isDark ? 'rgba(239,68,68,0.12)' : 'rgba(220,38,38,0.08)')
        .attr('stroke', '#ef4444').attr('stroke-width', 1.2);
      nrGroup.append('text').attr('x', 0).attr('dy', '0.35em').attr('text-anchor', 'middle')
        .attr('font-family', 'monospace').attr('font-size', '10px').attr('font-weight', 'bold').attr('fill', '#ef4444').text('NULL');
      // Line forwards from tail to NULL
      nrGroup.append('line').attr('x1', -(gap * 0.7)).attr('y1', 0).attr('x2', -25).attr('y2', 0)
        .attr('stroke', arrowDefault).attr('stroke-width', 2).attr('marker-end', 'url(#dll-arrow)');
      nrGroup.transition().duration(300).delay(200).style('opacity', 1);

    } else {
      labelLayer.append('text').attr('x', width / 2).attr('y', height / 2).attr('dy', '0.35em').attr('text-anchor', 'middle')
        .attr('font-family', 'monospace').attr('font-size', '16px').attr('font-weight', 'bold')
        .attr('fill', isDark ? '#334155' : '#cbd5e1')
        .text('NULL ← HEAD / TAIL → NULL');
    }

    // ─── PENDING GHOST NODE ────────────────────────────────────────────
    if (pendingNode !== undefined && stepType === 'highlight') {
      const ghostX = n === 0 ? startX : nodesData[n - 1].x + nodeW + gap;
      const ghostY = cy - 100;
      const ghostG = labelLayer.append('g').attr('transform', `translate(${ghostX}, ${ghostY}) scale(0.8)`).style('opacity', 0);
      ghostG.append('rect').attr('width', nodeW).attr('height', nodeH).attr('rx', 8)
        .attr('fill', 'rgba(203,255,94,0.06)').attr('stroke', '#cbff5e')
        .attr('stroke-width', 2).attr('stroke-dasharray', '5 3');
      ghostG.append('text').attr('x', nodeW / 2).attr('y', nodeH / 2).attr('dy', '0.35em').attr('text-anchor', 'middle')
        .attr('font-family', 'monospace').attr('font-size', '17px').attr('font-weight', 'bold').attr('fill', '#cbff5e').text(pendingNode);
      ghostG.append('text').attr('x', nodeW / 2).attr('y', -14).attr('text-anchor', 'middle')
        .attr('font-family', 'monospace').attr('font-size', '10px').attr('font-weight', 'bold')
        .attr('fill', isDark ? '#94a3b8' : '#64748b').attr('letter-spacing', '0.1em').text('NEW NODE');
      ghostG.transition().duration(350).ease(d3.easeBackOut.overshoot(1.2))
        .attr('transform', `translate(${ghostX}, ${ghostY}) scale(1)`).style('opacity', 1);
    }

  }, [currentStepData, resolvedTheme]);

  return (
    <div className="w-full h-full relative overflow-hidden" ref={containerRef}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-48 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
      <svg ref={svgRef} className="block w-full h-full relative z-10" />
    </div>
  );
}
