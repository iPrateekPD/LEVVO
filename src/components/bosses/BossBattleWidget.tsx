"use client";

import React, { useState } from "react";
import { Skull, Swords, CheckCircle2, Circle, Trophy, Award, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { sounds } from "@/lib/sound";

export interface BossMilestoneItem {
  id: string;
  title: string;
  damageHp: number;
  status: string;
  completedAt: string | null;
}

export interface BossItem {
  id: string;
  title: string;
  description: string | null;
  totalHp: number;
  currentHp: number;
  status: string;
  rewardXp: number;
  rewardGold: number;
  milestones: BossMilestoneItem[];
}

interface BossBattleWidgetProps {
  boss: BossItem | null;
  onMilestoneComplete: (
    bossId: string,
    milestoneId: string
  ) => Promise<{
    isDefeated?: boolean;
    lootAwarded?: { xp: number; gold: number; unlockedAchievement?: string } | null;
    damageDealt?: number;
    remainingHp?: number;
  } | void>;
}

export function BossBattleWidget({ boss, onMilestoneComplete }: BossBattleWidgetProps) {
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [floatingDamage, setFloatingDamage] = useState<{ id: number; text: string } | null>(null);
  const [victoryOverlay, setVictoryOverlay] = useState<{
    title: string;
    rewardXp: number;
    rewardGold: number;
    unlockedBadge: string;
  } | null>(null);

  if (!boss) {
    return (
      <div className="bg-cabinetSurface/90 border-2 border-cabinetBorder rounded-xl p-4 text-center">
        <span className="font-arcade text-xs text-textSecondary">
          NO ACTIVE BOSS BATTLES
        </span>
      </div>
    );
  }

  const hpPercent = Math.max(0, Math.min(100, Math.round((boss.currentHp / boss.totalHp) * 100)));
  const isDefeated = boss.status === "DEFEATED" || boss.currentHp <= 0;

  const handleMilestoneClick = async (milestone: BossMilestoneItem) => {
    if (isDefeated || submittingId || milestone.status === "COMPLETED") return;

    setSubmittingId(milestone.id);
    sounds.playBossHit();

    // Trigger Screen Shake
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 450);

    // Trigger Floating Damage Text
    const damageText = `-${milestone.damageHp} HP! CRITICAL HIT!`;
    setFloatingDamage({ id: Date.now(), text: damageText });
    setTimeout(() => setFloatingDamage(null), 1300);

    // Confetti burst (motion safe)
    const isReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isReducedMotion) {
      confetti({
        particleCount: 65,
        spread: 75,
        origin: { y: 0.6 },
        colors: ["#FF3366", "#FFE600", "#FF2A85", "#00F0FF"],
      });
    }

    try {
      const res = await onMilestoneComplete(boss.id, milestone.id);

      if (res && res.isDefeated) {
        sounds.playLevelUp();
        if (!isReducedMotion) {
          confetti({
            particleCount: 150,
            spread: 120,
            origin: { y: 0.5 },
            colors: ["#FFE600", "#FF2A85", "#00FF66", "#00F0FF"],
          });
        }
        setVictoryOverlay({
          title: boss.title,
          rewardXp: res.lootAwarded?.xp ?? boss.rewardXp,
          rewardGold: res.lootAwarded?.gold ?? boss.rewardGold,
          unlockedBadge: res.lootAwarded?.unlockedAchievement ?? "Titan Slayer",
        });
      }
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <>
      <div
        className={`relative bg-gradient-to-b from-[#240C22] to-cabinetSurface border-2 border-arcadeRed/60 rounded-xl p-4 shadow-[0_0_15px_rgba(255,51,102,0.2)] flex flex-col gap-3.5 transition-transform ${
          isShaking ? "animate-screen-shake" : ""
        }`}
      >
        {/* Floating Damage Text Popup */}
        {floatingDamage && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-float-damage">
            <span className="font-arcade text-sm sm:text-base font-black text-arcadeGold bg-black/80 px-3 py-1.5 rounded border border-arcadeGold shadow-[0_0_15px_rgba(255,230,0,0.8)] tracking-wider">
              💥 {floatingDamage.text}
            </span>
          </div>
        )}

        {/* Boss Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-arcadeRed/20 border border-arcadeRed text-arcadeRed">
              <Skull className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-arcade text-[10px] text-arcadeRed tracking-wider">
                  BOSS BATTLE
                </span>
                {isDefeated && (
                  <span className="font-arcade text-[9px] bg-phosphorGreen/20 text-phosphorGreen border border-phosphorGreen/40 px-1.5 py-0.2 rounded">
                    DEFEATED!
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-textPrimary leading-tight mt-0.5">
                {boss.title}
              </h3>
            </div>
          </div>

          <div className="text-right">
            <span className="font-arcade text-[10px] text-arcadeGold">
              +{boss.rewardXp} XP | +{boss.rewardGold} GP
            </span>
          </div>
        </div>

        {/* Animated Boss HP Bar */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="font-arcade text-[10px] text-arcadeRed flex items-center gap-1">
              <Swords className="w-3 h-3" /> BOSS HP
            </span>
            <span className="text-textSecondary">
              {boss.currentHp} / {boss.totalHp} HP ({hpPercent}%)
            </span>
          </div>
          <div className="w-full h-4 bg-arcadeBlack rounded-full p-0.5 border border-arcadeRed/50 overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,51,102,0.8)] ${
                hpPercent > 30
                  ? "bg-gradient-to-r from-arcadeRed to-synthMagenta"
                  : "bg-arcadeRed animate-pulse"
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* Project Deliverable Milestones */}
        <div className="flex flex-col gap-2 pt-2 border-t border-cabinetBorder">
          <span className="font-arcade text-[9px] text-textSecondary uppercase tracking-wider">
            Milestones (Deliverables)
          </span>
          <div className="flex flex-col gap-1.5">
            {boss.milestones.map((m) => {
              const isMilestoneDone = m.status === "COMPLETED";

              return (
                <button
                  key={m.id}
                  disabled={isMilestoneDone || isDefeated || submittingId === m.id}
                  onClick={() => handleMilestoneClick(m)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg border text-left text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    isMilestoneDone
                      ? "bg-phosphorGreen/10 border-phosphorGreen/30 text-textSecondary line-through"
                      : "bg-[#1B132B] hover:bg-[#281B42] border-cabinetBorder hover:border-arcadeRed/40 text-textPrimary cursor-pointer active:scale-[0.99]"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    {isMilestoneDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-phosphorGreen shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-arcadeRed shrink-0" />
                    )}
                    <span className="truncate">{m.title}</span>
                  </div>
                  <span
                    className={`font-arcade text-[9px] shrink-0 ${
                      isMilestoneDone ? "text-phosphorGreen" : "text-arcadeRed"
                    }`}
                  >
                    -{m.damageHp} HP
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Victory Fanfare & Loot Modal Overlay */}
      {victoryOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#090b14] border-2 border-arcadeGold rounded-2xl p-6 text-center shadow-[0_0_50px_rgba(255,230,0,0.5)] flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-arcadeGold/20 border-2 border-arcadeGold flex items-center justify-center text-arcadeGold shadow-[0_0_25px_rgba(255,230,0,0.8)] animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="font-arcade text-xs text-arcadeGold tracking-widest uppercase flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> TITAN FALLEN <Sparkles className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-xl font-black text-white font-mono uppercase tracking-wide">
                {victoryOverlay.title} DEFEATED!
              </h2>
            </div>

            {/* Unlocked Badge */}
            <div className="w-full bg-synthMagenta/15 border border-synthMagenta/40 rounded-xl p-3 flex items-center justify-center gap-3">
              <Award className="w-6 h-6 text-synthMagenta shrink-0" />
              <div className="text-left">
                <div className="text-[9px] font-arcade text-synthMagenta uppercase">
                  Achievement Unlocked
                </div>
                <div className="text-sm font-bold text-white">
                  {victoryOverlay.unlockedBadge}
                </div>
              </div>
            </div>

            {/* Loot Chest */}
            <div className="w-full bg-black/60 border border-gray-800 rounded-xl p-3 flex justify-around items-center font-mono">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-arcade block">
                  XP REWARD
                </span>
                <span className="text-base font-black text-arcade-cyan">
                  +{victoryOverlay.rewardXp} XP
                </span>
              </div>
              <div className="w-px h-8 bg-gray-800" />
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-arcade block">
                  GOLD REWARD
                </span>
                <span className="text-base font-black text-arcadeGold">
                  +{victoryOverlay.rewardGold} GP
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playBlip();
                setVictoryOverlay(null);
              }}
              className="w-full py-3 bg-arcadeGold text-black font-arcade text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(255,230,0,0.6)] hover:brightness-110 active:scale-[0.98] transition-all uppercase cursor-pointer"
            >
              CLAIM VICTORY & LOOT
            </button>
          </div>
        </div>
      )}
    </>
  );
}
