"use client";

import { Menu, ChevronRight, Terminal, Sun, Moon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useMobileSidebar } from '@/components/layout/MobileSidebar';

export function TopBar() {
  const pathname = usePathname();
  const { open } = useMobileSidebar();
  
  const parts = pathname.split('/').filter(Boolean);
  const category = parts[0] ? parts[0].replace(/-/g, ' ') : '';
  const algorithm = parts[1] ? parts[1].replace(/-/g, ' ') : '';

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="h-16 w-full bg-white dark:bg-[#0d0f1a] border-b border-black/10 dark:border-[#252840] flex items-center justify-between px-4 md:px-8 shrink-0 z-10 transition-all duration-300">
      <div className="flex items-center gap-3 md:gap-6">
        {/* Hamburger — mobile only */}
        <button
          onClick={open}
          className="md:hidden p-1.5 rounded-lg text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        
        <nav className="flex items-center gap-2 md:gap-3 text-[11px] font-bold uppercase tracking-[0.2em] font-body">
          <Link href="/" className="text-black/50 dark:text-slate-500 hover:text-[var(--lime-dark)] dark:hover:text-lime transition-all">
            AlgoLern
          </Link>
          {category && (
            <>
              <ChevronRight size={14} className="text-black/30 dark:text-slate-600" />
              <span className="text-black/60 dark:text-slate-400 capitalize hidden sm:inline">{category}</span>
            </>
          )}
          {algorithm && (
            <>
              <ChevronRight size={14} className="text-black/30 dark:text-slate-600 hidden sm:inline" />
              <span className="text-[var(--lime-dark)] dark:text-lime flex items-center gap-2">
                <Terminal size={12} className="text-black/40 dark:text-slate-400 hidden sm:inline" />
                {algorithm}
              </span>
            </>
          )}
        </nav>
      </div>
      
      <div className="flex items-center gap-4 md:gap-8">
        {/* Keyboard hints — desktop only */}
        <div className="hidden lg:flex items-center gap-6 text-[10px] uppercase font-bold tracking-[0.2em] text-black/50 dark:text-slate-500">
          <div className="flex items-center gap-3 group">
            <kbd className="px-2 py-1 rounded bg-black/5 dark:bg-[#1a1d2e] border border-black/10 dark:border-[#2f3352] font-mono text-[10px] text-black/50 dark:text-slate-400 group-hover:border-black/30 dark:group-hover:border-indigo-500/50 group-hover:text-black dark:group-hover:text-white transition-all">Space</kbd>
            <span className="group-hover:text-black dark:group-hover:text-slate-300 transition-colors">Play/Pause</span>
          </div>
          <div className="flex items-center gap-3 group">
            <div className="flex gap-1.5">
              <kbd className="px-2 py-1 rounded bg-black/5 dark:bg-[#1a1d2e] border border-black/10 dark:border-[#2f3352] font-mono text-[10px] text-black/50 dark:text-slate-400 group-hover:border-black/30 dark:group-hover:border-indigo-500/50 group-hover:text-black dark:group-hover:text-white transition-all">←</kbd>
              <kbd className="px-2 py-1 rounded bg-black/5 dark:bg-[#1a1d2e] border border-black/10 dark:border-[#2f3352] font-mono text-[10px] text-black/50 dark:text-slate-400 group-hover:border-black/30 dark:group-hover:border-indigo-500/50 group-hover:text-black dark:group-hover:text-white transition-all">→</kbd>
            </div>
            <span className="group-hover:text-black dark:group-hover:text-slate-300 transition-colors">Navigate</span>
          </div>
        </div>
        
        {/* Theme toggle — always visible */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-black/5 dark:bg-[#1a1d2e] border border-black/10 dark:border-[#2f3352] text-black/60 dark:text-slate-300 hover:text-black dark:hover:text-lime hover:border-black/30 dark:hover:border-indigo-500/40 transition-all"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        )}
      </div>
    </header>
  );
}

