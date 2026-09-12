"use client";

import React from "react";
import { soundEffects } from "@/lib/sound";

export type ViewMode = "list" | "kanban" | "table" | "heatmap" | "guild";

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  taskCount: number;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  currentView,
  onViewChange,
  taskCount,
}) => {
  const views: Array<{ id: ViewMode; label: string; icon: string; badge?: string }> = [
    { id: "list", label: "QUEST LIST", icon: "📜", badge: String(taskCount) },
    { id: "kanban", label: "KANBAN BOARD", icon: "📊" },
    { id: "table", label: "DATABASE TABLE", icon: "📋" },
    { id: "heatmap", label: "HEATMAP & HABITS", icon: "🟩" },
    { id: "guild", label: "GUILD RAID", icon: "⚔️", badge: "WORLD BOSS" },
  ];

  const handleSelect = (v: ViewMode) => {
    soundEffects.playBlip();
    onViewChange(v);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-black/60 border-2 border-arcade-cyan/40 rounded shadow-[0_0_15px_rgba(0,240,255,0.15)] backdrop-blur-md mb-6">
      <div className="flex items-center gap-1">
        <span className="text-[10px] uppercase font-bold tracking-widest text-arcade-cyan mr-2 px-2 py-1 bg-arcade-cyan/10 border border-arcade-cyan/30 rounded">
          VIEW ENGINE
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {views.map((v) => {
            const isActive = currentView === v.id;
            return (
              <button
                key={v.id}
                onClick={() => handleSelect(v.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all duration-150 rounded border ${
                  isActive
                    ? "bg-arcade-cyan text-black border-arcade-cyan shadow-[0_0_12px_rgba(0,240,255,0.6)] scale-[1.02]"
                    : "bg-black/40 text-gray-400 border-gray-800 hover:text-white hover:border-gray-600 hover:bg-white/5"
                }`}
              >
                <span>{v.icon}</span>
                <span>{v.label}</span>
                {v.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                      isActive ? "bg-black text-arcade-cyan" : "bg-gray-800 text-gray-300"
                    }`}
                  >
                    {v.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="hidden md:flex items-center text-[11px] font-mono text-gray-400 gap-2 pr-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>NOTION MODULAR SYNC</span>
      </div>
    </div>
  );
};
