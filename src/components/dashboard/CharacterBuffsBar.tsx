"use client";

import React, { useState } from "react";
import { Zap, Shield, Coffee, Info } from "lucide-react";
import { sounds } from "@/lib/sound";

interface CharacterBuffsBarProps {
  currentStreak: number;
}

export function CharacterBuffsBar({ currentStreak }: CharacterBuffsBarProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const buffs = [
    {
      id: "focus_surge",
      label: "+15% Focus XP",
      desc: "Earn 1.15x XP when completing quests using the Focus Sprint chamber.",
      icon: Zap,
      color: "text-amber-300 bg-amber-500/15 border-amber-500/30",
    },
    {
      id: "streak_shield",
      label: currentStreak >= 3 ? "Streak Shield: Active" : "Streak Shield: Locked (3d)",
      desc: "Protects your active streak if you miss a single day. Unlocked at 3+ day streak.",
      icon: Shield,
      color:
        currentStreak >= 3
          ? "text-cyan-300 bg-cyan-500/15 border-cyan-500/30"
          : "text-slate-400 bg-white/[0.04] border-white/[0.08] opacity-60",
    },
    {
      id: "early_bird",
      label: "+10 GP Early Bird",
      desc: "Complete quests before 12:00 PM to earn +10 bonus Gold Coins on every quest.",
      icon: Coffee,
      color: "text-purple-300 bg-purple-500/15 border-purple-500/30",
    },
  ];

  return (
    <div className="relative w-full flex items-center gap-2 flex-wrap text-xs">
      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider hidden sm:inline">
        Active Buffs:
      </span>
      {buffs.map((b) => {
        const Icon = b.icon;
        return (
          <div key={b.id} className="relative group">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTooltip(activeTooltip === b.id ? null : b.id);
              }}
              className={`px-2.5 py-1 rounded-full border text-[11px] font-medium flex items-center gap-1.5 transition-all hover:scale-105 ${b.color}`}
            >
              <Icon className="w-3 h-3" />
              <span>{b.label}</span>
            </button>

            {/* Hover / Click Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-xl bg-[#0F142A] border border-white/[0.1] shadow-2xl text-[10px] text-slate-300 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 text-center">
              {b.desc}
            </div>
          </div>
        );
      })}
    </div>
  );
}
