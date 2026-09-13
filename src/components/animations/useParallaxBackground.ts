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
    if (typeof window === "undefined") return;

    const mult = reverse ? -1 : 1;

    const handleMouseMove = (e: MouseEvent) => {
      const el = targetRef.current;
      if (!el) return;

      const { innerWidth, innerHeight } = window;
      // Normalized between -1 and 1
      const normX = (e.clientX / innerWidth - 0.5) * 2;
      const normY = (e.clientY / innerHeight - 0.5) * 2;

      gsap.to(el, {
        x: normX * depth * mult,
        y: normY * depth * mult,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const handleMouseLeave = () => {
      const el = targetRef.current;
      if (el) {
        gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "power2.out", overwrite: "auto" });
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [depth, reverse, targetRef]);
}
