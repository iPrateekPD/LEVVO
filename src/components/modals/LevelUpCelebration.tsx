"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Trophy, Star, ArrowRight } from "lucide-react";
import { sounds } from "@/lib/sound";
import { useEscapeKey } from "@/lib/useEscapeKey";

interface LevelUpCelebrationProps {
  isOpen: boolean;
  newLevel: number;
  onClose: () => void;
}

export function LevelUpCelebration({ isOpen, newLevel, onClose }: LevelUpCelebrationProps) {
  useEscapeKey(onClose, isOpen);

  useEffect(() => {
    if (isOpen) {
      sounds.playLevelUp();
      // Massive full-screen celebratory confetti
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.4 },
        colors: ["#FFE600", "#FF2A85", "#00F0FF", "#00FF66"],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-[#2E083B] to-[#120824] border-4 border-arcadeGold rounded-3xl w-full max-w-md p-6 text-center shadow-[0_0_50px_rgba(255,230,0,0.4)] flex flex-col items-center gap-4 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Floating Stars */}
        <div className="flex items-center gap-2 text-arcadeGold animate-pulse">
          <Star className="w-6 h-6 fill-arcadeGold" />
          <Star className="w-8 h-8 fill-arcadeGold" />
          <Star className="w-6 h-6 fill-arcadeGold" />
        </div>

        {/* Title */}
        <h2 className="font-arcade text-2xl sm:text-3xl text-arcadeGold neon-glow-gold tracking-widest uppercase">
          LEVEL UP!
        </h2>

        {/* Level Badge */}
        <div className="w-24 h-24 rounded-2xl bg-[#3E1152] border-4 border-neonCyan flex items-center justify-center shadow-[0_0_25px_rgba(0,240,255,0.6)] my-2">
          <span className="font-arcade text-4xl text-neonCyan neon-glow-cyan">
            {newLevel}
          </span>
        </div>

        <p className="text-sm text-textPrimary leading-relaxed">
          Your discipline in the real world has forged you into a higher-level player.
          Attributes bolstered, new potential unlocked!
        </p>

        {/* Continue Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="arcade-btn w-full mt-2 py-3 bg-gradient-to-r from-arcadeGold to-yellow-400 hover:brightness-110 text-arcadeBlack font-arcade text-sm rounded-xl border-2 border-yellow-200 shadow-[0_4px_0_#9E8200] flex items-center justify-center gap-2"
        >
          <span>CONTINUE QUESTING</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
