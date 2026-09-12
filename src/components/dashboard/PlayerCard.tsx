"use client";

import React from "react";
import Link from "next/link";
import { Coins, Flame, User, ArrowRight } from "lucide-react";

interface PlayerCardProps {
  username: string;
  title: string;
  level: number;
  currentLevelXp: number;
  xpToNextLevel: number;
  progressPercent: number;
  gold: number;
  streak: number;
  streakPaused?: boolean;
  avatarId?: string;
  ageGroup?: string | null;
}

export function PlayerCard({
  username,
  title,
  level,
  currentLevelXp,
  xpToNextLevel,
  progressPercent,
  gold,
  streak,
  streakPaused = false,
  avatarId = "pixel_knight",
  ageGroup,
}: PlayerCardProps) {
  const totalLevelBand = currentLevelXp + xpToNextLevel;

  const AVATAR_EMOJIS: Record<string, string> = {
    pixel_knight: "🧙‍♂️",
    pixel_mage: "🔮",
    pixel_runner: "🏃",
    pixel_scholar: "📜",
    pixel_robot: "🤖",
    pixel_cat: "🐱",
    pixel_dragon: "🐉",
    pixel_cyber: "🦾",
  };

  const avatarEmoji = AVATAR_EMOJIS[avatarId] || "🧙‍♂️";

  return (
    <div className="bg-cabinetSurface/90 border-2 border-cabinetBorder rounded-xl p-4 sm:p-5 shadow-lg flex flex-col gap-3.5 relative">
      <div className="flex items-center justify-between gap-3">
        {/* Avatar & Player Info */}
        <Link
          href="/profile"
          className="flex items-center gap-3.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg p-1 transition-all"
          title="View Player Profile"
        >
          {/* Avatar Frame */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#1C1236] to-[#341147] border-2 border-neonCyan group-hover:border-arcadeGold rounded-xl flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all">
            <span className="text-3xl select-none group-hover:scale-110 transition-transform">
              {avatarEmoji}
            </span>
            <span className="absolute -bottom-2 -right-2 bg-synthMagenta text-white font-arcade text-[9px] px-1.5 py-0.5 rounded border border-pink-300">
              L{level}
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-arcade text-sm sm:text-base text-neonCyan group-hover:text-arcadeGold truncate tracking-wider transition-colors">
                {username}
              </h2>
              {ageGroup && (
                <span className="font-arcade text-[8px] bg-purple-900/60 text-purple-300 border border-purple-500/40 px-1.5 py-0.5 rounded uppercase">
                  {ageGroup}
                </span>
              )}
            </div>
            <span className="text-xs text-textSecondary truncate">{title}</span>
          </div>
        </Link>

        {/* Currency & Streak Pills */}
        <div className="flex items-center gap-2">
          {/* Gold Wallet */}
          <div className="bg-[#1C142B] border border-arcadeGold/40 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-arcadeGold shadow-sm">
            <Coins className="w-4 h-4" />
            <span className="font-arcade text-xs">{gold}</span>
            <span className="text-[9px] text-textSecondary font-mono hidden sm:inline">GP</span>
          </div>

          {/* Streak Flame */}
          <div className="bg-[#1C142B] border border-arcadeRed/40 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-arcadeRed shadow-sm">
            <Flame className="w-4 h-4" />
            <span className="font-arcade text-xs">{streak}</span>
            <span className="text-[9px] text-textSecondary font-mono hidden sm:inline">
              {streakPaused ? "FROZEN" : "DAY"}
            </span>
          </div>

          {/* Profile link chevron */}
          <Link
            href="/profile"
            className="p-2 text-textSecondary hover:text-white bg-[#161028] hover:bg-[#251740] rounded-lg border border-cabinetBorder transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            title="Edit Profile"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main XP Progress Bar */}
      <div className="flex flex-col gap-1.5 pt-1">
        <div className="flex justify-between text-xs">
          <span className="font-arcade text-[10px] text-textSecondary">
            LEVEL {level} PROGRESS
          </span>
          <span className="font-mono text-textSecondary text-[11px]">
            {currentLevelXp} / {totalLevelBand} XP ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-3.5 bg-arcadeBlack rounded-full p-0.5 border border-cabinetBorder overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neonCyan via-purple-500 to-synthMagenta rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(0,240,255,0.6)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
