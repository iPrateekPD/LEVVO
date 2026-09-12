"use client";

import React, { useState } from "react";
import { Plus, ListFilter, Trophy } from "lucide-react";
import { QuestCard, TaskItem } from "./QuestCard";
import { sounds } from "@/lib/sound";

interface QuestListProps {
  tasks: TaskItem[];
  onComplete: (taskId: string) => Promise<{ didLevelUp?: boolean; newLevel?: number } | void>;
  onDelete: (taskId: string) => void;
  onOpenCreateModal: () => void;
}

export function QuestList({
  tasks,
  onComplete,
  onDelete,
  onOpenCreateModal,
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

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[#161226] p-1 rounded-lg border border-cabinetBorder">
            {(["ACTIVE", "COMPLETED", "ALL"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  sounds.playClick();
                  setFilter(mode);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  filter === mode
                    ? "bg-synthMagenta text-white shadow-sm font-semibold"
                    : "text-textSecondary hover:text-textPrimary"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Create Quest Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenCreateModal();
            }}
            className="arcade-btn flex items-center gap-1.5 px-3 py-1.5 bg-synthMagenta hover:bg-pink-600 text-white rounded-lg border border-pink-400 font-arcade text-[10px] shadow-[0_3px_0_#9E0045]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>NEW QUEST</span>
          </button>
        </div>
      </div>

      {/* Quest Cards Container */}
      <div className="flex flex-col gap-2.5">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center bg-cabinetSurface/40 border-2 border-dashed border-cabinetBorder rounded-xl flex flex-col items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-arcadeGold/50" />
            <p className="font-arcade text-xs text-textSecondary">
              {filter === "ACTIVE"
                ? "NO ACTIVE QUESTS! ALL OBJECTIVES CLEARED."
                : "NO QUESTS FOUND IN THIS VIEW."}
            </p>
            <button
              onClick={() => {
                sounds.playClick();
                onOpenCreateModal();
              }}
              className="mt-2 text-xs text-neonCyan underline hover:text-cyan-300"
            >
              Add a new quest to level up!
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <QuestCard
              key={task.id}
              task={task}
              onComplete={onComplete}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
