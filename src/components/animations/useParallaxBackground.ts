"use client";

import { useEffect, RefObject } from "react";
import gsap from "gsap";

interface ParallaxOptions {
  depth?: number; // Distance in pixels to move (default: 20)
  reverse?: boolean;
}

export function useParallaxBackground<T extends HTMLElement>(
  targetRef: RefObject<T>,
  options: ParallaxOptions = {}
) {
  const { depth = 20, reverse = false } = options;

  useEffect(() => {
    const el = targetRef.current;
    if (!el || typeof window === "undefined") return;
    const isTouch = !window.matchMedia("(pointer: fine)").matches;
    if (isTouch) return;

    const mult = reverse ? -1 : 1;
    const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "power2.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "power2.out" });

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Normalized between -1 and 1
      const normX = (e.clientX / innerWidth - 0.5) * 2;
      const normY = (e.clientY / innerHeight - 0.5) * 2;

      xTo(normX * depth * mult);
      yTo(normY * depth * mult);
    };

    const handleMouseLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 1, ease: "power2.out" });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [depth, reverse, targetRef]);
}
