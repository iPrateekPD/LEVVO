"use client";

import React, { useState, useEffect } from "react";
import { CrtContainer } from "@/components/arcade/CrtContainer";
import { ArcadeMarquee } from "@/components/arcade/ArcadeMarquee";
import { PlayerCard } from "@/components/dashboard/PlayerCard";
import { QuickStatsRow } from "@/components/dashboard/QuickStatsRow";
import { QuestList } from "@/components/quests/QuestList";
import { PredefinedTrackers } from "@/components/dashboard/PredefinedTrackers";
import { ArcadeTimer } from "@/components/dashboard/ArcadeTimer";
import { JourneyProgress } from "@/components/dashboard/JourneyProgress";
import { QuickMilestone } from "@/components/dashboard/QuickMilestone";
import { CreateQuestModal } from "@/components/modals/CreateQuestModal";
import { EditQuestModal } from "@/components/modals/EditQuestModal";
import { AiCampaignModal } from "@/components/modals/AiCampaignModal";
import { LevelUpCelebration } from "@/components/modals/LevelUpCelebration";
import { ArcadeAuthModal } from "@/components/auth/ArcadeAuthModal";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { TaskItem } from "@/components/quests/QuestCard";
import { sounds } from "@/lib/sound";

export default function ArcadeDashboard() {
  const [character, setCharacter] = useState<any>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [trackerCounts, setTrackerCounts] = useState<Record<string, number>>({});
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; username: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Display Settings
  const [scanlines, setScanlines] = useState(true);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ isOpen: boolean; newLevel: number }>({
    isOpen: false,
    newLevel: 1,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Initial Load from Database
  useEffect(() => {
    initApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const [charRes, tasksRes, trackersRes] = await Promise.all([
        fetch("/api/v1/character"),
        fetch("/api/v1/tasks"),
        fetch("/api/v1/trackers"),
      ]);

      const [charData, tasksData, trackersData] = await Promise.all([
        charRes.json(),
        tasksRes.json(),
        trackersRes.json(),
      ]);

      if (charData.success) {
        setCharacter(charData.data);
        if (charData.data.needsOnboarding) {
          setIsOnboardingOpen(true);
        }
      }
      if (tasksData.success) setTasks(tasksData.data);
      if (trackersData.success && trackersData.data) {
        setTrackerCounts(trackersData.data);
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

        if (data.data.spawnedRecurringTask) {
          setTasks((prev) => [data.data.spawnedRecurringTask, ...prev]);
        }

        if (data.data.dailyCapMessage) {
          showToast(data.data.dailyCapMessage);
        } else if (data.data.unlockedAchievement) {
          showToast(`🏆 Achievement Unlocked: ${data.data.unlockedAchievement}!`);
        } else if (data.data.boostActive && !character?.isBoostActive) {
          showToast("⚡ +50% XP Boost Active for the rest of today!");
        }

        if (character) {
          const newLevel = data.data.newLevel;
          if (data.data.didLevelUp) {
            setLevelUpData({ isOpen: true, newLevel });
          }

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

  // Quick Add Quest from Suggestions
  const handleQuickAddQuest = async (quest: {
    title: string;
    description: string;
    attributeCode: string;
    difficulty: string;
  }) => {
    try {
      const res = await fetch("/api/v1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quest),
      });
      const data = await res.json();
      if (data.success) {
        sounds.playLevelUp();
        setTasks((prev) => [data.data, ...prev]);
        showToast(`⚔️ Added new quest: ${quest.title}`);
      }
    } catch (err) {
      console.error("Failed to quick add quest:", err);
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

  // Quick Milestone: Log a quick win
  const handleLogQuickWin = async (title: string, difficulty: "Trivial" | "Easy" | "Medium") => {
    try {
      const res = await fetch("/api/v1/tasks/quick-milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, difficulty }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) => [data.data.task, ...prev]);
        showToast(`💥 Quick Win: +${data.data.awardedXp} XP / +${data.data.awardedGold} GP`);
        if (data.data.didLevelUp) {
          setLevelUpData({ isOpen: true, newLevel: data.data.newLevel });
        }
        const refreshedChar = await fetch("/api/v1/character").then((r) => r.json());
        if (refreshedChar.success) setCharacter(refreshedChar.data);
      }
    } catch (err) {
      console.error("Failed to log quick win:", err);
    }
  };

  // Focus Timer Session Complete
  const handleTimerComplete = async (taskTitle: string, minutes: number) => {
    try {
      const awardedXp = Math.min(60, minutes);
      showToast(`⏱️ Focus Sprint Complete! +${awardedXp} XP banked.`);
      const refreshedChar = await fetch("/api/v1/character").then((r) => r.json());
      if (refreshedChar.success) {
        if (refreshedChar.data.currentLevel > character.currentLevel) {
          setLevelUpData({ isOpen: true, newLevel: refreshedChar.data.currentLevel });
        }
        setCharacter(refreshedChar.data);
      }
    } catch (err) {
      console.error("Failed to update character after timer session:", err);
    }
  };

  // Tracker Increment (+10 XP, +5 GP with 1-hr anti-farm throttle)
  const handleIncrementTracker = async (key: string) => {
    try {
      const res = await fetch("/api/v1/trackers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackerKey: key, delta: 1 }),
      });
      const data = await res.json();
      if (data.success) {
        setTrackerCounts((prev) => ({
          ...prev,
          [key]: data.data.log.count,
        }));

        if (data.data.throttled) {
          showToast(`⚡ Micro-step saved! (${key.toUpperCase()} XP capped to 1x/hr to prevent farming)`);
        } else if (data.data.awardedXp > 0) {
          showToast(`💧 Tracker: +${data.data.awardedXp} XP / +${data.data.awardedGold} GP for ${key.toUpperCase()}!`);
        }

        const refreshedChar = await fetch("/api/v1/character").then((r) => r.json());
        if (refreshedChar.success) setCharacter(refreshedChar.data);
      }
    } catch (err) {
      console.error("Failed to increment tracker:", err);
    }
  };

  // Tracker Decrement
  const handleDecrementTracker = async (key: string) => {
    try {
      const res = await fetch("/api/v1/trackers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackerKey: key, delta: -1 }),
      });
      const data = await res.json();
      if (data.success) {
        setTrackerCounts((prev) => ({
          ...prev,
          [key]: data.data.log.count,
        }));
      }
    } catch (err) {
      console.error("Failed to decrement tracker:", err);
    }
  };

  if (loading || !character) {
    return (
      <div className="min-h-screen bg-arcadeBlack flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-synthMagenta border-t-transparent rounded-full animate-spin" />
          <span className="font-arcade text-xs text-neonCyan neon-glow-cyan animate-pulse">
            LOADING QUESTORIA ARCADE HUD...
          </span>
        </div>
      </div>
    );
  }

  const completedTasksCount = tasks.filter((t) => t.status === "COMPLETED").length;

  return (
    <CrtContainer scanlines={scanlines}>
      {/* 1. Header Marquee */}
      <ArcadeMarquee
        scanlines={scanlines}
        onToggleScanlines={() => setScanlines(!scanlines)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Single-Page Scrollable Layout */}
      <main className="w-full flex-1 max-w-4xl mx-auto flex flex-col gap-5 sm:gap-6">
        {/* 2. Player Card: avatar, LVL, XP bar, Gold, Streak */}
        <PlayerCard
          username={character.username}
          title={character.title}
          level={character.currentLevel}
          currentLevelXp={character.currentLevelXp}
          xpToNextLevel={character.xpToNextLevel}
          progressPercent={character.progressPercent}
          gold={character.gold}
          streak={character.streakCurrent}
          streakPaused={character.streakPaused}
          avatarId={character.avatarId}
          ageGroup={character.ageGroup}
        />

        {/* 3. Quick Stats Row */}
        <QuickStatsRow
          momentum={character.momentumScore}
          currentAp={character.currentAp ?? 100}
          maxAp={character.maxAp ?? 100}
          completedTasksCount={completedTasksCount}
          totalXp={character.totalXp}
        />

        {/* 4. Today's Quests */}
        <div className="bg-cabinetSurface/90 border-2 border-cabinetBorder rounded-xl p-4 sm:p-5 shadow-lg">
          <QuestList
            tasks={tasks}
            onComplete={handleCompleteTask}
            onDelete={handleDeleteTask}
            onEdit={(task) => setEditingTask(task)}
            onOpenCreateModal={() => setIsCreateOpen(true)}
            onOpenAiModal={() => setIsAiOpen(true)}
            onQuickAddQuest={handleQuickAddQuest}
          />
        </div>

        {/* 5. Predefined Trackers */}
        <PredefinedTrackers
          trackers={[
            { key: "water", label: "Water", icon: "💧", count: trackerCounts["water"] ?? 0, target: 8, unit: "glasses" },
            { key: "gym", label: "Gym Workout", icon: "🏋️", count: trackerCounts["gym"] ?? 0, target: 1, unit: "session" },
            { key: "cycling", label: "Cycling", icon: "🚴", count: trackerCounts["cycling"] ?? 0, target: 1, unit: "ride" },
            { key: "reading", label: "Reading", icon: "📖", count: trackerCounts["reading"] ?? 0, target: 20, unit: "pages" },
            { key: "meditation", label: "Meditation", icon: "🧘", count: trackerCounts["meditation"] ?? 0, target: 10, unit: "mins" },
          ]}
          onIncrementTracker={handleIncrementTracker}
          onDecrementTracker={handleDecrementTracker}
        />

        {/* 6. Focus Chamber Timer */}
        <ArcadeTimer tasks={tasks} onSessionComplete={handleTimerComplete} />

        {/* 7. Hero Journey / Progress */}
        <JourneyProgress
          currentLevel={character.currentLevel}
          totalXp={character.totalXp}
          totalCompletedQuests={completedTasksCount}
          streakCurrent={character.streakCurrent}
          streakLongest={character.streakLongest}
        />

        {/* 8. Quick Milestone: Log a quick win */}
        <QuickMilestone onLogWin={handleLogQuickWin} />
      </main>

      {/* Bottom Arcade Status Bar */}
      <footer className="w-full max-w-4xl mx-auto mt-8 pt-4 border-t border-cabinetBorder/60 flex flex-col sm:flex-row items-center justify-between text-[10px] font-arcade text-textSecondary gap-2">
        <div className="flex items-center gap-2">
          <span className="text-arcadeGold">★</span>
          <span>QUESTORIA | YOUR LIFE IS THE GAME</span>
          {currentUser ? (
            <span className="text-neonCyan">| HERO: {currentUser.username}</span>
          ) : (
            <span className="text-textMuted">| GUEST SESSION</span>
          )}
        </div>
        <div className="flex items-center gap-4">
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

      <AiCampaignModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        onCampaignAccepted={(newQuests) => setTasks((prev) => [...newQuests, ...prev])}
      />

      <LevelUpCelebration
        isOpen={levelUpData.isOpen}
        newLevel={levelUpData.newLevel}
        onClose={() => setLevelUpData({ isOpen: false, newLevel: 1 })}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={async ({ ageGroup, goals, seededTasks }) => {
          setIsOnboardingOpen(false);
          sounds.playLevelUp();
          showToast(`🌟 Welcome ${ageGroup} Hero! ${seededTasks.length} daily quests forged.`);
          if (seededTasks && seededTasks.length > 0) {
            setTasks((prev) => [...seededTasks, ...prev]);
          }
          const refreshedChar = await fetch("/api/v1/character").then((r) => r.json());
          if (refreshedChar.success) setCharacter(refreshedChar.data);
        }}
        onSkip={() => setIsOnboardingOpen(false)}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#120D24] border-2 border-neonCyan rounded-xl p-3.5 shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-2">
            <span className="font-arcade text-xs text-neonCyan">⚡</span>
            <span className="text-xs font-semibold text-textPrimary">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-textSecondary hover:text-white p-1 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded"
          >
            ✕
          </button>
        </div>
      )}
    </CrtContainer>
  );
}
