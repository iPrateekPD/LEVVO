"use client";

import React, { useState } from "react";
import { Check, Clock, Brain, Shield, Sparkles, Target, Palette, Users, Trash2 } from "lucide-react";
import confetti from "canvas-confetti";
import { sounds } from "@/lib/sound";

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  attributeCode: string;
  difficulty: string;
  xpReward: number;
  goldReward: number;
  status: string;
  dueDate: string | null;
}

interface QuestCardProps {
  task: TaskItem;
  onComplete: (taskId: string) => Promise<{ didLevelUp?: boolean; newLevel?: number } | void>;
  onDelete: (taskId: string) => void;
}

const ATTRIBUTE_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  INT: { bg: "bg-cyan-950/60", text: "text-neonCyan", icon: <Brain className="w-3.5 h-3.5" /> },
  STR: { bg: "bg-red-950/60", text: "text-arcadeRed", icon: <Shield className="w-3.5 h-3.5" /> },
  WIS: { bg: "bg-purple-950/60", text: "text-purple-400", icon: <Sparkles className="w-3.5 h-3.5" /> },
  DEX: { bg: "bg-yellow-950/60", text: "text-arcadeGold", icon: <Target className="w-3.5 h-3.5" /> },
  CRE: { bg: "bg-pink-950/60", text: "text-synthMagenta", icon: <Palette className="w-3.5 h-3.5" /> },
  CHA: { bg: "bg-emerald-950/60", text: "text-phosphorGreen", icon: <Users className="w-3.5 h-3.5" /> },
};

export function QuestCard({ task, onComplete, onDelete }: QuestCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCompleted = task.status === "COMPLETED";

  const handleCheckboxClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isCompleted || isSubmitting) return;

    setIsSubmitting(true);
    sounds.playComplete();

    // Trigger celebratory particle burst at button position
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { x, y },
      colors: ["#00F0FF", "#FF2A85", "#FFE600", "#00FF66"],
      disableForReducedMotion: true,
    });

    try {
      await onComplete(task.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const attrStyle = ATTRIBUTE_STYLES[task.attributeCode] || ATTRIBUTE_STYLES.INT;

  return (
    <div
      className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all duration-200 ${
        isCompleted
          ? "bg-[#141221]/60 border-cabinetBorder/40 opacity-70"
          : "bg-cabinetSurface/90 hover:bg-cabinetSurfaceLight border-cabinetBorder hover:border-synthMagenta/50 shadow-md"
      }`}
    >
      {/* Left Details */}
      <div className="flex items-start gap-3 min-w-0 pr-3">
        {/* Attribute Badge Icon */}
        <div
          className={`p-2 rounded-lg border border-cabinetBorder flex items-center justify-center shrink-0 ${attrStyle.bg} ${attrStyle.text}`}
        >
          {attrStyle.icon}
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`font-semibold text-sm sm:text-base leading-snug break-words ${
                isCompleted ? "line-through text-textSecondary" : "text-textPrimary"
              }`}
            >
              {task.title}
            </span>

            {/* Difficulty Badge */}
            <span className="text-[10px] uppercase font-arcade px-1.5 py-0.5 rounded bg-cabinetBorder/60 text-textSecondary">
              {task.difficulty}
            </span>
          </div>

          {task.description && (
            <p className="text-xs text-textSecondary mt-1 line-clamp-2">{task.description}</p>
          )}

          {/* Reward Indicators */}
          <div className="flex items-center gap-2.5 mt-2 text-xs">
            <span className="font-arcade text-[10px] text-neonCyan">+{task.xpReward} XP</span>
            <span className="text-textSecondary">•</span>
            <span className="font-arcade text-[10px] text-arcadeGold">+{task.goldReward} GP</span>
            {task.dueDate && (
              <>
                <span className="text-textSecondary">•</span>
                <span className="text-[11px] text-textSecondary flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Delete Task Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onDelete(task.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-textSecondary hover:text-arcadeRed rounded hover:bg-arcadeRed/10"
          title="Delete quest"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Tactile 3D Checkbox */}
        <button
          onClick={handleCheckboxClick}
          disabled={isCompleted || isSubmitting}
          aria-label={isCompleted ? "Completed quest" : "Complete quest"}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-100 ${
            isCompleted
              ? "bg-phosphorGreen/20 border-2 border-phosphorGreen text-phosphorGreen"
              : "arcade-btn bg-[#251B3D] hover:bg-[#342456] border-2 border-neonCyan text-transparent hover:text-neonCyan shadow-[0_3px_0_#140D26]"
          }`}
        >
          <Check className={`w-4 h-4 stroke-[3] ${isCompleted ? "opacity-100" : ""}`} />
        </button>
      </div>
    </div>
  );
}
