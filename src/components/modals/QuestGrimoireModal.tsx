"use client";

import React, { useState, useEffect } from "react";
import { soundEffects } from "@/lib/sound";
import { KanbanTask } from "../views/KanbanBoard";

interface QuestGrimoireModalProps {
  task: KanbanTask;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => Promise<void>;
}

export const QuestGrimoireModal: React.FC<QuestGrimoireModalProps> = ({
  task,
  isOpen,
  onClose,
  onRefresh,
}) => {
  const [notes, setNotes] = useState(task.notes || "");
  const [subTasks, setSubTasks] = useState(task.subTasks || []);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 25-minute Pomodoro Focus Timer
  const FOCUS_TIME_SECONDS = 25 * 60;
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    setNotes(task.notes || "");
    setSubTasks(task.subTasks || []);
  }, [task]);

  // Pomodoro countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      soundEffects.playLevelUp();
      alert("🏆 FOCUS TRIAL COMPLETE! +15 XP & +10 AP RESTORED TO HERO!");
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft]);

  if (!isOpen) return null;

  const handleSaveNotes = async () => {
    setIsSaving(true);
    soundEffects.playBlip();
    try {
      await fetch(`/api/v1/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      await onRefresh();
    } catch (err) {
      console.error("Failed to save notes:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSubTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTaskTitle.trim()) return;

    soundEffects.playBlip();
    try {
      const res = await fetch(`/api/v1/tasks/${task.id}/subtasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newSubTaskTitle.trim() }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setSubTasks((prev) => [...prev, json.data]);
        setNewSubTaskTitle("");
        await onRefresh();
      }
    } catch (err) {
      console.error("Failed to add subtask:", err);
    }
  };

  const toggleSubTask = async (subTaskId: string, currentStatus: string) => {
    soundEffects.playVictory();
    try {
      if (currentStatus !== "COMPLETED") {
        await fetch(`/api/v1/tasks/${subTaskId}/complete`, { method: "POST" });
        setSubTasks((prev) =>
          prev.map((s) => (s.id === subTaskId ? { ...s, status: "COMPLETED" } : s))
        );
        await onRefresh();
      }
    } catch (err) {
      console.error("Failed to complete subtask:", err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-[#090b14] border-2 border-arcade-cyan rounded-lg p-6 shadow-[0_0_40px_rgba(0,240,255,0.3)] max-h-[90vh] flex flex-col font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-arcade-cyan/15 text-arcade-cyan border border-arcade-cyan/40 rounded text-base">
              📜
            </span>
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                QUEST GRIMOIRE & FOCUS CHAMBER
              </span>
              <h2 className="text-base font-bold text-white tracking-wide line-clamp-1">
                {task.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white text-lg font-bold p-1 rounded hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {/* 1. Pomodoro Focus Chamber Widget */}
          <div className="p-4 bg-black/60 border border-purple-800/60 rounded-lg flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-pulse">⏳</span>
              <div>
                <span className="text-[10px] uppercase text-purple-400 font-bold tracking-widest">
                  DEEP WORK FOCUS CHAMBER
                </span>
                <p className="text-2xl font-black text-white tracking-widest">
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundEffects.playBlip();
                  setIsTimerRunning(!isTimerRunning);
                }}
                className={`px-4 py-2 text-xs font-bold rounded uppercase transition-all ${
                  isTimerRunning
                    ? "bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                    : "bg-arcade-cyan text-black shadow-[0_0_12px_rgba(0,240,255,0.5)]"
                }`}
              >
                {isTimerRunning ? "PAUSE FOCUS" : "START SPRINT (25M)"}
              </button>
              <button
                onClick={() => {
                  soundEffects.playBlip();
                  setIsTimerRunning(false);
                  setTimeLeft(FOCUS_TIME_SECONDS);
                }}
                className="px-3 py-2 bg-gray-800 text-gray-300 hover:text-white rounded"
              >
                RESET
              </button>
            </div>
          </div>

          {/* 2. Hierarchical Sub-Quests Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-arcade-cyan uppercase tracking-wider">
                SUB-QUEST BREAKDOWN ({subTasks.filter((s) => s.status === "COMPLETED").length}/
                {subTasks.length})
              </span>
              <span className="text-[10px] text-gray-500">
                EACH SUB-QUEST ROLLS UP BONUS XP
              </span>
            </div>

            {/* List of Subtasks */}
            <div className="space-y-2 mb-3">
              {subTasks.length === 0 ? (
                <p className="text-gray-600 italic text-[11px] p-2 bg-black/40 rounded border border-dashed border-gray-800">
                  No sub-quests defined yet. Deconstruct this epic below!
                </p>
              ) : (
                subTasks.map((st) => {
                  const isDone = st.status === "COMPLETED";
                  return (
                    <div
                      key={st.id}
                      onClick={() => toggleSubTask(st.id, st.status)}
                      className={`flex items-center justify-between p-2.5 rounded border transition-colors cursor-pointer ${
                        isDone
                          ? "bg-emerald-950/20 border-emerald-900/40 text-gray-500"
                          : "bg-black/50 border-gray-800 hover:border-arcade-cyan text-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggleSubTask(st.id, st.status)}
                          className="h-4 w-4 accent-emerald-400 cursor-pointer"
                        />
                        <span className={isDone ? "line-through" : "font-semibold"}>
                          {st.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold">
                        {isDone ? "COMPLETED ✔" : "ACTIVE"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Subtask Form */}
            <form onSubmit={handleAddSubTask} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter sub-quest step..."
                value={newSubTaskTitle}
                onChange={(e) => setNewSubTaskTitle(e.target.value)}
                className="flex-1 bg-black/60 border border-gray-800 focus:border-arcade-cyan text-gray-200 px-3 py-2 rounded outline-none text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-arcade-cyan/15 text-arcade-cyan border border-arcade-cyan/40 hover:bg-arcade-cyan/30 rounded font-bold uppercase transition-all"
              >
                + ADD STEP
              </button>
            </form>
          </div>

          {/* 3. Notion-Style Markdown / Notes Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-arcade-gold uppercase tracking-wider">
                GRIMOIRE NOTES & DOCUMENTATION (MARKDOWN)
              </span>
              <span className="text-[10px] text-gray-500">PERSISTENT IN DATABASE</span>
            </div>
            <textarea
              rows={8}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record architectural specs, code snippets, research findings, or reflection..."
              className="w-full bg-black/70 border border-gray-800 focus:border-arcade-gold text-gray-200 p-3 rounded outline-none font-mono text-xs leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <span className="text-[10px] text-gray-500">
            AUTO-CALCULATES ROLLUP REWARDS & FOCUS RESTORATION
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-gray-300 hover:text-white rounded font-bold uppercase"
            >
              CLOSE
            </button>
            <button
              onClick={handleSaveNotes}
              disabled={isSaving}
              className="px-5 py-2 bg-arcade-gold text-black rounded font-bold uppercase hover:bg-yellow-400 transition-all shadow-[0_0_12px_rgba(255,230,0,0.4)] disabled:opacity-50"
            >
              {isSaving ? "SAVING..." : "SAVE GRIMOIRE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
