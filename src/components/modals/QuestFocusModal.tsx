"use client";

import React, { useState, useEffect } from "react";
import { X, Play, Pause, RotateCcw, Check, Sparkles, Clock, Flame, Music } from "lucide-react";
import { sounds } from "@/lib/sound";
import { lofiMusic } from "@/lib/lofiSynthesizer";
import { TaskItem } from "@/components/quests/QuestCard";

interface QuestFocusModalProps {
  isOpen: boolean;
  task: TaskItem | null;
  onClose: () => void;
  onCompleteQuest: (taskId: string) => Promise<void>;
}

export function QuestFocusModal({ isOpen, task, onClose, onCompleteQuest }: QuestFocusModalProps) {
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Reset timer when duration changes or modal opens with new task
  useEffect(() => {
    if (task) {
      setTimeLeftSeconds(durationMinutes * 60);
      setIsRunning(false);
      setIsCompleted(false);
    }
  }, [task, durationMinutes]);

  // Tick countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setTimeLeftSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timeLeftSeconds === 0 && isRunning) {
      setIsRunning(false);
      setIsCompleted(true);
      sounds.playLevelUp();
      if (task) {
        onCompleteQuest(task.id);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeftSeconds, task, onCompleteQuest]);

  if (!isOpen || !task) return null;

  const totalSeconds = durationMinutes * 60;
  const progressPercent = Math.round(((totalSeconds - timeLeftSeconds) / totalSeconds) * 100);

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const toggleTimer = () => {
    sounds.playClick();
    setIsRunning(!isRunning);
    if (!isRunning && lofiMusic && !lofiMusic.getIsPlaying()) {
      lofiMusic.play();
    }
  };

  const resetTimer = () => {
    sounds.playClick();
    setIsRunning(false);
    setTimeLeftSeconds(durationMinutes * 60);
    setIsCompleted(false);
  };

  const setPreset = (mins: number) => {
    sounds.playClick();
    setDurationMinutes(mins);
    setTimeLeftSeconds(mins * 60);
    setIsRunning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#0C1022] border border-white/[0.1] rounded-3xl shadow-[0_0_50px_rgba(0,240,255,0.2)] p-6 sm:p-8 flex flex-col items-center text-center gap-5 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
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

        {/* Header Quest Title */}
        <div className="flex flex-col items-center gap-1.5 max-w-sm">
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] uppercase font-bold tracking-widest">
            FOCUS SPRINT CHAMBER
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
            {task.title}
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Reward: +{Math.round((task.xpReward || 40) * 1.25)} XP (+25% Focus Bonus)
          </span>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-white/[0.04] border border-white/[0.07]">
          {[15, 25, 45].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPreset(m)}
              disabled={isRunning}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                durationMinutes === m
                  ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow-sm"
                  : "text-slate-400 hover:text-white disabled:opacity-40"
              }`}
            >
              {m}m Sprint
            </button>
          ))}
        </div>

        {/* Circular Countdown Display */}
        <div className="relative w-48 h-48 sm:w-52 sm:h-52 rounded-full border-4 border-white/[0.06] flex items-center justify-center shadow-inner">
          {/* Progress Ring Overlay */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="6"
              className="text-cyan-400 transition-all duration-500"
              strokeDasharray="550"
              strokeDashoffset={550 - (550 * progressPercent) / 100}
              strokeLinecap="round"
            />
          </svg>

          <div className="flex flex-col items-center z-10">
            <span className="font-mono text-4xl sm:text-5xl font-black text-white tracking-wider">
              {formattedTime}
            </span>
            <span className="text-[11px] font-mono text-cyan-400 tracking-widest mt-1 uppercase">
              {isCompleted ? "VICTORY!" : isRunning ? "FOCUSING..." : "PAUSED"}
            </span>
          </div>
        </div>

        {/* Pac-Man Focus Corridor Animation */}
        <div className="w-full py-2 px-4 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between font-mono text-xs overflow-hidden select-none">
          <span className="text-amber-300 font-bold animate-pulse">ᗧ</span>
          <span className="text-slate-500 tracking-widest">················································</span>
          <span className="text-rose-400 animate-bounce">👾</span>
          <span className="text-cyan-400 animate-pulse">👻</span>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={resetTimer}
            className="p-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 hover:text-white transition-all"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleTimer}
            className={`px-8 py-3 rounded-2xl font-extrabold text-sm flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95 ${
              isRunning
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                : "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Sprint</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Sprint</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              if (lofiMusic) lofiMusic.toggle();
            }}
            className="p-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 hover:text-white transition-all"
            title="Toggle Lo-Fi Music"
          >
            <Music className="w-4 h-4 text-purple-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
