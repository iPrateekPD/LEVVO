"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface QuestSlashEffectProps {
  triggerKey: string; // unique key that triggers animation on change
  className?: string;
}

export function QuestSlashEffect({ triggerKey, className = "" }: QuestSlashEffectProps) {
  const lineRef = useRef<HTMLDivElement>(null);
  const coinsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!triggerKey || !lineRef.current) return;

    const line = lineRef.current;
    const coins = coinsContainerRef.current?.children;

    const tl = gsap.timeline();

    // 1. Neon laser slash sweep
    tl.fromTo(
      line,
      { scaleX: 0, opacity: 1, transformOrigin: "left center" },
      { scaleX: 1, duration: 0.22, ease: "power4.out" }
    ).to(line, { opacity: 0, duration: 0.35, ease: "power2.in" });

    // 2. Micro coin spark burst
    if (coins && coins.length > 0) {
      Array.from(coins).forEach((coin, i) => {
        const angle = (i / coins.length) * Math.PI * 2;
        const dist = 25 + Math.random() * 20;
        const targetX = Math.cos(angle) * dist;
        const targetY = Math.sin(angle) * dist;

        gsap.fromTo(
          coin,
          { x: 0, y: 0, scale: 0, opacity: 1, rotation: 0 },
          {
            x: targetX,
            y: targetY - 15,
            scale: 1,
            rotation: 180,
            opacity: 0,
            duration: 0.6,
            delay: 0.05 * i,
            ease: "power2.out",
          }
        );
      });
    }
  }, [triggerKey]);

  return (
    <div className={`relative pointer-events-none ${className}`}>
      {/* Neon Slash Beam */}
      <div
        ref={lineRef}
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-cyan-400 via-white to-amber-300 shadow-[0_0_12px_#22d3ee] scale-x-0 origin-left z-20"
      />

      {/* Mini Coin Particles */}
      <div ref={coinsContainerRef} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
        {[0, 1, 2, 3].map((idx) => (
          <span
            key={idx}
            className="absolute text-xs font-mono text-amber-300 font-bold select-none opacity-0"
          >
            🪙
          </span>
        ))}
      </div>
    </div>
  );
}
