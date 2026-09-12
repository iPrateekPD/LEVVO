"use client";

import React, { useState, useEffect } from "react";
import { CrtContainer } from "@/components/arcade/CrtContainer";
import { ArcadeMarquee } from "@/components/arcade/ArcadeMarquee";
import { CharacterHUD } from "@/components/arcade/CharacterHUD";
import { QuestList } from "@/components/quests/QuestList";
import { BossBattleWidget, BossItem } from "@/components/bosses/BossBattleWidget";
import { CreateQuestModal } from "@/components/modals/CreateQuestModal";
import { AiCampaignModal } from "@/components/modals/AiCampaignModal";
import { RewardsShopModal } from "@/components/modals/RewardsShopModal";
import { LevelUpCelebration } from "@/components/modals/LevelUpCelebration";
import { TaskItem } from "@/components/quests/QuestCard";

export default function ArcadeDashboard() {
  const [character, setCharacter] = useState<any>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [boss, setBoss] = useState<BossItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Display Settings
  const [scanlines, setScanlines] = useState(true);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ isOpen: boolean; newLevel: number }>({
    isOpen: false,
    newLevel: 1,
  });

  // Initial Load from Database
  useEffect(() => {
    loadAllData();
  }, []);

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
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
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
          const newTotalXp = data.data.totalXp;
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
            streak={character.streakCurrent}
            momentum={character.momentumScore}
            attributes={character.attributes}
          />
        </section>

        {/* Center & Right Column: Quests Stream & Boss Battles (8 Cols on Desktop) */}
        <section className="lg:col-span-8 flex flex-col gap-4 sm:gap-6">
          {/* Real-Life Boss Battle Widget */}
          <BossBattleWidget
            boss={boss}
            onMilestoneComplete={handleMilestoneComplete}
          />

          {/* Daily Quests Queue */}
          <div className="bg-cabinetSurface/90 border-2 border-cabinetBorder rounded-xl p-4 shadow-lg">
            <QuestList
              tasks={tasks}
              onComplete={handleCompleteTask}
              onDelete={handleDeleteTask}
              onOpenCreateModal={() => setIsCreateOpen(true)}
            />
          </div>
        </section>
      </main>

      {/* Bottom Arcade Status Bar */}
      <footer className="w-full mt-6 pt-3 border-t border-cabinetBorder/60 flex flex-col sm:flex-row items-center justify-between text-[10px] font-arcade text-textSecondary gap-2">
        <div className="flex items-center gap-2">
          <span className="text-arcadeGold">★</span>
          <span>YOUR LIFE IS THE GAME</span>
        </div>
        <div className="flex items-center gap-4">
          <span>SERVER AUTHORITATIVE ENGINE ACTIVE</span>
          <span className="text-phosphorGreen">DATABASE PERSISTENCE: ON</span>
        </div>
      </footer>

      {/* Modals */}
      <CreateQuestModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onTaskCreated={(newTask) => setTasks((prev) => [newTask, ...prev])}
      />

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
