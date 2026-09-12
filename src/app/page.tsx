"use client";

import React, { useState, useEffect } from "react";
import { CrtContainer } from "@/components/arcade/CrtContainer";
import { ArcadeMarquee } from "@/components/arcade/ArcadeMarquee";
import { CharacterHUD } from "@/components/arcade/CharacterHUD";
import { QuestList } from "@/components/quests/QuestList";
import { BossBattleWidget, BossItem } from "@/components/bosses/BossBattleWidget";
import { CreateQuestModal } from "@/components/modals/CreateQuestModal";
import { EditQuestModal } from "@/components/modals/EditQuestModal";
import { AiCampaignModal } from "@/components/modals/AiCampaignModal";
import { RewardsShopModal } from "@/components/modals/RewardsShopModal";
import { LevelUpCelebration } from "@/components/modals/LevelUpCelebration";
import { ArcadeAuthModal } from "@/components/auth/ArcadeAuthModal";
import { TaskItem } from "@/components/quests/QuestCard";
import { ViewSwitcher, ViewMode } from "@/components/views/ViewSwitcher";
import { KanbanBoard } from "@/components/views/KanbanBoard";
import { TableMatrixView } from "@/components/views/TableMatrixView";
import { HabitHeatmap } from "@/components/views/HabitHeatmap";
import { GuildRaidWidget } from "@/components/views/GuildRaidWidget";
import { QuestGrimoireModal } from "@/components/modals/QuestGrimoireModal";
import { sounds } from "@/lib/sound";

export default function ArcadeDashboard() {
  const [character, setCharacter] = useState<any>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [boss, setBoss] = useState<BossItem | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; username: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // View Engine State
  const [currentView, setCurrentView] = useState<ViewMode>("list");

  // Display Settings
  const [scanlines, setScanlines] = useState(true);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [grimoireTask, setGrimoireTask] = useState<any | null>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ isOpen: boolean; newLevel: number }>({
    isOpen: false,
    newLevel: 1,
  });

  // Initial Load from Database
  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    await checkAuth();
    await loadAllData();
  };

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/v1/auth/me");
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  };

  const loadAllData = async () => {
    try {
      const [charRes, tasksRes, bossRes] = await Promise.all([
        fetch("/api/v1/character"),
        fetch("/api/v1/tasks"),
        fetch("/api/v1/bosses"),
      ]);

      const [charData, tasksData, bossData] = await Promise.all([
        charRes.json(),
        tasksRes.json(),
        bossRes.json(),
      ]);

      if (charData.success) setCharacter(charData.data);
      if (tasksData.success) setTasks(tasksData.data);
      if (bossData.success && bossData.data.length > 0) {
        setBoss(bossData.data[0]);
      } else {
        setBoss(null);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    sounds.playClick();
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      setCurrentUser(null);
      await loadAllData();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleAuthenticated = async (user: { id: string; email: string; username: string }) => {
    setCurrentUser(user);
    setLoading(true);
    await loadAllData();
  };

  // Complete a Task authoritatively
  const handleCompleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/v1/tasks/${taskId}/complete`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        // Update local tasks
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: "COMPLETED" } : t))
        );

        // Update character stats
        if (character) {
          const newLevel = data.data.newLevel;

          // Check Level Up!
          if (data.data.didLevelUp) {
            setLevelUpData({ isOpen: true, newLevel });
          }

          // Reload fresh character sheet from database
          const refreshedChar = await fetch("/api/v1/character").then((r) => r.json());
          if (refreshedChar.success) {
            setCharacter(refreshedChar.data);
          }
        }
      }
    } catch (err) {
      console.error("Complete task error:", err);
    }
  };

  // Delete a Task
  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/v1/tasks/${taskId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      }
    } catch (err) {
      console.error("Delete task error:", err);
    }
  };

  // Complete Boss Milestone
  const handleMilestoneComplete = async (bossId: string, milestoneId: string) => {
    try {
      const res = await fetch(`/api/v1/bosses/${bossId}/milestones/${milestoneId}/complete`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        setBoss(data.data.boss);
        // If defeated, refresh character for victory loot
        if (data.data.isDefeated) {
          const refreshedChar = await fetch("/api/v1/character").then((r) => r.json());
          if (refreshedChar.success) {
            setCharacter(refreshedChar.data);
          }
        }
      }
    } catch (err) {
      console.error("Milestone error:", err);
    }
  };

  // Shift task stage in Kanban/Table
  const handleStageChange = async (taskId: string, newStage: string) => {
    try {
      const res = await fetch(`/api/v1/tasks/${taskId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  stage: newStage,
                  status: newStage === "DONE" ? "COMPLETED" : "ACTIVE",
                }
              : t
          )
        );
        if (newStage === "DONE") {
          const refreshedChar = await fetch("/api/v1/character").then((r) => r.json());
          if (refreshedChar.success) setCharacter(refreshedChar.data);
        }
      }
    } catch (err) {
      console.error("Failed to change stage:", err);
    }
  };

  if (loading || !character) {
    return (
      <div className="min-h-screen bg-arcadeBlack flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-synthMagenta border-t-transparent rounded-full animate-spin" />
          <span className="font-arcade text-xs text-neonCyan neon-glow-cyan animate-pulse">
            LOADING LIFE-RPG ARCADE HUD...
          </span>
        </div>
      </div>
    );
  }

  return (
    <CrtContainer scanlines={scanlines}>
      {/* Top Illuminated Marquee Header */}
      <ArcadeMarquee
        scanlines={scanlines}
        onToggleScanlines={() => setScanlines(!scanlines)}
        onOpenShop={() => setIsShopOpen(true)}
        onOpenAiModal={() => setIsAiOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Responsive Grid Layout */}
      <main className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column: Character Sheet & Attributes HUD (4 Cols on Desktop) */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          <CharacterHUD
            username={character.username}
            title={character.title}
            level={character.currentLevel}
            currentLevelXp={character.currentLevelXp}
            xpToNextLevel={character.xpToNextLevel}
            progressPercent={character.progressPercent}
            gold={character.gold}
            currentAp={character.currentAp ?? 100}
            maxAp={character.maxAp ?? 100}
            streak={character.streakCurrent}
            momentum={character.momentumScore}
            attributes={character.attributes}
          />
        </section>

        {/* Center & Right Column: Quests Stream, Multi-Views & Boss Battles (8 Cols on Desktop) */}
        <section className="lg:col-span-8 flex flex-col gap-4 sm:gap-6">
          {/* Real-Life Boss Battle Widget */}
          <BossBattleWidget
            boss={boss}
            onMilestoneComplete={handleMilestoneComplete}
          />

          {/* Notion-Style View Switcher Bar */}
          <ViewSwitcher
            currentView={currentView}
            onViewChange={(v) => setCurrentView(v)}
            taskCount={tasks.length}
          />

          {/* Dynamic View Engine */}
          {currentView === "list" && (
            <div className="bg-cabinetSurface/90 border-2 border-cabinetBorder rounded-xl p-4 shadow-lg">
              <QuestList
                tasks={tasks}
                onComplete={handleCompleteTask}
                onDelete={handleDeleteTask}
                onEdit={(task) => setEditingTask(task)}
                onOpenCreateModal={() => setIsCreateOpen(true)}
              />
            </div>
          )}

          {currentView === "kanban" && (
            <KanbanBoard
              tasks={tasks as any}
              onStageChange={handleStageChange}
              onInspectGrimoire={(task) => setGrimoireTask(task)}
              onEdit={(task) => setEditingTask(task as any)}
              onComplete={handleCompleteTask}
            />
          )}

          {currentView === "table" && (
            <TableMatrixView
              tasks={tasks as any}
              onStageChange={handleStageChange}
              onInspectGrimoire={(task) => setGrimoireTask(task)}
              onEdit={(task) => setEditingTask(task as any)}
              onDelete={handleDeleteTask}
              onComplete={handleCompleteTask}
            />
          )}

          {currentView === "heatmap" && (
            <HabitHeatmap
              onAddHabitXp={async () => {
                const refreshedChar = await fetch("/api/v1/character").then((r) => r.json());
                if (refreshedChar.success) setCharacter(refreshedChar.data);
              }}
            />
          )}

          {currentView === "guild" && (
            <GuildRaidWidget />
          )}
        </section>
      </main>

      {/* Bottom Arcade Status Bar */}
      <footer className="w-full mt-6 pt-3 border-t border-cabinetBorder/60 flex flex-col sm:flex-row items-center justify-between text-[10px] font-arcade text-textSecondary gap-2">
        <div className="flex items-center gap-2">
          <span className="text-arcadeGold">★</span>
          <span>YOUR LIFE IS THE GAME</span>
          {currentUser ? (
            <span className="text-neonCyan">| HERO: {currentUser.username}</span>
          ) : (
            <span className="text-textMuted">| GUEST SESSION</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>SERVER AUTHORITATIVE ENGINE ACTIVE</span>
          <span className="text-phosphorGreen">DATABASE PERSISTENCE: ON</span>
        </div>
      </footer>

      {/* Modals */}
      <ArcadeAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticated={handleAuthenticated}
      />

      <CreateQuestModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onTaskCreated={(newTask) => setTasks((prev) => [newTask, ...prev])}
      />

      <EditQuestModal
        isOpen={!!editingTask}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onTaskUpdated={(updatedTask) => {
          setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
        }}
      />

      {grimoireTask && (
        <QuestGrimoireModal
          task={grimoireTask}
          isOpen={!!grimoireTask}
          onClose={() => setGrimoireTask(null)}
          onRefresh={async () => {
            await loadAllData();
          }}
        />
      )}

      <AiCampaignModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        onCampaignAccepted={(newQuests) => setTasks((prev) => [...newQuests, ...prev])}
      />

      <RewardsShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        gold={character.gold}
        onGoldUpdated={(newGold) => setCharacter((prev: any) => ({ ...prev, gold: newGold }))}
      />

      <LevelUpCelebration
        isOpen={levelUpData.isOpen}
        newLevel={levelUpData.newLevel}
        onClose={() => setLevelUpData({ isOpen: false, newLevel: 1 })}
      />
    </CrtContainer>
  );
}
