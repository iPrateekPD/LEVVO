"use client";

import React from "react";
import { Zap, CheckCircle2, Trophy, BatteryCharging } from "lucide-react";

interface QuickStatsRowProps {
  momentum: number;
  currentAp: number;
  maxAp: number;
  completedTasksCount: number;
  totalXp: number;
}

export function QuickStatsRow({
  momentum,
  currentAp,
  maxAp,
  completedTasksCount,
  totalXp,
}: QuickStatsRowProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full">
      {/* Momentum */}
      <div className="bg-[#141026] border border-phosphorGreen/30 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="flex items-center gap-1.5 text-phosphorGreen">
          <Zap className="w-4 h-4 animate-pulse" />
          <span className="font-arcade text-base sm:text-lg">{momentum}%</span>
        </div>
        <span className="text-[10px] text-textSecondary uppercase font-medium mt-1">
          7-Day Momentum
        </span>
      </div>

      {/* Action Points */}
      <div className="bg-[#141026] border border-neonCyan/30 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="flex items-center gap-1.5 text-neonCyan">
          <BatteryCharging className="w-4 h-4" />
          <span className="font-arcade text-base sm:text-lg">
            {currentAp}/{maxAp}
          </span>
        </div>
        <span className="text-[10px] text-textSecondary uppercase font-medium mt-1">
          Energy (AP)
        </span>
      </div>

      {/* Quests Done */}
      <div className="bg-[#141026] border border-synthMagenta/30 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="flex items-center gap-1.5 text-synthMagenta">
          <CheckCircle2 className="w-4 h-4" />
          <span className="font-arcade text-base sm:text-lg">{completedTasksCount}</span>
        </div>
        <span className="text-[10px] text-textSecondary uppercase font-medium mt-1">
          Quests Done
        </span>
      </div>

      {/* Lifetime XP */}
      <div className="bg-[#141026] border border-arcadeGold/30 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="flex items-center gap-1.5 text-arcadeGold">
          <Trophy className="w-4 h-4" />
          <span className="font-arcade text-base sm:text-lg">{totalXp}</span>
        </div>
        <span className="text-[10px] text-textSecondary uppercase font-medium mt-1">
          Total XP Earned
        </span>
      </div>
    </div>
  );
}
