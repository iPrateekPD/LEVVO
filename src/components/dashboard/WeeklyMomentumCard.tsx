"use client";

import React from "react";
import { Flame, CheckCircle2, Zap } from "lucide-react";

interface WeeklyMomentumCardProps {
  currentStreak: number;
  completedTasksCount: number;
}

export function WeeklyMomentumCard({ currentStreak, completedTasksCount }: WeeklyMomentumCardProps) {
  // Days of week
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0, Sunday = 6

  // Simulated active days based on currentStreak up to today
  const activeDayIndices = new Set<number>();
  for (let i = 0; i < currentStreak; i++) {
    const dayIdx = (todayIndex - i + 7) % 7;
    activeDayIndices.add(dayIdx);
  }

  const multiplier = currentStreak >= 7 ? "2.0x" : currentStreak >= 3 ? "1.5x" : "1.0x";

  return (
    <div className="bg-[#0C1022]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] flex flex-col gap-3.5">
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.07]">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
            Weekly Momentum
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>{multiplier} XP Boost</span>
        </div>
      </div>

      {/* 7-Day Matrix */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, idx) => {
          const isToday = idx === todayIndex;
          const isActive = activeDayIndices.has(idx) || (isToday && completedTasksCount > 0);
          const isFuture = idx > todayIndex;

          return (
            <div
              key={day}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                isToday
                  ? "bg-cyan-500/15 border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                  : isActive
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-white/[0.03] border-white/[0.06] text-slate-500"
              }`}
            >
              <span className="text-[10px] font-medium text-slate-400">{day}</span>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                  isActive
                    ? "bg-emerald-500 text-black shadow-[0_0_8px_#10b981]"
                    : isToday
                    ? "bg-cyan-400 text-black shadow-[0_0_8px_#22d3ee]"
                    : "bg-white/[0.05] text-slate-600"
                }`}
              >
                {isActive ? "✓" : isToday ? "•" : "·"}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
        <span>Consistency: <strong className="text-white">{Math.min(7, currentStreak)}/7 days active</strong></span>
        <span className="text-emerald-400 font-medium">Keep the flame alive 🔥</span>
      </div>
    </div>
  );
}
