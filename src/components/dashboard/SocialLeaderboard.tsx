"use client";

import React, { useState } from "react";
import { Trophy, Flame, Zap, Crown, Medal, Users, Sparkles, Filter } from "lucide-react";
import { sounds } from "@/lib/sound";

interface LeaderboardPlayer {
  rank: number;
  name: string;
  avatar: string;
  archetype: string;
  level: number;
  xp: number;
  streak: number;
  badge: string;
  isCurrentUser?: boolean;
}

interface SocialLeaderboardProps {
  currentUserName?: string;
  currentUserLevel?: number;
  currentUserXp?: number;
  currentUserStreak?: number;
}

export function SocialLeaderboard({
  currentUserName,
  currentUserLevel,
  currentUserXp,
  currentUserStreak,
}: SocialLeaderboardProps) {
  const [activeTab, setActiveTab] = useState<"global" | "guild" | "weekly">("global");

  const resolvedName = (currentUserName || "EXPLORER").toUpperCase();
  const resolvedLevel = currentUserLevel || 4;
  const resolvedXp = currentUserXp || 1450;
  const resolvedStreak = currentUserStreak || 5;

  const players: LeaderboardPlayer[] = [
    {
      rank: 1,
      name: "VALKYRIE_99",
      avatar: "⚔️",
      archetype: "Cyber Paladin",
      level: 12,
      xp: 4850,
      streak: 42,
      badge: "LEGEND",
    },
    {
      rank: 2,
      name: "NEO_KAI",
      avatar: "🧙‍♂️",
      archetype: "Code Arcanist",
      level: 10,
      xp: 3920,
      streak: 28,
      badge: "ELITE",
    },
    {
      rank: 3,
      name: "SHADOW_RUNNER",
      avatar: "🥷",
      archetype: "Shadow Assassin",
      level: 8,
      xp: 2980,
      streak: 19,
      badge: "VETERAN",
    },
    {
      rank: 4,
      name: resolvedName,
      avatar: "⚡",
      archetype: "Cyber Knight",
      level: resolvedLevel,
      xp: resolvedXp,
      streak: resolvedStreak,
      badge: "RISING STAR",
      isCurrentUser: true,
    },
    {
      rank: 5,
      name: "AURA_BLAZE",
      avatar: "🦊",
      archetype: "Elementalist",
      level: 4,
      xp: 1120,
      streak: 5,
      badge: "CHALLENGER",
    },
    {
      rank: 6,
      name: "CYBER_MONK",
      avatar: "🧘",
      archetype: "Zen Hacker",
      level: 4,
      xp: 980,
      streak: 4,
      badge: "NOVICE",
    },
  ];

  return (
    <div className="relative w-full rounded-3xl bg-[#090D1E]/90 border border-white/[0.08] backdrop-blur-xl p-5 sm:p-6 overflow-hidden shadow-2xl">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Arcade Hall of Legends
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-extrabold uppercase">
                Season 1
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live realm leaderboard ranked by total experience points & consistency.
            </p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.07] self-start sm:self-auto">
          {(["global", "guild", "weekly"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab(tab);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium capitalize transition-all ${
                activeTab === tab
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab === "global" ? "Global Realm" : tab === "guild" ? "Guild Raid" : "Weekly Blitz"}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06] text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <th className="pb-3 pl-2 w-16">Rank</th>
              <th className="pb-3">Hero / Player</th>
              <th className="pb-3 hidden sm:table-cell">Class</th>
              <th className="pb-3 text-right">Level</th>
              <th className="pb-3 text-right">Total XP</th>
              <th className="pb-3 text-right pr-2">Streak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {players.map((p) => {
              const isFirst = p.rank === 1;
              const isSecond = p.rank === 2;
              const isThird = p.rank === 3;
              return (
                <tr
                  key={p.rank}
                  className={`transition-colors group ${
                    p.isCurrentUser
                      ? "bg-cyan-500/10 hover:bg-cyan-500/15 border-l-2 border-cyan-400"
                      : "hover:bg-white/[0.03]"
                  }`}
                >
                  {/* Rank Badge */}
                  <td className="py-3 pl-2 font-mono font-black text-sm">
                    {isFirst ? (
                      <span className="flex items-center gap-1 text-amber-300">
                        <Crown className="w-4 h-4 fill-amber-300" /> #1
                      </span>
                    ) : isSecond ? (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Medal className="w-4 h-4" /> #2
                      </span>
                    ) : isThird ? (
                      <span className="flex items-center gap-1 text-amber-600">
                        <Medal className="w-4 h-4" /> #3
                      </span>
                    ) : (
                      <span className={`text-slate-400 ${p.isCurrentUser ? "text-cyan-300 font-bold" : ""}`}>
                        #{p.rank}
                      </span>
                    )}
                  </td>

                  {/* Player Name */}
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{p.avatar}</span>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{p.name}</span>
                          {p.isCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 font-mono text-[9px]">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block sm:hidden">
                          {p.archetype}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Archetype / Class */}
                  <td className="py-3 font-mono text-slate-400 hidden sm:table-cell">
                    {p.archetype}
                  </td>

                  {/* Level */}
                  <td className="py-3 text-right font-mono font-bold text-cyan-300">
                    LVL {p.level}
                  </td>

                  {/* XP */}
                  <td className="py-3 text-right font-mono font-extrabold text-amber-300">
                    {p.xp.toLocaleString()} XP
                  </td>

                  {/* Streak */}
                  <td className="py-3 text-right pr-2 font-mono">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 text-[10px] font-bold">
                      <Flame className="w-3 h-3 fill-orange-400" /> {p.streak}d
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
