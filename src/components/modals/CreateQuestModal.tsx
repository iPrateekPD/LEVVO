"use client";

import React, { useState } from "react";
import { X, Sparkles, Plus } from "lucide-react";
import { CANONICAL_ATTRIBUTES, DIFFICULTY_TIERS, DifficultyTier } from "@/lib/progression";
import { sounds } from "@/lib/sound";

interface CreateQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (newTask: any) => void;
}

export function CreateQuestModal({ isOpen, onClose, onTaskCreated }: CreateQuestModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attributeCode, setAttributeCode] = useState("INT");
  const [difficulty, setDifficulty] = useState<DifficultyTier>("Medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a quest title");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          attributeCode,
          difficulty,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create quest");
        return;
      }

      sounds.playClick();
      onTaskCreated(data.data);
      onClose();
      setTitle("");
      setDescription("");
    } catch {
      setError("Network error while creating quest");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cabinetSurface border-2 border-synthMagenta rounded-2xl w-full max-w-lg p-5 shadow-[0_0_30px_rgba(255,42,133,0.3)] relative">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 text-textSecondary hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-synthMagenta" />
          <h2 className="font-arcade text-base text-[#FFE600] tracking-wider">
            FORGE NEW QUEST
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded bg-arcadeRed/20 border border-arcadeRed text-arcadeRed text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title Input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-textSecondary">Quest Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Code for 45 minutes, Hit the gym, Read chapter..."
              className="w-full bg-[#120D24] border border-cabinetBorder rounded-lg px-3 py-2 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-neonCyan"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-textSecondary">Notes / Motivation</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes or sub-tasks..."
              rows={2}
              className="w-full bg-[#120D24] border border-cabinetBorder rounded-lg px-3 py-2 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-neonCyan resize-none"
            />
          </div>

          {/* Attribute Selection */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-textSecondary">Target Attribute</label>
            <div className="grid grid-cols-3 gap-2">
              {CANONICAL_ATTRIBUTES.map((attr) => (
                <button
                  type="button"
                  key={attr.code}
                  onClick={() => setAttributeCode(attr.code)}
                  className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    attributeCode === attr.code
                      ? "bg-[#2A1642] border-neonCyan text-neonCyan shadow-[0_0_8px_rgba(0,240,255,0.4)]"
                      : "bg-[#150F26] border-cabinetBorder text-textSecondary hover:text-textPrimary"
                  }`}
                >
                  <span>{attr.code}</span>
                  <span className="text-[10px] text-textMuted">({attr.name})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Tier */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-textSecondary">Difficulty Tier</label>
            <div className="grid grid-cols-5 gap-1.5">
              {(Object.keys(DIFFICULTY_TIERS) as DifficultyTier[]).map((tier) => {
                const config = DIFFICULTY_TIERS[tier];
                return (
                  <button
                    type="button"
                    key={tier}
                    onClick={() => setDifficulty(tier)}
                    className={`p-1.5 rounded-lg border text-center flex flex-col items-center justify-center transition-all ${
                      difficulty === tier
                        ? "bg-synthMagenta/20 border-synthMagenta text-synthMagenta shadow-[0_0_8px_rgba(255,42,133,0.4)]"
                        : "bg-[#150F26] border-cabinetBorder text-textSecondary hover:text-textPrimary"
                    }`}
                  >
                    <span className="text-[11px] font-semibold">{tier}</span>
                    <span className="text-[9px] font-arcade text-arcadeGold mt-0.5">
                      +{config.xp} XP
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-textSecondary hover:text-textPrimary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="arcade-btn flex items-center gap-2 px-5 py-2.5 bg-synthMagenta hover:bg-pink-600 text-white border border-pink-400 rounded-lg font-arcade text-xs shadow-[0_3px_0_#9E0045]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isSubmitting ? "FORGING..." : "CREATE QUEST"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
