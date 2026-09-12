"use client";

import React, { useState, useEffect } from "react";
import { Plus, Minus, Droplet, Dumbbell, Bike, BookOpen, Sparkles } from "lucide-react";
import { sounds } from "@/lib/sound";

export interface TrackerItem {
  key: string;
  label: string;
  icon: string;
  count: number;
  target: number;
  unit: string;
}

interface PredefinedTrackersProps {
  onIncrementTracker?: (key: string) => Promise<void>;
  onDecrementTracker?: (key: string) => Promise<void>;
  trackers?: TrackerItem[];
}

const DEFAULT_TRACKERS: TrackerItem[] = [
  { key: "water", label: "Water", icon: "💧", count: 0, target: 8, unit: "glasses" },
  { key: "gym", label: "Gym Workout", icon: "🏋️", count: 0, target: 1, unit: "session" },
  { key: "cycling", label: "Cycling", icon: "🚴", count: 0, target: 1, unit: "ride" },
  { key: "reading", label: "Reading", icon: "📖", count: 0, target: 20, unit: "pages" },
  { key: "meditation", label: "Meditation", icon: "🧘", count: 0, target: 10, unit: "mins" },
];

export function PredefinedTrackers({
  onIncrementTracker,
  onDecrementTracker,
  trackers = DEFAULT_TRACKERS,
}: PredefinedTrackersProps) {
  const [localTrackers, setLocalTrackers] = useState<TrackerItem[]>(trackers);

  useEffect(() => {
    if (trackers) setLocalTrackers(trackers);
  }, [trackers]);

  const handleIncrement = async (key: string) => {
    sounds.playClick();
    setLocalTrackers((prev) =>
      prev.map((t) => (t.key === key ? { ...t, count: t.count + 1 } : t))
    );
    if (onIncrementTracker) {
      await onIncrementTracker(key);
    }
  };

  const handleDecrement = async (key: string) => {
    sounds.playClick();
    setLocalTrackers((prev) =>
      prev.map((t) => (t.key === key ? { ...t, count: Math.max(0, t.count - 1) } : t))
    );
    if (onDecrementTracker) {
      await onDecrementTracker(key);
    }
  };

  return (
    <section className="bg-cabinetSurface/90 border-2 border-cabinetBorder rounded-xl p-4 sm:p-5 shadow-lg flex flex-col gap-3.5">
      <div className="flex items-center justify-between pb-2 border-b border-cabinetBorder">
        <div className="flex items-center gap-2">
          <span className="font-arcade text-xs text-neonCyan neon-glow-cyan tracking-wider">
            DAILY HABIT TRACKERS
          </span>
          <span className="text-[10px] text-textSecondary font-mono hidden sm:inline">
            (+10 XP / +5 GP per micro-win)
          </span>
        </div>
        <span className="text-[10px] font-arcade text-arcadeGold bg-arcadeGold/10 px-2 py-0.5 rounded border border-arcadeGold/30">
          MICRO-GOALS
        </span>
      </div>

      {/* Tracker Chips Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {localTrackers.map((tracker) => {
          const isComplete = tracker.count >= tracker.target;
          return (
            <div
              key={tracker.key}
              className={`p-3 rounded-xl border flex flex-col items-center justify-between gap-2 transition-all ${
                isComplete
                  ? "bg-phosphorGreen/15 border-phosphorGreen/50 shadow-[0_0_12px_rgba(0,255,102,0.2)]"
                  : "bg-[#140F24] border-cabinetBorder hover:border-neonCyan/40"
              }`}
            >
              <div className="text-2xl select-none">{tracker.icon}</div>
              <div className="text-center">
                <div className="text-xs font-semibold text-textPrimary">{tracker.label}</div>
                <div className="font-arcade text-[10px] text-arcadeGold mt-0.5">
                  {tracker.count} / {tracker.target}{" "}
                  <span className="text-[8px] text-textSecondary font-sans">{tracker.unit}</span>
                </div>
              </div>

              {/* Stepper Controls */}
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleDecrement(tracker.key)}
                  disabled={tracker.count <= 0}
                  className="w-7 h-7 rounded-lg bg-black/50 border border-cabinetBorder text-textSecondary hover:text-white flex items-center justify-center disabled:opacity-40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  aria-label={`Decrement ${tracker.label}`}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleIncrement(tracker.key)}
                  className="w-7 h-7 rounded-lg bg-neonCyan/20 hover:bg-neonCyan/40 border border-neonCyan/60 text-neonCyan flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 active:scale-95"
                  aria-label={`Increment ${tracker.label}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
