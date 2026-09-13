"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export function AmbientCursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on desktop/fine-pointer devices
    if (typeof window === "undefined") return;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!hasFinePointer || !glowRef.current) return;

    const glow = glowRef.current;
    gsap.set(glow, { xPercent: -50, yPercent: -50, opacity: 0 });

    const xTo = gsap.quickTo(glow, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(glow, "y", { duration: 0.6, ease: "power3.out" });

    let hasMoved = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!hasMoved) {
        hasMoved = true;
        gsap.to(glow, { opacity: 0.45, duration: 0.8, ease: "power2.out" });
      }
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const handleMouseLeave = () => {
      gsap.to(glow, { opacity: 0, duration: 0.5 });
    };

    const handleMouseEnter = () => {
      gsap.to(glow, { opacity: 0.45, duration: 0.5 });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="fixed top-0 left-0 w-[420px] h-[420px] rounded-full pointer-events-none z-30 select-none blur-[120px] bg-gradient-to-br from-cyan-500/15 via-purple-600/10 to-transparent mix-blend-screen hidden md:block"
    />
  );
}
