"use client";

import React, { useState, useEffect } from "react";
import { Skull, Shield, Sword, Award, Sparkles, RefreshCw } from "lucide-react";
import { sounds } from "@/lib/sound";

interface DailyBossCardProps {
  completedTasksCount: number;
  totalXpToday: number;
  onClaimVictoryLoot?: () => void;
  onBossStrike?: (damage: number) => void;
}

export function DailyBossCard({
  completedTasksCount,
  totalXpToday,
  onClaimVictoryLoot,
  onBossStrike,
}: DailyBossCardProps) {
  const MAX_HP = 400;
  const [bonusDamage, setBonusDamage] = useState(0);

  // Calculate boss damage from total XP earned today + direct player strikes
  const baseDamage = totalXpToday > 0 ? totalXpToday : completedTasksCount * 50;
  const totalDamage = baseDamage + bonusDamage;
  const currentHp = Math.max(0, MAX_HP - totalDamage);
  const isDefeated = currentHp === 0;
  const hpPercent = Math.round((currentHp / MAX_HP) * 100);

  const [isHit, setIsHit] = useState(false);
  const [lootClaimed, setLootClaimed] = useState(false);
  const [comboCount, setComboCount] = useState(0);

  // Trigger hit animation when currentHp decreases
  useEffect(() => {
    if (completedTasksCount > 0) {
      setIsHit(true);
      setComboCount((prev) => prev + 1);
      const t = setTimeout(() => setIsHit(false), 600);
      return () => clearTimeout(t);
    }
  }, [completedTasksCount, totalXpToday]);

  const handleManualStrike = () => {
    if (isDefeated) return;
    sounds.playBossHit();
    setIsHit(true);
    setComboCount((prev) => prev + 1);
    const dmg = 35;
    setBonusDamage((prev) => prev + dmg);
    onBossStrike?.(dmg);
    setTimeout(() => setIsHit(false), 400);

    if (currentHp - dmg <= 0) {
      sounds.playLevelUp();
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08] min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-base select-none border shrink-0 transition-transform ${
              isDefeated
                ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
                : isHit
                ? "scale-125 bg-rose-500/30 border-rose-400 text-rose-300"
                : "bg-rose-500/15 border-rose-500/30 text-rose-400"
            }`}
          >
            {isDefeated ? "🏆" : "👹"}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
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
                {isDefeated ? "K.O. VICTORY" : "ROUND 1 · FIGHT!"}
              </span>
              {!isDefeated && currentHp <= 120 && (
                <span className="px-1.5 py-0.2 rounded text-[8px] font-arcade text-amber-300 bg-amber-500/20 border border-amber-500/40 animate-pulse">
                  ⚡ FINISH HIM!
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 truncate">
              {isDefeated ? "The Sloth Demon has fallen!" : "Malakor, The Procrastination Titan (OG Boss)"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap shrink-0">
          {comboCount > 0 && !isDefeated && (
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-arcade text-[9px] animate-bounce">
              🔥 COMBO x{comboCount}
            </span>
          )}

          {!isDefeated && (
            <button
              type="button"
              onClick={handleManualStrike}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-mono text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
              title="Channel discipline into direct strike against Malakor"
            >
              <Sword className="w-3.5 h-3.5" />
              <span>Strike (-35 HP)</span>
            </button>
          )}

          <span className="font-mono text-xs font-bold text-slate-300">
            {isDefeated ? "0 HP" : `${currentHp} / ${MAX_HP} HP`}
          </span>
        </div>
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
            <span>Tasks & strikes deal direct HP damage</span>
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
        <div className="pt-1 flex items-center justify-between">
          <p className="text-[11px] text-slate-400 italic">
            &ldquo;Every quest completed today strikes down Malakor&apos;s procrastination aura.&rdquo;
          </p>
          <button
            type="button"
            onClick={handleManualStrike}
            className="sm:hidden inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono text-[11px] font-bold"
          >
            <Sword className="w-3 h-3" />
            <span>Strike</span>
          </button>
        </div>
      )}
    </div>
  );
}
