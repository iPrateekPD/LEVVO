"use client";

import React, { useState } from "react";
import { Skull, Swords, Users, ShieldAlert, Sparkles, Flame, Trophy } from "lucide-react";
import { sounds } from "@/lib/sound";

interface Companion {
  id: string;
  name: string;
  avatar: string;
  role: string;
  damage: number;
  isReady: boolean;
}

interface PartyRaidSectionProps {
  onDealBossDamage?: (dmg: number) => void;
}

export function PartyRaidSection({ onDealBossDamage }: PartyRaidSectionProps) {
  const [bossHp, setBossHp] = useState(340);
  const maxBossHp = 2000;
  const [isStriking, setIsStriking] = useState(false);
  const [combatLog, setCombatLog] = useState<string[]>([
    "Aria cast Void Pulse for 85 damage!",
    "Kaelen blocked Burnout Shockwave!",
    "Boran rallied the guild party (+10% Crit)!",
  ]);

  const companions: Companion[] = [
    { id: "1", name: "Aria", avatar: "🧙‍♀️", role: "Arcanist", damage: 420, isReady: true },
    { id: "2", name: "Kaelen", avatar: "🛡️", role: "Warden", damage: 580, isReady: true },
    { id: "3", name: "Boran", avatar: "🏹", role: "Ranger", damage: 310, isReady: true },
    { id: "4", name: "Prateek (You)", avatar: "⚡", role: "Paladin", damage: 350, isReady: true },
  ];

  const handleStrike = () => {
    if (bossHp <= 0) return;
    sounds.playBossHit();
    setIsStriking(true);

    const dmg = Math.floor(Math.random() * 45) + 30; // 30 - 75 dmg
    const newHp = Math.max(0, bossHp - dmg);
    setBossHp(newHp);

    setCombatLog((prev) => [
      `⚔️ You struck The Titan of Burnout for CRITICAL ${dmg} DMG!`,
      ...prev.slice(0, 3),
    ]);

    if (onDealBossDamage) {
      onDealBossDamage(dmg);
    }

    if (newHp === 0) {
      sounds.playLevelUp();
    }

    setTimeout(() => {
      setIsStriking(false);
    }, 400);
  };

  const hpPercent = Math.round((bossHp / maxBossHp) * 100);

  return (
    <div className="relative w-full rounded-3xl bg-[#090D1E]/90 border border-purple-500/30 backdrop-blur-xl p-5 sm:p-6 overflow-hidden shadow-2xl">
      {/* Ambient background aura */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Co-Op Guild Raid: Titan of Burnout
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-black uppercase">
                WORLD BOSS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Fight alongside your guild party to topple the procrastination demon before Sunday reset.
            </p>
          </div>
        </div>

        {/* Boss Reward Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 self-start sm:self-auto font-mono text-xs text-amber-300">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Reward: +250 XP & 150 GP</span>
        </div>
      </div>

      {/* Boss Health Bar */}
      <div className="mt-5 p-4 rounded-2xl bg-black/40 border border-white/[0.06] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`text-2xl select-none ${isStriking ? "animate-bounce scale-125" : ""}`}>
              👹
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <span>The Titan of Burnout</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                  Level 15 Demon
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Phase 3: Desperation Vortex
              </span>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-sm font-bold text-rose-400">{bossHp} / {maxBossHp} HP</span>
            <span className="text-[10px] text-slate-400 block">{hpPercent}% remaining</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full bg-white/[0.06] overflow-hidden p-0.5 border border-white/[0.08]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-rose-500 to-amber-500 transition-all duration-300 shadow-[0_0_12px_rgba(244,63,94,0.5)]"
            style={{ width: `${Math.max(4, hpPercent)}%` }}
          />
        </div>
      </div>

      {/* Party Squad & Attack Action */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Companions Squad */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Active Raid Squad (4/4):
          </span>
          <div className="grid grid-cols-2 gap-2">
            {companions.map((c) => (
              <div
                key={c.id}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{c.avatar}</span>
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">{c.name}</div>
                    <span className="text-[10px] text-slate-400 font-mono">{c.role}</span>
                  </div>
                </div>
                <div className="text-right font-mono text-[11px] font-bold text-purple-300">
                  {c.damage} DMG
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Combat Log & Attack Trigger */}
        <div className="flex flex-col justify-between gap-3 p-3 rounded-xl bg-black/30 border border-white/[0.06]">
          <div className="space-y-1 text-[11px] font-mono text-slate-400">
            <span className="text-slate-500 uppercase block text-[10px]">Recent Battle Feed:</span>
            {combatLog.map((log, idx) => (
              <div key={idx} className="line-clamp-1 text-slate-300">
                {log}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleStrike}
            disabled={bossHp <= 0 || isStriking}
            className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
              bossHp <= 0
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default"
                : "bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 text-white hover:scale-[1.02] active:scale-98 shadow-[0_0_20px_rgba(225,29,72,0.4)]"
            }`}
          >
            {bossHp <= 0 ? (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>TITAN DEFEATED! RAID CLEARED!</span>
              </>
            ) : (
              <>
                <Swords className="w-4 h-4" />
                <span>Strike with Focus Power (-30~75 HP)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
