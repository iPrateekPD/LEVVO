"use client";

import React, { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import confetti from "canvas-confetti";
import { sounds } from "@/lib/sound";

interface QuickMilestoneProps {
  onLogWin: (title: string, difficulty: "Trivial" | "Easy" | "Medium") => Promise<void>;
}

export function QuickMilestone({ onLogWin }: QuickMilestoneProps) {
  const [winText, setWinText] = useState("");
  const [difficulty, setDifficulty] = useState<"Trivial" | "Easy" | "Medium">("Trivial");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const XP_VALUES = {
    Trivial: 10,
    Easy: 25,
    Medium: 50,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!winText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    sounds.playLevelUp();

    const isReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isReducedMotion) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#FFE600", "#FF2A85", "#00F0FF", "#00FF66"],
      });
    }

    try {
      await onLogWin(winText.trim(), difficulty);
      setWinText("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-gradient-to-r from-[#21092F] via-[#1B0D36] to-[#120D24] border-2 border-synthMagenta/70 rounded-xl p-4 sm:p-5 shadow-[0_0_20px_rgba(255,42,133,0.2)] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-synthMagenta animate-pulse" />
          <span className="font-arcade text-xs text-synthMagenta neon-glow-magenta tracking-wider">
            LOG A QUICK WIN
          </span>
        </div>
        <span className="text-[9px] sm:text-[10px] font-arcade text-arcadeGold text-right">
          +{XP_VALUES[difficulty]} XP / +{Math.floor(XP_VALUES[difficulty] / 2)} GP
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <input
          type="text"
          value={winText}
          onChange={(e) => setWinText(e.target.value)}
          placeholder="What did you accomplish? (e.g. Meditated, read, workout)..."
          className="flex-1 w-full bg-[#0E0A1E] border border-cabinetBorder focus:border-synthMagenta text-textPrimary px-3.5 py-2 rounded-lg text-xs outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 placeholder:text-textMuted"
        />

        {/* Difficulty Selector and Action */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-1">
            {(["Trivial", "Easy", "Medium"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setDifficulty(d);
                }}
                className={`px-2 py-1.5 rounded-lg border font-arcade text-[9px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                  difficulty === d
                    ? "bg-synthMagenta text-white border-pink-400 shadow-[0_0_8px_rgba(255,42,133,0.5)] font-bold"
                    : "bg-[#140F24] border-cabinetBorder text-textSecondary hover:text-textPrimary"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Log Win Action Button */}
          <button
            type="submit"
            disabled={!winText.trim() || isSubmitting}
            className="arcade-btn px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-arcadeGold to-yellow-400 hover:brightness-110 text-arcadeBlack font-arcade text-[10px] sm:text-xs font-bold rounded-lg border border-yellow-200 shadow-[0_3px_0_#9E8200] flex items-center gap-1.5 shrink-0 disabled:opacity-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ml-auto sm:ml-0"
          >
            <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{isSubmitting ? "..." : "LOG WIN"}</span>
          </button>
        </div>
      </form>
    </section>
  );
}
