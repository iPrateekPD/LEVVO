"use client";

import React, { useState } from "react";
import { Plus, Sparkles, BookOpen, Dumbbell, Code2 } from "lucide-react";
import { QuestCard, TaskItem } from "./QuestCard";
import { sounds } from "@/lib/sound";

interface QuestListProps {
  tasks: TaskItem[];
  onComplete: (taskId: string) => Promise<{ didLevelUp?: boolean; newLevel?: number } | void>;
  onDelete: (taskId: string) => void;
  onEdit?: (task: TaskItem) => void;
  onOpenCreateModal: () => void;
  onOpenAiModal?: () => void;
  onQuickAddQuest?: (quest: {
    title: string;
    description: string;
    attributeCode: "INT" | "STR" | "WIS";
    difficulty: "Easy" | "Medium";
  }) => void;
}

const EXAMPLE_QUESTS = [
  {
    title: "Solve 1 algorithmic challenge or system design question",
    description: "Sharpen cognitive problem solving and engineering intuition.",
    attributeCode: "INT" as const,
    difficulty: "Medium" as const,
    icon: <Code2 className="w-4 h-4 text-neonCyan shrink-0" />,
    rewardText: "+50 XP | INT",
  },
  {
    title: "20-minute physical mobility or strength training",
    description: "Recharge physical vitality and break sedentary lethargy.",
    attributeCode: "STR" as const,
    difficulty: "Easy" as const,
    icon: <Dumbbell className="w-4 h-4 text-arcadeRed shrink-0" />,
    rewardText: "+25 XP | STR",
  },
  {
    title: "Read 1 chapter of high-leverage technical book",
    description: "Synthesize foundational principles from textbooks or research papers.",
    attributeCode: "WIS" as const,
    difficulty: "Medium" as const,
    icon: <BookOpen className="w-4 h-4 text-purple-400 shrink-0" />,
    rewardText: "+50 XP | WIS",
  },
];

export function QuestList({
  tasks,
  onComplete,
  onDelete,
  onEdit,
  onOpenCreateModal,
  onOpenAiModal,
  onQuickAddQuest,
}: QuestListProps) {
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ACTIVE");

  const filteredTasks = tasks.filter((task) => {
    if (filter === "ACTIVE") return task.status === "ACTIVE";
    if (filter === "COMPLETED") return task.status === "COMPLETED";
    return true;
  });

  return (
    <div className="flex flex-col gap-3.5">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-2 border-b border-cabinetBorder">
        <div className="flex items-center gap-2">
          <span className="font-arcade text-xs text-arcadeGold neon-glow-gold tracking-wider">
            DAILY QUESTS
          </span>
          <span className="text-xs text-textSecondary font-mono">
            ({tasks.filter((t) => t.status === "ACTIVE").length} active)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[#161226] p-1 rounded-lg border border-cabinetBorder">
            {(["ACTIVE", "COMPLETED"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  sounds.playClick();
                  setFilter(mode);
                }}
                className={`px-3 py-1 rounded text-[11px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                  filter === mode
                    ? "bg-synthMagenta text-white shadow-sm font-semibold"
                    : "text-textSecondary hover:text-textPrimary"
                }`}
              >
                {mode === "ACTIVE" ? "Active" : "Completed"}
              </button>
            ))}
          </div>

          {/* AI Oracle Button */}
          {onOpenAiModal && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenAiModal();
              }}
              className="arcade-btn flex items-center gap-1.5 px-3 py-1.5 bg-[#1F1238] hover:bg-[#2C1852] text-arcade-cyan rounded-lg border border-arcade-cyan/40 font-arcade text-[10px] shadow-[0_0_12px_rgba(0,240,255,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <Sparkles className="w-3.5 h-3.5 text-arcade-cyan animate-pulse" />
              <span>AI ORACLE</span>
            </button>
          )}

          {/* Create Quest Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenCreateModal();
            }}
            className="arcade-btn flex items-center gap-1.5 px-3 py-1.5 bg-synthMagenta hover:bg-pink-600 text-white rounded-lg border border-pink-400 font-arcade text-[10px] shadow-[0_3px_0_#9E0045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>NEW QUEST</span>
          </button>
        </div>
      </div>

      {/* Quest Cards Container */}
      <div className="flex flex-col gap-2.5">
        {filteredTasks.length === 0 ? (
          <div className="p-6 text-center bg-cabinetSurface/40 border-2 border-dashed border-cabinetBorder rounded-xl flex flex-col items-center justify-center gap-4">
            <div className="space-y-1">
              <span className="font-arcade text-xs text-arcadeGold">
                {filter === "ACTIVE"
                  ? "PICK YOUR FIRST QUEST"
                  : "NO QUESTS FOUND IN THIS VIEW"}
              </span>
              <p className="text-xs text-gray-400 max-w-md mx-auto font-sans">
                Jumpstart your adventure by selecting a preset quest below or consult the AI Oracle to proceduralize your real-world ambitions.
              </p>
            </div>

            {/* 3 Suggested Example Quests */}
            <div className="w-full max-w-lg flex flex-col gap-2 text-left">
              <span className="font-arcade text-[9px] text-gray-400 uppercase tracking-widest text-center">
                Suggested Quests for Today
              </span>
              {EXAMPLE_QUESTS.map((ex, idx) => (
                <div
                  key={idx}
                  className="bg-[#120F24] border border-cabinetBorder hover:border-arcade-cyan/60 rounded-lg p-3 flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {ex.icon}
                    <div className="min-w-0">
                      <div className="font-medium text-xs text-gray-200 truncate">
                        {ex.title}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">
                        {ex.description}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      if (onQuickAddQuest) {
                        onQuickAddQuest(ex);
                      } else {
                        onOpenCreateModal();
                      }
                    }}
                    className="shrink-0 px-2.5 py-1 bg-neonCyan/15 hover:bg-neonCyan/30 text-neonCyan border border-neonCyan/40 rounded font-arcade text-[9px] uppercase transition-all focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    + ADD ({ex.rewardText})
                  </button>
                </div>
              ))}
            </div>

            {/* AI Oracle Call-To-Action */}
            {onOpenAiModal && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenAiModal();
                }}
                className="mt-2 px-5 py-2.5 bg-gradient-to-r from-[#241344] to-[#3B155B] hover:from-[#2F195A] hover:to-[#4D1B77] border border-neonCyan/50 text-white font-arcade text-xs rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center gap-2 uppercase cursor-pointer transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <Sparkles className="w-4 h-4 text-neonCyan animate-bounce" />
                <span>ASK THE AI ORACLE TO FORGE QUESTS</span>
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <QuestCard
              key={task.id}
              task={task}
              onComplete={onComplete}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </div>
  );
}
