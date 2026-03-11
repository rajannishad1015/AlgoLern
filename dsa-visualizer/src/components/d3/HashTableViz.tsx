"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from 'next-themes';
import { AlgorithmStep } from '@/lib/types/algorithm';
import { HashTableState } from '@/lib/algorithms/data-structures/hashTable';

interface HashTableVizProps {
  currentStepData: AlgorithmStep | undefined;
  tableSize: number;
}

export function HashTableViz({ currentStepData, tableSize }: HashTableVizProps) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const width = containerRef.current.clientWidth;
    const stateDisplay = (currentStepData?.values?.table as HashTableState) || Array.from({ length: tableSize }, () => []);
    
    const isDark = resolvedTheme !== 'light';
    const isMobile = width < 600;

    // ─── RESPONSIVE LAYOUT DIMENSIONS ─────────────────────────
    const bucketW = isMobile ? 40 : 80;
    const bucketH = isMobile ? 40 : 60;
    const gapX = isMobile ? 6 : 14;
    const totalBgW = tableSize * bucketW + (tableSize - 1) * gapX;
    const startX = Math.max(10, (width - totalBgW) / 2);
    const startY = 120; // Top space for hash animation

    const entryW = bucketW - 4;
    const entryH = isMobile ? 24 : 36;
    const ptrH = isMobile ? 12 : 18;
    const chainGapY = isMobile ? 24 : 35;
    
    const maxChainLength = Math.max(...stateDisplay.map(b => b.length), 0);
    const requiredHeight = Math.max(300, startY + bucketH + maxChainLength * (entryH + ptrH + chainGapY) + 120);
    const height = requiredHeight;

    const svg = d3.select(svgRef.current);
    svg.attr('width', width).attr('height', height);

    const stepType = currentStepData?.type;
    const activeIndices = currentStepData?.indices || [];
    const pendingKey = currentStepData?.values?.pendingKey;
    const hashVal = currentStepData?.values?.hash;

    // ─── DEFS ──────────────────────────────────────────────────────────
    let defs = svg.select<SVGDefsElement>('defs');
    if (defs.empty()) defs = svg.append('defs');

    const setupMarker = (id: string, color: string) => {
      let m = defs.select<SVGMarkerElement>(`#${id}`);
      if (m.empty()) {
        m = defs.append('marker')
          .attr('id', id).attr('viewBox', '0 -5 10 10')
          .attr('refX', 7).attr('refY', 0)
          .attr('markerWidth', isMobile ? 4 : 5).attr('markerHeight', isMobile ? 4 : 5)
          .attr('orient', 'auto-start-reverse');
        m.append('path').attr('d', 'M0,-5L10,0L0,5');
      }
      m.select('path').attr('fill', color);
    };

    const arrowDefault = isDark ? '#475569' : '#94a3b8';
    const arrowActive  = '#cbff5e';
    setupMarker('ht-arrow', arrowDefault);
    setupMarker('ht-arrow-active', arrowActive);
    
    const makeGrad = (id: string, c1: string, c2: string) => {
      if (defs.select(`#${id}`).empty()) {
        const g = defs.append('linearGradient').attr('id', id)
          .attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '100%');
        g.append('stop').attr('offset', '0%').attr('stop-color', c1);
        g.append('stop').attr('offset', '100%').attr('stop-color', c2);
      }
    };
    makeGrad('ht-g-default', '#818cf8', '#4f46e5');
    makeGrad('ht-g-insert',  '#a8d43a', '#cbff5e');
    makeGrad('ht-g-delete',  '#ea6d0a', '#fdba74');
    makeGrad('ht-g-visit',   '#d97706', '#fcd34d');

    const getGrad = (bucketIdx: number) => {
      if (activeIndices.includes(bucketIdx)) {
        if (stepType === 'insert')  return 'url(#ht-g-insert)';
        if (stepType === 'delete')  return 'url(#ht-g-delete)';
        if (stepType === 'visit')   return 'url(#ht-g-visit)';
      }
      return 'url(#ht-g-default)';
    };

    if (defs.select('#ht-shadow').empty()) {
      const sh = defs.append('filter').attr('id', 'ht-shadow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
      sh.append('feDropShadow').attr('dx', 0).attr('dy', 4).attr('stdDeviation', 6).attr('flood-color', 'rgba(0,0,0,0.4)');
    }

    // ─── LAYERS ────────────────────────────────────────────────────────
    ['ht-layer-bg', 'ht-layer-conn', 'ht-layer-buckets', 'ht-layer-chains', 'ht-layer-hash-anim'].forEach(cls => {
      if (svg.select(`.${cls}`).empty()) svg.append('g').attr('class', cls);
    });
    
    const connLayer    = svg.select<SVGGElement>('.ht-layer-conn');
    const bucketsLayer = svg.select<SVGGElement>('.ht-layer-buckets');
    const chainsLayer  = svg.select<SVGGElement>('.ht-layer-chains');
    const animLayer    = svg.select<SVGGElement>('.ht-layer-hash-anim');
    animLayer.selectAll('*').remove();

    // ─── DRAW BUCKETS (Horizontal Array) ───────────────────────────────
    type BuckData = { i: number; x: number; y: number; active: boolean };
    const bucketData: BuckData[] = Array.from({ length: tableSize }, (_, i) => ({
      i,
      x: startX + i * (bucketW + gapX),
      y: startY,
      active: activeIndices.includes(i)
    }));

    const buckets = bucketsLayer.selectAll<SVGGElement, BuckData>('g.ht-bucket').data(bucketData, d => `bucket-${d.i}`);
    const bucketEnter = buckets.enter().append('g').attr('class', 'ht-bucket')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    // Bucket Box
    bucketEnter.append('rect').attr('class', 'ht-bucket-box')
      .attr('width', bucketW).attr('height', bucketH).attr('rx', 8)
      .attr('fill', isDark ? '#1e293b' : '#f8fafc')
      .attr('stroke', isDark ? '#334155' : '#cbd5e1').attr('stroke-width', 1.5)
      .attr('filter', 'url(#ht-shadow)');
    
    // Bucket Highlight Inner Ring
    bucketEnter.append('rect').attr('class', 'ht-bucket-inner')
      .attr('width', bucketW).attr('height', bucketH).attr('rx', 8)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.05)').attr('stroke-width', 1);
    
    // Index Label (Top outside)
    bucketEnter.append('text').attr('class', 'ht-bucket-idx')
      .attr('x', bucketW / 2).attr('y', -10).attr('text-anchor', 'middle')
      .attr('font-family', 'monospace').attr('font-weight', 'bold').attr('font-size', isMobile ? '11px' : '15px')
      .attr('fill', isDark ? '#64748b' : '#94a3b8').text(d => `[${d.i}]`);

    // Port Dot (Bottom Center)
    bucketEnter.append('circle').attr('cx', bucketW / 2).attr('cy', bucketH - 6).attr('r', isMobile ? 3 : 4)
      .attr('fill', isDark ? '#475569' : '#cbd5e1');

    const bucketMerge = bucketEnter.merge(buckets);
    bucketMerge.transition().duration(300)
      .attr('transform', d => `translate(${d.x}, ${d.y})`);
      
    bucketMerge.select('.ht-bucket-box').transition().duration(300)
      .attr('stroke', d => d.active ? arrowActive : (isDark ? '#334155' : '#cbd5e1'))
      .attr('fill', d => d.active ? 'rgba(203,255,94,0.05)' : (isDark ? '#1e293b' : '#f8fafc'))
      .attr('stroke-width', d => d.active ? 2 : 1.5);

    // ─── DRAW CHAIN ENTRIES (Vertical Linked Lists) ────────────────────
    type EntryData = { id: string; bucketIdx: number; chainIdx: number; key: string; val: string; x: number; y: number; active: boolean };
    let entriesData: EntryData[] = [];
    let connData: { id: string; sx: number; sy: number; tx: number; ty: number; active: boolean }[] = [];

    stateDisplay.forEach((bucket, bIdx) => {
      const bDat = bucketData[bIdx];
      bucket.forEach((entry, cIdx) => {
        const id = `entry-${entry.key}-${bIdx}-${cIdx}`;
        const ex = bDat.x + bucketW / 2 - entryW / 2;
        const ey = bDat.y + bucketH + chainGapY + cIdx * (entryH + ptrH + chainGapY);
        const isActive = activeIndices.includes(bIdx) && (
          (stepType === 'insert' && cIdx === bucket.length - 1) || 
          (stepType === 'visit' && currentStepData?.values?.currentChainIndex === cIdx) ||
          (stepType === 'delete' && currentStepData?.values?.currentChainIndex === cIdx)
        );
        
        entriesData.push({
          id, bucketIdx: bIdx, chainIdx: cIdx, key: entry.key, val: entry.value, x: ex, y: ey, active: isActive
        });

        // Connection pointing downwards
        const sx = ex + entryW / 2;
        const sy = cIdx === 0 ? bDat.y + bucketH - 6 : ey - chainGapY - ptrH / 2;
        const tx = ex + entryW / 2;
        const ty = ey - 4; // Arrow tip target
        
        connData.push({
          id: `conn-${id}`, sx, sy, tx, ty, active: isActive
        });
      });
    });

    // Render Chains
    const entries = chainsLayer.selectAll<SVGGElement, EntryData>('g.ht-entry').data(entriesData, d => d.id);
    const entryEnter = entries.enter().append('g').attr('class', 'ht-entry')
      .attr('transform', d => `translate(${d.x}, ${d.y - 20})`)
      .style('opacity', 0);

    // Premium Node Box (Key section)
    entryEnter.append('rect').attr('class', 'ht-entry-box')
      .attr('width', entryW).attr('height', entryH).attr('rx', 6)
      .attr('fill', d => getGrad(d.bucketIdx))
      .attr('filter', 'url(#ht-shadow)');
      
    // Glassy highlight
    entryEnter.append('rect').attr('class', 'ht-entry-highlight')
      .attr('width', entryW).attr('height', entryH / 2).attr('rx', 6)
      .attr('fill', 'rgba(255,255,255,0.12)');

    // Pointer Box (NEXT section)
    entryEnter.append('rect').attr('class', 'ht-entry-pointer')
      .attr('y', entryH - 2).attr('width', entryW).attr('height', ptrH + 2).attr('rx', 6)
      .attr('fill', isDark ? 'rgba(15,23,42,0.8)' : 'rgba(241,245,249,0.9)')
      .attr('stroke', 'rgba(255,255,255,0.05)').attr('stroke-width', 1)
      .attr('filter', 'url(#ht-shadow)'); // give pointer box shadow

    // Pointer Dot (Bottom center)
    entryEnter.append('circle').attr('cx', entryW / 2).attr('cy', entryH + ptrH / 2).attr('r', isMobile ? 2 : 3)
      .attr('fill', isDark ? '#475569' : '#94a3b8');
      
    // Text: Key (Truncate if mobile and long)
    entryEnter.append('text').attr('class', 'ht-entry-key')
      .attr('x', entryW / 2).attr('y', entryH / 2 - (isMobile ? 3 : 5)).attr('dy', '0.35em').attr('text-anchor', 'middle')
      .attr('font-family', 'monospace').attr('font-weight', 'bold').attr('font-size', isMobile ? '9px' : '12px')
      .attr('fill', '#fff')
      .text(d => isMobile && d.key.length > 5 ? d.key.substring(0, 4) + '..' : d.key);

    entryEnter.append('text').attr('class', 'ht-entry-value')
      .attr('x', entryW / 2).attr('y', entryH / 2 + (isMobile ? 7 : 8)).attr('dy', '0.35em').attr('text-anchor', 'middle')
      .attr('font-family', 'monospace').attr('font-weight', '600').attr('font-size', isMobile ? '8px' : '10px')
      .attr('fill', 'rgba(255,255,255,0.86)')
      .text(d => isMobile && d.val.length > 6 ? d.val.substring(0, 5) + '..' : d.val);

    const entryMerge = entryEnter.merge(entries);
    entryMerge.transition().duration(400).ease(d3.easeBackOut.overshoot(1.2))
      .attr('transform', d => `translate(${d.x}, ${d.y})`).style('opacity', 1);

    entryMerge.select('.ht-entry-box').transition().duration(350)
      .attr('fill', d => {
        if (d.active) {
          if (stepType === 'insert') return 'url(#ht-g-insert)';
          if (stepType === 'delete') return 'url(#ht-g-delete)';
          if (stepType === 'visit') return 'url(#ht-g-visit)';
        }
        return 'url(#ht-g-default)';
      });
      
    entryMerge.select('.ht-entry-key')
      .attr('fill', d => (d.active && (stepType === 'insert' || stepType === 'visit')) ? '#111827' : '#fff');

    entryMerge.select('.ht-entry-value')
      .attr('fill', d => (d.active && (stepType === 'insert' || stepType === 'visit')) ? '#1f2937' : 'rgba(255,255,255,0.86)');

    entries.exit()
      .transition().duration(300).attr('transform', (d: any) => `translate(${d.x}, ${d.y + 20})`).style('opacity', 0)
      .remove();

    // Render Connections (Arrows going down)
    const conns = connLayer.selectAll<SVGGElement, any>('line.ht-conn').data(connData, d => d.id);
    conns.enter().append('line').attr('class', 'ht-conn')
      .attr('x1', d => d.sx).attr('y1', d => d.sy).attr('x2', d => d.sx).attr('y2', d => d.sy)
      .attr('stroke', arrowDefault).attr('stroke-width', 2).attr('marker-end', 'url(#ht-arrow)')
      .attr('opacity', 0)
    .merge(conns as any)
      .transition().duration(400)
      .attr('x1', d => d.sx).attr('y1', d => d.sy).attr('x2', d => d.tx).attr('y2', d => d.ty)
      .attr('stroke', d => d.active ? arrowActive : arrowDefault)
      .attr('marker-end', d => d.active ? 'url(#ht-arrow-active)' : 'url(#ht-arrow)')
      .attr('opacity', 1);

    conns.exit().transition().duration(200).style('opacity', 0).remove();

    // ─── HASH FUNCTION ANIMATION (Flying Key) ──────────────────────────
    if (stepType === 'highlight' && pendingKey !== undefined) {
      const animG = animLayer.append('g').attr('class', 'ht-fly');
      
      const animW = isMobile ? 60 : 80;
      const animH = isMobile ? 24 : 30;
      const startAnimX = width / 2;
      const startAnimY = startY - 80;
      
      let targetY = height / 2;
      let targetX = startX + bucketW / 2;
      if (typeof hashVal === 'number') {
        const bDat = bucketData[hashVal];
        targetY = bDat.y + bucketH / 2;
        targetX = bDat.x + bucketW / 2;
      }

      animG.attr('transform', `translate(${startAnimX}, ${startAnimY})`);

      animG.append('rect').attr('x', -animW/2).attr('y', -animH/2).attr('width', animW).attr('height', animH).attr('rx', 4)
        .attr('fill', 'rgba(203,255,94,0.15)').attr('stroke', '#cbff5e')
        .attr('stroke-width', 2).attr('stroke-dasharray', '4 2');
        
      animG.append('text').attr('x', 0).attr('y', 0).attr('dy', '0.35em').attr('text-anchor', 'middle')
        .attr('font-family', 'monospace').attr('font-size', isMobile ? '12px' : '15px').attr('font-weight', 'bold')
        .attr('fill', '#cbff5e').text(`"${isMobile && pendingKey.length > 5 ? pendingKey.substring(0, 4) + '..' : pendingKey}"`);

      animG.append('text').attr('x', 0).attr('y', -animH/2 - 6).attr('text-anchor', 'middle')
        .attr('font-family', 'monospace').attr('font-size', '10px').attr('font-weight', 'bold')
        .attr('fill', isDark ? '#94a3b8' : '#64748b').text('HASHING...');

      if (typeof hashVal === 'number') {
        animG.transition().delay(200).duration(600).ease(d3.easeCubicInOut)
          .attr('transform', `translate(${targetX}, ${targetY})`)
          .style('opacity', 0);
      }
    }

  }, [currentStepData, tableSize, resolvedTheme]);

  return (
    <div className="w-full h-full relative overflow-y-auto" ref={containerRef}>
      <svg ref={svgRef} className="block w-full min-h-full relative z-10" />
    </div>
  );
}
