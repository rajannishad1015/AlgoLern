"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { AlgorithmStep } from "@/lib/types/algorithm";
import { PQNode } from "@/lib/algorithms/data-structures/priorityQueue";

interface HeapVizProps {
  currentStepData: AlgorithmStep | undefined;
}

// Easing functions
const easeSnap = d3.easeBackOut.overshoot(1.4);
const easeSwing = d3.easeSinInOut;

export function HeapViz({ currentStepData }: HeapVizProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 420;
    const isDark = resolvedTheme !== "light";

    const svg = d3.select(svgRef.current);
    svg.attr("width", width).attr("height", height);

    const heap: PQNode[] = (currentStepData?.values?.heap as PQNode[]) ?? [];
    const activeIndices = currentStepData?.indices ?? [];
    const stepType = currentStepData?.type ?? "highlight";

    // ─── Color Palette ────────────────────────────────────────────────────────
    const col = {
      bg:           isDark ? "#0d0f1a" : "#f1f5f9",
      nodeBg:       isDark ? "#1a1d2e" : "#e2e8f0",
      nodeBorder:   isDark ? "#2f3352" : "#cbd5e1",
      rootBg:       isDark ? "#064e3b" : "#d1fae5",
      rootBorder:   isDark ? "#34d399" : "#059669",
      compareBg:    isDark ? "#1e1b4b" : "#e0e7ff",
      compareBorder:isDark ? "#818cf8" : "#6366f1",
      swapBg:       isDark ? "#7f1d1d" : "#fee2e2",
      swapBorder:   isDark ? "#f87171" : "#ef4444",
      insertBg:     isDark ? "#1e1a2f" : "#ede9fe",
      insertBorder: isDark ? "#a78bfa" : "#7c3aed",
      deleteBg:     isDark ? "#431c09" : "#ffedd5",
      deleteBorder: isDark ? "#fb923c" : "#ea580c",
      doneBg:       isDark ? "#052e16" : "#dcfce7",
      doneBorder:   isDark ? "#4ade80" : "#16a34a",
      link:         isDark ? "#2f3352" : "#cbd5e1",
      linkActive:   isDark ? "#6366f1" : "#4f46e5",
      text:         isDark ? "#e2e8f0" : "#1e293b",
      textMuted:    isDark ? "#64748b" : "#94a3b8",
      priText:      isDark ? "#94a3b8" : "#64748b",
      rootText:     isDark ? "#6ee7b7" : "#047857",
    };

    const getNodeColors = (idx: number) => {
      const isActive = activeIndices.includes(idx);
      if (idx === 0 && !isActive) return { fill: col.rootBg,    stroke: col.rootBorder };
      if (isActive) {
        if (stepType === "swap")    return { fill: col.swapBg,    stroke: col.swapBorder };
        if (stepType === "compare") return { fill: col.compareBg, stroke: col.compareBorder };
        if (stepType === "insert")  return { fill: col.insertBg,  stroke: col.insertBorder };
        if (stepType === "delete")  return { fill: col.deleteBg,  stroke: col.deleteBorder };
        if (stepType === "done")    return { fill: col.doneBg,    stroke: col.doneBorder };
        return { fill: col.compareBg, stroke: col.compareBorder };
      }
      return { fill: col.nodeBg, stroke: col.nodeBorder };
    };

    // ─── Setup persistent defs (only first time) ──────────────────────────────
    let defs = svg.select<SVGDefsElement>("defs");
    if (defs.empty()) defs = svg.append("defs");

    const ensureFilter = (id: string, stdDev: number, color: string) => {
      if (!defs.select(`#${id}`).empty()) return;
      const f = defs.append("filter").attr("id", id).attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
      f.append("feGaussianBlur").attr("stdDeviation", stdDev).attr("result", "blur");
      const merge = f.append("feMerge");
      merge.append("feMergeNode").attr("in", "blur");
      merge.append("feMergeNode").attr("in", "SourceGraphic");
      // Colored glow via flood
      const fe = defs.append("filter").attr("id", `${id}-color`).attr("x", "-80%").attr("y", "-80%").attr("width", "260%").attr("height", "260%");
      fe.append("feFlood").attr("flood-color", color).attr("flood-opacity", 0.5).attr("result", "color");
      fe.append("feComposite").attr("in", "color").attr("in2", "SourceAlpha").attr("operator", "in").attr("result", "shadow");
      fe.append("feGaussianBlur").attr("in", "shadow").attr("stdDeviation", stdDev + 2).attr("result", "blurredShadow");
      fe.append("feMerge").selectAll("feMergeNode").data(["blurredShadow", "SourceGraphic"]).join("feMergeNode").attr("in", (d) => d);
    };

    ensureFilter("glow-root",    6, "#34d399");
    ensureFilter("glow-compare", 5, "#818cf8");
    ensureFilter("glow-swap",    5, "#f87171");
    ensureFilter("glow-insert",  5, "#a78bfa");
    ensureFilter("glow-delete",  5, "#fb923c");
    ensureFilter("glow-done",    5, "#4ade80");

    const getFilter = (idx: number) => {
      const isActive = activeIndices.includes(idx);
      if (idx === 0 && !isActive) return "url(#glow-root-color)";
      if (isActive) {
        if (stepType === "swap")    return "url(#glow-swap-color)";
        if (stepType === "compare") return "url(#glow-compare-color)";
        if (stepType === "insert")  return "url(#glow-insert-color)";
        if (stepType === "delete")  return "url(#glow-delete-color)";
        if (stepType === "done")    return "url(#glow-done-color)";
        return "url(#glow-compare-color)";
      }
      return "none";
    };

    // ─── Layout Calculation ───────────────────────────────────────────────────
    const nodeRadius = Math.min(30, Math.max(18, width / Math.max(heap.length * 3.5, 8)));
    const levels: { idx: number; node: PQNode; x: number; y: number }[] = [];
    const maxDepth = Math.ceil(Math.log2(heap.length + 1));
    const verticalGap = Math.min(90, (height - 110) / Math.max(maxDepth, 1));

    let depth = 0;
    let start = 0;
    while (start < heap.length) {
      const count = Math.pow(2, depth);
      const end = Math.min(start + count, heap.length);
      const spacing = (width - 60) / (count + 1);
      for (let i = start; i < end; i++) {
        const posInLevel = i - start;
        levels.push({
          idx: i,
          node: heap[i],
          x: 30 + spacing * (posInLevel + 1),
          y: 40 + depth * verticalGap,
        });
      }
      start = end;
      depth++;
    }

    // Build a lookup map for quick position retrieval
    const posMap = new Map(levels.map((l) => [l.idx, { x: l.x, y: l.y }]));

    // ─── Persistent Layer Groups ──────────────────────────────────────────────
    let linksG = svg.select<SVGGElement>(".links-layer");
    if (linksG.empty()) linksG = svg.insert("g", ":first-child").attr("class", "links-layer");

    let nodesG = svg.select<SVGGElement>(".nodes-layer");
    if (nodesG.empty()) nodesG = svg.append("g").attr("class", "nodes-layer");

    let arrayG = svg.select<SVGGElement>(".array-layer");
    if (arrayG.empty()) arrayG = svg.append("g").attr("class", "array-layer");

    let emptyG = svg.select<SVGGElement>(".empty-layer");
    if (emptyG.empty()) emptyG = svg.append("g").attr("class", "empty-layer");

    // ─── Empty State ──────────────────────────────────────────────────────────
    emptyG.selectAll("*").remove();
    if (heap.length === 0) {
      nodesG.selectAll("*").remove();
      linksG.selectAll("*").remove();
      arrayG.selectAll("*").remove();
      emptyG.append("text")
        .attr("x", width / 2).attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("fill", col.textMuted)
        .attr("font-family", "monospace")
        .attr("font-size", "14px")
        .text("Priority Queue is empty — enqueue elements to begin.")
        .style("opacity", 0)
        .transition().duration(400).style("opacity", 1);
      return;
    }

    // ─── Build edge data ──────────────────────────────────────────────────────
    type EdgeDatum = { id: string; sx: number; sy: number; tx: number; ty: number; active: boolean };
    const edgeData: EdgeDatum[] = [];
    for (let i = 1; i < levels.length; i++) {
      const parentIdx = Math.floor((levels[i].idx - 1) / 2);
      const sp = posMap.get(parentIdx);
      const tp = posMap.get(levels[i].idx);
      if (sp && tp) {
        const bothActive = activeIndices.includes(parentIdx) && activeIndices.includes(levels[i].idx);
        edgeData.push({
          id: `e-${parentIdx}-${levels[i].idx}`,
          sx: sp.x, sy: sp.y,
          tx: tp.x, ty: tp.y,
          active: bothActive,
        });
      }
    }

    // ─── Draw Edges ───────────────────────────────────────────────────────────
    const linksSel = linksG.selectAll<SVGLineElement, EdgeDatum>(".heap-link")
      .data(edgeData, (d) => d.id);

    // ENTER
    linksSel.enter()
      .append("line")
      .attr("class", "heap-link")
      .attr("x1", (d) => d.sx).attr("y1", (d) => d.sy)
      .attr("x2", (d) => d.tx).attr("y2", (d) => d.ty)
      .attr("stroke", col.link)
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0)
      .transition().duration(350)
      .attr("stroke-opacity", 0.55);

    // UPDATE
    linksSel.transition().duration(450).ease(easeSwing)
      .attr("x1", (d) => d.sx).attr("y1", (d) => d.sy)
      .attr("x2", (d) => d.tx).attr("y2", (d) => d.ty)
      .attr("stroke", (d) => d.active ? col.linkActive : col.link)
      .attr("stroke-width", (d) => d.active ? 2.5 : 1.5)
      .attr("stroke-opacity", (d) => d.active ? 0.9 : 0.55);

    // EXIT
    linksSel.exit()
      .transition().duration(300)
      .attr("stroke-opacity", 0)
      .remove();

    // ─── Draw Nodes ───────────────────────────────────────────────────────────
    type NodeDatum = { idx: number; node: PQNode; x: number; y: number };
    const nodeKey = (d: NodeDatum) => `node-${d.idx}`;

    const nodesSel = nodesG.selectAll<SVGGElement, NodeDatum>(".heap-node")
      .data(levels, nodeKey);

    // ── ENTER new nodes ───────────────────────────────────────────────────────
    const nodeEnter = nodesSel.enter()
      .append("g")
      .attr("class", "heap-node")
      .attr("transform", (d) => `translate(${d.x},${d.y - 80})`)  // drop in from above
      .style("opacity", 0);

    // Outer glow ring
    nodeEnter.append("circle")
      .attr("class", "glow-ring")
      .attr("r", nodeRadius + 8)
      .attr("fill", "none")
      .attr("stroke-width", 3)
      .attr("stroke-opacity", 0);

    // Main circle
    nodeEnter.append("circle")
      .attr("class", "main-circle")
      .attr("r", 0)
      .attr("fill", (d) => getNodeColors(d.idx).fill)
      .attr("stroke", (d) => getNodeColors(d.idx).stroke)
      .attr("stroke-width", 2.5)
      .attr("filter", (d) => getFilter(d.idx));

    // Priority label
    nodeEnter.append("text")
      .attr("class", "pri-label")
      .attr("dy", -nodeRadius * 0.22)
      .attr("text-anchor", "middle")
      .attr("font-size", `${Math.max(9, nodeRadius * 0.36)}px`)
      .attr("font-family", "monospace")
      .attr("font-weight", "600")
      .text((d) => `P:${d.node.priority}`)
      .style("opacity", 0);

    // Value label
    nodeEnter.append("text")
      .attr("class", "val-label")
      .attr("dy", nodeRadius * 0.32)
      .attr("text-anchor", "middle")
      .attr("fill", col.text)
      .attr("font-size", `${Math.max(13, nodeRadius * 0.58)}px`)
      .attr("font-family", "monospace")
      .attr("font-weight", "bold")
      .text((d) => d.node.value)
      .style("opacity", 0);

    // Index label
    nodeEnter.append("text")
      .attr("class", "idx-label")
      .attr("dy", nodeRadius + 16)
      .attr("text-anchor", "middle")
      .attr("fill", col.textMuted)
      .attr("font-size", "9px")
      .attr("font-family", "monospace")
      .text((d) => `[${d.idx}]`)
      .style("opacity", 0);

    // Animate enter: drop in + scale up
    const nodeEnterTransition = nodeEnter.transition().duration(450).ease(easeSnap)
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .style("opacity", 1);

    nodeEnterTransition.select(".main-circle")
      .attr("r", nodeRadius);

    nodeEnter.transition().delay(200).duration(300)
      .select(".pri-label").style("opacity", 1);
    nodeEnter.transition().delay(200).duration(300)
      .select(".val-label").style("opacity", 1);
    nodeEnter.transition().delay(280).duration(300)
      .select(".idx-label").style("opacity", 0.6);

    // ── UPDATE existing nodes ─────────────────────────────────────────────────
    const nodeUpdate = nodesSel;

    // Smooth position transition
    nodeUpdate.transition().duration(500).ease(easeSwing)
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    // Update circle fill/stroke
    nodeUpdate.select<SVGCircleElement>(".main-circle")
      .transition().duration(450)
      .attr("r", nodeRadius)
      .attr("fill", (d) => getNodeColors(d.idx).fill)
      .attr("stroke", (d) => getNodeColors(d.idx).stroke)
      .attr("filter", (d) => getFilter(d.idx));

    // Glow ring — pulse on active nodes
    nodeUpdate.select<SVGCircleElement>(".glow-ring")
      .attr("r", nodeRadius + 8)
      .attr("stroke", (d) => {
        if (activeIndices.includes(d.idx)) return getNodeColors(d.idx).stroke;
        if (d.idx === 0) return col.rootBorder;
        return "transparent";
      })
      .transition().duration(300)
      .attr("stroke-opacity", (d) => {
        if (d.idx === 0) return 0.35;
        if (activeIndices.includes(d.idx)) return 0.55;
        return 0;
      });

    // Pulse-scale on active (swap/compare/insert/delete)
    const isActiveStep = (idx: number) => activeIndices.includes(idx);
    nodeUpdate
      .filter((d) => isActiveStep(d.idx))
      .select<SVGCircleElement>(".main-circle")
      .transition().duration(160).ease(d3.easeQuadOut).attr("r", nodeRadius * 1.2)
      .transition().duration(200).ease(d3.easeBackOut.overshoot(2)).attr("r", nodeRadius);

    // Update labels
    nodeUpdate.select<SVGTextElement>(".pri-label")
      .transition().duration(350)
      .attr("fill", (d) => {
        if (d.idx === 0 && !activeIndices.includes(d.idx)) return col.rootText;
        if (activeIndices.includes(d.idx)) return getNodeColors(d.idx).stroke;
        return col.priText;
      })
      .text((d) => `P:${d.node.priority}`)
      .style("opacity", 1);

    nodeUpdate.select<SVGTextElement>(".val-label")
      .transition().duration(350)
      .attr("fill", (d) => (d.idx === 0 || activeIndices.includes(d.idx)) ? "#fff" : col.text)
      .text((d) => d.node.value)
      .style("opacity", 1);

    nodeUpdate.select<SVGTextElement>(".idx-label")
      .text((d) => `[${d.idx}]`)
      .style("opacity", 0.6);

    // ── EXIT nodes ────────────────────────────────────────────────────────────
    nodesSel.exit<NodeDatum>()
      .transition().duration(350).ease(d3.easeCubicIn)
      .attr("transform", (d) => `translate(${d.x},${d.y - 60})`)
      .style("opacity", 0)
      .remove();

    // ─── Swap Arc Animation ───────────────────────────────────────────────────
    // Draw a curved arc between two swapping nodes to show motion path
    if (stepType === "swap" && activeIndices.length >= 2) {
      const [ai, bi] = activeIndices;
      const pa = posMap.get(ai);
      const pb = posMap.get(bi);
      if (pa && pb) {
        const arc = svg.select(".swap-arc");
        if (!arc.empty()) arc.remove();

        const mx = (pa.x + pb.x) / 2;
        const my = Math.min(pa.y, pb.y) - 40; // Arc curves up above both nodes
        const pathD = `M${pa.x},${pa.y} Q${mx},${my} ${pb.x},${pb.y}`;

        svg.append("path")
          .attr("class", "swap-arc")
          .attr("d", pathD)
          .attr("fill", "none")
          .attr("stroke", col.swapBorder)
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,4")
          .attr("stroke-linecap", "round")
          .attr("opacity", 0)
          .transition().duration(250)
          .attr("opacity", 0.7)
          .transition().delay(400).duration(300)
          .attr("opacity", 0)
          .remove();

        // Dots moving along the arc
        const swapDot = (from: { x: number; y: number }, id: string) => {
          svg.append("circle")
            .attr("class", `swap-dot-${id}`)
            .attr("r", 5)
            .attr("cx", from.x).attr("cy", from.y)
            .attr("fill", col.swapBorder)
            .attr("opacity", 0.9)
            .transition().duration(500).ease(d3.easeSinInOut)
            .attrTween("cx", () => d3.interpolateNumber(from.x, from === pa ? pb.x : pa.x))
            .attrTween("cy", () => {
              const yFrom = from === pa ? pa.y : pb.y;
              const yTo = from === pa ? pb.y : pa.y;
              return (t: number) => {
                const midT = Math.sin(t * Math.PI); // parabolic
                return String(yFrom + (yTo - yFrom) * t - 40 * midT);
              };
            })
            .transition().duration(200).attr("opacity", 0).remove();
        };
        swapDot(pa, "a");
        swapDot(pb, "b");
      }
    }

    // ─── Array Bar at Bottom ──────────────────────────────────────────────────
    const barY = height - 40;
    const barH = 26;
    const cellW = Math.min(52, (width - 80) / Math.max(heap.length, 1));
    const barStartX = (width - cellW * heap.length) / 2;

    let arrayLabel = arrayG.select<SVGTextElement>(".array-label");
    if (arrayLabel.empty()) {
      arrayLabel = arrayG.append("text")
        .attr("class", "array-label")
        .attr("text-anchor", "end")
        .attr("fill", col.textMuted)
        .attr("font-size", "9px")
        .attr("font-family", "monospace");
    }
    arrayLabel.attr("x", barStartX - 6).attr("y", barY + barH / 2 + 4).text("Heap[]:");

    type CellDatum = { node: PQNode; i: number };
    const cellsSel = arrayG.selectAll<SVGGElement, CellDatum>(".array-cell")
      .data(heap.map((node, i) => ({ node, i })), (d) => `cell-${d.i}`);

    // Cell ENTER
    const cellEnter = cellsSel.enter()
      .append("g")
      .attr("class", "array-cell")
      .attr("transform", (d) => `translate(${barStartX + d.i * cellW},${barY})`);

    cellEnter.append("rect")
      .attr("class", "cell-rect")
      .attr("width", cellW - 3).attr("height", barH)
      .attr("rx", 5)
      .attr("fill", col.nodeBg)
      .attr("stroke", col.nodeBorder)
      .attr("stroke-width", 1)
      .attr("opacity", 0)
      .transition().duration(350).attr("opacity", 1);

    cellEnter.append("text")
      .attr("class", "cell-val")
      .attr("x", (cellW - 3) / 2).attr("y", barH / 2 + 1)
      .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
      .attr("fill", col.text)
      .attr("font-size", "10px").attr("font-family", "monospace").attr("font-weight", "bold")
      .text((d) => d.node.value)
      .attr("opacity", 0)
      .transition().delay(100).duration(300).attr("opacity", 1);

    // Cell UPDATE
    cellsSel
      .transition().duration(400).ease(easeSwing)
      .attr("transform", (d) => `translate(${barStartX + d.i * cellW},${barY})`);

    cellsSel.select<SVGRectElement>(".cell-rect")
      .transition().duration(400)
      .attr("fill", (d) => {
        if (d.i === 0) return col.rootBg;
        if (activeIndices.includes(d.i)) return getNodeColors(d.i).fill;
        return col.nodeBg;
      })
      .attr("stroke", (d) => {
        if (d.i === 0) return col.rootBorder;
        if (activeIndices.includes(d.i)) return getNodeColors(d.i).stroke;
        return col.nodeBorder;
      });

    cellsSel.select<SVGTextElement>(".cell-val")
      .transition().duration(300)
      .text((d) => d.node.value)
      .attr("fill", col.text);

    // Cell EXIT
    cellsSel.exit()
      .transition().duration(300)
      .attr("opacity", 0)
      .remove();

    // ─── Resize Observer ──────────────────────────────────────────────────────
    const observer = new ResizeObserver(() => {
      svg.attr("width", container.clientWidth || 800).attr("height", container.clientHeight || 420);
    });
    observer.observe(container);
    return () => observer.disconnect();

  }, [currentStepData, resolvedTheme]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[320px] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/8 dark:bg-indigo-500/10 rounded-full blur-[90px]" />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 h-24 bg-emerald-500/8 dark:bg-emerald-500/8 rounded-full blur-[60px]" />
      </div>
      <svg ref={svgRef} className="w-full h-full block relative z-10" />
    </div>
  );
}
