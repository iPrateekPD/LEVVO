"use client";

import React from "react";
import { Compass, Flame, Trophy, CheckCircle, Award } from "lucide-react";

interface JourneyProgressProps {
  currentLevel: number;
  totalXp: number;
  totalCompletedQuests: number;
  streakCurrent: number;
  streakLongest: number;
}

const LEVEL_MILESTONES = [1, 2, 3, 5, 10, 20];

export function JourneyProgress({
  currentLevel,
  totalXp,
  totalCompletedQuests,
  streakCurrent,
  streakLongest,
}: JourneyProgressProps) {
  return (
    <section className="bg-cabinetSurface/90 border-2 border-cabinetBorder rounded-xl p-4 sm:p-5 shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between pb-2 border-b border-cabinetBorder">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-arcadeGold animate-spin-slow" />
          <span className="font-arcade text-xs text-arcadeGold neon-glow-gold tracking-wider">
            HERO JOURNEY & MILESTONE MAP
          </span>
        </div>
        <span className="font-arcade text-[10px] text-neonCyan">
          CURRENT: LVL {currentLevel}
        </span>
      </div>

      {/* Horizontal Pixel Level Path */}
      <div className="py-4 px-1 sm:px-2 w-full overflow-hidden">
        <div className="w-full relative flex items-center justify-between">
          {/* Connecting Track Line */}
          <div className="absolute left-4 right-4 sm:left-6 sm:right-6 top-1/2 -translate-y-1/2 h-2 bg-[#0B0818] border border-cabinetBorder rounded-full z-0">
            <div
              className="h-full bg-gradient-to-r from-neonCyan via-synthMagenta to-arcadeGold rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,240,255,0.5)]"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    ((Math.min(currentLevel, 20) - 1) / (20 - 1)) * 100
                  )
                )}%`,
              }}
            />
          </div>

          {/* Level Nodes */}
          {LEVEL_MILESTONES.map((lvl) => {
            const isReached = currentLevel >= lvl;
            const isCurrent = currentLevel === lvl || (currentLevel > lvl && (lvl === 20 || currentLevel < (LEVEL_MILESTONES[LEVEL_MILESTONES.indexOf(lvl) + 1] || 99)));

            return (
              <div
                key={lvl}
                className="relative z-10 flex flex-col items-center gap-1 sm:gap-1.5"
              >
                <div
                  className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border-2 flex items-center justify-center font-arcade text-[9px] sm:text-xs transition-all ${
                    isReached
                      ? "bg-gradient-to-br from-[#2E083B] to-[#120824] border-neonCyan text-neonCyan shadow-[0_0_12px_rgba(0,240,255,0.6)]"
                      : "bg-[#0B0818] border-cabinetBorder text-textMuted"
                  } ${isCurrent ? "ring-2 sm:ring-4 ring-synthMagenta/50 scale-110" : ""}`}
                >
                  {isReached ? `L${lvl}` : `${lvl}`}
                </div>
                <span
                  className={`font-arcade text-[7px] sm:text-[9px] uppercase ${
                    isReached ? "text-neonCyan" : "text-textMuted"
                  }`}
                >
                  {lvl === 1 ? "Start" : lvl === 20 ? "Master" : `Stg ${lvl}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lifetime Stats Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-cabinetBorder text-center text-xs">
        <div className="bg-[#120D24] p-2.5 rounded-lg border border-cabinetBorder">
          <div className="text-textSecondary text-[10px] uppercase font-medium">
            Quests Cleared
          </div>
          <div className="font-arcade text-sm text-textPrimary mt-0.5">
            {totalCompletedQuests}
          </div>
        </div>

        <div className="bg-[#120D24] p-2.5 rounded-lg border border-cabinetBorder">
          <div className="text-textSecondary text-[10px] uppercase font-medium">
            Total XP Banked
          </div>
          <div className="font-arcade text-sm text-neonCyan mt-0.5">{totalXp}</div>
        </div>

        <div className="bg-[#120D24] p-2.5 rounded-lg border border-cabinetBorder">
          <div className="text-textSecondary text-[10px] uppercase font-medium">
            Current Streak
          </div>
          <div className="font-arcade text-sm text-arcadeRed mt-0.5">
            {streakCurrent} Days
          </div>
        </div>

        <div className="bg-[#120D24] p-2.5 rounded-lg border border-cabinetBorder">
          <div className="text-textSecondary text-[10px] uppercase font-medium">
            Longest Streak
          </div>
          <div className="font-arcade text-sm text-arcadeGold mt-0.5">
            {streakLongest} Days
          </div>
        </div>
      </div>
    </section>
  );
}
