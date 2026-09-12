"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Clock, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { sounds } from "@/lib/sound";
import { TaskItem } from "@/components/quests/QuestCard";

interface ArcadeTimerProps {
  tasks: TaskItem[];
  onSessionComplete?: (taskTitle: string, minutes: number) => Promise<void>;
}

export function ArcadeTimer({ tasks, onSessionComplete }: ArcadeTimerProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<number>(25); // minutes
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompletedFlash, setIsCompletedFlash] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-select first active quest if none selected
  useEffect(() => {
    if (!selectedTaskId && tasks.length > 0) {
      const active = tasks.find((t) => t.status === "ACTIVE") || tasks[0];
      if (active) setSelectedTaskId(active.id);
    }
  }, [tasks, selectedTaskId]);

  // Load active timer state from server & fallback to localStorage to survive page refresh
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const res = await fetch("/api/v1/timer");
        const data = await res.json();
        if (data.success && data.data) {
          const session = data.data;
          const endsAtMs = new Date(session.endsAt).getTime();
          const now = Date.now();
          const remaining = Math.max(0, Math.round((endsAtMs - now) / 1000));

          if (remaining > 0) {
            setSelectedDuration(session.durationMinutes || 25);
            if (session.taskId) setSelectedTaskId(session.taskId);
            setTimeLeftSeconds(remaining);
            setIsRunning(true);
            return;
          }
        }
      } catch {
        // Fallback to local storage below
      }

      try {
        const saved = localStorage.getItem("liferpg_active_timer");
        if (saved) {
          const parsed = JSON.parse(saved);
          const now = Date.now();
          if (parsed.endTime && parsed.endTime > now) {
            const remaining = Math.round((parsed.endTime - now) / 1000);
            setSelectedDuration(parsed.durationMinutes || 25);
            setSelectedTaskId(parsed.taskId || "");
            setTimeLeftSeconds(remaining);
            setIsRunning(true);
          } else if (parsed.endTime && parsed.endTime <= now && parsed.isRunning) {
            // Completed while away
            setTimeLeftSeconds(0);
            setIsRunning(false);
            triggerCompletion(parsed.durationMinutes || 25, parsed.taskId);
            localStorage.removeItem("liferpg_active_timer");
          }
        }
      } catch {
        // ignore
      }
    };

    checkActiveSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            triggerCompletion(selectedDuration, selectedTaskId);
            localStorage.removeItem("liferpg_active_timer");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, selectedDuration, selectedTaskId]);

  const triggerCompletion = async (durationMinutes: number, taskId?: string) => {
    sounds.playLevelUp();
    setIsCompletedFlash(true);
    setTimeout(() => setIsCompletedFlash(false), 2500);

    const isReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isReducedMotion) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FFE600", "#FF2A85", "#00F0FF", "#00FF66"],
      });
    }

    // Call server to finalize session and award XP
    try {
      await fetch("/api/v1/timer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          durationMinutes,
          taskId: taskId || null,
        }),
      });
    } catch (err) {
      console.error("Failed to complete timer session on server:", err);
    }

    const task = tasks.find((t) => t.id === taskId);
    const taskTitle = task?.title || "Focus Chamber Sprint";
    if (onSessionComplete) {
      await onSessionComplete(taskTitle, durationMinutes);
    }
  };

  const handleStart = async () => {
    sounds.playClick();
    const endTime = Date.now() + timeLeftSeconds * 1000;
    try {
      localStorage.setItem(
        "liferpg_active_timer",
        JSON.stringify({
          endTime,
          durationMinutes: selectedDuration,
          taskId: selectedTaskId,
          isRunning: true,
        })
      );
    } catch {
      // ignore
    }

    // Persist active session in database
    try {
      await fetch("/api/v1/timer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          durationMinutes: selectedDuration,
          taskId: selectedTaskId || null,
        }),
      });
    } catch (err) {
      console.error("Failed to register timer session on server:", err);
    }

    setIsRunning(true);
  };

  const handlePause = async () => {
    sounds.playClick();
    setIsRunning(false);
    try {
      localStorage.removeItem("liferpg_active_timer");
    } catch {
      // ignore
    }
    try {
      await fetch("/api/v1/timer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
    } catch {
      // ignore
    }
  };

  const handleReset = async (newMinutes?: number) => {
    sounds.playClick();
    setIsRunning(false);
    const mins = newMinutes !== undefined ? newMinutes : selectedDuration;
    setTimeLeftSeconds(mins * 60);
    try {
      localStorage.removeItem("liferpg_active_timer");
    } catch {
      // ignore
    }
    try {
      await fetch("/api/v1/timer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
    } catch {
      // ignore
    }
  };

  const handleSelectDuration = (minutes: number) => {
    setSelectedDuration(minutes);
    handleReset(minutes);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const minutesAwarded = Math.min(60, selectedDuration);

  return (
    <section
      className={`bg-cabinetSurface/90 border-2 rounded-xl p-4 sm:p-5 shadow-lg flex flex-col gap-4 transition-all ${
        isCompletedFlash
          ? "border-arcadeGold bg-arcadeGold/15 shadow-[0_0_25px_rgba(255,230,0,0.5)]"
          : "border-cabinetBorder"
      }`}
    >
      <div className="flex items-center justify-between pb-2 border-b border-cabinetBorder">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-synthMagenta" />
          <span className="font-arcade text-xs text-synthMagenta neon-glow-magenta tracking-wider">
            FOCUS CHAMBER TIMER
          </span>
        </div>
        <span className="text-[10px] font-arcade text-arcadeGold">
          +{minutesAwarded} XP ON FINISH
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left Side: Quest Selector & Durations (5 Cols) */}
        <div className="md:col-span-5 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-textSecondary font-semibold">
              Dedicate focus to quest:
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full bg-[#120D24] border border-cabinetBorder rounded-lg px-3 py-2 text-xs text-textPrimary focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              {tasks.filter((t) => t.status === "ACTIVE").length === 0 ? (
                <option value="">General Deep Work</option>
              ) : (
                tasks
                  .filter((t) => t.status === "ACTIVE")
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))
              )}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-textSecondary font-semibold">Sprint duration:</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[15, 25, 45, 60].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSelectDuration(m)}
                  className={`py-1.5 rounded-lg border font-arcade text-[10px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    selectedDuration === m
                      ? "bg-synthMagenta text-white border-pink-400 shadow-[0_0_8px_rgba(255,42,133,0.4)]"
                      : "bg-[#150F26] border-cabinetBorder text-textSecondary hover:text-textPrimary"
                  }`}
                >
                  {m}M
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Big Pixel Countdown & Tactile Controls (7 Cols) */}
        <div className="md:col-span-7 bg-[#0E0A1E] border border-cabinetBorder rounded-xl p-4 flex flex-col items-center justify-center gap-3">
          <div className="font-arcade text-3xl sm:text-4xl md:text-5xl text-[#FFE600] neon-glow-gold tracking-widest font-black select-none">
            {formatTime(timeLeftSeconds)}
          </div>

          {/* 90's Pac-Man Focus Progress Corridor */}
          <div className="w-full max-w-xs bg-[#070512] border border-blue-900/60 rounded-lg py-1.5 px-3 flex items-center justify-between overflow-hidden select-none">
            <span className="font-arcade text-[8px] text-yellow-400">PAC-SPRINT</span>
            <div className="flex items-center gap-1.5">
              <span className={`text-base select-none ${isRunning ? "animate-pulse text-yellow-300" : "text-yellow-400"}`}>ᗧ</span>
              <span className="text-yellow-200/60 text-[10px] tracking-widest font-mono">••••••••</span>
              <span className="text-sm select-none">👾</span>
              <span className="text-sm select-none">👻</span>
            </div>
            <span className="font-arcade text-[8px] text-synthMagenta">
              {isRunning ? "WAKA!" : "STANDBY"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!isRunning ? (
              <button
                type="button"
                onClick={handleStart}
                className="arcade-btn px-6 py-2.5 bg-phosphorGreen hover:bg-emerald-400 text-arcadeBlack font-arcade text-xs font-bold rounded-xl border border-emerald-300 shadow-[0_3px_0_#008A36] flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <Play className="w-4 h-4 fill-arcadeBlack" />
                <span>START SPRINT</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePause}
                className="arcade-btn px-6 py-2.5 bg-arcadeGold hover:bg-yellow-400 text-arcadeBlack font-arcade text-xs font-bold rounded-xl border border-yellow-200 shadow-[0_3px_0_#9E8200] flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <Pause className="w-4 h-4 fill-arcadeBlack" />
                <span>PAUSE</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleReset()}
              className="p-2.5 rounded-xl bg-cabinetSurface border border-cabinetBorder text-textSecondary hover:text-white hover:border-gray-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              title="Reset Timer"
              aria-label="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
