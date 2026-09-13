"use client";

import React, { useState, useEffect } from "react";
import { Skull, Shield, Sword, Award, Sparkles, RefreshCw } from "lucide-react";
import { sounds } from "@/lib/sound";

interface DailyBossCardProps {
  completedTasksCount: number;
  totalXpToday: number;
  onClaimVictoryLoot?: () => void;
}

export function DailyBossCard({
  completedTasksCount,
  totalXpToday,
  onClaimVictoryLoot,
}: DailyBossCardProps) {
  const MAX_HP = 400;
  // Calculate boss damage from total XP earned today
  const currentHp = Math.max(0, MAX_HP - (totalXpToday > 0 ? totalXpToday : completedTasksCount * 50));
  const isDefeated = currentHp === 0;
  const hpPercent = Math.round((currentHp / MAX_HP) * 100);

  const [isHit, setIsHit] = useState(false);
  const [lootClaimed, setLootClaimed] = useState(false);

  // Trigger hit animation when currentHp decreases
  useEffect(() => {
    if (completedTasksCount > 0) {
      setIsHit(true);
      const t = setTimeout(() => setIsHit(false), 600);
      return () => clearTimeout(t);
    }
  }, [completedTasksCount, totalXpToday]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 p-5 shadow-xl ${
        isDefeated
          ? "bg-gradient-to-br from-[#101D1A] to-[#0A1412] border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.15)]"
          : "bg-gradient-to-br from-[#140E20]/90 to-[#0A0D1B]/95 border-rose-500/25 shadow-[0_0_25px_rgba(244,63,94,0.1)]"
      }`}
    >
      {/* Hit Flash Overlay */}
      {isHit && (
        <div className="absolute inset-0 bg-rose-500/20 pointer-events-none z-10 animate-ping" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-base select-none border transition-transform ${
              isDefeated
                ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
                : isHit
                ? "scale-125 bg-rose-500/30 border-rose-400 text-rose-300"
                : "bg-rose-500/15 border-rose-500/30 text-rose-400"
            }`}
          >
            {isDefeated ? "🏆" : "👹"}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-white uppercase tracking-wider">
                {isDefeated ? "DUNGEON CLEARED" : "DAILY BOSS BATTLE"}
              </span>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                  isDefeated
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                }`}
              >
                {isDefeated ? "SLAYED" : "ACTIVE"}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {isDefeated ? "The Sloth Demon has fallen!" : "Malakor, The Procrastination Titan"}
            </span>
          </div>
        </div>

        <span className="font-mono text-xs font-bold text-slate-300">
          {isDefeated ? "0 HP" : `${currentHp} / ${MAX_HP} HP`}
        </span>
      </div>

      {/* Dynamic Boss HP Bar */}
      <div className="py-3 flex flex-col gap-1.5">
        <div className="w-full h-2.5 bg-[#070914] rounded-full overflow-hidden border border-white/[0.06] p-0.5 relative">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isDefeated
                ? "bg-emerald-400 shadow-[0_0_12px_#34d399]"
                : "bg-gradient-to-r from-rose-500 via-amber-500 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
            }`}
            style={{ width: `${isDefeated ? 100 : hpPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Sword className="w-3 h-3 text-rose-400" />
            <span>Tasks deal direct HP damage</span>
          </span>
          <span>{isDefeated ? "100% Cleared" : `${100 - hpPercent}% Damage Taken`}</span>
        </div>
      </div>

      {/* Boss Action / Victory Banner */}
      {isDefeated ? (
        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">+100 GP Dungeon Chest Unlocked!</span>
          </div>
          {!lootClaimed ? (
            <button
              type="button"
              onClick={() => {
                sounds.playLevelUp();
                setLootClaimed(true);
                onClaimVictoryLoot?.();
              }}
              className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs font-bold rounded-xl shadow-[0_0_12px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-all"
            >
              Claim Loot 🎁
            </button>
          ) : (
            <span className="text-[10px] font-mono text-emerald-400">CLAIMED ✓</span>
          )}
        </div>
      ) : (
        <p className="text-[11px] text-slate-400 italic pt-1">
          &ldquo;Every quest completed today strikes down Malakor&apos;s procrastination aura.&rdquo;
        </p>
      )}
    </div>
  );
}
