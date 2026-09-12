"use client";

import React, { useEffect, useState } from "react";
import { soundEffects } from "@/lib/sound";

interface GuildMember {
  userId: string;
  username: string;
  title: string;
  level: number;
  avatarId: string;
  role: string;
}

interface GuildBoss {
  id: string;
  title: string;
  totalHp: number;
  currentHp: number;
  progressPercent: number;
  status: string;
  rewardXp: number;
  rewardGold: number;
}

interface GuildData {
  id: string;
  name: string;
  tag: string;
  description: string;
  level: number;
  membersCount: number;
  members: GuildMember[];
  boss: GuildBoss | null;
}

export const GuildRaidWidget: React.FC = () => {
  const [guild, setGuild] = useState<GuildData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAttacking, setIsAttacking] = useState(false);
  const [combatLog, setCombatLog] = useState<string[]>([]);

  useEffect(() => {
    fetchGuildData();
  }, []);

  const fetchGuildData = async () => {
    try {
      const res = await fetch("/api/v1/guilds");
      const json = await res.json();
      if (json.success && json.data) {
        setGuild(json.data);
      }
    } catch (err) {
      console.error("Failed to load guild:", err);
    } finally {
      setLoading(false);
    }
  };

  const executeRaidStrike = async () => {
    if (!guild?.boss || guild.boss.status === "DEFEATED" || isAttacking) return;

    setIsAttacking(true);
    soundEffects.playVictory();

    try {
      const res = await fetch("/api/v1/guilds/raid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ damage: 150 }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setGuild((prev) =>
          prev && prev.boss
            ? {
                ...prev,
                boss: {
                  ...prev.boss,
                  currentHp: json.data.currentHp,
                  progressPercent: Math.round(
                    ((prev.boss.totalHp - json.data.currentHp) / prev.boss.totalHp) * 100
                  ),
                  status: json.data.isDefeated ? "DEFEATED" : "ACTIVE",
                },
              }
            : prev
        );

        setCombatLog((prev) => [
          `⚔️ HERO STRIKE! Dealt 150 damage to ${guild.boss?.title}! (+50 XP, +25 GP)`,
          ...prev.slice(0, 3),
        ]);
      }
    } catch (err) {
      console.error("Failed to execute raid attack:", err);
    } finally {
      setIsAttacking(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-xs font-mono text-gray-500 animate-pulse">
        CONNECTING TO GUILD COMM-LINK...
      </div>
    );
  }

  if (!guild) {
    return (
      <div className="p-8 text-center text-xs font-mono text-gray-400 bg-black/60 border border-gray-800 rounded">
        NO GUILD AFFILIATION FOUND
      </div>
    );
  }

  const boss = guild.boss;
  const hpPercent = boss ? Math.max(0, Math.round((boss.currentHp / boss.totalHp) * 100)) : 0;

  return (
    <div className="flex flex-col gap-6 w-full font-mono text-xs">
      {/* 1. World Boss Raid Chamber */}
      {boss && (
        <div className="p-6 bg-black/80 border-2 border-red-500/80 rounded-lg backdrop-blur-md shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-red-950">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-bounce">🐲</span>
              <div>
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">
                  COLLABORATIVE WORLD RAID BOSS
                </span>
                <h2 className="text-base font-black text-white uppercase tracking-wider">
                  {boss.title}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-red-950/60 text-red-300 border border-red-800/80 rounded text-[10px] font-bold">
                REWARD: +{boss.rewardXp} XP | +{boss.rewardGold} GP
              </span>
            </div>
          </div>

          {/* Health Bar */}
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-red-400">
                HEALTH: {boss.currentHp.toLocaleString()} / {boss.totalHp.toLocaleString()} HP
              </span>
              <span className="text-gray-400">{hpPercent}% REMAINING</span>
            </div>
            <div className="w-full h-4 bg-gray-950 rounded-full border border-red-900/60 overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-red-500 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(239,68,68,0.7)]"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* Raid Attack Trigger & Combat Log */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <button
              onClick={executeRaidStrike}
              disabled={isAttacking || boss.currentHp <= 0}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase rounded shadow-[0_0_15px_rgba(239,68,68,0.6)] transition-all disabled:opacity-40 active:scale-95"
            >
              {isAttacking ? "STRIKING..." : "⚔️ EXECUTE RAID STRIKE (-150 HP)"}
            </button>
            <div className="flex-1 min-w-[240px] bg-black/60 p-2.5 rounded border border-gray-800 text-[10px] text-gray-400">
              <span className="text-[9px] text-gray-500 uppercase block mb-1">
                PARTY COMBAT FEED:
              </span>
              {combatLog.length === 0 ? (
                <p className="italic text-gray-600">
                  Strike the boss or complete daily deliverables to inflict damage!
                </p>
              ) : (
                combatLog.map((log, idx) => (
                  <p key={idx} className="text-arcade-cyan font-bold">
                    {log}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Guild Party Roster */}
      <div className="p-6 bg-black/70 border-2 border-gray-800 rounded-lg backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛡️</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-arcade-cyan">
              GUILD ROSTER: {guild.name} [{guild.tag}] (LVL {guild.level})
            </h3>
          </div>
          <span className="text-[10px] text-gray-400 font-bold">
            {guild.membersCount} ADVENTURERS ASSEMBLED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {guild.members.map((m) => (
            <div
              key={m.userId}
              className="p-3 bg-[#0b0c14] border border-gray-800 rounded flex items-center gap-3 hover:border-arcade-cyan/50 transition-colors"
            >
              <div className="w-10 h-10 rounded bg-arcade-cyan/15 border border-arcade-cyan/40 flex items-center justify-center text-lg">
                ⚔️
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-xs">{m.username}</span>
                  <span className="text-[9px] text-arcade-gold font-bold">LVL {m.level}</span>
                </div>
                <span className="text-[9px] text-gray-400">{m.title}</span>
                <span className="text-[8px] text-purple-400 uppercase tracking-widest mt-0.5">
                  {m.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
