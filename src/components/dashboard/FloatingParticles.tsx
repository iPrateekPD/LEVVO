"use client";

import React, { useEffect, useState } from "react";

export interface FloatingParticleItem {
  id: string;
  x: number;
  y: number;
  text: string;
  color?: string;
  isCrit?: boolean;
}

interface FloatingParticlesProps {
  particles: FloatingParticleItem[];
  onRemove: (id: string) => void;
}

export function FloatingParticles({ particles, onRemove }: FloatingParticlesProps) {
  useEffect(() => {
    particles.forEach((p) => {
      const timer = setTimeout(() => {
        onRemove(p.id);
      }, 1200);
      return () => clearTimeout(timer);
    });
  }, [particles, onRemove]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          style={{ left: `${p.x}px`, top: `${p.y}px` }}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-fade-float select-none ${
            p.isCrit ? "scale-110" : ""
          }`}
        >
          {p.isCrit && (
            <span className="font-mono text-[10px] font-extrabold text-amber-300 tracking-wider uppercase drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">
              CRITICAL HIT!
            </span>
          )}
          <div
            className={`px-2.5 py-1 rounded-full font-mono text-xs font-black shadow-lg flex items-center gap-1.5 backdrop-blur-md border ${
              p.isCrit
                ? "bg-gradient-to-r from-amber-500/90 to-yellow-400 text-black border-yellow-200 shadow-[0_0_15px_rgba(250,204,21,0.6)]"
                : "bg-emerald-500/90 text-black border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
            }`}
          >
            <span>{p.text}</span>
            <span>✨</span>
          </div>
        </div>
      ))}
      <style jsx global>{`
        @keyframes fadeFloat {
          0% {
            opacity: 0;
            transform: translate(-50%, -20%) scale(0.7);
          }
          20% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.05);
          }
          80% {
            opacity: 0.9;
            transform: translate(-50%, -100%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -140%) scale(0.85);
          }
        }
        .animate-fade-float {
          animation: fadeFloat 1.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
