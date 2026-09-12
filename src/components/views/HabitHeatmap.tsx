"use client";

import React, { useEffect, useState } from "react";
import { soundEffects } from "@/lib/sound";

interface HeatmapDay {
  date: string;
  xp: number;
  tasks: number;
  level: number;
}

interface HabitHeatmapProps {
  onAddHabitXp?: (xp: number, label: string) => void;
}

export const HabitHeatmap: React.FC<HabitHeatmapProps> = ({ onAddHabitXp }) => {
  const [days, setDays] = useState<HeatmapDay[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [activeDays, setActiveDays] = useState(0);
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const [loading, setLoading] = useState(true);

  // Daily Routine checklist state
  const [habits, setHabits] = useState([
    { id: "h1", name: "Drink 500ml Water Upon Waking", attr: "STR", xp: 10, completed: false },
    { id: "h2", name: "20-Min Deep Technical Reading", attr: "INT", xp: 25, completed: true },
    { id: "h3", name: "Review Weekly Deliverables", attr: "DEX", xp: 15, completed: false },
    { id: "h4", name: "Evening Screen Dimming Protocol", attr: "WIS", xp: 10, completed: false },
  ]);

  useEffect(() => {
    fetchHeatmapData();
  }, []);

  const fetchHeatmapData = async () => {
    try {
      const res = await fetch("/api/v1/analytics/heatmap");
      const json = await res.json();
      if (json.success && json.data) {
        setDays(json.data.days);
        setTotalXp(json.data.totalXpPeriod);
        setTotalTasks(json.data.totalTasksPeriod);
        setActiveDays(json.data.activeDaysCount);
      }
    } catch (err) {
      console.error("Failed to load heatmap:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id && !h.completed) {
          soundEffects.playVictory();
          if (onAddHabitXp) onAddHabitXp(h.xp, h.name);
          return { ...h, completed: true };
        }
        return h;
      })
    );
  };

  const getCellColor = (level: number) => {
    switch (level) {
      case 4:
        return "#FFE600"; // Blazing Gold
      case 3:
        return "#00F0FF"; // Neon Cyan
      case 2:
        return "#7c3aed"; // Vivid Purple
      case 1:
        return "#3b0764"; // Deep Indigo
      default:
        return "#121422"; // Dark Empty
    }
  };

  // Group 364 days into 52 weeks (7 days each)
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Banner: Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-black/60 border border-gray-800 rounded-lg backdrop-blur-md">
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
            TOTAL HARVESTED XP
          </p>
          <p className="text-xl font-mono font-black text-arcade-gold mt-1">
            +{totalXp.toLocaleString()} XP
          </p>
        </div>
        <div className="p-4 bg-black/60 border border-gray-800 rounded-lg backdrop-blur-md">
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
            TOTAL PROTOCOLS CLEARED
          </p>
          <p className="text-xl font-mono font-black text-arcade-cyan mt-1">
            {totalTasks} QUESTS
          </p>
        </div>
        <div className="p-4 bg-black/60 border border-gray-800 rounded-lg backdrop-blur-md">
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
            ACTIVE BATTLE DAYS
          </p>
          <p className="text-xl font-mono font-black text-emerald-400 mt-1">
            {activeDays} / 365 DAYS
          </p>
        </div>
      </div>

      {/* 365-Day Consistency Heatmap Grid */}
      <div className="p-5 bg-black/70 border-2 border-gray-800 rounded-lg backdrop-blur-md shadow-2xl relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🟩</span>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-arcade-cyan">
              365-DAY CONSISTENCY MATRIX
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
            <span>LESS</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((lvl) => (
                <div
                  key={lvl}
                  className="w-3 h-3 rounded-[2px] border border-black/40"
                  style={{ backgroundColor: getCellColor(lvl) }}
                />
              ))}
            </div>
            <span>MORE</span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-gray-500 animate-pulse">
            CALIBRATING NEURAL MATRIX...
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-1 min-w-[720px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className="w-3 h-3 rounded-[2px] transition-all duration-100 hover:scale-125 cursor-pointer border border-black/50"
                      style={{
                        backgroundColor: getCellColor(day.level),
                        boxShadow:
                          day.level >= 3
                            ? `0 0 6px ${getCellColor(day.level)}80`
                            : "none",
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hover Tooltip display */}
        <div className="h-6 mt-2 flex items-center text-[11px] font-mono text-gray-300">
          {hoveredDay ? (
            <span className="text-arcade-cyan">
              📅 {hoveredDay.date}:{" "}
              <strong className="text-arcade-gold">+{hoveredDay.xp} XP</strong> |{" "}
              {hoveredDay.tasks} Quests Cleared
            </span>
          ) : (
            <span className="text-gray-500">HOVER OVER SQUARES TO INSPECT DAY RECORD</span>
          )}
        </div>
      </div>

      {/* Daily Recurring Habit Routines */}
      <div className="p-5 bg-black/70 border-2 border-gray-800 rounded-lg backdrop-blur-md">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-base">⏰</span>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-arcade-gold">
              DAILY RECURRING HABIT PROTOCOLS (RESET EVERY 24H)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">
            +{habits.filter((h) => h.completed).reduce((s, h) => s + h.xp, 0)} XP EARNED TODAY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {habits.map((habit) => (
            <div
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              className={`flex items-center justify-between p-3 rounded border transition-all cursor-pointer ${
                habit.completed
                  ? "bg-emerald-950/20 border-emerald-800/40 text-gray-400"
                  : "bg-[#0b0c14] border-gray-800 hover:border-arcade-cyan text-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={habit.completed}
                  onChange={() => toggleHabit(habit.id)}
                  className="h-4 w-4 accent-emerald-400 cursor-pointer"
                />
                <span className={`text-xs font-mono font-semibold ${habit.completed ? "line-through" : ""}`}>
                  {habit.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-white/5 border border-gray-800 text-arcade-cyan">
                  {habit.attr}
                </span>
                <span className="text-arcade-gold font-bold">+{habit.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
