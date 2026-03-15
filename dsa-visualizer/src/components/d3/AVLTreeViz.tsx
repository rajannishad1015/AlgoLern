"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { AlgorithmStep } from "@/lib/types/algorithm";

interface AVLNodeData {
  value: number;
  height: number;
  left: string | null;
  right: string | null;
}
type NodeMap = Record<string, AVLNodeData>;

interface AVLTreeVizProps {
  currentStepData: AlgorithmStep | undefined;
}

function flatToHierarchy(id: string | null, nodes: NodeMap): Record<string, any> | null {
  if (!id || !nodes[id]) return null;
  const n = nodes[id];
  const children: Record<string, any>[] = [];

  if (n.left || n.right) {
    children.push(n.left ? flatToHierarchy(n.left, nodes)! : { id: `ph-l-${id}`, isPhantom: true });
    children.push(n.right ? flatToHierarchy(n.right, nodes)! : { id: `ph-r-${id}`, isPhantom: true });
  }

  return {
    id, value: n.value, height: n.height,
    left: n.left, right: n.right,
    children: children.length > 0 ? children : undefined,
  };
}

function getBF(id: string, nodes: NodeMap): number {
  const n = nodes[id];
  if (!n) return 0;
  const lh = n.left && nodes[n.left] ? nodes[n.left].height : 0;
  const rh = n.right && nodes[n.right] ? nodes[n.right].height : 0;
  return lh - rh;
}

// ─── Color palette per state ──────────────────────────────────────────────────
const COLORS = {
  normal:   { fill: ["#3b4a6b", "#252d4a"], stroke: "rgba(100,120,200,0.35)", text: "#e2e8f0" },
  compare:  { fill: ["#f59e0b", "#d97706"], stroke: "#fcd34d",               text: "#1c1917" },
  insert:   { fill: ["#84cc16", "#65a30d"], stroke: "#d9f99d",               text: "#14532d" },
  rotate:   { fill: ["#f97316", "#ea580c"], stroke: "#fdba74",               text: "#fff7ed" },
  balanced: { fill: ["#10b981", "#059669"], stroke: "#6ee7b7",               text: "#ecfdf5" },
  unbal:    { fill: ["#ef4444", "#dc2626"], stroke: "#fca5a5",               text: "#fff1f2" },
  path:     { fill: ["#818cf8", "#6366f1"], stroke: "#c7d2fe",               text: "#fff"    },
};

export function AVLTreeViz({ currentStepData }: AVLTreeVizProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const W = containerRef.current.clientWidth;
    const H = containerRef.current.clientHeight || 480;
    const M = { top: 56, right: 32, bottom: 48, left: 32 };
    const R = 26; // node radius

    const svg = d3.select(svgRef.current);
    const avlData = currentStepData?.values as { root: string | null; nodes: NodeMap } | undefined;
    const isRotation = currentStepData?.type === "update" ||
      (currentStepData?.description?.toLowerCase().includes("rotation") ?? false);

    const draw = () => {
      const isDark = document.documentElement.classList.contains("dark");
      svg.attr("width", W).attr("height", H);

      let g = svg.select<SVGGElement>("g.avl-root");
      if (g.empty()) g = svg.append("g").attr("class", "avl-root");
      g.attr("transform", `translate(${M.left},${M.top})`);

      // ── DEFS ───────────────────────────────────────────────────────────
      let defs = svg.select<SVGDefsElement>("defs");
      if (defs.empty()) defs = svg.append("defs");

      const ensureGrad = (id: string, c1: string, c2: string) => {
        let gr = defs.select<SVGLinearGradientElement>(`#${id}`);
        if (gr.empty()) {
          gr = defs.append("linearGradient").attr("id", id)
            .attr("x1","0%").attr("y1","0%").attr("x2","60%").attr("y2","100%");
          gr.append("stop").attr("offset","0%");
          gr.append("stop").attr("offset","100%");
        }
        gr.select("stop:first-child").attr("stop-color", c1);
        gr.select("stop:last-child").attr("stop-color", c2);
      };

      Object.entries(COLORS).forEach(([k, v]) => ensureGrad(`avlg-${k}`, v.fill[0], v.fill[1]));

      // soft shadow
      if (defs.select("#avl-sh").empty()) {
        const sh = defs.append("filter").attr("id","avl-sh")
          .attr("x","-25%").attr("y","-25%").attr("width","150%").attr("height","150%");
        sh.append("feDropShadow").attr("dx",0).attr("dy",3).attr("stdDeviation",6)
          .attr("flood-color","rgba(0,0,0,0.45)");
      }
      // glow
      if (defs.select("#avl-gl").empty()) {
        const f = defs.append("filter").attr("id","avl-gl")
          .attr("x","-50%").attr("y","-50%").attr("width","200%").attr("height","200%");
        f.append("feGaussianBlur").attr("stdDeviation","6").attr("result","blur");
        const fm = f.append("feMerge");
        fm.append("feMergeNode").attr("in","blur");
        fm.append("feMergeNode").attr("in","SourceGraphic");
      }
      // rotation glow (bigger)
      if (defs.select("#avl-rtgl").empty()) {
        const f = defs.append("filter").attr("id","avl-rtgl")
          .attr("x","-70%").attr("y","-70%").attr("width","240%").attr("height","240%");
        f.append("feGaussianBlur").attr("stdDeviation","10").attr("result","blur");
        const fm = f.append("feMerge");
        fm.append("feMergeNode").attr("in","blur");
        fm.append("feMergeNode").attr("in","SourceGraphic");
      }

      // ── EMPTY ──────────────────────────────────────────────────────────
      if (!avlData?.root || !avlData.nodes) {
        g.selectAll("*").remove();
        g.append("text").attr("class","empty-msg")
          .attr("x",(W-M.left-M.right)/2).attr("y",(H-M.top-M.bottom)/2)
          .attr("text-anchor","middle")
          .attr("fill", isDark ? "#475569" : "#94a3b8")
          .style("font-family","var(--font-geist-mono)").style("font-size","15px")
          .text("Tree is empty — insert a value to start!");
        return;
      }
      g.selectAll(".empty-msg").remove();

      const hier = flatToHierarchy(avlData.root, avlData.nodes);
      if (!hier) return;

      const root = d3.hierarchy<Record<string, any>>(hier);
      d3.tree<Record<string, any>>().size([W - M.left - M.right, H - M.top - M.bottom])(root);

      const nodes = root.descendants().filter((d: any) => !d.data.isPhantom);
      const links = root.links().filter((d: any) => !d.target.data.isPhantom);
      const activeIds = currentStepData?.nodeIds ?? [];

      // ── Choose state for a node ─────────────────────────────────────────
      const stateOf = (d: any): keyof typeof COLORS => {
        const id: string = d.data.id;
        const isActive = activeIds.includes(id);
        const bf = avlData.nodes[id] ? getBF(id, avlData.nodes) : 0;
        if (isActive) {
          if (isRotation) return "rotate";
          if (currentStepData?.type === "compare") return "compare";
          if (currentStepData?.type === "insert") return "insert";
          if (currentStepData?.type === "sorted" || currentStepData?.type === "done") return "balanced";
          if (currentStepData?.type === "highlight") return "path";
          return "insert";
        }
        if (Math.abs(bf) > 1) return "unbal";
        return "normal";
      };

      // ── LINKS ──────────────────────────────────────────────────────────
      const linkGen = d3.linkVertical<any,any>().x((d:any)=>d.x).y((d:any)=>d.y);

      const linkSel = g.selectAll<SVGPathElement,"any">("path.avl-lnk")
        .data(links, (d:any) => `${d.source.data.id}-${d.target.data.id}`);

      const linkColor = (d: any) => {
        const isLeft = d.target.data.id === d.source.data.left;
        const eid = `${d.source.data.id}-${isLeft ? "left" : "right"}`;
        if (currentStepData?.edgeIds?.includes(eid)) {
          if (isRotation) return "#f97316";
          if (currentStepData.type === "compare") return "#f59e0b";
          if (currentStepData.type === "done" || currentStepData.type === "sorted") return "#10b981";
          return "#818cf8";
        }
        return isDark ? "rgba(148,163,184,0.2)" : "rgba(0,0,0,0.12)";
      };

      linkSel.enter().append("path").attr("class","avl-lnk")
        .attr("fill","none").attr("stroke-width",2.5)
        .attr("d",(d:any)=>{ const o={x:d.source.x,y:d.source.y}; return linkGen({source:o,target:o} as any); })
        .style("opacity",0)
        .merge(linkSel as any)
        .transition().duration(480).ease(d3.easeQuadInOut)
        .style("opacity",1)
        .attr("stroke", linkColor)
        .attr("stroke-width",(d:any)=>{
          const isLeft=d.target.data.id===d.source.data.left;
          const eid=`${d.source.data.id}-${isLeft?"left":"right"}`;
          return currentStepData?.edgeIds?.includes(eid) ? 3.5 : 2;
        })
        .attr("d", linkGen as any);

      linkSel.exit().transition().duration(300).style("opacity",0)
        .attr("d",(d:any)=>{const o={x:d.source.x,y:d.source.y};return linkGen({source:o,target:o} as any);})
        .remove();

      // ── NODES ──────────────────────────────────────────────────────────
      const nodeSel = g.selectAll<SVGGElement,"any">("g.avl-nd")
        .data(nodes, (d:any) => d.data.id);

      const nodeEnter = nodeSel.enter().append("g").attr("class","avl-nd")
        .attr("transform",(d:any)=>d.parent?`translate(${d.parent.x},${d.parent.y})`:`translate(${d.x},${d.y-50})`)
        .style("opacity",0);

      // outer glow ring (visible on active nodes)
      nodeEnter.append("circle").attr("class","avl-halo").attr("r", R + 10).attr("fill","none").attr("stroke-width",2).style("opacity",0);

      // main circle
      nodeEnter.append("circle").attr("class","avl-c").attr("r",0).attr("filter","url(#avl-sh)");

      // value text
      nodeEnter.append("text").attr("class","avl-v")
        .attr("dy","0.35em").attr("text-anchor","middle")
        .style("font-family","var(--font-geist-mono)").style("font-weight","800")
        .style("font-size","0px").style("pointer-events","none");

      // BF pill background rect (rounded)
      nodeEnter.append("rect").attr("class","avl-pill")
        .attr("rx",8).attr("ry",8)
        .attr("width",56).attr("height",18)
        .attr("x",-28).attr("y", R + 6)
        .style("opacity",0);

      // BF pill text
      nodeEnter.append("text").attr("class","avl-bft")
        .attr("y", R + 18).attr("text-anchor","middle")
        .style("font-family","var(--font-geist-mono)").style("font-weight","700")
        .style("font-size","0px").style("pointer-events","none");

      const nodeMerge = nodeEnter.merge(nodeSel as any);

      // Animate position
      nodeMerge.transition().duration(520).ease(d3.easeBackOut.overshoot(1.1) as any)
        .style("opacity",1)
        .attr("transform",(d:any)=>`translate(${d.x},${d.y})`);

      // Halo ring
      nodeMerge.select<SVGCircleElement>("circle.avl-halo")
        .transition().duration(420)
        .attr("r", R + 10)
        .attr("stroke",(d:any)=>{
          const s = stateOf(d);
          return activeIds.includes(d.data.id) ? COLORS[s].stroke : "transparent";
        })
        .style("opacity",(d:any)=> activeIds.includes(d.data.id) ? 0.55 : 0);

      // Main circle
      nodeMerge.select<SVGCircleElement>("circle.avl-c")
        .transition().duration(440).ease(d3.easeBackOut.overshoot(1.5) as any)
        .attr("r",(d:any)=> activeIds.includes(d.data.id) ? R + 4 : R)
        .attr("fill",(d:any)=>`url(#avlg-${stateOf(d)})`)
        .attr("stroke",(d:any)=> COLORS[stateOf(d)].stroke)
        .attr("stroke-width",(d:any)=> activeIds.includes(d.data.id) ? 2.5 : 1.5)
        .attr("filter",(d:any)=>{
          if (!activeIds.includes(d.data.id)) return "url(#avl-sh)";
          return isRotation ? "url(#avl-rtgl)" : "url(#avl-gl)";
        });

      // Value text
      nodeMerge.select<SVGTextElement>("text.avl-v")
        .transition().duration(380)
        .style("font-size",(d:any)=> d.data.value > 99 ? "11px" : "14px")
        .attr("fill",(d:any)=> COLORS[stateOf(d)].text)
        .text((d:any)=> d.data.value);

      // BF pill
      nodeMerge.select<SVGRectElement>("rect.avl-pill")
        .transition().duration(380)
        .attr("fill",(d:any)=>{
          const bf = avlData.nodes[d.data.id] ? getBF(d.data.id, avlData.nodes) : 0;
          if (Math.abs(bf) > 1) return "rgba(239,68,68,0.3)";
          if (activeIds.includes(d.data.id)) return "rgba(255,255,255,0.15)";
          return isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
        })
        .style("opacity",1);

      nodeMerge.select<SVGTextElement>("text.avl-bft")
        .transition().duration(380)
        .style("font-size","9px")
        .attr("fill",(d:any)=>{
          const bf = avlData.nodes[d.data.id] ? getBF(d.data.id, avlData.nodes) : 0;
          if (Math.abs(bf) > 1) return "#fca5a5";
          if (activeIds.includes(d.data.id)) return "#fff";
          return isDark ? "#94a3b8" : "#64748b";
        })
        .text((d:any)=>{
          if (!avlData.nodes[d.data.id]) return "";
          const bf = getBF(d.data.id, avlData.nodes);
          const h  = avlData.nodes[d.data.id].height;
          return `h:${h}  bf:${bf >= 0 ? "+" : ""}${bf}`;
        });

      // EXIT
      nodeSel.exit().transition().duration(320).ease(d3.easeBackIn.overshoot(1) as any)
        .style("opacity",0)
        .attr("transform",(d:any)=>d.parent?`translate(${d.parent.x},${d.parent.y}) scale(0.3)`:`translate(${d.x},${d.y+40}) scale(0.3)`)
        .remove();

      // ── ROTATION RIPPLES ───────────────────────────────────────────────
      if (isRotation) {
        activeIds.forEach(aid => {
          const nd = nodes.find((n: any) => n.data.id === aid) as any;
          if (!nd) return;
          [0, 120].forEach(delay => {
            g.append("circle")
              .attr("cx", nd.x).attr("cy", nd.y)
              .attr("r", R + 4)
              .attr("fill","none")
              .attr("stroke","#f97316")
              .attr("stroke-width", 3)
              .style("opacity", 0.9)
              .transition().delay(delay).duration(650).ease(d3.easeExpOut)
              .attr("r", R + 42)
              .attr("stroke-width", 0.5)
              .style("opacity", 0)
              .remove();
          });
        });
      }
    };

    draw();
    const obs = new ResizeObserver(() => draw());
    obs.observe(containerRef.current!);
    return () => obs.disconnect();
  }, [currentStepData]);

  return (
    <div ref={containerRef} className="w-full h-full bg-transparent overflow-hidden">
      <svg ref={svgRef} className="w-full h-full block" />
    </div>
  );
}
