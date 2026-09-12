"use client";

import React, { useState } from "react";
import { soundEffects } from "@/lib/sound";
import { KanbanTask } from "./KanbanBoard";

interface TableMatrixViewProps {
  tasks: KanbanTask[];
  onStageChange: (taskId: string, newStage: string) => Promise<void>;
  onInspectGrimoire: (task: KanbanTask) => void;
  onEdit: (task: KanbanTask) => void;
  onDelete: (taskId: string) => void;
  onComplete: (taskId: string) => void;
}

export const TableMatrixView: React.FC<TableMatrixViewProps> = ({
  tasks,
  onStageChange,
  onInspectGrimoire,
  onEdit,
  onDelete,
  onComplete,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [attrFilter, setAttrFilter] = useState("ALL");
  const [stageFilter, setStageFilter] = useState("ALL");

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.tags && t.tags.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesAttr = attrFilter === "ALL" || t.attributeCode === attrFilter;
    const matchesStage = stageFilter === "ALL" || (t.stage || "TODO") === stageFilter;
    return matchesSearch && matchesAttr && matchesStage;
  });

  const attributes = ["ALL", "INT", "STR", "WIS", "DEX", "CRE", "CHA"];
  const stages = ["ALL", "TODO", "IN_PROGRESS", "REVIEW", "DONE"];

  return (
    <div className="flex flex-col w-full bg-black/70 border-2 border-gray-800 rounded-lg p-4 backdrop-blur-md shadow-2xl">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <span className="text-gray-500 font-mono text-xs">🔍</span>
          <input
            type="text"
            placeholder="Search quest protocol or #tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0d0f1a] border border-gray-800 focus:border-arcade-cyan text-xs font-mono text-gray-200 px-3 py-1.5 rounded outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-gray-400">ATTR:</span>
          <select
            value={attrFilter}
            onChange={(e) => {
              soundEffects.playBlip();
              setAttrFilter(e.target.value);
            }}
            className="bg-[#0d0f1a] border border-gray-800 text-[11px] font-mono text-arcade-cyan px-2 py-1 rounded outline-none"
          >
            {attributes.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <span className="text-[10px] font-mono text-gray-400 ml-2">STAGE:</span>
          <select
            value={stageFilter}
            onChange={(e) => {
              soundEffects.playBlip();
              setStageFilter(e.target.value);
            }}
            className="bg-[#0d0f1a] border border-gray-800 text-[11px] font-mono text-arcade-gold px-2 py-1 rounded outline-none"
          >
            {stages.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Database Table Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-[10px] uppercase tracking-wider bg-white/[0.02]">
              <th className="py-2.5 px-3 w-12 text-center">DONE</th>
              <th className="py-2.5 px-3 min-w-[220px]">QUEST PROTOCOL</th>
              <th className="py-2.5 px-3 w-20 text-center">ATTR</th>
              <th className="py-2.5 px-3 w-24 text-center">TIER</th>
              <th className="py-2.5 px-3 w-36 text-center">STAGE</th>
              <th className="py-2.5 px-3 w-20 text-center">SUBTASKS</th>
              <th className="py-2.5 px-3 w-20 text-right">REWARD</th>
              <th className="py-2.5 px-3 w-24 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-900">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500 font-mono text-xs">
                  NO QUEST PROTOCOLS MATCH FILTER
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => {
                const isCompleted = task.status === "COMPLETED";
                const subTasksTotal = task.subTasks?.length || 0;
                const subTasksDone =
                  task.subTasks?.filter((s) => s.status === "COMPLETED").length || 0;

                return (
                  <tr
                    key={task.id}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    {/* Checkbox */}
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => {
                          if (!isCompleted) {
                            soundEffects.playVictory();
                            onComplete(task.id);
                          }
                        }}
                        disabled={isCompleted}
                        className="cursor-pointer accent-arcade-cyan h-4 w-4 rounded border-gray-700 disabled:opacity-50"
                      />
                    </td>

                    {/* Title & tags */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col gap-0.5">
                        <span
                          onClick={() => onInspectGrimoire(task)}
                          className={`font-semibold cursor-pointer hover:text-arcade-cyan transition-colors ${
                            isCompleted ? "line-through text-gray-500" : "text-gray-200"
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.tags && (
                          <div className="flex flex-wrap gap-1">
                            {task.tags.split(",").map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[8px] text-gray-500 hover:text-gray-400"
                              >
                                #{tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Attribute */}
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-arcade-cyan/10 text-arcade-cyan border border-arcade-cyan/30">
                        {task.attributeCode}
                      </span>
                    </td>

                    {/* Difficulty */}
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-1.5 py-0.5 text-[9px] rounded bg-white/5 text-gray-300 border border-gray-800">
                        {task.difficulty}
                      </span>
                    </td>

                    {/* Stage selector dropdown */}
                    <td className="py-2.5 px-3 text-center">
                      <select
                        value={task.stage || "TODO"}
                        onChange={async (e) => {
                          soundEffects.playBlip();
                          await onStageChange(task.id, e.target.value);
                        }}
                        className="bg-[#0b0c14] border border-gray-800 text-[10px] text-gray-300 rounded px-2 py-1 outline-none hover:border-arcade-cyan/60"
                      >
                        <option value="TODO">📥 BACKLOG</option>
                        <option value="IN_PROGRESS">⚡ ACTIVE</option>
                        <option value="REVIEW">⚔️ REVIEW</option>
                        <option value="DONE">🏆 DONE</option>
                      </select>
                    </td>

                    {/* Subtasks Count */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onInspectGrimoire(task)}
                        className="text-[10px] px-2 py-0.5 rounded bg-black/60 border border-gray-800 hover:border-arcade-cyan text-gray-400 hover:text-arcade-cyan"
                      >
                        {subTasksDone}/{subTasksTotal}
                      </button>
                    </td>

                    {/* Reward */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-arcade-gold font-bold">+{task.xpReward} XP</span>
                        <span className="text-[9px] text-amber-500">+{task.goldReward} GP</span>
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => onInspectGrimoire(task)}
                          title="Open Grimoire Notes"
                          className="p-1 text-purple-400 hover:text-purple-300 hover:bg-purple-950/40 rounded"
                        >
                          📜
                        </button>
                        <button
                          onClick={() => onEdit(task)}
                          title="Reforge Quest"
                          className="p-1 text-gray-400 hover:text-arcade-gold hover:bg-white/5 rounded"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => onDelete(task.id)}
                          title="Obliterate Quest"
                          className="p-1 text-gray-500 hover:text-arcade-magenta hover:bg-white/5 rounded"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer stats */}
      <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 pt-3 mt-3 border-t border-gray-900">
        <span>SHOWING {filteredTasks.length} OF {tasks.length} PROTOCOLS</span>
        <span>TOTAL REWARD POOL: {filteredTasks.reduce((s, t) => s + t.xpReward, 0)} XP</span>
      </div>
    </div>
  );
};
