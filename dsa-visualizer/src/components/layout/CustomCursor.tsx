"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function CustomCursor() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;
    
    // Disable custom cursor on mobile devices
    if (window.matchMedia('(max-width: 768px)').matches) {
      const cursor = document.getElementById('cursor');
      if (cursor) cursor.style.display = 'none';
      return;
    }

    const cursor = document.getElementById('cursor');
    if (!cursor) return;

    // Ensure it's visible on desktop if it was previously hidden
    cursor.style.display = 'block';

    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;
    let tgX = cursorX;
    let tgY = cursorY;

    const onMouseMove = (e: MouseEvent) => {
      tgX = e.clientX;
      tgY = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);

    let rafId: number;
    const move = () => {
      cursorX += (tgX - cursorX) * 0.15;
      cursorY += (tgY - cursorY) * 0.15;
      if (cursor) {
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
      }
      rafId = requestAnimationFrame(move);
    };
    rafId = requestAnimationFrame(move);

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, input, .fcard, [role="button"]')) {
        cursor.classList.add('hover');
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, input, .fcard, [role="button"]')) {
        cursor.classList.remove('hover');
      }
    };

    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mouseout', onMouseOut);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseout', onMouseOut);
      cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  if (pathname !== "/") return null;

  return <div id="cursor" className="hidden md:block" />;
}
