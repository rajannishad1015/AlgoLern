"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ArrowUpDown, Search, Hexagon, Network, CircleDot, Zap, Square, Play, Timer, Edit3 } from "lucide-react";
import "./landing.css";

export default function LandingPage() {
  useEffect(() => {
    // 2) SCROLL REVEAL
    const revEls = document.querySelectorAll('.reveal');
    const revObs = new IntersectionObserver(entries => {
      entries.forEach((e: IntersectionObserverEntry, i: number) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.transitionDelay = (i % 4) * 0.1 + 's';
          e.target.classList.add('in');
          revObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    revEls.forEach(el => revObs.observe(el));

    // 3) COUNTER ANIMATION
    const statNums = document.querySelectorAll('.stat-num[data-target]');
    let counted = false;
    const countObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !counted) {
        counted = true;
        statNums.forEach(el => {
          const target = +(el as HTMLElement).dataset.target!;
          const hasSup = el.querySelector('sup');
          const sup = hasSup ? hasSup.outerHTML : '';
          let current = 0;
          const step = target / 60; // 60 frames
          const timer = setInterval(() => {
            current = Math.min(current + step, target);
            el.innerHTML = Math.floor(current) + sup;
            if (current >= target) clearInterval(timer);
          }, 24);
        });
      }
    }, { threshold: 0.5 });
    if (statNums[0]) countObs.observe(statNums[0].closest('.stats-row') || statNums[0]);

    // 4) ANIMATED BAR VISUALIZER
    const vizContainer = document.getElementById('arrayViz');
    const compCountEl = document.getElementById('compCount');
    let vizTimer: NodeJS.Timeout;

    if (vizContainer) {
      let vals = [64, 34, 25, 12, 22, 11, 90, 45];
      let comparisons = 0;

      const BAR_COLORS = {
        default: '#2a2a2a',
        compare: '#cbff5e',   /* lime — two bars being compared */
        swap: '#f5c400',      /* gold — swap happening          */
      };

      const buildBars = () => {
        vizContainer.innerHTML = '';
        const max = Math.max(...vals);
        vals.forEach((v, i) => {
          const wrap = document.createElement('div');
          wrap.className = 'bar-wrap';
          const bar = document.createElement('div');
          bar.className = 'bar';
          bar.id = 'b' + i;
          bar.style.height = Math.max((v / max) * 68, 6) + 'px';
          bar.style.background = BAR_COLORS.default;
          const lbl = document.createElement('div');
          lbl.className = 'bar-label';
          lbl.textContent = v.toString();
          wrap.appendChild(bar); wrap.appendChild(lbl);
          vizContainer.appendChild(wrap);
        });
      };

      const colorBar = (i: number, col: string) => {
        const b = document.getElementById('b' + i);
        if (b) b.style.background = col;
      };

      const resetBars = () => { vals.forEach((_, i) => colorBar(i, BAR_COLORS.default)); };

      buildBars();
      let si = 0, sj = 0, sorted = vals.length;

      vizTimer = setInterval(() => {
        resetBars();
        if (sj >= sorted - 1) { 
          sj = 0; 
          si++; 
          if (si >= sorted) { 
            si = 0; 
            sorted = vals.length; 
            vals = [64, 34, 25, 12, 22, 11, 90, 45]; // Reset array to restart
            comparisons = 0;
            if (compCountEl) compCountEl.textContent = comparisons.toString();
          } 
        }
        colorBar(sj, BAR_COLORS.compare);
        colorBar(sj + 1, BAR_COLORS.compare);
        comparisons++;
        if (compCountEl) compCountEl.textContent = comparisons.toString();

        if (vals[sj] > vals[sj + 1]) {
          [vals[sj], vals[sj + 1]] = [vals[sj + 1], vals[sj]];
          buildBars();
          colorBar(sj, BAR_COLORS.swap);
          colorBar(sj + 1, BAR_COLORS.swap);
        }
        sj++;
      }, 650);
    }

    // Cleanup
    return () => {
      revObs.disconnect();
      countObs.disconnect();
      if (vizTimer) clearInterval(vizTimer);
    };
  }, []);

  return (
    <div className="landing-wrapper">
      {/* NAVIGATION */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <span className="logo-accent">ALGO</span>LERN
          </div>

          <ul className="landing-nav-links">
            <li><a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>Topics</a></li>
            <li><a href="#viz" onClick={(e) => { e.preventDefault(); document.getElementById('viz')?.scrollIntoView({ behavior: 'smooth' }); }}>Visualizer</a></li>
            <li><Link href="#">Practice</Link></li>
            <li><Link href="#">Pricing</Link></li>
          </ul>

          <Link href="/sorting/bubble" className="landing-btn-cta">Start Learning →</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-rules"></div>
        <div className="hero-watermark">DSA</div>

        <div className="container">
          <div className="hero-content">
            <div className="hero-eyebrow reveal">
              <span className="eyebrow-line"></span>
              <span className="eyebrow-tag">Interactive Platform</span>
              <span>37+ Algorithms · Step-by-step Visualizations</span>
            </div>

            <h1 className="hero-title reveal">
              SEE THE <span className="highlight">LOGIC.</span><br/>
              <span className="stroke">UNDERSTAND</span><br/>
              THE PATTERN.
            </h1>

            <p className="hero-desc reveal">
              A fully interactive DSA platform. Watch algorithms execute
              step-by-step, see exact operation complexity, and master
              how each structure works — visually, not theoretically.
            </p>

            <div className="hero-actions reveal">
              <Link href="/sorting/bubble" className="landing-btn-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Play className="fill-current" size={16} style={{ marginTop: '-2px' }}/> Start Visualizing
              </Link>
              <button className="btn-ghost" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: 'smooth' })}>Browse All Topics ↓</button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS ROW */}
      <div className="stats-row">
        <div className="stat-item">
          <div className="stat-num" data-target="37">0<sup>+</sup></div>
          <div className="stat-label">Algorithms covered</div>
        </div>
        <div className="stat-item">
          <div className="stat-num" data-target="37">0</div>
          <div className="stat-label">Live visualizations</div>
        </div>
        <div className="stat-item">
          <div className="stat-num" data-target="6">0</div>
          <div className="stat-label">Topic categories</div>
        </div>
        <div className="stat-item">
          <div className="stat-num" data-target="1000">0<sup>+</sup></div>
          <div className="stat-label">Active learners</div>
        </div>
      </div>

      {/* FEATURES GRID SECTION */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-label reveal">
            <span className="section-label-text">{"// everything you need"}</span>
            <div className="section-label-line"></div>
            <span className="section-label-num">01</span>
          </div>

          <h2 className="section-heading reveal">
            COMPLETE<br/>COVERAGE.
          </h2>

          <div className="bento reveal">
            {/* CARD 1 */}
            <Link href="/sorting/bubble" className="fcard span2" style={{ display: 'flex' }}>
              <div className="fcard-num">01 / 06</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div className="fcard-icon"><ArrowUpDown size={20} strokeWidth={1.5} /></div>
                <h3 className="fcard-title">SORTING</h3>
                <span className="fcard-badge"><Square size={10} className="fill-current" strokeWidth={2.5} /> 8 Topics</span>
              </div>
              <ul className="fcard-algos">
                <li>Bubble Sort — swap highlighting, pass counter</li>
                <li>Merge Sort — recursive call tree animation</li>
                <li>Quick Sort — pivot selection + partition</li>
                <li>Heap, Insertion, Selection, Radix, Shell Sort</li>
              </ul>
              <div className="fcard-cta">
                <span>Explore Sorting</span>
                <div className="cta-arrow">↗</div>
              </div>
            </Link>

            {/* CARD 2 */}
            <Link href="/searching/binary" className="fcard" style={{ display: 'flex' }}>
              <div className="fcard-num">02 / 06</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="fcard-icon"><Search size={20} strokeWidth={1.5} /></div>
                <span className="fcard-badge"><Square size={10} className="fill-current" strokeWidth={2.5} /> 5 Topics</span>
              </div>
              <h3 className="fcard-title">SEARCHING</h3>
              <ul className="fcard-algos">
                <li>Binary Search + midpoint trace</li>
                <li>Linear Search scan view</li>
                <li>Jump, Exponential, Interpolation</li>
              </ul>
              <div className="fcard-cta">
                <span>Try Searching</span>
                <div className="cta-arrow">↗</div>
              </div>
            </Link>

            {/* CARD 3 */}
            <Link href="/data-structures/linked-list" className="fcard" style={{ display: 'flex' }}>
              <div className="fcard-num">03 / 06</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="fcard-icon"><Hexagon size={20} strokeWidth={1.5} /></div>
                <span className="fcard-badge"><Square size={10} className="fill-current" strokeWidth={2.5} /> 7 Topics</span>
              </div>
              <h3 className="fcard-title">DATA<br/>STRUCTURES</h3>
              <ul className="fcard-algos">
                <li>Arrays, Linked Lists, Stacks</li>
                <li>Queues, Hash Tables, Trie</li>
                <li>Segment Tree</li>
              </ul>
              <div className="fcard-cta">
                <span>See Structures</span>
                <div className="cta-arrow">↗</div>
              </div>
            </Link>

            {/* CARD 4 */}
            <Link href="/trees/bst" className="fcard" style={{ display: 'flex' }}>
              <div className="fcard-num">04 / 06</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="fcard-icon"><Network size={20} strokeWidth={1.5} /></div>
                <span className="fcard-badge"><Square size={10} className="fill-current" strokeWidth={2.5} /> 6 Topics</span>
              </div>
              <h3 className="fcard-title">TREES</h3>
              <ul className="fcard-algos">
                <li>BST — insert, delete, search</li>
                <li>AVL & Red-Black rotations</li>
                <li>BFS / DFS traversal live</li>
              </ul>
              <div className="fcard-cta">
                <span>Grow the Tree</span>
                <div className="cta-arrow">↗</div>
              </div>
            </Link>

            {/* CARD 5 */}
            <Link href="/graphs/dijkstra" className="fcard" style={{ display: 'flex' }}>
              <div className="fcard-num">05 / 06</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="fcard-icon"><CircleDot size={20} strokeWidth={1.5} /></div>
                <span className="fcard-badge"><Square size={10} className="fill-current" strokeWidth={2.5} /> 7 Topics</span>
              </div>
              <h3 className="fcard-title">GRAPH<br/>ALGORITHMS</h3>
              <ul className="fcard-algos">
                <li>Dijkstra&apos;s shortest path</li>
                <li>Kruskal&apos;s MST, Prim&apos;s</li>
                <li>Topological Sort, Bellman-Ford</li>
              </ul>
              <div className="fcard-cta">
                <span>Map the Graph</span>
                <div className="cta-arrow">↗</div>
              </div>
            </Link>

            {/* CARD 6 */}
            <Link href="/advanced/fibonacci" className="fcard" style={{ display: 'flex' }}>
              <div className="fcard-num">06 / 06</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="fcard-icon"><Zap size={20} strokeWidth={1.5} /></div>
                <span className="fcard-badge"><Square size={10} className="fill-current" strokeWidth={2.5} /> 4 Topics</span>
              </div>
              <h3 className="fcard-title">ADVANCED</h3>
              <ul className="fcard-algos">
                <li>Dynamic Programming patterns</li>
                <li>Backtracking, Greedy</li>
                <li>Divide & Conquer</li>
              </ul>
              <div className="fcard-cta">
                <span>Level Up</span>
                <div className="cta-arrow">↗</div>
              </div>
            </Link>

            {/* CARD 7: COMING SOON */}
            <div className="fcard span2" style={{ display: 'flex', opacity: 0.6, cursor: 'not-allowed' }}>
              <div className="fcard-num">COMING SOON</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div className="fcard-icon"><Timer size={20} strokeWidth={1.5} /></div>
                <h3 className="fcard-title">SYSTEM DESIGN<br/>& MORE</h3>
                <span className="fcard-badge"><Square size={10} className="fill-current" strokeWidth={2.5} /> IN PROGRESS</span>
              </div>
              <ul className="fcard-algos">
                <li>System Design Architectures</li>
                <li>Machine Learning Algorithms</li>
                <li>Object-Oriented Design (OOD)</li>
                <li>Advanced System Mockups</li>
              </ul>
              <div className="fcard-cta">
                <span>Stay Tuned</span>
                <div className="cta-arrow" style={{ transform: 'none' }}>+</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TICKER MARQUEE */}
      <div className="ticker-strip" aria-hidden="true">
        <div className="ticker-track">
          <div className="ticker-item">BUBBLE SORT</div>
          <div className="ticker-item">BINARY SEARCH</div>
          <div className="ticker-item">MERGE SORT</div>
          <div className="ticker-item">DIJKSTRA</div>
          <div className="ticker-item">AVL TREE</div>
          <div className="ticker-item">QUICK SORT</div>
          <div className="ticker-item">BFS / DFS</div>
          <div className="ticker-item">DYNAMIC PROGRAMMING</div>
          <div className="ticker-item">KRUSKAL&apos;S MST</div>
          <div className="ticker-item">HEAP SORT</div>
          {/* Duplicate for seamless loop */}
          <div className="ticker-item">BUBBLE SORT</div>
          <div className="ticker-item">BINARY SEARCH</div>
          <div className="ticker-item">MERGE SORT</div>
          <div className="ticker-item">DIJKSTRA</div>
          <div className="ticker-item">AVL TREE</div>
          <div className="ticker-item">QUICK SORT</div>
          <div className="ticker-item">BFS / DFS</div>
          <div className="ticker-item">DYNAMIC PROGRAMMING</div>
          <div className="ticker-item">KRUSKAL&apos;S MST</div>
          <div className="ticker-item">HEAP SORT</div>
        </div>
      </div>

      {/* VISUALIZER FEATURE SECTION */}
      <section className="viz-section" id="viz">
        <div className="container">
          <div className="viz-grid">

            {/* LEFT: Code panel */}
            <div className="code-panel reveal">
              <div className="code-panel-header">
                <div className="wdots">
                  <div className="wdot wdot-r"></div>
                  <div className="wdot wdot-y"></div>
                  <div className="wdot wdot-g"></div>
                </div>
                <span className="panel-filename">bubble_sort.py</span>
                <span className="panel-step-badge" id="stepBadge">STEP ACTIVE</span>
              </div>

              <div className="code-body">
                <div className="cl"><span className="ln">1</span><span className="kw">def </span><span className="fn">bubble_sort</span>(arr):</div>
                <div className="cl"><span className="ln">2</span>  <span className="cm"># n = number of elements to sort</span></div>
                <div className="cl"><span className="ln">3</span>  n <span className="op">=</span> <span className="fn">len</span>(arr)</div>
                <div className="cl"><span className="ln">4</span>  <span className="kw">for </span>i <span className="kw">in</span> <span className="fn">range</span>(n):</div>
                <div className="cl active-line" id="activeLine"><span className="ln">5</span>    <span className="kw">for </span>j <span className="kw">in</span> <span className="fn">range</span>(<span className="num">0</span>, n<span className="op">-</span>i<span className="op">-</span><span className="num">1</span>):</div>
                <div className="cl"><span className="ln">6</span>      <span className="kw">if </span>arr[j] <span className="op">&gt;</span> arr[j<span className="op">+</span><span className="num">1</span>]:</div>
                <div className="cl"><span className="ln">7</span>        arr[j], arr[j<span className="op">+</span><span className="num">1</span>] <span className="op">=</span> arr[j<span className="op">+</span><span className="num">1</span>], arr[j]</div>
                <div className="cl"><span className="ln">8</span>  <span className="kw">return </span>arr</div>
              </div>

              <div className="array-visual" id="arrayViz"></div>

              <div className="complexity-row">
                <div className="cplx-item">Time: <span id="timeComplexity">O(n²)</span></div>
                <div className="cplx-item">Space: <span>O(1)</span></div>
                <div className="cplx-item">Comparisons: <span id="compCount">0</span></div>
              </div>
            </div>

            {/* RIGHT: Copy and feature bullets */}
            <div className="viz-copy reveal">
              <div className="section-label" style={{ marginBottom: '20px' }}>
                <span className="section-label-text">{"// interactive engine"}</span>
                <div className="section-label-line"></div>
                <span className="section-label-num">02</span>
              </div>

              <h2 className="section-heading">
                WATCH CODE<br/>RUN LIVE.
              </h2>

              <p>
                Not just a pretty animation — real algorithm execution,
                traced line-by-line so you understand every decision
                the code makes. Pause, rewind, replay at your speed.
              </p>

              <div className="viz-feats">
                <div className="vf-item">
                  <div className="vf-icon"><Play className="fill-current" size={20} /></div>
                  <div>
                    <div className="vf-title">Step-through Execution</div>
                    <div className="vf-desc">Pause and rewind any algorithm at any point. Watch each comparison and swap happen.</div>
                  </div>
                </div>
                <div className="vf-item">
                  <div className="vf-icon"><Timer size={22} strokeWidth={1.5} /></div>
                  <div>
                    <div className="vf-title">Live Complexity Meter</div>
                    <div className="vf-desc">Big-O tracked in real time as operations execute. See why O(n²) slows down.</div>
                  </div>
                </div>
                <div className="vf-item">
                  <div className="vf-icon"><Edit3 size={20} strokeWidth={1.5} /></div>
                  <div>
                    <div className="vf-title">Custom Input</div>
                    <div className="vf-desc">Enter your own arrays, trees, and graphs. See how the algorithm handles your data.</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-logo"><span className="fa">ALGO</span>LERN</div>
            <p className="footer-note">© 2026 AlgoLern · Built for serious learners.</p>
            <ul className="footer-links">
              <li><Link href="#">Privacy</Link></li>
              <li><Link href="#">Terms</Link></li>
              <li><Link href="#">GitHub</Link></li>
              <li><Link href="#">Discord</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
