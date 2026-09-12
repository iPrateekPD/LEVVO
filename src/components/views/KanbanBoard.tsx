"use client";

import React, { useState } from "react";
import { soundEffects } from "@/lib/sound";

export interface KanbanTask {
  id: string;
  title: string;
  description?: string | null;
  notes?: string | null;
  attributeCode: string;
  difficulty: string;
  xpReward: number;
  goldReward: number;
  apCost?: number;
  status: string;
  stage?: string;
  tags?: string | null;
  subTasks?: Array<{
    id: string;
    title: string;
    status: string;
  }>;
}

interface KanbanBoardProps {
  tasks: KanbanTask[];
  onStageChange: (taskId: string, newStage: string) => Promise<void>;
  onInspectGrimoire: (task: KanbanTask) => void;
  onEdit: (task: KanbanTask) => void;
  onComplete: (taskId: string) => void;
}

const STAGES: Array<{ id: string; label: string; color: string; bgGlow: string; icon: string }> = [
  { id: "TODO", label: "QUEST BACKLOG", color: "#A855F7", bgGlow: "rgba(168,85,247,0.1)", icon: "📥" },
  { id: "IN_PROGRESS", label: "ACTIVE FOCUS", color: "#00F0FF", bgGlow: "rgba(0,240,255,0.1)", icon: "⚡" },
  { id: "REVIEW", label: "BOSS TRIAL", color: "#FFE600", bgGlow: "rgba(255,230,0,0.1)", icon: "⚔️" },
  { id: "DONE", label: "CLAIMED LOOT", color: "#00FF66", bgGlow: "rgba(0,255,102,0.1)", icon: "🏆" },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onStageChange,
  onInspectGrimoire,
  onEdit,
  onComplete,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggedTaskId(id);
    soundEffects.playBlip();
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
    setDragOverStage(null);
    setDraggedTaskId(null);

    if (taskId) {
      soundEffects.playPowerUp();
      await onStageChange(taskId, targetStage);
    }
  };

  const shiftStage = async (taskId: string, currentStage: string, direction: number) => {
    const stageIds = STAGES.map((s) => s.id);
    const currentIndex = stageIds.indexOf(currentStage || "TODO");
    const targetIndex = currentIndex + direction;

    if (targetIndex >= 0 && targetIndex < stageIds.length) {
      soundEffects.playBlip();
      await onStageChange(taskId, stageIds[targetIndex]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {STAGES.map((stage, idx) => {
        const stageTasks = tasks.filter((t) => (t.stage || "TODO") === stage.id);
        const totalXp = stageTasks.reduce((sum, t) => sum + t.xpReward, 0);
        const isDragOver = dragOverStage === stage.id;

        return (
          <div
            key={stage.id}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={() => setDragOverStage(null)}
            onDrop={(e) => handleDrop(e, stage.id)}
            className={`flex flex-col rounded-lg border-2 bg-black/60 backdrop-blur-md transition-all duration-200 min-h-[480px] p-3 ${
              isDragOver
                ? "border-arcade-cyan ring-2 ring-arcade-cyan/40 bg-arcade-cyan/5 scale-[1.01]"
                : "border-gray-800 hover:border-gray-700"
            }`}
          >
            {/* Stage Header */}
            <div
              className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800"
              style={{ borderBottomColor: `${stage.color}40` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{stage.icon}</span>
                <h3
                  className="text-xs font-mono font-bold tracking-wider uppercase"
                  style={{ color: stage.color }}
                >
                  {stage.label}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-black/80 border"
                  style={{ color: stage.color, borderColor: `${stage.color}60` }}
                >
                  {stageTasks.length}
                </span>
                <span className="text-[10px] font-mono text-gray-500">+{totalXp} XP</span>
              </div>
            </div>

            {/* Stage Column Content */}
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[650px] pr-1">
              {stageTasks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-gray-800/80 rounded p-6 text-center text-gray-600">
                  <span className="text-xl mb-1 opacity-40">{stage.icon}</span>
                  <p className="text-[11px] font-mono">DRAG QUESTS HERE</p>
                </div>
              ) : (
                stageTasks.map((task) => {
                  const subTasksCount = task.subTasks?.length || 0;
                  const completedSubTasks =
                    task.subTasks?.filter((s) => s.status === "COMPLETED").length || 0;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="group relative bg-[#0b0c14] border border-gray-800 hover:border-arcade-cyan/60 rounded-md p-3 transition-all duration-150 cursor-grab active:cursor-grabbing hover:shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                    >
                      {/* Top Bar: Attribute & Badges */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-arcade-cyan/15 text-arcade-cyan border border-arcade-cyan/30">
                          {task.attributeCode}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-mono text-arcade-gold font-semibold">
                            +{task.xpReward} XP
                          </span>
                          {task.apCost !== undefined && (
                            <span className="text-[9px] font-mono text-purple-400 bg-purple-950/40 px-1 py-0.2 rounded border border-purple-800/40">
                              ⚡{task.apCost} AP
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Notes snippet */}
                      <h4
                        onClick={() => onInspectGrimoire(task)}
                        className="text-xs font-mono font-bold text-gray-200 hover:text-arcade-cyan cursor-pointer transition-colors line-clamp-2 mb-1"
                      >
                        {task.title}
                      </h4>

                      {task.tags && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {task.tags.split(",").map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[8px] font-mono bg-white/5 text-gray-400 px-1.5 py-0.2 rounded border border-gray-800"
                            >
                              #{tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Subtask Mini Progress */}
                      {subTasksCount > 0 && (
                        <div className="mb-2 p-1.5 bg-black/40 rounded border border-gray-800/60">
                          <div className="flex justify-between text-[9px] font-mono text-gray-400 mb-1">
                            <span>SUB-QUESTS</span>
                            <span>
                              {completedSubTasks}/{subTasksCount}
                            </span>
                          </div>
                          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-arcade-cyan transition-all duration-300"
                              style={{
                                width: `${Math.round((completedSubTasks / subTasksCount) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Footer: Quick Stage Shifter & Action Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-900 mt-2 text-[10px] font-mono">
                        {/* Shifters */}
                        <div className="flex items-center gap-1">
                          <button
                            title="Move Left"
                            disabled={idx === 0}
                            onClick={() => shiftStage(task.id, stage.id, -1)}
                            className="p-1 text-gray-500 hover:text-white disabled:opacity-20 disabled:hover:text-gray-500 hover:bg-white/5 rounded"
                          >
                            ◀
                          </button>
                          <button
                            title="Move Right"
                            disabled={idx === STAGES.length - 1}
                            onClick={() => shiftStage(task.id, stage.id, 1)}
                            className="p-1 text-gray-500 hover:text-white disabled:opacity-20 disabled:hover:text-gray-500 hover:bg-white/5 rounded"
                          >
                            ▶
                          </button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onInspectGrimoire(task)}
                            title="Inspect Grimoire Notes"
                            className="px-1.5 py-0.5 text-[9px] bg-purple-950/40 text-purple-300 hover:bg-purple-900/60 border border-purple-800/50 rounded"
                          >
                            GRIMOIRE
                          </button>
                          <button
                            onClick={() => onEdit(task)}
                            title="Reforge Quest"
                            className="p-1 text-gray-400 hover:text-arcade-gold rounded hover:bg-white/5"
                          >
                            ✏️
                          </button>
                          {task.status !== "COMPLETED" && (
                            <button
                              onClick={() => onComplete(task.id)}
                              title="Complete Quest & Claim XP"
                              className="px-1.5 py-0.5 text-[9px] bg-emerald-950/50 text-emerald-300 hover:bg-emerald-800/60 border border-emerald-700/50 rounded font-bold"
                            >
                              CLAIM ✔
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
