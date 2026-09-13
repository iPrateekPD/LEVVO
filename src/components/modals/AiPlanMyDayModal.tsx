"use client";

import React, { useState } from "react";
import { Sparkles, X, Check, ArrowRight, Brain, Clock, Coins } from "lucide-react";
import { sounds } from "@/lib/sound";

interface GeneratedQuest {
  title: string;
  description: string;
  attributeCode: "INT" | "STR" | "WIS" | "DEX" | "CRE" | "CHA";
  difficulty: "Easy" | "Medium" | "Hard";
  xpReward: number;
  duration: string;
}

interface AiPlanMyDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptQuests: (quests: GeneratedQuest[]) => Promise<void>;
}

export function AiPlanMyDayModal({ isOpen, onClose, onAcceptQuests }: AiPlanMyDayModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);

  // Default suggested daily quests based on macro goals
  const [quests, setQuests] = useState<GeneratedQuest[]>([
    {
      title: "Develop Core Architecture Module for Final Year Project",
      description: "Implement primary data pipeline and API endpoints for capstone milestone.",
      attributeCode: "INT",
      difficulty: "Hard",
      xpReward: 60,
      duration: "~ 45 min",
    },
    {
      title: "Active Practice: React Performance & Tree Traversal (DSA)",
      description: "Solve 2 tree algorithms and review useMemo/useCallback optimization patterns.",
      attributeCode: "DEX",
      difficulty: "Medium",
      xpReward: 45,
      duration: "~ 30 min",
    },
    {
      title: "Recharge Sprint: 30 Min Outdoor Walk / Cardio Session",
      description: "Clear mental cache, get blood flowing, and sustain cognitive energy.",
      attributeCode: "STR",
      difficulty: "Medium",
      xpReward: 40,
      duration: "~ 30 min",
    },
  ]);

  if (!isOpen) return null;

  const handleRegenerate = () => {
    sounds.playClick();
    setIsGenerating(true);
    setTimeout(() => {
      // Alternate set of high-impact quests
      setQuests([
        {
          title: "Synthesize Project Documentation & Deployment Architecture",
          description: "Draft comprehensive README and cloud deployment workflow.",
          attributeCode: "INT",
          difficulty: "Medium",
          xpReward: 50,
          duration: "~ 35 min",
        },
        {
          title: "Build & Style Responsive Component with Unit Tests",
          description: "Implement interactive dashboard widget and write validation tests.",
          attributeCode: "DEX",
          difficulty: "Hard",
          xpReward: 55,
          duration: "~ 45 min",
        },
        {
          title: "Mindful Reset: 15 Min Deep Breathing & Workspace Reset",
          description: "Organize desk, log today's notes, and calibrate evening priorities.",
          attributeCode: "WIS",
          difficulty: "Easy",
          xpReward: 30,
          duration: "~ 15 min",
        },
      ]);
      setIsGenerating(false);
      sounds.playCoin();
    }, 600);
  };

  const handleAccept = async () => {
    sounds.playLevelUp();
    setIsAccepting(true);
    await onAcceptQuests(quests);
    setIsAccepting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-[#0E1326] border border-white/[0.1] rounded-2xl shadow-2xl p-6 flex flex-col gap-5 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>AI Day Planner</span>
                <span className="px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono">
                  SMART BALANCED
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Optimized 3-quest daily itinerary aligned with your macro-goals.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quests Preview List */}
        <div className="flex flex-col gap-3 relative z-10">
          {quests.map((q, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#131930]/90 border border-white/[0.06] flex flex-col gap-1.5 shadow-sm hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/[0.06] text-cyan-300 font-mono text-xs flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-white">{q.title}</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono text-amber-300 font-bold shrink-0">
                  +{q.xpReward} XP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 pl-7 leading-relaxed">{q.description}</p>
              <div className="flex items-center gap-2 pl-7 pt-1 text-[10px] font-mono text-slate-400">
                <span className="px-2 py-0.2 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  {q.attributeCode}
                </span>
                <span>•</span>
                <span>{q.duration}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between gap-3 relative z-10">
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={isGenerating || isAccepting}
            className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition-all disabled:opacity-50"
          >
            {isGenerating ? "Generating..." : "⚡ Reroll Quests"}
          </button>

          <button
            type="button"
            onClick={handleAccept}
            disabled={isAccepting}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:brightness-110 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <span>{isAccepting ? "Enrolling Quests..." : "Accept All Quests ⚔️"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
