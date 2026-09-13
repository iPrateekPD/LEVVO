"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Share2, Copy, Check, Twitter, Sparkles, Flame, Trophy, Zap, Shield } from "lucide-react";
import { sounds } from "@/lib/sound";

interface ShareVictoryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterName: string;
  level: number;
  xpEarnedToday: number;
  questsCompletedToday: number;
  currentStreak: number;
}

export function ShareVictoryCardModal({
  isOpen,
  onClose,
  characterName,
  level,
  xpEarnedToday,
  questsCompletedToday,
  currentStreak,
}: ShareVictoryCardModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = `⚔️ Leveled up my real life today on LEVVO!\n\n👑 Hero: ${characterName} (Level ${level})\n⚡ Quests Cleared: ${questsCompletedToday}\n🔥 Streak: ${currentStreak} Days\n💎 XP Earned: +${xpEarnedToday} XP\n\nTurn your daily routine into an RPG: https://levvo.app #LifeRPG #LEVVO #GamifyLife`;

  const handleCopyText = async () => {
    sounds.playCoin();
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleShareTwitter = () => {
    sounds.playClick();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#0C1022] border border-white/[0.1] rounded-3xl shadow-[0_0_50px_rgba(234,179,8,0.2)] p-6 sm:p-7 flex flex-col items-center gap-5">
        {/* Glow ambient background */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-widest">
            VICTORY RECAP
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1">
            Share Daily Hero Card
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Brag about your discipline & real-world accomplishments.
          </p>
        </div>

        {/* The Aesthetic Victory Card Preview */}
        <div className="relative w-full p-6 rounded-2xl bg-gradient-to-br from-[#121936] to-[#0A0D1F] border-2 border-amber-400/40 shadow-2xl flex flex-col gap-4 overflow-hidden select-none">
          {/* Subtle star field */}
          <div className="absolute top-2 right-3 flex items-center gap-1.5 opacity-80">
            <Image src="/logo.png" alt="LEVVO" width={18} height={18} className="drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
            <span className="font-arcade text-[10px] tracking-widest text-cyan-300">LEVVO</span>
          </div>

          {/* Hero Avatar & Title */}
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-cyan-500 p-0.5 shadow-lg">
              <div className="w-full h-full rounded-2xl bg-[#090D1E] flex items-center justify-center text-2xl">
                ⚡
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white tracking-tight">
                  {characterName || "Hero"}
                </h3>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                  LVL {level}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">Cyber Paladin</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.08]">
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">XP Today</span>
              <span className="text-sm font-black font-mono text-amber-300">+{xpEarnedToday || 120}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Quests Done</span>
              <span className="text-sm font-black font-mono text-cyan-300">{questsCompletedToday || 3}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Fire Streak</span>
              <span className="text-sm font-black font-mono text-orange-400 flex items-center justify-center gap-0.5">
                <Flame className="w-3.5 h-3.5 fill-orange-400" /> {currentStreak || 6}d
              </span>
            </div>
          </div>

          {/* Bottom Stamp */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
            <span>REAL-LIFE RPG ENGINE</span>
            <span>RANK #4 REALM</span>
          </div>
        </div>

        {/* Sharing Actions */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={handleShareTwitter}
            className="w-full sm:w-1/2 py-2.5 rounded-xl bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 border border-[#1DA1F2]/40 text-[#1DA1F2] text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Twitter className="w-4 h-4 fill-current" />
            <span>Share to X / Twitter</span>
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="w-full sm:w-1/2 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Summary Text</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
