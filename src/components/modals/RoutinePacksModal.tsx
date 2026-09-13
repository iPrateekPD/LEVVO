"use client";

import React, { useState } from "react";
import { X, Package, Sparkles, Check, ArrowRight, Code2, GraduationCap, Sunrise, Dumbbell, ShieldAlert } from "lucide-react";
import { sounds } from "@/lib/sound";

export interface RoutineQuest {
  title: string;
  description: string;
  attributeCode: "INT" | "STR" | "WIS" | "DEX" | "CRE" | "CHA";
  difficulty: "Easy" | "Medium" | "Hard";
  xpReward: number;
  duration: string;
}

interface RoutinePack {
  id: string;
  title: string;
  tagline: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  borderColor: string;
  badge: string;
  quests: RoutineQuest[];
}

interface RoutinePacksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnrollPack: (quests: RoutineQuest[]) => Promise<void>;
}

export function RoutinePacksModal({ isOpen, onClose, onEnrollPack }: RoutinePacksModalProps) {
  const [selectedPackId, setSelectedPackId] = useState<string>("swe_sprint");
  const [isEnrolling, setIsEnrolling] = useState(false);

  const packs: RoutinePack[] = [
    {
      id: "swe_sprint",
      title: "Software Engineer Sprint",
      tagline: "High-focus deep work, algorithms, and clean architecture.",
      category: "Engineering",
      icon: Code2,
      color: "from-cyan-500/20 to-blue-600/20 text-cyan-300",
      borderColor: "border-cyan-500/30",
      badge: "POPULAR",
      quests: [
        {
          title: "Deep Work: Core Feature Implementation",
          description: "Uninterrupted 45-min sprint coding primary application logic without tab switching.",
          attributeCode: "INT",
          difficulty: "Hard",
          xpReward: 60,
          duration: "~ 45 min",
        },
        {
          title: "Code Review & Refactoring Pass",
          description: "Review open PRs, remove dead code, and ensure clean architecture principles.",
          attributeCode: "WIS",
          difficulty: "Medium",
          xpReward: 40,
          duration: "~ 25 min",
        },
        {
          title: "DSA Drill: Solve 2 Algorithm Problems",
          description: "Implement solutions with optimal time & space complexity analysis.",
          attributeCode: "DEX",
          difficulty: "Medium",
          xpReward: 45,
          duration: "~ 35 min",
        },
        {
          title: "System Documentation & API Specs",
          description: "Document interfaces, test edge cases, and log milestone progress.",
          attributeCode: "INT",
          difficulty: "Easy",
          xpReward: 30,
          duration: "~ 20 min",
        },
      ],
    },
    {
      id: "exam_crunch",
      title: "Academic & Exam Mastery",
      tagline: "Active recall, Feynman technique, and past exam questions.",
      category: "Academics",
      icon: GraduationCap,
      color: "from-purple-500/20 to-indigo-600/20 text-purple-300",
      borderColor: "border-purple-500/30",
      badge: "STUDY RIGOR",
      quests: [
        {
          title: "Feynman Study Sprint: Teach Complex Topic",
          description: "Explain core concept out loud in simple terms and identify knowledge gaps.",
          attributeCode: "INT",
          difficulty: "Hard",
          xpReward: 60,
          duration: "~ 40 min",
        },
        {
          title: "Timed Mock Exam Simulation",
          description: "Complete past year questions under timed conditions without checking answers.",
          attributeCode: "WIS",
          difficulty: "Hard",
          xpReward: 65,
          duration: "~ 50 min",
        },
        {
          title: "Anki / Flashcard Spaced Repetition Drill",
          description: "Review active memory cards and memorize high-yield formulas.",
          attributeCode: "DEX",
          difficulty: "Easy",
          xpReward: 30,
          duration: "~ 20 min",
        },
      ],
    },
    {
      id: "morning_miracle",
      title: "Morning Miracle Reset",
      tagline: "Kickstart dopamine, energy, and mental clarity before noon.",
      category: "Lifestyle",
      icon: Sunrise,
      color: "from-amber-500/20 to-orange-600/20 text-amber-300",
      borderColor: "border-amber-500/30",
      badge: "HIGH ENERGY",
      quests: [
        {
          title: "Hydration & Sunlight Calibration",
          description: "Drink 500ml water with electrolytes and view natural morning light for 10 min.",
          attributeCode: "STR",
          difficulty: "Easy",
          xpReward: 25,
          duration: "~ 10 min",
        },
        {
          title: "Mindfulness & Priority Journaling",
          description: "10-minute breathwork session followed by writing top 3 daily imperatives.",
          attributeCode: "WIS",
          difficulty: "Easy",
          xpReward: 30,
          duration: "~ 15 min",
        },
        {
          title: "Physical Activation: HIIT / Calisthenics",
          description: "Get heart rate up with pushups, bodyweight squats, or brisk walk.",
          attributeCode: "STR",
          difficulty: "Medium",
          xpReward: 40,
          duration: "~ 25 min",
        },
      ],
    },
    {
      id: "fitness_reset",
      title: "Iron & Vitality Protocol",
      tagline: "Structured physical conditioning, nutrition, and recovery.",
      category: "Health",
      icon: Dumbbell,
      color: "from-emerald-500/20 to-teal-600/20 text-emerald-300",
      borderColor: "border-emerald-500/30",
      badge: "BODY & MIND",
      quests: [
        {
          title: "Progressive Overload Strength Session",
          description: "Execute compound movements with structured rest intervals and form focus.",
          attributeCode: "STR",
          difficulty: "Hard",
          xpReward: 65,
          duration: "~ 45 min",
        },
        {
          title: "10,000 Daily Exploration Steps",
          description: "Accumulate healthy walking volume throughout the day for active recovery.",
          attributeCode: "STR",
          difficulty: "Medium",
          xpReward: 40,
          duration: "Throughout Day",
        },
        {
          title: "Evening Mobility & Decompression",
          description: "Full body foam rolling and hamstring/hip mobility stretches.",
          attributeCode: "DEX",
          difficulty: "Easy",
          xpReward: 30,
          duration: "~ 15 min",
        },
      ],
    },
  ];

  if (!isOpen) return null;

  const currentPack = packs.find((p) => p.id === selectedPackId) || packs[0];
  const totalXp = currentPack.quests.reduce((acc, q) => acc + q.xpReward, 0);

  const handleEnroll = async () => {
    sounds.playCoin();
    setIsEnrolling(true);
    try {
      await onEnrollPack(currentPack.quests);
      sounds.playLevelUp();
      onClose();
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#0C1022] border border-white/[0.1] rounded-3xl shadow-[0_0_50px_rgba(0,240,255,0.15)] p-6 sm:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Routine Quest Packs</h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                  CURATED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Install full pre-configured battle routines with 1 click.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pack Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {packs.map((p) => {
            const Icon = p.icon;
            const isSelected = p.id === selectedPackId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setSelectedPackId(p.id);
                }}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-2 transition-all ${
                  isSelected
                    ? `bg-white/[0.08] ${p.borderColor} shadow-lg ring-1 ring-cyan-400/40`
                    : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] opacity-75 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-1.5 rounded-lg bg-white/[0.05] ${isSelected ? p.color : "text-slate-400"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                    {p.badge}
                  </span>
                </div>
                <div className="font-bold text-xs text-white leading-tight line-clamp-1">
                  {p.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Pack Detail */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{currentPack.title}</span>
                <span className="text-xs font-normal text-slate-400">({currentPack.quests.length} Quests)</span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">{currentPack.tagline}</p>
            </div>
            <div className="text-right font-mono">
              <span className="text-xs text-amber-300 font-bold">+{totalXp} XP</span>
              <span className="text-[10px] text-slate-400 block">Total Reward</span>
            </div>
          </div>

          {/* Quest items list */}
          <div className="space-y-2 mt-1">
            {currentPack.quests.map((q, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-black/40 border border-white/[0.05] flex items-center justify-between gap-3 hover:border-white/[0.12] transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-white/[0.08] text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-white leading-tight">{q.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{q.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300">
                    {q.duration}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    +{q.xpReward} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl border border-white/[0.08] text-xs font-bold text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleEnroll}
            disabled={isEnrolling}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isEnrolling ? "Enrolling Pack..." : `Enroll ${currentPack.title}`}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
