"use client";

import React from "react";
import { Flame, Coins, Zap, Shield, Brain, Sparkles, Target, Palette, Users } from "lucide-react";

interface AttributeData {
  code: string;
  name: string;
  color: string;
  currentXp: number;
  currentLevel: number;
}

interface CharacterHUDProps {
  username: string;
  title: string;
  level: number;
  currentLevelXp: number;
  xpToNextLevel: number;
  progressPercent: number;
  gold: number;
  streak: number;
  momentum: number;
  attributes: AttributeData[];
}

const ATTRIBUTE_ICONS: Record<string, React.ReactNode> = {
  INT: <Brain className="w-3.5 h-3.5" />,
  STR: <Shield className="w-3.5 h-3.5" />,
  WIS: <Sparkles className="w-3.5 h-3.5" />,
  DEX: <Target className="w-3.5 h-3.5" />,
  CRE: <Palette className="w-3.5 h-3.5" />,
  CHA: <Users className="w-3.5 h-3.5" />,
};

export function CharacterHUD({
  username,
  title,
  level,
  currentLevelXp,
  xpToNextLevel,
  progressPercent,
  gold,
  streak,
  momentum,
  attributes,
}: CharacterHUDProps) {
  const totalLevelBand = currentLevelXp + xpToNextLevel;

  return (
    <div className="bg-cabinetSurface/90 border-2 border-cabinetBorder rounded-xl p-4 shadow-lg flex flex-col gap-4">
      {/* Top Profile Header */}
      <div className="flex items-center gap-3.5">
        {/* Pixel Avatar Frame */}
        <div className="relative w-14 h-14 bg-gradient-to-br from-[#1C1236] to-[#341147] border-2 border-neonCyan rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.3)]">
          <span className="text-2xl select-none">🧙‍♂️</span>
          <span className="absolute -bottom-2 -right-2 bg-synthMagenta text-white font-arcade text-[8px] px-1.5 py-0.5 rounded border border-pink-300">
            L{level}
          </span>
        </div>

        {/* Character Title & Handle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-arcade text-xs sm:text-sm text-textPrimary truncate">
              {username}
            </h2>
            <span className="text-[10px] bg-synthMagenta/20 text-synthMagenta border border-synthMagenta/40 px-1.5 py-0.5 rounded font-arcade">
              LVL {level}
            </span>
          </div>
          <p className="text-xs text-neonCyan font-medium mt-0.5">{title}</p>
        </div>
      </div>

      {/* Main XP Progress Gauge */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-[11px]">
          <span className="font-arcade text-[10px] text-[#00F0FF]">XP PROGRESS</span>
          <span className="text-textSecondary font-mono text-xs">
            {currentLevelXp} / {totalLevelBand} XP ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-3.5 bg-arcadeBlack rounded-full p-0.5 border border-cabinetBorder relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neonCyan via-synthMagenta to-arcadeGold rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,240,255,0.6)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Vital Stats Strip */}
      <div className="grid grid-cols-3 gap-2">
        {/* Gold Wallet */}
        <div className="bg-[#1C142B] border border-arcadeGold/30 rounded-lg p-2 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1 text-arcadeGold">
            <Coins className="w-3.5 h-3.5" />
            <span className="font-arcade text-[11px]">{gold}</span>
          </div>
          <span className="text-[9px] text-textSecondary uppercase font-medium mt-0.5">
            Gold (GP)
          </span>
        </div>

        {/* Day Streak */}
        <div className="bg-[#1C142B] border border-arcadeRed/30 rounded-lg p-2 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1 text-arcadeRed">
            <Flame className="w-3.5 h-3.5" />
            <span className="font-arcade text-[11px]">{streak}</span>
          </div>
          <span className="text-[9px] text-textSecondary uppercase font-medium mt-0.5">
            Day Streak
          </span>
        </div>

        {/* Momentum */}
        <div className="bg-[#1C142B] border border-phosphorGreen/30 rounded-lg p-2 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1 text-phosphorGreen">
            <Zap className="w-3.5 h-3.5" />
            <span className="font-arcade text-[11px]">{momentum}%</span>
          </div>
          <span className="text-[9px] text-textSecondary uppercase font-medium mt-0.5">
            Momentum
          </span>
        </div>
      </div>

      {/* Attributes Radar / List */}
      <div className="flex flex-col gap-2 pt-1 border-t border-cabinetBorder/60">
        <span className="font-arcade text-[9px] text-textSecondary uppercase tracking-wider">
          Character Attributes
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {attributes.map((attr) => (
            <div
              key={attr.code}
              className="bg-[#120F24] border border-cabinetBorder/70 rounded p-1.5 flex items-center justify-between text-[11px]"
            >
              <div className="flex items-center gap-1.5">
                <span style={{ color: attr.color }}>{ATTRIBUTE_ICONS[attr.code]}</span>
                <span className="font-semibold text-textPrimary text-xs">{attr.code}</span>
              </div>
              <span className="font-arcade text-[9px]" style={{ color: attr.color }}>
                L{attr.currentLevel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
