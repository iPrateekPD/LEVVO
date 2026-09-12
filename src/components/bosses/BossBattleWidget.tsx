"use client";

import React, { useState } from "react";
import { Skull, Swords, CheckCircle2, Circle } from "lucide-react";
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
  ) => Promise<{ isDefeated?: boolean } | void>;
}

export function BossBattleWidget({ boss, onMilestoneComplete }: BossBattleWidgetProps) {
  const [submittingId, setSubmittingId] = useState<string | null>(null);

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

  const handleMilestoneClick = async (milestoneId: string) => {
    if (isDefeated || submittingId) return;

    setSubmittingId(milestoneId);
    sounds.playBossHit();

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#FF3366", "#FFE600", "#FF2A85"],
    });

    try {
      await onMilestoneComplete(boss.id, milestoneId);
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#240C22] to-cabinetSurface border-2 border-arcadeRed/60 rounded-xl p-4 shadow-[0_0_15px_rgba(255,51,102,0.2)] flex flex-col gap-3.5">
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
                onClick={() => handleMilestoneClick(m.id)}
                className={`w-full flex items-center justify-between p-2 rounded-lg border text-left text-xs transition-all ${
                  isMilestoneDone
                    ? "bg-phosphorGreen/10 border-phosphorGreen/30 text-textSecondary line-through"
                    : "bg-[#1B132B] hover:bg-[#281B42] border-cabinetBorder hover:border-arcadeRed/40 text-textPrimary"
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
  );
}
