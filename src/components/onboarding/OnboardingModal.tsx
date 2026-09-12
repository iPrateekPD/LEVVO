"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, ArrowLeft, Check, FastForward } from "lucide-react";
import { AGE_GROUP_CONFIGS, AgeGroup } from "@/lib/presets";
import { sounds } from "@/lib/sound";
import { useEscapeKey } from "@/lib/useEscapeKey";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: { ageGroup?: string; goals: string[]; seededTasks: any[] }) => void;
  onSkip: () => void;
}

export function OnboardingModal({ isOpen, onComplete, onSkip }: OnboardingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedAge, setSelectedAge] = useState<AgeGroup | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEscapeKey(onSkip, isOpen);

  if (!isOpen) return null;

  const handleSelectAge = (age: AgeGroup) => {
    sounds.playClick();
    setSelectedAge(age);
    setSelectedGoals([]);
    setStep(2);
  };

  const handleToggleGoal = (goal: string) => {
    sounds.playClick();
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      if (selectedGoals.length < 3) {
        setSelectedGoals([...selectedGoals, goal]);
      }
    }
  };

  const handleFinish = async () => {
    if (!selectedAge) return;
    setIsSubmitting(true);
    sounds.playLevelUp();

    try {
      const res = await fetch("/api/v1/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ageGroup: selectedAge,
          goals: selectedGoals,
          skipped: false,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onComplete({
          ageGroup: selectedAge,
          goals: selectedGoals,
          seededTasks: data.data.seededTasks || [],
        });
      } else {
        onSkip();
      }
    } catch {
      onSkip();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipAction = async () => {
    sounds.playClick();
    try {
      await fetch("/api/v1/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skipped: true }),
      });
    } catch {
      // ignore
    }
    onSkip();
  };

  const ageConfig = selectedAge ? AGE_GROUP_CONFIGS[selectedAge] : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-cabinetSurface border-2 border-synthMagenta rounded-2xl w-full max-w-xl p-5 sm:p-7 shadow-[0_0_40px_rgba(255,42,133,0.35)] relative flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Marquee Info */}
        <div className="flex items-center justify-between pb-3 border-b border-cabinetBorder">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-arcadeGold animate-pulse" />
            <div>
              <span className="font-arcade text-[10px] text-synthMagenta uppercase tracking-widest block">
                CHARACTER CREATION MATRIX • STEP {step} OF 2
              </span>
              <h2 className="font-arcade text-base sm:text-lg text-arcadeGold neon-glow-gold">
                {step === 1 ? "CHOOSE YOUR ERA (AGE GROUP)" : "SELECT 1–3 CORE OBJECTIVES"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSkipAction}
            className="text-textSecondary hover:text-white font-arcade text-[10px] flex items-center gap-1 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded"
            title="Skip Onboarding"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>SKIP</span>
          </button>
        </div>

        {/* STEP 1: Age Group Selection */}
        {step === 1 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-textSecondary">
              Your age group personalizes your default quest catalog, habits, and difficulty curves:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(AGE_GROUP_CONFIGS) as AgeGroup[]).map((key) => {
                const item = AGE_GROUP_CONFIGS[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectAge(key)}
                    className="p-4 bg-[#140F26] hover:bg-[#21143D] border-2 border-cabinetBorder hover:border-neonCyan rounded-xl flex items-center gap-3.5 text-left transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 active:scale-[0.98]"
                  >
                    <span className="text-3xl select-none group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="font-arcade text-xs text-neonCyan group-hover:text-arcadeGold transition-colors">
                        {key} ({item.label})
                      </div>
                      <div className="text-[11px] text-textSecondary mt-0.5 line-clamp-1">
                        {item.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Goals Selection */}
        {step === 2 && ageConfig && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-textSecondary">
                Choose 1 to 3 priorities for your daily quest stream ({selectedGoals.length}/3 selected):
              </p>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-textSecondary hover:text-neonCyan text-xs flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Era ({selectedAge})</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {ageConfig.availableGoals.map((goal) => {
                const isSelected = selectedGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => handleToggleGoal(goal)}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                      isSelected
                        ? "bg-synthMagenta/20 border-synthMagenta text-white shadow-[0_0_10px_rgba(255,42,133,0.4)]"
                        : "bg-[#140F26] border-cabinetBorder text-textSecondary hover:text-textPrimary"
                    }`}
                  >
                    <span>{goal}</span>
                    {isSelected && <Check className="w-4 h-4 text-synthMagenta shrink-0 stroke-[3]" />}
                  </button>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-cabinetBorder">
              <button
                type="button"
                onClick={handleSkipAction}
                className="text-xs text-textSecondary hover:text-white"
              >
                Skip for now
              </button>

              <button
                type="button"
                onClick={handleFinish}
                disabled={isSubmitting || selectedGoals.length === 0}
                className="arcade-btn px-6 py-2.5 bg-gradient-to-r from-arcadeGold to-yellow-400 hover:brightness-110 text-arcadeBlack font-arcade text-xs font-bold rounded-xl border border-yellow-200 shadow-[0_3px_0_#9E8200] flex items-center gap-2 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <span>{isSubmitting ? "FORGING HERO..." : "ENTER LEVVO"}</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
