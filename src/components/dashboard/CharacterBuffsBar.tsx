"use client";

import React, { useState } from "react";
import { Zap, Shield, Coffee } from "lucide-react";
import { sounds } from "@/lib/sound";

interface CharacterBuffsBarProps {
  currentStreak: number;
}

export function CharacterBuffsBar({ currentStreak }: CharacterBuffsBarProps) {
  const [selectedBuffId, setSelectedBuffId] = useState<string | null>(null);

  const buffs = [
    {
      id: "focus_surge",
      label: "+15% Focus XP",
      desc: "Earn 1.15x XP on quests completed in the Focus Sprint chamber.",
      icon: Zap,
      color: "text-amber-300 bg-amber-500/15 border-amber-500/30",
    },
    {
      id: "streak_shield",
      label: currentStreak >= 3 ? "Streak Shield: Active" : "Streak Shield: Locked (3d)",
      desc: "Protects your fire streak if you miss a day. Unlocked at 3+ day streak.",
      icon: Shield,
      color:
        currentStreak >= 3
          ? "text-cyan-300 bg-cyan-500/15 border-cyan-500/30"
          : "text-slate-400 bg-white/[0.04] border-white/[0.08] opacity-60",
    },
    {
      id: "early_bird",
      label: "+10 GP Early Bird",
      desc: "Complete quests before 12:00 PM to earn +10 bonus Gold Coins per quest (Sonic 100-Ring Rush).",
      icon: Coffee,
      color: "text-purple-300 bg-purple-500/15 border-purple-500/30",
    },
    {
      id: "star_power",
      label: "★ Star Power",
      desc: "Super Mario invincibility: Focus through distractions to maintain your combo.",
      icon: Zap,
      color: "text-amber-300 bg-amber-500/15 border-amber-500/30",
    },
  ];

  const activeBuff = buffs.find((b) => b.id === selectedBuffId);

  return (
    <div className="relative w-full flex flex-col gap-2 text-xs">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider hidden sm:inline">
          Active Buffs:
        </span>
        {buffs.map((b) => {
          const Icon = b.icon;
          const isSelected = selectedBuffId === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                sounds.playClick();
                setSelectedBuffId(isSelected ? null : b.id);
              }}
              className={`px-2.5 py-1 rounded-full border text-[11px] font-medium flex items-center gap-1.5 transition-all hover:scale-105 ${
                b.color
              } ${isSelected ? "ring-2 ring-cyan-400/50 scale-105" : ""}`}
              title={b.desc}
            >
              <Icon className="w-3 h-3" />
              <span>{b.label}</span>
            </button>
          );
        })}
      </div>

      {/* Clean inline description bar (No floating overlap!) */}
      {activeBuff && (
        <div className="p-2 px-3 rounded-xl bg-[#080B18]/90 border border-white/[0.1] text-[11px] text-cyan-200 font-mono flex items-center justify-between animate-in fade-in slide-in-from-top-1 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">{activeBuff.label}:</span>
            <span className="text-slate-200">{activeBuff.desc}</span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedBuffId(null)}
            className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-white/[0.1] transition-colors"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
