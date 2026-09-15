"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  CheckCircle2,
  Target,
  Clock,
  BarChart3,
  User,
  Search,
  Bell,
  Plus,
  Flame,
  Coins,
  Sparkles,
  ChevronRight,
  Check,
  Laptop,
  Code,
  Gamepad2,
  ArrowRight,
  Menu,
  X,
  ExternalLink,
  Shield,
  Zap,
  Trash2,
  Edit3,
  Sun,
  Moon,
  Sunset,
  Award,
  Play,
  Share2,
  Volume2,
  VolumeX,
  Music,
  Send,
  Wand2,
  Trophy,
  Swords,
  Package,
  Heart,
  Crown,
  Sword,
  LogOut,
} from "lucide-react";
import confetti from "canvas-confetti";
import { sounds } from "@/lib/sound";
import { lofiMusic } from "@/lib/lofiSynthesizer";
import { TaskItem } from "@/components/quests/QuestCard";
import { ArcadeTimer } from "./ArcadeTimer";
import { RetroArcadeZone } from "./RetroArcadeZone";
import { PredefinedTrackers } from "./PredefinedTrackers";
import { JourneyProgress } from "./JourneyProgress";
import { QuickMilestone } from "./QuickMilestone";
import { DailyBossCard } from "./DailyBossCard";
import { WeeklyMomentumCard } from "./WeeklyMomentumCard";
import { OGArcaneRelicsCard } from "./OGArcaneRelicsCard";
import { FloatingParticles, FloatingParticleItem } from "./FloatingParticles";
import { CharacterBuffsBar } from "./CharacterBuffsBar";
import { SocialLeaderboard } from "./SocialLeaderboard";
import { PartyRaidSection } from "./PartyRaidSection";
import { AiPlanMyDayModal } from "../modals/AiPlanMyDayModal";
import { QuestFocusModal } from "../modals/QuestFocusModal";
import { RoutinePacksModal, RoutineQuest } from "../modals/RoutinePacksModal";
import { ShareVictoryCardModal } from "../modals/ShareVictoryCardModal";
import { AmbientCursorGlow } from "@/components/animations/AmbientCursorGlow";
import { MagneticWrapper } from "@/components/animations/MagneticWrapper";
import { TiltCard } from "@/components/animations/TiltCard";
import { useParallaxBackground } from "@/components/animations/useParallaxBackground";
import { QuestSlashEffect } from "@/components/animations/QuestSlashEffect";

interface ModernAppDashboardProps {
  currentUser: { id: string; email: string; username: string };
  character: any;
  tasks: TaskItem[];
  trackerCounts: Record<string, number>;
  onCompleteTask: (taskId: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onEditTask: (task: TaskItem) => void;
  onOpenCreateQuest: () => void;
  onOpenAiOracle: () => void;
  onIncrementTracker: (key: string) => Promise<void>;
  onDecrementTracker: (key: string) => Promise<void>;
  onTimerComplete: (title: string, minutes: number) => Promise<void>;
  onLogQuickWin: (title: string, difficulty: "Trivial" | "Easy" | "Medium") => Promise<void>;
  onQuickCreateTask?: (taskData: { title: string; attributeCode: string; difficulty: string; xpReward: number }) => Promise<void>;
  onBatchCreateTasks?: (quests: any[]) => Promise<void>;
  onLogout: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function ModernAppDashboard({
  currentUser,
  character,
  tasks,
  trackerCounts,
  onCompleteTask,
  onDeleteTask,
  onEditTask,
  onOpenCreateQuest,
  onOpenAiOracle,
  onIncrementTracker,
  onDecrementTracker,
  onTimerComplete,
  onLogQuickWin,
  onQuickCreateTask,
  onBatchCreateTasks,
  onLogout,
  onRefresh,
}: ModernAppDashboardProps) {
  // Active Sidebar Nav Tab
  const [activeTab, setActiveTab] = useState<
    "HOME" | "TODAY" | "GOALS" | "FOCUS" | "PROGRESS" | "ARCADE" | "LEADERBOARD" | "GUILD" | "PROFILE"
  >("HOME");
  const [searchQuery, setSearchQuery] = useState("");
  const [taskFilter, setTaskFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const sidebarRef = useRef<HTMLElement>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  // Auto-focus search input when opened
  useEffect(() => {
    if (searchFocused) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [searchFocused]);

  // Handle outside clicks and ESC key to close notifications
  useEffect(() => {
    if (!notificationsOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setNotificationsOpen(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick, { passive: true });
      document.addEventListener("keydown", handleKeyDown);
    }, 20);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [notificationsOpen]);

  // Auto-collapse mobile sidebar when touching anywhere outside or pressing Escape
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleTouchOrClickOutside = (e: MouseEvent | TouchEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleTouchOrClickOutside);
    document.addEventListener("touchstart", handleTouchOrClickOutside, { passive: true });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleTouchOrClickOutside);
      document.removeEventListener("touchstart", handleTouchOrClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Floating Particles State
  const [particles, setParticles] = useState<FloatingParticleItem[]>([]);

  // Modals State
  const [isAiPlanOpen, setIsAiPlanOpen] = useState(false);
  const [isRoutinePacksOpen, setIsRoutinePacksOpen] = useState(false);
  const [isShareVictoryOpen, setIsShareVictoryOpen] = useState(false);
  const [focusModalTask, setFocusModalTask] = useState<TaskItem | null>(null);
  const [lastCompletedTaskId, setLastCompletedTaskId] = useState<string | null>(null);

  // Mouse Parallax for Cinematic Dashboard Hero
  const dashboardHeroBgRef = useRef<HTMLDivElement>(null);
  useParallaxBackground(dashboardHeroBgRef, { depth: 25 });

  // Instant Quick-Capture Task Bar State
  const [quickTitle, setQuickTitle] = useState("");
  const [quickAttr, setQuickAttr] = useState<"INT" | "STR" | "WIS" | "DEX">("INT");
  const [isQuickSubmitting, setIsQuickSubmitting] = useState(false);

  // Lo-Fi Ambient Synthesizer Music State
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicTrackName, setMusicTrackName] = useState("Cosmic Lo-Fi");

  useEffect(() => {
    if (lofiMusic) {
      const unsub = lofiMusic.subscribe((playing: boolean, track: string) => {
        setIsMusicPlaying(playing);
        setMusicTrackName(track);
      });
      return () => unsub();
    }
  }, []);

  // Time-aware greeting & icon
  const timeContext = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { greeting: "Good morning", icon: Sun, label: "Morning Sprint" };
    }
    if (hour >= 12 && hour < 17) {
      return { greeting: "Good afternoon", icon: Sunset, label: "Midday Momentum" };
    }
    return { greeting: "Good evening", icon: Moon, label: "Night Wind-down" };
  }, []);

  // Today's Date formatted
  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    }).format(new Date());
  }, []);

  // Konami Code Easter Egg State
  const [isKonamiUnlocked, setIsKonamiUnlocked] = useState(false);
  const [isKonamiModalOpen, setIsKonamiModalOpen] = useState(false);
  const konamiSequenceRef = useRef<string[]>([]);
  const KONAMI_CODE = useMemo(
    () => [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ],
    []
  );

  const triggerKonamiEasterEgg = () => {
    sounds.playLevelUp();
    sounds.playCoin();
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
    });
    setIsKonamiUnlocked(true);
    setIsKonamiModalOpen(true);
  };

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Player Goals for Global Search & Right Rail
  const playerGoals = useMemo(
    () => [
      { id: "g1", title: "Final Year Project", progress: 60, category: "INT", icon: Laptop },
      { id: "g2", title: "Learn React & DSA", progress: 45, category: "INT", icon: Code },
      { id: "g3", title: "30-Day Fitness & Strength", progress: 70, category: "STR", icon: Flame },
      { id: "g4", title: "Daily Deep Work Focus", progress: 85, category: "WIS", icon: Sparkles },
    ],
    []
  );

  // Quick navigation shortcuts for search dropdown
  const quickActions = useMemo(
    () => [
      { id: "act-today", title: "Active Quests Hub", icon: Target, tab: "TODAY" },
      { id: "act-boss", title: "Battle Procrastination Boss", icon: Swords, tab: "HOME" },
      { id: "act-focus", title: "Arcade Focus Timer", icon: Clock, tab: "FOCUS" },
      { id: "act-arcade", title: "90's Retro Arcade Zone", icon: Gamepad2, tab: "ARCADE" },
      { id: "act-legends", title: "Hall of Legends", icon: Trophy, tab: "LEADERBOARD" },
      { id: "act-ai", title: "Ask AI Strategy Coach", icon: Wand2, modal: "AI" },
      { id: "act-bgm", title: "Toggle Lo-Fi Synthwave BGM", icon: Music, action: "BGM" },
    ],
    []
  );

  // Filtered goals & actions for search dropdown
  const filteredGoals = useMemo(() => {
    if (!searchQuery.trim()) return playerGoals.slice(0, 2);
    const q = searchQuery.toLowerCase();
    return playerGoals.filter(
      (g) => g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q)
    );
  }, [searchQuery, playerGoals]);

  const filteredQuickActions = useMemo(() => {
    if (!searchQuery.trim()) return quickActions.slice(0, 4);
    const q = searchQuery.toLowerCase();
    return quickActions.filter((a) => a.title.toLowerCase().includes(q));
  }, [searchQuery, quickActions]);

  // Quests filtered for search dropdown
  const filteredQuestsForSearch = useMemo(() => {
    if (!searchQuery.trim()) return tasks.slice(0, 4);
    const q = searchQuery.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.attributeCode?.toLowerCase().includes(q)
    );
  }, [tasks, searchQuery]);

  const isEasterEggQuery = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return (
      q.includes("konami") ||
      q.includes("cheat") ||
      q.includes("zelda") ||
      q.includes("mario") ||
      q.includes("pokemon") ||
      q.includes("iddqd") ||
      q.includes("doom") ||
      q.includes("sonic")
    );
  }, [searchQuery]);

  const handleQuickCreateFromSearch = async (title: string) => {
    if (!title.trim() || isQuickSubmitting) return;
    setIsQuickSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          attributeCode: "INT",
          status: "ACTIVE",
          xpReward: 50,
          goldReward: 10,
        }),
      });
      if (res.ok) {
        sounds.playComplete();
        setSearchQuery("");
        setSearchFocused(false);
        onRefresh();
      }
    } catch {
      sounds.playError();
    } finally {
      setIsQuickSubmitting(false);
    }
  };

  // Keyboard shortcuts (⌘K for Search, N for New Quest, Konami code)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchFocused(true);
      }
      if (e.key === "Escape") {
        setSearchFocused(false);
        searchInputRef.current?.blur();
      }

      // Check Konami Code
      const key = e.key;
      konamiSequenceRef.current.push(key);
      if (konamiSequenceRef.current.length > KONAMI_CODE.length) {
        konamiSequenceRef.current.shift();
      }
      if (
        konamiSequenceRef.current.length === KONAMI_CODE.length &&
        konamiSequenceRef.current.every(
          (k, i) => k.toLowerCase() === KONAMI_CODE[i].toLowerCase()
        )
      ) {
        triggerKonamiEasterEgg();
        konamiSequenceRef.current = [];
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [KONAMI_CODE]);

  // Filter tasks based on search & active filter
  const filteredTasks = useMemo(() => {
    let list = tasks;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.attributeCode?.toLowerCase().includes(q)
      );
    }
    if (taskFilter === "ACTIVE") {
      list = list.filter((t) => t.status === "ACTIVE");
    } else if (taskFilter === "COMPLETED") {
      list = list.filter((t) => t.status === "COMPLETED");
    }
    return list;
  }, [tasks, searchQuery, taskFilter]);

  const activeTasks = useMemo(() => tasks.filter((t) => t.status === "ACTIVE"), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((t) => t.status === "COMPLETED"), [tasks]);

  const completionPercentage = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((completedTasks.length / tasks.length) * 100);
  }, [tasks, completedTasks]);

  // Handle Quick Quest Submission
  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || isQuickSubmitting) return;

    setIsQuickSubmitting(true);
    try {
      if (onQuickCreateTask) {
        await onQuickCreateTask({
          title: quickTitle.trim(),
          attributeCode: quickAttr,
          difficulty: "Medium",
          xpReward: 40,
        });
      } else {
        onOpenCreateQuest();
      }
      setQuickTitle("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsQuickSubmitting(false);
    }
  };

  // Trigger floating particle & complete task
  const handleTaskCheck = (e: React.MouseEvent, t: TaskItem) => {
    sounds.playClick();
    setLastCompletedTaskId(`${t.id}-${Date.now()}`);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;

    const isCrit = Math.random() < 0.2; // 20% critical hit chance!
    const xp = t.xpReward || 40;
    const particleText = isCrit ? `+${xp * 2} XP` : `+${xp} XP`;

    setParticles((prev) => [
      ...prev,
      {
        id: `${t.id}-${Date.now()}`,
        x,
        y,
        text: particleText,
        isCrit,
      },
    ]);

    onCompleteTask(t.id);
  };

  const navItems = [
    { id: "HOME", label: "Home", icon: Home },
    { id: "TODAY", label: "Today", icon: CheckCircle2, count: activeTasks.length },
    { id: "GOALS", label: "Goals", icon: Target },
    { id: "FOCUS", label: "Focus", icon: Clock },
    { id: "PROGRESS", label: "Progress", icon: BarChart3 },
    { id: "ARCADE", label: "Arcade", icon: Gamepad2 },
    { id: "LEADERBOARD", label: "Legends", icon: Trophy },
    { id: "GUILD", label: "Co-Op Raid", icon: Swords },
  ] as const;

  // Determine user display name & initials
  const displayName = character?.username || currentUser?.username || "Adventurer";
  const firstName = displayName.split(" ")[0];
  const initials = (firstName.slice(0, 2) || "LV").toUpperCase();

  // Category Styles
  const categoryStyles: Record<string, { label: string; bg: string; text: string; border: string }> = {
    INT: { label: "Learning", bg: "bg-purple-500/10", text: "text-purple-300", border: "border-purple-500/25" },
    STR: { label: "Health", bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/25" },
    WIS: { label: "Mindset", bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/25" },
    DEX: { label: "Focus", bg: "bg-cyan-500/10", text: "text-cyan-300", border: "border-cyan-500/25" },
    CRE: { label: "Creative", bg: "bg-rose-500/10", text: "text-rose-300", border: "border-rose-500/25" },
    CHA: { label: "Social", bg: "bg-blue-500/10", text: "text-blue-300", border: "border-blue-500/25" },
  };

  const TimeIcon = timeContext.icon;

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-[#070913] text-slate-100 flex flex-col md:flex-row relative selection:bg-cyan-500 selection:text-black font-sans w-full max-w-full overflow-x-hidden">
      {/* Ambient Mouse Cursor Follower Glow */}
      <AmbientCursorGlow />

      {/* Floating XP Particles System */}
      <FloatingParticles
        particles={particles}
        onRemove={(id) => setParticles((prev) => prev.filter((p) => p.id !== id))}
      />

      {/* AI Plan My Day Modal */}
      <AiPlanMyDayModal
        isOpen={isAiPlanOpen}
        onClose={() => setIsAiPlanOpen(false)}
        onAcceptQuests={async (quests) => {
          if (onBatchCreateTasks) {
            await onBatchCreateTasks(quests);
          }
        }}
      />

      {/* Curated Routine Packs Modal */}
      <RoutinePacksModal
        isOpen={isRoutinePacksOpen}
        onClose={() => setIsRoutinePacksOpen(false)}
        onEnrollPack={async (quests) => {
          if (onBatchCreateTasks) {
            await onBatchCreateTasks(quests);
          }
        }}
      />

      {/* Dedicated Quest Focus Sprint Chamber */}
      <QuestFocusModal
        isOpen={!!focusModalTask}
        task={focusModalTask}
        onClose={() => setFocusModalTask(null)}
        onCompleteQuest={async (taskId) => {
          await onCompleteTask(taskId);
          setFocusModalTask(null);
        }}
      />

      {/* Shareable Daily Victory Card */}
      <ShareVictoryCardModal
        isOpen={isShareVictoryOpen}
        onClose={() => setIsShareVictoryOpen(false)}
        characterName={firstName}
        level={character?.currentLevel || 1}
        xpEarnedToday={completedTasks.length * 50}
        questsCompletedToday={completedTasks.length}
        currentStreak={character?.streakCurrent || 1}
      />

      {/* 90'S RETRO KONAMI CODE 30-LIVES EASTER EGG MODAL */}
      {isKonamiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#141A35] to-[#0A0D1B] border-2 border-amber-400/80 rounded-2xl shadow-[0_0_50px_rgba(251,191,36,0.35)] p-6 flex flex-col items-center text-center gap-4">
            <button
              type="button"
              onClick={() => setIsKonamiModalOpen(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(251,191,36,0.4)] animate-bounce select-none">
              🕹️
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-arcade text-[10px] text-amber-300 tracking-widest leading-none">
                SECRET CHEAT ACTIVATED
              </span>
              <h2 className="font-arcade text-xl sm:text-2xl text-[#FFE600] neon-glow-gold tracking-widest mt-1">
                30 LIVES UNLOCKED!
              </h2>
              <p className="text-xs text-slate-300 max-w-sm mt-1 leading-relaxed">
                You entered the legendary Konami sequence: <span className="font-mono text-cyan-300 font-bold">↑ ↑ ↓ ↓ ← → ← → B A</span>. A true gamer from the golden arcade era!
              </p>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 py-1">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <div className="flex flex-col text-left">
                  <span className="font-extrabold text-sm text-white">+100 Gold</span>
                  <span className="text-[10px] text-slate-400">Bonus Loot</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <div className="flex flex-col text-left">
                  <span className="font-extrabold text-sm text-white">+250 XP</span>
                  <span className="text-[10px] text-slate-400">Arcade Boost</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playComplete();
                setIsKonamiModalOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-arcade text-xs tracking-wider font-black shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:scale-[1.02] active:scale-95 transition-all"
            >
              CLAIM 30 LIVES & RESUME
            </button>
          </div>
        </div>
      )}

      {/* GLOBAL SEARCH & COMMAND PALETTE MODAL (TOP-LEVEL FULL SCREEN) */}
      {searchFocused && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setSearchFocused(false)}
          />

          <div
            ref={searchContainerRef}
            className="relative w-full max-w-lg bg-[#0A0E1F]/95 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] p-4 z-10 flex flex-col gap-3 max-h-[80vh] overflow-y-auto animate-in zoom-in-95 duration-200"
          >
            {/* Search Input Bar inside Modal */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    if (filteredQuestsForSearch.length > 0) {
                      setActiveTab("HOME");
                      setSearchFocused(false);
                    } else {
                      handleQuickCreateFromSearch(searchQuery.trim());
                    }
                  }
                }}
                placeholder="Type a command or search quests..."
                className="w-full h-11 bg-[#12162B] border border-white/[0.12] focus:border-cyan-400/60 rounded-xl pl-9 pr-8 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <span className="absolute right-3 font-mono text-[10px] text-slate-400 bg-[#161B33] px-1.5 py-0.5 rounded border border-white/[0.08] pointer-events-none">
                  ESC
                </span>
              )}
            </div>

            {/* Secret Easter Egg Banner if query triggers it */}
            {isEasterEggQuery && (
              <button
                type="button"
                onClick={() => {
                  triggerKonamiEasterEgg();
                  setSearchFocused(false);
                }}
                className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 flex items-center justify-between hover:scale-[1.01] transition-transform text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🕹️</span>
                  <div>
                    <div className="font-arcade text-[10px] text-[#FFE600] tracking-wider">
                      90&apos;S CHEAT CODE DETECTED!
                    </div>
                    <div className="text-[10px] text-slate-300 font-mono">
                      Click to unlock 30 Lives & +250 XP
                    </div>
                  </div>
                </div>
                <span className="font-arcade text-[9px] px-2 py-0.5 rounded bg-amber-500/30 text-amber-200">
                  ACTIVATE
                </span>
              </button>
            )}

            {/* Quests Section */}
            <div>
              <div className="flex items-center justify-between px-1 pb-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <span>Quests ({filteredQuestsForSearch.length})</span>
                {searchQuery && (
                  <span className="text-cyan-400">Matching &ldquo;{searchQuery}&rdquo;</span>
                )}
              </div>
              {filteredQuestsForSearch.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {filteredQuestsForSearch.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => {
                        sounds.playClick();
                        setActiveTab("HOME");
                        setSearchFocused(false);
                      }}
                      className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] hover:border-cyan-500/30 flex items-center justify-between cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            task.status === "COMPLETED" ? "bg-emerald-400" : "bg-cyan-400"
                          }`}
                        />
                        <span className="text-xs text-white group-hover:text-cyan-300 truncate font-medium">
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/[0.06] text-slate-300">
                          {task.attributeCode || "INT"}
                        </span>
                        <span className="text-[10px] font-mono text-amber-400">
                          +{task.xpReward || 50} XP
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-slate-400 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                  No quests match &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </div>

            {/* Goals Section */}
            {filteredGoals.length > 0 && (
              <div>
                <div className="px-1 pb-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Goals ({filteredGoals.length})
                </div>
                <div className="flex flex-col gap-1">
                  {filteredGoals.map((goal) => {
                    const Icon = goal.icon;
                    return (
                      <div
                        key={goal.id}
                        onClick={() => {
                          sounds.playClick();
                          setActiveTab("GOALS");
                          setSearchFocused(false);
                        }}
                        className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] flex items-center justify-between cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span className="text-xs text-white group-hover:text-cyan-300 font-medium">
                            {goal.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">
                          {goal.progress}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Shortcuts & Navigation */}
            <div>
              <div className="px-1 pb-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Quick Shortcuts
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onOpenCreateQuest();
                    setSearchFocused(false);
                  }}
                  className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] text-left text-xs text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Create Quest</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab("FOCUS");
                    setSearchFocused(false);
                  }}
                  className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] text-left text-xs text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Focus Chamber</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab("ARCADE");
                    setSearchFocused(false);
                  }}
                  className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] text-left text-xs text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Arcade Zone</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onOpenAiOracle();
                    setSearchFocused(false);
                  }}
                  className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] text-left text-xs text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ask Oracle AI</span>
                </button>
              </div>
            </div>

            {/* Quick Add Quest Option if user is typing */}
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => handleQuickCreateFromSearch(searchQuery.trim())}
                className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 hover:border-cyan-400 flex items-center justify-between text-xs text-cyan-300 font-semibold transition-all group"
              >
                <div className="flex items-center gap-2 truncate">
                  <Plus className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">Add quest &ldquo;{searchQuery}&rdquo;</span>
                </div>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 shrink-0">
                  Enter ↵
                </span>
              </button>
            )}

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Press ESC to close</span>
              <span>⌘K to toggle</span>
            </div>
          </div>
        </div>
      )}

      {/* Subtle Atmospheric Ambient Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/4 -right-40 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-amber-500/05 rounded-full blur-[140px]" />
      </div>

      {/* ========================================================================= */}
      {/* 1. LEFT MODERN SIDEBAR (FIXED & CONSISTENT ON ALL VIEWS)                  */}
      {/* ========================================================================= */}
      {/* Full-screen Dark Backdrop on Mobile: Touching anywhere on dashboard collapses hamburger menu */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Close navigation menu"
        onClick={() => setMobileMenuOpen(false)}
        onTouchStart={() => setMobileMenuOpen(false)}
        className={`md:hidden fixed inset-0 bg-black/65 backdrop-blur-[2px] z-40 transition-opacity duration-300 ease-in-out ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        ref={sidebarRef}
        className={`bg-[#0A0D1B]/95 backdrop-blur-xl flex flex-col shrink-0 z-50 transition-all duration-300 ease-in-out overflow-hidden min-h-0 ${
          /* Mobile styles: fixed slide-over drawer constrained to dynamic viewport height */
          mobileMenuOpen
            ? "fixed inset-y-0 left-0 w-64 h-[100dvh] max-h-[100dvh] h-screen shadow-2xl translate-x-0 border-r border-white/[0.07]"
            : "fixed inset-y-0 left-0 w-64 h-[100dvh] max-h-[100dvh] h-screen -translate-x-full shadow-none border-r-0"
        } ${
          /* Desktop/Laptop styles: responsive collapsible sidebar */
          desktopSidebarOpen
            ? "md:relative md:inset-auto md:w-60 lg:w-64 md:translate-x-0 md:h-full md:max-h-full md:opacity-100 md:pointer-events-auto md:border-r md:border-white/[0.07]"
            : "md:relative md:inset-auto md:w-0 md:translate-x-0 md:h-full md:max-h-full md:opacity-0 md:pointer-events-none md:border-r-0"
        }`}
      >
        <div className="w-60 lg:w-64 h-full flex flex-col shrink-0 min-h-0">
          {/* Brand Header */}
          <div className="h-14 sm:h-16 px-4 flex items-center border-b border-white/[0.07] shrink-0">
            <Link
              href="/"
              onClick={() => {
                sounds.playClick();
                setActiveTab("HOME");
              }}
              className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-xl"
            >
              <Image
                src="/logo.png"
                alt="LEVVO Logo"
                width={32}
                height={32}
                className="w-8 h-8 object-contain drop-shadow-[0_0_12px_rgba(251,191,36,0.5)] group-hover:scale-105 transition-transform shrink-0"
                priority
              />
              <div className="flex flex-col">
                <span className="font-arcade text-base text-[#FFE600] neon-glow-gold tracking-widest font-black leading-none group-hover:scale-105 transition-transform">
                  LEVVO
                </span>
                <span className="font-arcade text-[8px] text-gray-300 tracking-wider mt-1 leading-none whitespace-nowrap">
                  SMALL STEPS. EPIC YOU.
                </span>
              </div>
            </Link>
          </div>

        {/* Scrollable Navigation & Quick Actions Area */}
        <div className="flex-1 px-3 py-3 flex flex-col gap-3 overflow-y-auto min-h-0">
          {/* Main Navigation Links */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab(item.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs flex items-center justify-between transition-all group ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/15 via-purple-500/10 to-transparent text-cyan-300 font-semibold border-l-2 border-cyan-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {"count" in item && item.count !== undefined && item.count > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition-colors ${
                        isActive
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          : "bg-white/[0.06] text-slate-300 border border-white/[0.08]"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Actions (Brought directly into the left section for easy 1-click access across all tabs) */}
          <div className="pt-2 border-t border-white/[0.06] flex flex-col gap-2">
            <div className="flex items-center gap-1.5 px-2 text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Actions</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 px-0.5">
              {/* New Task */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setMobileMenuOpen(false);
                  onOpenCreateQuest();
                }}
                className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-cyan-500/40 flex flex-col items-center justify-center gap-1 text-center transition-all group shadow-sm hover:scale-[1.02]"
                title="Create a new task"
              >
                <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-medium text-slate-300">New Task</span>
              </button>

              {/* Focus Mode */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setMobileMenuOpen(false);
                  setActiveTab("FOCUS");
                }}
                className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-purple-500/40 flex flex-col items-center justify-center gap-1 text-center transition-all group shadow-sm hover:scale-[1.02]"
                title="Enter Focus Mode"
              >
                <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-medium text-slate-300">Focus Mode</span>
              </button>

              {/* Ask AI */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setMobileMenuOpen(false);
                  onOpenAiOracle();
                }}
                className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-amber-500/40 flex flex-col items-center justify-center gap-1 text-center transition-all group shadow-sm hover:scale-[1.02]"
                title="Consult AI Oracle"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-medium text-slate-300">Ask AI</span>
              </button>

              {/* Progress */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setMobileMenuOpen(false);
                  setActiveTab("PROGRESS");
                }}
                className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-emerald-500/40 flex flex-col items-center justify-center gap-1 text-center transition-all group shadow-sm hover:scale-[1.02]"
                title="View Progress"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-medium text-slate-300">Progress</span>
              </button>

              {/* Legends */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setMobileMenuOpen(false);
                  setActiveTab("LEADERBOARD");
                }}
                className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-amber-500/40 flex flex-col items-center justify-center gap-1 text-center transition-all group shadow-sm hover:scale-[1.02]"
                title="Arcade Hall of Legends"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Trophy className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-medium text-slate-300">Legends</span>
              </button>

              {/* Co-Op Raid */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setMobileMenuOpen(false);
                  setActiveTab("GUILD");
                }}
                className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-rose-500/40 flex flex-col items-center justify-center gap-1 text-center transition-all group shadow-sm hover:scale-[1.02]"
                title="Co-Op Guild Raid"
              >
                <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                  <Swords className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-medium text-slate-300">Co-Op Raid</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pinned Bottom Sidebar Pixel Character & Quote Widget (Permanently visible in full) */}
        <div className="p-2.5 mx-3 mt-auto mb-2 rounded-xl border border-white/[0.07] bg-gradient-to-br from-[#10152B] to-[#0A0D1A] flex items-center gap-2.5 shadow-inner shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 text-sm sm:text-base select-none shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            🧙‍♂️
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs text-slate-200 truncate">
                {character?.title || "Novice Hero"}
              </span>
              <span className="text-[10px] font-mono text-cyan-400">Lv.{character?.currentLevel || 1}</span>
            </div>
            <span className="text-[10px] text-slate-400 italic truncate mt-0.5">
              &ldquo;Small steps, epic you.&rdquo;
            </span>
          </div>
        </div>

        {/* Profile Tab Button below Quotes */}
        <div className="px-3 pb-[max(0.75rem,env(safe-area-inset-bottom,16px))] shrink-0">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab("PROFILE");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 sm:py-2.5 rounded-xl border transition-all group ${
              activeTab === "PROFILE"
                ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)] font-semibold"
                : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] text-slate-300 hover:text-white"
            }`}
            title="Open Profile Tab"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  activeTab === "PROFILE"
                    ? "bg-cyan-500/20 text-cyan-300"
                    : "bg-white/[0.04] text-slate-400 group-hover:text-cyan-400"
                }`}
              >
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium truncate">Profile</span>
            </div>

            <ChevronRight
              className={`w-3.5 h-3.5 transition-transform ${
                activeTab === "PROFILE"
                  ? "text-cyan-400 translate-x-0.5"
                  : "text-slate-500 group-hover:text-slate-300"
              }`}
            />
          </button>
        </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT AREA (APP BAR + CLEAN 2-COLUMN DASHBOARD)                 */}
      {/* ========================================================================= */}
      <div
        onClick={() => {
          if (mobileMenuOpen) setMobileMenuOpen(false);
        }}
        onTouchStart={() => {
          if (mobileMenuOpen) setMobileMenuOpen(false);
        }}
        className="flex-1 pt-16 md:pt-0 flex flex-col min-w-0 z-10 md:h-full md:overflow-y-auto overflow-x-hidden w-full max-w-full"
      >
        {/* Top App Bar (Search + Lo-Fi Music + Notifications + User Menu) - Fixed on mobile, sticky on desktop */}
        <header className="fixed top-0 left-0 right-0 md:static md:sticky md:top-0 h-16 bg-[#080B17]/95 md:bg-[#080B17]/80 border-b border-white/[0.07] px-3 sm:px-4 lg:px-6 flex items-center justify-between z-30 backdrop-blur-xl shrink-0 w-full max-w-full">
          {/* Mobile Menu Toggle + Compact Search Input + OG Gaming Life & Hi-Score Badges */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                if (typeof window !== "undefined" && window.innerWidth < 768) {
                  setMobileMenuOpen((prev) => !prev);
                } else {
                  setDesktopSidebarOpen((prev) => !prev);
                }
              }}
              className="h-9 w-9 inline-flex items-center justify-center text-slate-400 hover:text-white rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all hover:scale-105 active:scale-95 shrink-0"
              title={desktopSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Search Icon Button: clean icon button matching other header options */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setSearchFocused(true);
              }}
              className="h-9 w-9 inline-flex items-center justify-center text-slate-400 hover:text-white rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all hover:scale-105 active:scale-95 shrink-0"
              title="Search & Command Palette (⌘K)"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

            {/* OG Zelda 3-Heart Health Containers */}
            <div
              className="hidden xl:inline-flex items-center gap-1.5 h-9 px-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-mono cursor-default shadow-sm select-none shrink-0 whitespace-nowrap"
              title="Zelda Life Containers: 3/3 Full Life"
            >
              <span className="text-[9px] font-arcade text-rose-300">LIFE</span>
              <Heart className="w-3 h-3 fill-rose-500 text-rose-400 animate-pulse" />
              <Heart className="w-3 h-3 fill-rose-500 text-rose-400 animate-pulse delay-100" />
              <Heart className="w-3 h-3 fill-rose-500 text-rose-400 animate-pulse delay-200" />
            </div>

            {/* OG Arcade 1P Hi-Score Badge */}
            <div
              className="hidden 2xl:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-amber-500/10 border border-amber-500/25 font-arcade text-[9px] text-[#FFE600] tracking-wider cursor-pointer hover:bg-amber-500/20 transition-colors shadow-sm select-none shrink-0 whitespace-nowrap"
              onClick={() => triggerKonamiEasterEgg()}
              title="Click to trigger Retro High-Score Easter Egg"
            >
              <span className="text-cyan-400">1P</span>
              <span className="text-slate-300">HI-SCORE</span>
              <span className="neon-glow-gold">99,990</span>
            </div>
          </div>

          {/* Right Action Icons & User Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
            {/* FEATURE 5: Lo-Fi Ambient Synthesizer Music Player */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                if (lofiMusic) {
                  lofiMusic.toggle();
                }
              }}
              className={`h-9 px-2.5 sm:px-3 inline-flex items-center justify-center gap-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                isMusicPlaying
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  : "bg-white/[0.04] text-slate-400 border-white/[0.08] hover:text-slate-200 hover:bg-white/[0.08]"
              }`}
              title="Toggle Lo-Fi Study Synthwave Music"
            >
              <Music className={`w-3.5 h-3.5 shrink-0 ${isMusicPlaying ? "text-cyan-400 animate-bounce" : ""}`} />
              <span className="hidden xl:inline truncate max-w-[65px]">
                {isMusicPlaying ? musicTrackName : "Lo-Fi BGM"}
              </span>
            </button>

            {/* Ask AI Companion Button */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onOpenAiOracle();
              }}
              className="h-9 px-2.5 sm:px-3 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-200 text-xs font-semibold whitespace-nowrap hover:bg-purple-500/30 hover:border-purple-400/50 transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(168,85,247,0.15)] shrink-0"
              title="Ask AI Companion Oracle"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow shrink-0" />
              <span className="hidden lg:inline">Ask AI</span>
            </button>

            {/* Share Victory Card Trigger with Magnetic Hover */}
            <MagneticWrapper strength={0.25} className="inline-block shrink-0">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsShareVictoryOpen(true);
                }}
                className="h-9 px-2.5 sm:px-3 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold whitespace-nowrap shadow-sm transition-all hover:scale-105 active:scale-95 shrink-0"
                title="Share your daily hero achievements"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden xl:inline">Share Card</span>
              </button>
            </MagneticWrapper>

            {/* Notification Bell */}
            <div ref={notificationRef} className="relative shrink-0">
              <button
                id="header-notification-bell"
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setNotificationsOpen((prev) => !prev);
                }}
                className="h-9 w-9 inline-flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors relative shrink-0"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {activeTasks.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-2 right-2 ring-2 ring-[#080B17] shadow-[0_0_6px_#22d3ee]" />
                )}
              </button>

              {notificationsOpen && (
                <div
                  id="notification-popover"
                  className="absolute top-full right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-xs sm:w-80 bg-[#0E1326] border border-cyan-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-4 z-50 text-xs animate-in fade-in zoom-in-95 backdrop-blur-2xl"
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-semibold text-white">Daily Briefing</span>
                    </div>
                    <span className="font-mono text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                      ACTIVE
                    </span>
                  </div>
                  <div className="py-3 flex flex-col gap-2.5 text-slate-300">
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setActiveTab("HOME");
                        setNotificationsOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] hover:border-cyan-500/30 flex items-center gap-2.5 text-left transition-all group"
                    >
                      <span className="text-base shrink-0">⚔️</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white group-hover:text-cyan-300 font-medium">
                          {activeTasks.length} Active Quests
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Awaiting completion today
                        </p>
                      </div>
                    </button>
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center gap-2.5">
                      <span className="text-base shrink-0">🔥</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium">
                          Streak: <strong className="text-amber-400">{character?.streakCurrent || 1} Days Strong</strong>
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Keep the flame alive today!
                        </p>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center gap-2.5">
                      <span className="text-base shrink-0">👾</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium">
                          Daily Boss Strike Ready
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Deal damage to Malakor!
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Press ESC to close</span>
                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-white/[0.08] shrink-0">
              <Link
                href="/profile"
                onClick={() => sounds.playClick()}
                className="h-9 flex items-center gap-2 p-1 pr-1.5 sm:pr-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.07] hover:border-cyan-500/30 transition-all shrink-0"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 p-0.5 shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0">
                  <div className="w-full h-full rounded-[6px] bg-[#0B0F20] flex items-center justify-center font-bold text-[10px] text-white">
                    {initials}
                  </div>
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white leading-tight">
                    {firstName}
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono leading-none">
                    Lv. {character?.currentLevel || 1}
                  </span>
                </div>
              </Link>

              {/* Logout button: ALWAYS visible with clear LogOut icon */}
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.07] text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors shrink-0"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* ===================================================================== */}
        {/* 3. TAB CANVAS CONTENT                                                 */}
        {/* ===================================================================== */}
        <div className="flex-1 p-4 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto flex flex-col gap-6 min-w-0">
          {/* TAB 1: HOME (REDESIGNED PREMIUM 2-COLUMN DASHBOARD) */}
          {activeTab === "HOME" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start w-full min-w-0">
              {/* ------------------------------------------------------------- */}
              {/* LEFT MAIN COLUMN (7 cols on lg, 8 cols on xl+)               */}
              {/* ------------------------------------------------------------- */}
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-5 lg:gap-6 min-w-0">
                {/* 1. CINEMATIC HERO GREETING BANNER */}
                <div className="relative w-full rounded-2xl overflow-hidden border border-white/[0.09] shadow-[0_12px_40px_rgba(0,0,0,0.5)] min-h-[220px] sm:min-h-[250px] flex flex-col justify-between p-6 sm:p-8 bg-[#0B0F22] group">
                  {/* Background Artwork with Seamless Vignette Masks & Mouse Parallax */}
                  <div
                    ref={dashboardHeroBgRef}
                    className="absolute -inset-6 bg-cover bg-right sm:bg-center z-0 scale-105 will-change-transform opacity-55 pointer-events-none"
                    style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
                  />
                  {/* Layered Gradient Atmosphere */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#080B18] via-[#080B18]/85 to-transparent z-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080B18] via-transparent to-transparent z-0" />
                  <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Top Bar inside Hero: Time Greeting + Date + OG World Marker */}
                  <div className="relative z-10 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.1] text-slate-300 text-xs font-medium">
                        <TimeIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>{timeContext.greeting} · {timeContext.label}</span>
                      </div>
                      {/* OG Super Mario Stage / World Badge */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/15 backdrop-blur-md border border-cyan-500/30 font-arcade text-[8px] sm:text-[9px] text-cyan-300 tracking-wider">
                        <span>WORLD 1-4</span>
                        <span className="text-amber-400">★ CITADEL OF FOCUS</span>
                      </div>
                    </div>

                    <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] backdrop-blur-md border border-white/[0.08] text-slate-400 font-mono text-[11px]">
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  {/* Center Hero Identity */}
                  <div className="relative z-10 my-3 flex flex-col text-left">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-300 drop-shadow-[0_2px_15px_rgba(251,191,36,0.3)]">
                        {firstName}
                      </h1>
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-semibold tracking-wide">
                        LVL {character?.currentLevel || 1} ADVENTURER
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-arcade text-[9px] font-semibold tracking-wider">
                        1-UP: READY
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-lg leading-relaxed font-normal">
                      Small steps today, a brighter you tomorrow. Defeat procrastination and claim your daily victory.
                    </p>
                  </div>

                  {/* Bottom Footer Quote & Tag with OG Gaming Wisdom */}
                  <div className="relative z-10 flex items-center justify-between flex-wrap gap-3 pt-2">
                    <div className="inline-flex items-center gap-2 bg-[#060813]/70 backdrop-blur-md border border-white/[0.08] rounded-xl px-3.5 py-1.5 text-xs text-slate-300 shadow-sm">
                      <span className="text-amber-400 text-sm">🗡️</span>
                      <span className="italic text-slate-200">
                        &ldquo;It&apos;s dangerous to go alone! Take this daily quest.&rdquo;
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400 pl-1 border-l border-white/[0.1] hidden sm:inline">
                        Zelda 1986
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-cyan-300/90 tracking-wide">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span>Progress Lives Here</span>
                    </div>
                  </div>

                  {/* Character Buffs Bar */}
                  <div className="relative z-10 pt-2 border-t border-white/[0.06] mt-2">
                    <CharacterBuffsBar currentStreak={character?.streakCurrent || 1} />
                  </div>
                </div>

                {/* FEATURE 3: DAILY DUNGEON BOSS CARD WITH 3D TILT */}
                <TiltCard maxTilt={5}>
                  <DailyBossCard
                    completedTasksCount={completedTasks.length}
                    totalXpToday={completedTasks.length * 50}
                    onClaimVictoryLoot={() => {
                      onRefresh();
                    }}
                  />
                </TiltCard>

                {/* 2. TODAY'S FOCUS (QUEST HUB CARD) */}
                <div className="bg-[#0C1022]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)] flex flex-col gap-4">
                  {/* Card Header & Filter Tabs */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.07]">
                    {/* Left: Title & Filter Tabs */}
                    <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <Sun className="w-4 h-4" />
                        </div>
                        <h2 className="text-base font-bold text-white tracking-wide">
                          Today&apos;s Focus
                        </h2>
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-slate-300 text-[11px] font-mono">
                          {activeTasks.length} remaining
                        </span>
                      </div>

                      {/* Filter Tabs */}
                      <div className="flex items-center bg-[#070915] p-1 rounded-xl border border-white/[0.08] text-[11px]">
                        <button
                          type="button"
                          onClick={() => setTaskFilter("ALL")}
                          className={`px-2.5 py-1 rounded-lg transition-all ${
                            taskFilter === "ALL"
                              ? "bg-white/[0.1] text-white font-semibold"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          All ({tasks.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setTaskFilter("ACTIVE")}
                          className={`px-2.5 py-1 rounded-lg transition-all ${
                            taskFilter === "ACTIVE"
                              ? "bg-cyan-500/20 text-cyan-300 font-semibold"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          Active ({activeTasks.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setTaskFilter("COMPLETED")}
                          className={`px-2.5 py-1 rounded-lg transition-all ${
                            taskFilter === "COMPLETED"
                              ? "bg-emerald-500/20 text-emerald-300 font-semibold"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          Done ({completedTasks.length})
                        </button>
                      </div>
                    </div>

                    {/* Right: Actions Group */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* FEATURE 6: AI Plan My Day Trigger */}
                      <MagneticWrapper strength={0.25} className="hidden sm:inline-block">
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setIsAiPlanOpen(true);
                          }}
                          className="px-3 py-1.5 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                          title="AI Plan My Day: Auto-generate 3 balanced daily quests"
                        >
                          <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                          <span>Plan Day</span>
                        </button>
                      </MagneticWrapper>

                      {/* FEATURE: Curated Routine Packs Trigger */}
                      <MagneticWrapper strength={0.25} className="hidden sm:inline-block">
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setIsRoutinePacksOpen(true);
                          }}
                          className="px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                          title="Curated Routine Packs: 1-click install SWE, Exam, Morning, or Fitness routines"
                        >
                          <Package className="w-3.5 h-3.5 text-cyan-300" />
                          <span>Routine Packs</span>
                        </button>
                      </MagneticWrapper>

                      <MagneticWrapper strength={0.25} className="inline-block">
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            onOpenCreateQuest();
                          }}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all hover:scale-105 active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Task</span>
                        </button>
                      </MagneticWrapper>
                    </div>
                  </div>

                  {/* FEATURE 2: INSTANT QUICK-CAPTURE TASK BAR */}
                  <form onSubmit={handleQuickSubmit} className="relative flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-xl bg-[#090D1E]/90 border border-white/[0.08] shadow-inner focus-within:border-cyan-500/50 transition-all">
                    <div className="relative flex-1 w-full flex items-center">
                      <Zap className="w-4 h-4 text-amber-400 absolute left-3 pointer-events-none" />
                      <input
                        type="text"
                        value={quickTitle}
                        onChange={(e) => setQuickTitle(e.target.value)}
                        placeholder="Quick capture a quest... (e.g. Read 20 pages, 30m Workout)"
                        className="w-full bg-transparent pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>

                    {/* Quick Category Selector */}
                    <div className="flex items-center gap-1 shrink-0 w-full sm:w-auto justify-between sm:justify-start px-2 sm:px-0">
                      <div className="flex items-center gap-1">
                        {(["INT", "STR", "WIS", "DEX"] as const).map((attr) => (
                          <button
                            key={attr}
                            type="button"
                            onClick={() => {
                              sounds.playClick();
                              setQuickAttr(attr);
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all ${
                              quickAttr === attr
                                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                                : "bg-white/[0.04] text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            {attr}
                          </button>
                        ))}
                      </div>

                      <button
                        type="submit"
                        disabled={!quickTitle.trim() || isQuickSubmitting}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-40"
                      >
                        <Send className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  </form>

                  {/* Task List Items */}
                  {filteredTasks.length === 0 ? (
                    <div className="py-10 flex flex-col items-center justify-center text-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400">
                        <Check className="w-6 h-6 text-emerald-400" />
                      </div>
                      <p className="text-xs text-slate-300 font-medium">
                        {searchQuery ? "No matching quests found" : "No quests in this category"}
                      </p>
                      <button
                        type="button"
                        onClick={onOpenCreateQuest}
                        className="text-xs text-cyan-400 hover:underline font-semibold mt-1"
                      >
                        + Create a new quest
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {filteredTasks.map((t) => {
                        const isDone = t.status === "COMPLETED";
                        const xpReward = t.xpReward || (t.difficulty === "Hard" ? 50 : t.difficulty === "Medium" ? 40 : 30);
                        const duration = t.difficulty === "Hard" ? "~ 45 min" : t.difficulty === "Medium" ? "~ 30 min" : "~ 15 min";
                        const cat = categoryStyles[t.attributeCode] || {
                          label: "General",
                          bg: "bg-slate-500/10",
                          text: "text-slate-300",
                          border: "border-slate-500/25",
                        };

                        return (
                          <div
                            key={t.id}
                            className={`group relative overflow-hidden p-3 sm:p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all duration-150 ${
                              isDone
                                ? "bg-[#090D1C]/60 border-white/[0.04] text-slate-400 opacity-75"
                                : "bg-[#101427]/80 hover:bg-[#141A33] border-white/[0.06] hover:border-cyan-500/30 text-white shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:-translate-y-0.5"
                            }`}
                          >
                            <QuestSlashEffect triggerKey={lastCompletedTaskId?.startsWith(t.id) ? lastCompletedTaskId : ""} />
                            {/* FEATURE 1: Checkbox with Particle Trigger */}
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  if (!isDone) handleTaskCheck(e, t);
                                }}
                                disabled={isDone}
                                aria-label={`Complete quest ${t.title}`}
                                className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                                  isDone
                                    ? "bg-emerald-500 border-emerald-400 text-black shadow-[0_0_8px_#10b981]"
                                    : "border-slate-500 hover:border-cyan-400 bg-black/40 hover:bg-cyan-500/10"
                                }`}
                              >
                                {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>

                              <span
                                className={`text-xs sm:text-sm font-medium truncate ${
                                  isDone ? "line-through text-slate-400" : "text-slate-100"
                                }`}
                              >
                                {t.title}
                              </span>
                            </div>

                            {/* Tags & Action Buttons */}
                            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                              {/* Category Badge */}
                              <span
                                className={`hidden sm:inline-block px-2.5 py-0.5 rounded-md border text-[10px] font-medium ${cat.bg} ${cat.text} ${cat.border}`}
                              >
                                {cat.label}
                              </span>

                              {/* XP Reward badge */}
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono text-amber-300 font-bold flex items-center gap-1">
                                <Coins className="w-3 h-3 text-amber-400" />
                                <span>+{xpReward} XP</span>
                              </span>

                              {/* Estimated Duration */}
                              <span className="hidden md:inline-block text-[11px] text-slate-400 font-mono">
                                {duration}
                              </span>

                              {/* Status or Actions */}
                              {isDone ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium px-2 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                                  <Check className="w-3 h-3" />
                                  <span>Done</span>
                                </span>
                              ) : (
                                <div className="flex items-center gap-1">
                                  {/* Quick Sprint Focus Chamber Button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      sounds.playClick();
                                      setFocusModalTask(t);
                                    }}
                                    className="p-1.5 text-cyan-400 hover:text-cyan-200 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg transition-all"
                                    title="Enter 25m Focus Sprint Chamber (+25% XP Bonus)"
                                  >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                  </button>

                                  {/* Quick Edit */}
                                  <button
                                    type="button"
                                    onClick={() => onEditTask(t)}
                                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/[0.06] transition-colors"
                                    title="Edit quest"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Quick Delete */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      sounds.playClick();
                                      onDeleteTask(t.id);
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-white/[0.06] transition-colors"
                                    title="Delete quest"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Encouraging Footer Banner & Progress */}
                  <div className="pt-3 border-t border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400">🚩</span>
                      <span>
                        {activeTasks.length > 0
                          ? `Keep going! ${activeTasks.length} more tasks to complete today (${completionPercentage}% done).`
                          : "Outstanding work! All quests for today are finished."}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab("TODAY")}
                      className="text-cyan-400 hover:text-cyan-300 hover:underline text-xs font-semibold flex items-center gap-1"
                    >
                      <span>View Quest Log</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 3. INSPIRATIONAL ARTWORK BANNER */}
                <div className="relative w-full rounded-2xl overflow-hidden border border-white/[0.08] p-5 sm:p-6 bg-gradient-to-r from-[#0C1126] via-[#111735] to-[#0A0D1E] flex items-center justify-between gap-4 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl select-none shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                      🏮
                    </div>
                    <div className="flex flex-col">
                      <p className="text-xs sm:text-sm font-medium text-slate-200 italic">
                        &ldquo;Discipline today, a brighter tomorrow.&rdquo;
                      </p>
                      <span className="text-[10px] font-mono text-amber-300 mt-1 uppercase tracking-wider">
                        — Levvo Daily Philosophy
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("PROGRESS")}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-slate-200 text-xs font-medium transition-all"
                  >
                    <span>Journey</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* RIGHT SIDEBAR COLUMN (5 cols on lg, 4 cols on xl+)            */}
              {/* ------------------------------------------------------------- */}
              <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-5 lg:gap-6 min-w-0">
                {/* 1. PLAYER LEVEL & STATS CARD */}
                <div className="bg-[#0C1022]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] flex flex-col gap-4 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-[0_0_15px_rgba(99,102,241,0.35)] shrink-0">
                        <div className="w-full h-full bg-[#0B0F20] rounded-[10px] flex items-center justify-center">
                          <Target className="w-5 h-5 text-indigo-400" />
                        </div>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-sm text-white truncate">
                            Level {character?.currentLevel || 1}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shrink-0">
                            RANK 1
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 truncate">
                          {character?.title || "Novice Explorer"}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-cyan-400 shrink-0">
                      {character?.progressPercent || 0}%
                    </span>
                  </div>

                  {/* Multi-gradient XP Progress Bar */}
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="w-full h-2 bg-[#060813] rounded-full overflow-hidden border border-white/[0.06] p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                        style={{ width: `${character?.progressPercent || 0}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>{character?.currentLevelXp || 0} / {character?.xpToNextLevel || 100} XP</span>
                      <span>Total: {character?.totalXp || 0} XP</span>
                    </div>
                  </div>

                  {/* Mini Stats Grid: Gold & Streak */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-2.5 pt-2 border-t border-white/[0.07] min-w-0">
                    <div className="bg-[#101427]/80 border border-white/[0.06] rounded-xl p-2.5 sm:p-3 flex items-center gap-2 sm:gap-2.5 shadow-sm min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                        <Coins className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-extrabold text-sm text-white truncate">
                          {character?.gold || 0}
                        </span>
                        <span className="text-[10px] text-slate-400 leading-none mt-0.5 truncate">Gold Coins</span>
                      </div>
                    </div>

                    <div className="bg-[#101427]/80 border border-white/[0.06] rounded-xl p-2.5 sm:p-3 flex items-center gap-2 sm:gap-2.5 shadow-sm min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                        <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-extrabold text-sm text-white truncate">
                          {character?.streakCurrent || 1}
                        </span>
                        <span className="text-[10px] text-slate-400 leading-none mt-0.5 truncate">Day Streak</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FEATURE 4: 7-DAY WEEKLY MOMENTUM HEATMAP */}
                <TiltCard maxTilt={5}>
                  <WeeklyMomentumCard
                    currentStreak={character?.streakCurrent || 1}
                    completedTasksCount={completedTasks.length}
                  />
                </TiltCard>

                {/* OG 90'S ARCANA & GAMING RELICS VAULT CARD */}
                <OGArcaneRelicsCard
                  onTriggerKonami={triggerKonamiEasterEgg}
                  isKonamiActive={isKonamiUnlocked}
                />

                {/* 2. OG GAMING WISDOM CARD */}
                <div className="bg-gradient-to-br from-[#0F142A]/80 to-[#0A0D1B]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] flex items-start gap-3">
                  <span className="text-amber-400 text-xl leading-none select-none">
                    🎮
                  </span>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-slate-200 leading-relaxed italic">
                      &ldquo;It&apos;s dangerous to go alone! Complete your quests and level up daily.&rdquo;
                    </p>
                    <span className="text-[10px] font-mono text-cyan-400">
                      — The Legend of Zelda (1986)
                    </span>
                  </div>
                </div>

                {/* 3. YOUR GOALS & HABITS */}
                <div className="bg-[#0C1022]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] flex flex-col gap-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.07]">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-rose-400" />
                      <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                        Your Goals
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("GOALS")}
                      className="text-cyan-400 hover:text-cyan-300 hover:underline text-[11px] font-semibold"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Goal Item 1 */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="font-medium text-slate-200">Final Year Project</span>
                        </div>
                        <span className="font-mono text-[10px] text-cyan-400">60%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#060813] rounded-full overflow-hidden">
                        <div className="w-[60%] h-full bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]" />
                      </div>
                    </div>

                    {/* Goal Item 2 */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Code className="w-3.5 h-3.5 text-purple-400" />
                          <span className="font-medium text-slate-200">Learn React & DSA</span>
                        </div>
                        <span className="font-mono text-[10px] text-purple-400">45%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#060813] rounded-full overflow-hidden">
                        <div className="w-[45%] h-full bg-purple-400 rounded-full shadow-[0_0_8px_#c084fc]" />
                      </div>
                    </div>

                    {/* Habit Tracker Item: Water */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-base select-none">💧</span>
                        <span className="font-medium text-slate-200">Hydration</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onDecrementTracker("water")}
                          className="w-6 h-6 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-slate-300 text-xs transition-colors"
                          aria-label="Decrease water count"
                        >
                          -
                        </button>
                        <span className="font-mono text-xs text-cyan-300 px-1 font-semibold">
                          {trackerCounts["water"] || 0}/8
                        </span>
                        <button
                          type="button"
                          onClick={() => onIncrementTracker("water")}
                          className="w-6 h-6 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-slate-300 text-xs transition-colors"
                          aria-label="Increase water count"
                        >
                          +
                        </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* TAB 2: TODAY (FULL-LENGTH QUEST MANAGER) */}
          {activeTab === "TODAY" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                    <span>Daily Quest Log</span>
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Execute your missions, defeat procrastination, and bank XP.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenCreateQuest}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Quest</span>
                </button>
              </div>

              {/* Task list with Active & Completed */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0C1022]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3 shadow-lg">
                  <h3 className="text-xs font-bold text-cyan-400 flex items-center justify-between uppercase tracking-wider">
                    <span>Active Quests</span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-[10px] text-cyan-300 font-mono">
                      {activeTasks.length}
                    </span>
                  </h3>
                  <div className="flex flex-col gap-2">
                    {activeTasks.map((t) => (
                      <div
                        key={t.id}
                        className="relative overflow-hidden p-3 rounded-xl bg-[#101427] border border-white/[0.06] flex items-center justify-between gap-3 hover:border-cyan-500/30 transition-all"
                      >
                        <QuestSlashEffect triggerKey={lastCompletedTaskId?.startsWith(t.id) ? lastCompletedTaskId : ""} />
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={(e) => handleTaskCheck(e, t)}
                            className="w-5 h-5 rounded-lg border border-slate-500 hover:border-emerald-400 flex items-center justify-center shrink-0 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5 opacity-0 hover:opacity-100 text-emerald-400" />
                          </button>
                          <span className="text-xs font-medium text-slate-200 truncate">{t.title}</span>
                        </div>
                        <span className="font-mono text-[10px] text-amber-300 font-bold shrink-0">+{t.difficulty === "Hard" ? 50 : 30} XP</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0C1022]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3 shadow-lg">
                  <h3 className="text-xs font-bold text-emerald-400 flex items-center justify-between uppercase tracking-wider">
                    <span>Completed Today</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[10px] text-emerald-300 font-mono">
                      {completedTasks.length}
                    </span>
                  </h3>
                  <div className="flex flex-col gap-2">
                    {completedTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl bg-[#090D1C]/60 border border-white/[0.04] flex items-center justify-between gap-3 text-slate-400"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-5 h-5 rounded-lg bg-emerald-500 text-black flex items-center justify-center shrink-0 shadow-sm">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <span className="text-xs line-through truncate">{t.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 shrink-0">BANKED</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Habit Trackers */}
              <PredefinedTrackers
                trackers={[
                  { key: "water", label: "Water", icon: "💧", count: trackerCounts["water"] ?? 0, target: 8, unit: "glasses" },
                  { key: "gym", label: "Gym Workout", icon: "🏋️", count: trackerCounts["gym"] ?? 0, target: 1, unit: "session" },
                  { key: "cycling", label: "Cycling", icon: "🚴", count: trackerCounts["cycling"] ?? 0, target: 1, unit: "ride" },
                  { key: "reading", label: "Reading", icon: "📖", count: trackerCounts["reading"] ?? 0, target: 20, unit: "pages" },
                  { key: "meditation", label: "Meditation", icon: "🧘", count: trackerCounts["meditation"] ?? 0, target: 10, unit: "mins" },
                ]}
                onIncrementTracker={onIncrementTracker}
                onDecrementTracker={onDecrementTracker}
              />
            </div>
          )}

          {/* TAB 3: GOALS (HABIT TRACKERS + MILESTONE WINS) */}
          {activeTab === "GOALS" && (
            <div className="flex flex-col gap-6">
              <div className="pb-3 border-b border-white/[0.08]">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-rose-400" />
                  <span>Goals & Milestones</span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track macro-goals, daily habits, and record unexpected wins.
                </p>
              </div>

              <PredefinedTrackers
                trackers={[
                  { key: "water", label: "Water", icon: "💧", count: trackerCounts["water"] ?? 0, target: 8, unit: "glasses" },
                  { key: "gym", label: "Gym Workout", icon: "🏋️", count: trackerCounts["gym"] ?? 0, target: 1, unit: "session" },
                  { key: "cycling", label: "Cycling", icon: "🚴", count: trackerCounts["cycling"] ?? 0, target: 1, unit: "ride" },
                  { key: "reading", label: "Reading", icon: "📖", count: trackerCounts["reading"] ?? 0, target: 20, unit: "pages" },
                  { key: "meditation", label: "Meditation", icon: "🧘", count: trackerCounts["meditation"] ?? 0, target: 10, unit: "mins" },
                ]}
                onIncrementTracker={onIncrementTracker}
                onDecrementTracker={onDecrementTracker}
              />

              <QuickMilestone onLogWin={onLogQuickWin} />
            </div>
          )}

          {/* TAB 4: FOCUS (FOCUS CHAMBER SPRINT) */}
          {activeTab === "FOCUS" && (
            <div className="flex flex-col gap-6">
              <div className="pb-3 border-b border-white/[0.08]">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span>Focus Chamber Sprint</span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Engage high-focus deep work sprints with live Pac-Man pellet corridor animations.
                </p>
              </div>

              <ArcadeTimer tasks={tasks} onSessionComplete={onTimerComplete} />
            </div>
          )}

          {/* TAB 5: PROGRESS (JOURNEY & STATS) */}
          {activeTab === "PROGRESS" && (
            <div className="flex flex-col gap-6">
              <div className="pb-3 border-b border-white/[0.08]">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  <span>Hero Journey & Progress</span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track long-term trajectory, momentum milestones, and levels.
                </p>
              </div>

              <JourneyProgress
                currentLevel={character?.currentLevel || 1}
                totalXp={character?.totalXp || 0}
                totalCompletedQuests={completedTasks.length}
                streakCurrent={character?.streakCurrent || 1}
                streakLongest={character?.streakLongest || 1}
              />
            </div>
          )}

          {/* TAB 6: ARCADE (OG 90'S VIDEOGAME ZONE) */}
          {activeTab === "ARCADE" && (
            <div className="flex flex-col gap-6">
              <div className="pb-3 border-b border-white/[0.08]">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-amber-400" />
                  <span>90&apos;s Retro Arcade Zone</span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Play retro Pac-Man, roll dice on the 30-tile Snakes & Ladders Habit Board, and move Ludo Life Tokens!
                </p>
              </div>

              <RetroArcadeZone
                currentLevel={character?.currentLevel || 1}
                streak={character?.streakCurrent || 1}
                completedTasksCount={completedTasks.length}
                totalXp={character?.totalXp || 0}
                onAwardBonusXp={(amount, reason) => {
                  sounds.playLevelUp();
                  onRefresh();
                }}
              />
            </div>
          )}

          {/* TAB: LEADERBOARD (ARCADE HIGH-SCORE HALL OF LEGENDS) */}
          {activeTab === "LEADERBOARD" && (
            <div className="flex flex-col gap-6">
              <SocialLeaderboard
                currentUserName={character?.username || currentUser?.username}
                currentUserLevel={character?.currentLevel}
                currentUserXp={character?.totalXp}
                currentUserStreak={character?.streakCurrent}
              />
            </div>
          )}

          {/* TAB: GUILD (CO-OP GUILD RAID BOSS BATTLE) */}
          {activeTab === "GUILD" && (
            <div className="flex flex-col gap-6">
              <PartyRaidSection
                onDealBossDamage={() => onRefresh()}
                currentUserName={character?.username || currentUser?.username}
              />
            </div>
          )}

          {/* TAB 7: PROFILE */}
          {activeTab === "PROFILE" && (
            <div className="bg-[#0C1022]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
              <h2 className="text-lg font-bold text-white">Hero Identity</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-3xl select-none shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  🧙‍♂️
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xl text-white">{displayName}</span>
                  <span className="text-xs text-slate-400">{currentUser.email}</span>
                  <span className="text-xs text-cyan-400 font-mono mt-1">
                    Level {character?.currentLevel || 1} • {character?.title || "Hero"}
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                <Link
                  href="/profile"
                  className="flex-1 h-10 px-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all text-center"
                >
                  <span>Open Full Wardrobe & Shop</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex-1 sm:flex-none h-10 px-6 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center text-center"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
