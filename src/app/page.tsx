"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Sword,
  Brain,
  BarChart3,
  Trophy,
  Users,
  Gamepad2,
  Play,
  ArrowRight,
  ShoppingBag,
  LogIn,
  Check,
  Flame,
  Zap,
  Coins,
  Shield,
  Star,
  Flag,
  LayoutDashboard,
  Globe,
  Plus,
  Minus,
  Clock,
  Send,
  User,
  Monitor,
  Heart,
  ScrollText,
  ChevronRight,
} from "lucide-react";
import confetti from "canvas-confetti";
import gsap from "gsap";
import { sounds } from "@/lib/sound";
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
import { RetroArcadeZone } from "@/components/dashboard/RetroArcadeZone";
import { ModernAppDashboard } from "@/components/dashboard/ModernAppDashboard";
import { TaskItem } from "@/components/quests/QuestCard";

export default function LevvoMainPage() {
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; username: string } | null>(null);
  const [character, setCharacter] = useState<any>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [trackerCounts, setTrackerCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // View state: if user is logged in, default to DASHBOARD; if guest, default to OVERVIEW
  const [viewMode, setViewMode] = useState<"OVERVIEW" | "DASHBOARD">("OVERVIEW");
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

  // Showcase interactive preview state
  const [showcaseQuests, setShowcaseQuests] = useState([
    { id: "q1", title: "Study DSA (1 hour)", xp: "+50 XP", done: false },
    { id: "q2", title: "Read a book (20 pages)", xp: "+30 XP", done: false },
    { id: "q3", title: "Workout (30 mins)", xp: "+40 XP", done: false },
    { id: "q4", title: "Plan tomorrow", xp: "+20 XP", done: false },
  ]);
  const [showcaseGold, setShowcaseGold] = useState(545);
  const [showcaseXp, setShowcaseXp] = useState(749);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // GSAP animation container refs
  const heroRef = useRef<HTMLDivElement>(null);
  const featureCardsRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  useEffect(() => {
    initApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger GSAP entrance animations when viewMode changes
  useEffect(() => {
    if (viewMode === "OVERVIEW") {
      const ctx = gsap.context(() => {
        if (heroRef.current) {
          gsap.from(".hero-anim-item", {
            y: 30,
            opacity: 0,
            stagger: 0.12,
            duration: 0.8,
            ease: "power3.out",
          });
        }
        if (featureCardsRef.current) {
          gsap.from(".feature-card-anim", {
            y: 20,
            opacity: 0,
            stagger: 0.08,
            duration: 0.6,
            delay: 0.3,
            ease: "power2.out",
          });
        }
        if (showcaseRef.current) {
          gsap.to(".floating-card", {
            y: -8,
            duration: 2.2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        }
      });
      return () => ctx.revert();
    } else {
      const ctx = gsap.context(() => {
        if (dashboardRef.current) {
          gsap.from(dashboardRef.current, {
            opacity: 0,
            y: 25,
            duration: 0.5,
            ease: "power2.out",
          });
        }
      });
      return () => ctx.revert();
    }
  }, [viewMode]);

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
        setViewMode("DASHBOARD");
      } else {
        setCurrentUser(null);
        setViewMode("OVERVIEW");
      }
    } catch {
      setCurrentUser(null);
      setViewMode("OVERVIEW");
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
        if (charData.data.gold) setShowcaseGold(charData.data.gold);
        if (charData.data.currentLevelXp) setShowcaseXp(charData.data.currentLevelXp);
        if (charData.data.needsOnboarding && currentUser) {
          setIsOnboardingOpen(true);
        }
      }
      if (tasksData.success) setTasks(tasksData.data);
      if (trackersData.success && trackersData.data) setTrackerCounts(trackersData.data);
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
      setViewMode("OVERVIEW");
      showToast("👋 Logged out. Return soon, Adventurer!");
      await loadAllData();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Quest Completion
  const handleCompleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/v1/tasks/${taskId}/complete`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: "COMPLETED" } : t)));
        if (data.data.spawnedRecurringTask) {
          setTasks((prev) => [data.data.spawnedRecurringTask, ...prev]);
        }
        if (data.data.didLevelUp) {
          setLevelUpData({ isOpen: true, newLevel: data.data.newLevel });
        }
        showToast(`⚔️ Quest Completed! +${data.data.awardedXp} XP / +${data.data.awardedGold} GP`);
        const refreshedChar = await fetch("/api/v1/character").then((r) => r.json());
        if (refreshedChar.success) setCharacter(refreshedChar.data);
      }
    } catch (err) {
      console.error("Failed to complete task:", err);
    }
  };

  // Quick Win Logger
  const handleLogQuickWin = async (title: string, difficulty: "Trivial" | "Easy" | "Medium") => {
    if (!currentUser) {
      sounds.playClick();
      showToast("🔑 Please log in or sign up to record real-world wins!");
      setIsAuthOpen(true);
      return;
    }

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

  // Predefined Tracker Increment
  const handleIncrementTracker = async (key: string) => {
    try {
      const res = await fetch("/api/v1/trackers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackerKey: key, delta: 1 }),
      });
      const data = await res.json();
      if (data.success) {
        setTrackerCounts((prev) => ({ ...prev, [key]: data.data.log.count }));
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

  const handleDecrementTracker = async (key: string) => {
    try {
      const res = await fetch("/api/v1/trackers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackerKey: key, delta: -1 }),
      });
      const data = await res.json();
      if (data.success) {
        setTrackerCounts((prev) => ({ ...prev, [key]: data.data.log.count }));
      }
    } catch (err) {
      console.error("Failed to decrement tracker:", err);
    }
  };

  // Focus Timer Complete
  const handleTimerComplete = async (taskTitle: string, minutes: number) => {
    try {
      const awardedXp = Math.min(60, minutes);
      showToast(`⏱️ Sprint Complete! +${awardedXp} XP banked.`);
      const refreshedChar = await fetch("/api/v1/character").then((r) => r.json());
      if (refreshedChar.success) {
        if (refreshedChar.data.currentLevel > (character?.currentLevel ?? 1)) {
          setLevelUpData({ isOpen: true, newLevel: refreshedChar.data.currentLevel });
        }
        setCharacter(refreshedChar.data);
      }
    } catch (err) {
      console.error("Failed to update character after timer:", err);
    }
  };

  // Interactive Showcase Quest Toggle
  const handleToggleShowcaseQuest = (id: string) => {
    sounds.playClick();
    setShowcaseQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, done: !q.done } : q))
    );
  };

  // Interactive Showcase Complete Action
  const handleCompleteShowcase = () => {
    sounds.playLevelUp();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#FFE600", "#FF2A85", "#00F0FF", "#00FF66"],
    });

    const pending = showcaseQuests.filter((q) => !q.done);
    if (pending.length > 0) {
      setShowcaseQuests((prev) => prev.map((q) => ({ ...q, done: true })));
      setShowcaseXp((prev) => prev + 140);
      setShowcaseGold((prev) => prev + 65);
      showToast("⚔️ All Daily Quests Completed! +140 XP / +65 GP Banked!");
    } else {
      setShowcaseQuests((prev) => prev.map((q) => ({ ...q, done: false })));
      showToast("✨ Quest queue refreshed!");
    }
  };

  const completedTasksCount = tasks.filter((t) => t.status === "COMPLETED").length;

  return (
    <div className="min-h-screen bg-[#060414] text-white flex flex-col selection:bg-synthMagenta selection:text-white font-sans relative overflow-x-hidden">
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR (SHOWN FOR GUESTS / LANDING)                                */}
      {/* ========================================================================= */}
      {!currentUser && (
        <header className="w-full bg-[#09071A]/95 backdrop-blur-md border-b border-[#281A4C] sticky top-0 z-50 px-3 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between shadow-lg">
        {/* Left Brand */}
        <Link
          href="/"
          onClick={() => {
            sounds.playClick();
          }}
          className="flex items-center gap-2.5 sm:gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg p-1"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-synthMagenta to-[#8A2BE2] flex items-center justify-center border border-synthMagenta/60 shadow-[0_0_12px_rgba(255,42,133,0.5)] group-hover:scale-105 transition-transform">
            <Gamepad2 className="w-5 h-5 text-arcadeGold animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-arcade text-base sm:text-xl text-[#FFE600] neon-glow-gold tracking-widest font-black leading-none group-hover:scale-105 transition-transform">
              LEVVO
            </span>
            <span className="font-arcade text-[8px] sm:text-[9px] text-gray-300 tracking-wider mt-0.5 leading-none">
              SMALL STEPS. EPIC YOU.
            </span>
          </div>
        </Link>

        {/* Center Navigation Links (Matching Screenshot: Why Levvo, How It Works, Stories) */}
        {!currentUser ? (
          <nav className="hidden md:flex items-center gap-8 text-sm font-sans">
            <a href="#why-levvo" className="text-gray-300 hover:text-white transition-colors text-xs font-medium">
              Why Levvo
            </a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors text-xs font-medium">
              How It Works
            </a>
            <a href="#stories" className="text-gray-300 hover:text-white transition-colors text-xs font-medium">
              Stories
            </a>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-3 bg-[#110B24]/90 border border-[#3A1E68] rounded-xl px-4 py-1.5 shadow-[inset_0_0_12px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-phosphorGreen animate-ping" />
              <span className="font-arcade text-[10px] text-phosphorGreen tracking-widest uppercase">
                1P READY
              </span>
            </div>
            <div className="h-3 w-px bg-[#3A1E68]" />
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-300">
              <span className="text-synthMagenta font-bold">HI-SCORE:</span>
              <span className="text-[#FFE600] font-arcade">999,990</span>
            </div>
            <div className="h-3 w-px bg-[#3A1E68]" />
            <div className="flex items-center gap-1.5 font-arcade text-[10px] text-neonCyan">
              <span>CREDITS:</span>
              <span className="text-arcadeGold animate-pulse">02</span>
            </div>
            <div className="h-3 w-px bg-[#3A1E68]" />
            <div className="text-[9px] font-mono text-purple-300 uppercase tracking-wider">
              LEVVO HARDWARE // SYSTEM-94
            </div>
          </div>
        )}

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <Link
            href="/login"
            onClick={() => sounds.playClick()}
            className="hidden sm:inline-flex px-3.5 py-2 text-xs font-bold text-gray-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/login?mode=signup"
            onClick={() => sounds.playClick()}
            className="arcade-btn px-4 sm:px-5 py-2 bg-[#FFE600] hover:bg-yellow-400 text-arcadeBlack font-arcade text-xs font-bold rounded-xl border border-yellow-200 shadow-[0_2px_0_#9E8200] flex items-center gap-1.5 transition-transform hover:scale-105"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>
      )}

      {/* ========================================================================= */}
      {/* 2. AUTHENTICATED USER: CLEAN MODERN RPG DASHBOARD                         */}
      {/* ========================================================================= */}
      {currentUser ? (
        character ? (
          <ModernAppDashboard
            currentUser={currentUser}
            character={character}
            tasks={tasks}
            trackerCounts={trackerCounts}
            onCompleteTask={handleCompleteTask}
            onDeleteTask={async (id) => {
              await fetch(`/api/v1/tasks/${id}`, { method: "DELETE" });
              setTasks((prev) => prev.filter((t) => t.id !== id));
            }}
            onEditTask={(t) => setEditingTask(t)}
            onOpenCreateQuest={() => setIsCreateOpen(true)}
            onOpenAiOracle={() => setIsAiOpen(true)}
            onIncrementTracker={handleIncrementTracker}
            onDecrementTracker={handleDecrementTracker}
            onTimerComplete={handleTimerComplete}
            onLogQuickWin={handleLogQuickWin}
            onLogout={handleLogout}
            onRefresh={loadAllData}
          />
        ) : (
          <div className="w-full flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
            <div className="w-16 h-16 rounded-2xl bg-synthMagenta/20 border-2 border-synthMagenta flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(255,42,133,0.5)] animate-pulse">
              <Gamepad2 className="w-8 h-8 text-arcadeGold" />
            </div>
            <h2 className="font-arcade text-lg sm:text-xl text-arcadeGold neon-glow-gold tracking-widest">
              INSERT COIN // LOADING HERO HUD...
            </h2>
            <p className="font-mono text-xs text-neonCyan mt-2 tracking-wider">
              SYNCHRONIZING 90&apos;S HARDWARE SYSTEM
            </p>
          </div>
        )
      ) : (
        /* ========================================================================= */
        /* 3. MODE SWITCH: EXACT HOME / LANDING OVERVIEW PAGE                        */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col">
          {/* HERO CANVAS */}
          <section
            ref={heroRef}
            className="relative w-full min-h-[580px] sm:min-h-[660px] md:min-h-[720px] flex flex-col items-center justify-center text-center px-4 overflow-hidden border-b border-[#281A4C]"
          >
            {/* Background Artwork */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 scale-100"
              style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
            />

            {/* Dark Vignette Overlay for Crisp Readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#070514]/75 via-[#070514]/50 to-[#070514] z-0" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#070514]/30 to-[#070514]/90 z-0" />

            {/* Top Right Floating Castle Caption (Matching Screenshot) */}
            <div className="hero-anim-item absolute top-10 sm:top-14 right-6 sm:right-16 z-10 hidden md:flex flex-col items-center text-center">
              <span className="font-arcade text-[11px] sm:text-xs text-[#FFE600] neon-glow-gold tracking-widest uppercase font-bold">
                A BRIGHTER
              </span>
              <span className="font-arcade text-[11px] sm:text-xs text-[#FFE600] neon-glow-gold tracking-widest uppercase font-bold mt-0.5">
                YOU AWAITS
              </span>
              <div className="w-6 sm:w-8 h-[2px] bg-[#FFE600]/80 mt-1.5 rounded" />
            </div>

            {/* Right Floating Wooden Signposts (Matching Screenshot: DISCIPLINE, PROGRESS, FREEDOM) */}
            <div className="hero-anim-item absolute bottom-10 sm:bottom-16 right-4 sm:right-10 z-10 hidden lg:flex flex-col items-center gap-1.5">
              <div className="bg-[#24140D]/95 border-2 border-[#543220] shadow-[0_4px_12px_rgba(0,0,0,0.6)] rounded px-3.5 py-1.5 font-arcade text-xs text-amber-200 tracking-wider">
                DISCIPLINE
              </div>
              <div className="bg-[#24140D]/95 border-2 border-[#543220] shadow-[0_4px_12px_rgba(0,0,0,0.6)] rounded px-3.5 py-1.5 font-arcade text-xs text-amber-200 tracking-wider">
                PROGRESS
              </div>
              <div className="bg-[#24140D]/95 border-2 border-[#543220] shadow-[0_4px_12px_rgba(0,0,0,0.6)] rounded px-3.5 py-1.5 font-arcade text-xs text-amber-200 tracking-wider">
                FREEDOM
              </div>
            </div>

            {/* Center Hero Typography */}
            <div className="relative z-10 max-w-3xl flex flex-col items-center gap-2 pt-6 sm:pt-8">
              {/* Eyebrow: A PRODUCTIVITY RPG ── */}
              <div className="hero-anim-item flex items-center gap-2.5 font-arcade text-xs sm:text-sm text-gray-300 tracking-[0.25em] uppercase">
                <span>A PRODUCTIVITY RPG</span>
                <span className="w-6 sm:w-8 h-[2px] bg-gray-400 inline-block" />
              </div>

              {/* Main Headline: REAL PROGRESS. MORE YOU. */}
              <h1 className="hero-anim-item font-arcade text-4xl sm:text-6xl md:text-7xl text-white tracking-wider font-black leading-none select-none drop-shadow-[0_5px_15px_rgba(255,255,255,0.2)]">
                REAL PROGRESS.
              </h1>

              <h2 className="hero-anim-item font-arcade text-4xl sm:text-6xl md:text-7xl text-[#FFE600] neon-glow-gold tracking-wider font-black leading-none select-none drop-shadow-[0_5px_20px_rgba(255,230,0,0.4)] mt-1 sm:mt-2">
                MORE YOU.
              </h2>

              {/* Subtitle */}
              <p className="hero-anim-item text-sm sm:text-base text-gray-200 mt-4 max-w-xl leading-relaxed font-sans">
                Turn your real-life goals into quests, build better habits, and level up your life — one step at a time.
              </p>

              {/* Action Buttons: Start Your Journey -> & Watch 1-min Video */}
              <div className="hero-anim-item flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    if (!currentUser) {
                      window.location.href = "/login?mode=signup";
                    } else {
                      setViewMode("DASHBOARD");
                    }
                  }}
                  className="arcade-btn px-6 sm:px-8 py-3.5 bg-[#FFE600] hover:bg-yellow-400 text-arcadeBlack font-arcade text-xs sm:text-sm font-bold rounded-xl shadow-[0_0_25px_rgba(255,230,0,0.4)] flex items-center gap-2 transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                >
                  <span>Start Your Journey</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    showToast("🎬 Launching Levvo 1-min Video Tour!");
                  }}
                  className="px-5 py-3.5 bg-black/40 hover:bg-black/60 border border-white/25 text-white font-sans text-xs sm:text-sm rounded-xl flex items-center gap-2.5 transition-colors backdrop-blur-sm"
                >
                  <div className="w-6 h-6 rounded-full border border-white/60 flex items-center justify-center bg-white/10">
                    <Play className="w-3 h-3 fill-white translate-x-0.5" />
                  </div>
                  <span>Watch 1-min Video</span>
                </button>
              </div>

              {/* Trust Badges under CTA (Matching Screenshot: Free to join, No pressure, Any device, For all ages) */}
              <div className="hero-anim-item flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-300 mt-6 font-sans select-none">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-neonCyan" />
                  <span>Free to join</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-phosphorGreen" />
                  <span>No pressure</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-arcadeGold" />
                  <span>Any device</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                  <span>For all ages</span>
                </div>
              </div>
            </div>
          </section>

          {/* 4-STEP PROCESS SECTION (MATCHING SCREENSHOT) */}
          <section id="why-levvo" ref={featureCardsRef} className="w-full bg-[#080516] border-b border-[#241744] py-10 px-4 sm:px-8">
            <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
              <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-3">
                {/* Step 1: SET GOALS */}
                <div className="feature-card-anim flex flex-col items-center text-center gap-2 flex-1 max-w-xs">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/15 border border-pink-500/40 flex items-center justify-center text-pink-400 mb-1 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                    <Flag className="w-6 h-6 fill-pink-500/30" />
                  </div>
                  <h3 className="font-arcade text-xs text-white tracking-widest uppercase font-bold">
                    SET GOALS
                  </h3>
                  <p className="text-xs text-gray-400 leading-tight font-sans">
                    Choose what matters to you
                  </p>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-600 hidden lg:block shrink-0" />

                {/* Step 2: COMPLETE TASKS */}
                <div className="feature-card-anim flex flex-col items-center text-center gap-2 flex-1 max-w-xs">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-300 mb-1 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                    <ScrollText className="w-6 h-6" />
                  </div>
                  <h3 className="font-arcade text-xs text-white tracking-widest uppercase font-bold">
                    COMPLETE TASKS
                  </h3>
                  <p className="text-xs text-gray-400 leading-tight font-sans">
                    Do real work, in real life
                  </p>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-600 hidden lg:block shrink-0" />

                {/* Step 3: EARN REWARDS */}
                <div className="feature-card-anim flex flex-col items-center text-center gap-2 flex-1 max-w-xs">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/15 border border-yellow-500/40 flex items-center justify-center text-[#FFE600] mb-1 shadow-[0_0_15px_rgba(255,230,0,0.2)]">
                    <Star className="w-6 h-6 fill-[#FFE600]/40" />
                  </div>
                  <h3 className="font-arcade text-xs text-white tracking-widest uppercase font-bold">
                    EARN REWARDS
                  </h3>
                  <p className="text-xs text-gray-400 leading-tight font-sans">
                    Gain XP, unlock new possibilities
                  </p>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-600 hidden lg:block shrink-0" />

                {/* Step 4: BECOME A BETTER YOU */}
                <div className="feature-card-anim flex flex-col items-center text-center gap-2 flex-1 max-w-xs">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-1 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h3 className="font-arcade text-xs text-white tracking-widest uppercase font-bold">
                    BECOME A BETTER YOU
                  </h3>
                  <p className="text-xs text-gray-400 leading-tight font-sans">
                    Real progress. A brighter tomorrow.
                  </p>
                </div>
              </div>

              {/* Bottom Divider Text: REAL LIFE // REAL PROGRESS // LEVVO */}
              <div className="w-full flex items-center justify-center gap-3 sm:gap-6 text-gray-500 font-mono text-[10px] sm:text-xs tracking-[0.25em] uppercase pt-4 select-none">
                <span className="w-10 sm:w-24 h-px bg-gray-800" />
                <span>REAL LIFE &nbsp;//&nbsp; REAL PROGRESS &nbsp;//&nbsp; LEVVO</span>
                <span className="w-10 sm:w-24 h-px bg-gray-800" />
              </div>
            </div>
          </section>

          {/* INTERACTIVE DASHBOARD SHOWCASE ("REAL GOALS. EPIC PROGRESS.") */}
          <section id="how-it-works" ref={showcaseRef} className="w-full py-12 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Value Proposition */}
              <div className="lg:col-span-4 flex flex-col gap-4 text-left">
                <span className="font-mono text-xs text-neonCyan tracking-widest uppercase">
                  {"// YOUR STORY AWAITS"}
                </span>

                <div className="flex flex-col leading-none">
                  <h2 className="font-arcade text-3xl sm:text-4xl text-[#FFE600] neon-glow-gold tracking-wider">
                    REAL GOALS.
                  </h2>
                  <h2 className="font-arcade text-3xl sm:text-4xl text-synthMagenta neon-glow-magenta tracking-wider mt-1">
                    EPIC PROGRESS.
                  </h2>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed mt-1">
                  Whether you want to learn a new skill, build better habits, stay healthy or complete a big project — Levvo turns it into a game.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      if (currentUser) {
                        setViewMode("DASHBOARD");
                      } else {
                        window.location.href = "/login?mode=signup";
                      }
                    }}
                    className="arcade-btn px-5 py-2.5 bg-neonCyan hover:bg-cyan-300 text-arcadeBlack font-arcade text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    <span>JOIN LEVVO</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      showToast("🎬 Launching Levvo Arcade Demo Video!");
                    }}
                    className="px-4 py-2.5 bg-[#140E2A] hover:bg-[#201445] border border-cabinetBorder text-white font-arcade text-xs rounded-xl flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>WATCH DEMO</span>
                  </button>
                </div>
              </div>

              {/* Middle Column: Interactive 3-Card Arcade HUD Showcase */}
              <div className="lg:col-span-5 flex items-center justify-center relative">
                <div className="floating-card w-full max-w-md flex flex-col gap-3 relative">
                  {/* Daily Quests Centerpiece Card */}
                  <div className="bg-[#120B24] border-2 border-synthMagenta rounded-2xl p-4 sm:p-5 shadow-[0_0_30px_rgba(255,42,133,0.3)] flex flex-col gap-3 relative z-20">
                    <div className="flex items-center justify-between pb-2 border-b border-[#2C1948]">
                      <div className="flex items-center gap-2">
                        <span className="text-synthMagenta">✦</span>
                        <span className="font-arcade text-xs text-neonCyan tracking-wider">
                          DAILY QUESTS
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-gray-400">ACTIVE MISSIONS</span>
                    </div>

                    {/* Checkbox Quest Items */}
                    <div className="flex flex-col gap-2">
                      {showcaseQuests.map((q) => (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => handleToggleShowcaseQuest(q.id)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-left transition-all ${
                            q.done
                              ? "bg-phosphorGreen/15 border-phosphorGreen/60 text-gray-400"
                              : "bg-[#1A1032] border-[#311E58] hover:border-synthMagenta/50 text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                q.done
                                  ? "bg-phosphorGreen border-phosphorGreen text-arcadeBlack"
                                  : "border-gray-500 bg-black/40"
                              }`}
                            >
                              {q.done && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className={`text-xs truncate ${q.done ? "line-through text-gray-400" : "font-medium"}`}>
                              {q.title}
                            </span>
                          </div>
                          <span className="font-arcade text-[10px] text-arcadeGold shrink-0">
                            {q.xp}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Complete Quest Action Button */}
                    <button
                      type="button"
                      onClick={handleCompleteShowcase}
                      className="arcade-btn w-full py-2.5 bg-gradient-to-r from-emerald-500 to-phosphorGreen hover:brightness-110 text-arcadeBlack font-arcade text-xs font-bold rounded-xl border border-emerald-300 shadow-[0_3px_0_#008A36] flex items-center justify-center gap-2 mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>COMPLETE QUEST</span>
                    </button>
                  </div>

                  {/* Player Status & Rewards Shop Mini-Ribbon */}
                  <div className="grid grid-cols-2 gap-3 z-10">
                    {/* Left Mini Card: Player Card */}
                    <div className="bg-[#120B24] border border-[#2C1948] rounded-xl p-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-arcade text-[9px] text-synthMagenta">LEVEL 4</span>
                        <span className="text-base select-none">🧙‍♂️</span>
                      </div>
                      <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-[#2B1B4A]">
                        <div
                          className="h-full bg-gradient-to-r from-neonCyan to-synthMagenta rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (showcaseXp / 800) * 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-mono text-gray-300">
                        <span className="text-arcadeGold flex items-center gap-0.5">🪙 {showcaseGold}</span>
                        <span className="text-arcadeRed flex items-center gap-0.5">🔥 5</span>
                        <span className="text-neonCyan flex items-center gap-0.5">⚡ 67%</span>
                      </div>
                    </div>

                    {/* Right Mini Card: Rewards Shop */}
                    <div className="bg-[#120B24] border border-[#2C1948] rounded-xl p-3 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-arcade text-[9px] text-arcadeGold">REWARDS SHOP</span>
                        <ShoppingBag className="w-3 h-3 text-arcadeGold" />
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 pt-1 text-center text-sm">
                        <span className="p-1 bg-[#1A1032] rounded border border-cabinetBorder hover:scale-110 transition-transform select-none" title="Sword">🗡️</span>
                        <span className="p-1 bg-[#1A1032] rounded border border-cabinetBorder hover:scale-110 transition-transform select-none" title="Mana Crystal">🔮</span>
                        <span className="p-1 bg-[#1A1032] rounded border border-cabinetBorder hover:scale-110 transition-transform select-none" title="Pet">🐕</span>
                        <span className="p-1 bg-[#1A1032] rounded border border-cabinetBorder hover:scale-110 transition-transform select-none" title="Cloak">🧙‍♂️</span>
                        <span className="p-1 bg-[#1A1032] rounded border border-cabinetBorder hover:scale-110 transition-transform select-none" title="Chest">📦</span>
                        <span className="p-1 bg-[#1A1032] rounded border border-cabinetBorder hover:scale-110 transition-transform select-none" title="Diamond">💎</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Lifetime Stats Counters */}
              <div className="lg:col-span-3 flex flex-col gap-3.5">
                {/* Counter 1: Active Explorers */}
                <div className="bg-[#120D2A] border border-[#2B1D54] rounded-2xl p-4 flex items-center gap-4 shadow-lg hover:border-synthMagenta/50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-synthMagenta/15 border border-synthMagenta/40 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-synthMagenta" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-arcade text-xl sm:text-2xl text-white font-bold tracking-wider">
                      12,428
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono tracking-wider">
                      ACTIVE EXPLORERS
                    </span>
                  </div>
                </div>

                {/* Counter 2: Quests Completed */}
                <div className="bg-[#120D2A] border border-[#2B1D54] rounded-2xl p-4 flex items-center gap-4 shadow-lg hover:border-arcadeGold/50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-arcadeGold/15 border border-arcadeGold/40 flex items-center justify-center shrink-0">
                    <Flag className="w-6 h-6 text-arcadeGold" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-arcade text-xl sm:text-2xl text-[#FFE600] font-bold tracking-wider">
                      1,16,320
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono tracking-wider">
                      QUESTS COMPLETED
                    </span>
                  </div>
                </div>

                {/* Counter 3: User Happiness */}
                <div className="bg-[#120D2A] border border-[#2B1D54] rounded-2xl p-4 flex items-center gap-4 shadow-lg hover:border-yellow-400/50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-yellow-400/15 border border-yellow-400/40 flex items-center justify-center shrink-0">
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-arcade text-xl sm:text-2xl text-yellow-300 font-bold tracking-wider">
                      4.8/5
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono tracking-wider">
                      USER HAPPINESS
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Win Dopamine Bar */}
          <section className="w-full bg-[#09071A] border-t border-b border-[#281A4C] py-8 px-4 sm:px-8">
            <div className="max-w-4xl mx-auto flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-synthMagenta animate-pulse" />
                  <span className="font-arcade text-xs text-synthMagenta neon-glow-magenta tracking-wider">
                    TRY A MICRO-WIN • LOG A QUICK WIN
                  </span>
                </div>
                {!currentUser && (
                  <Link
                    href="/login"
                    className="text-[10px] font-arcade text-neonCyan hover:underline"
                  >
                    LOGIN TO SAVE PROGRESS →
                  </Link>
                )}
              </div>
              <QuickMilestone onLogWin={handleLogQuickWin} />
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FOOTER (EXACT MATCH TO SCREENSHOT)                                    */}
      {/* ========================================================================= */}
      {!currentUser && (
        <footer className="w-full bg-[#05030E] border-t border-[#1C1236] py-5 px-4 sm:px-8 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-arcade text-xs">
            {/* Left Brand */}
            <div className="flex items-center gap-2">
              <span className="text-synthMagenta">✦</span>
              <span className="text-synthMagenta tracking-widest font-bold">LEVVO</span>
            </div>

            {/* Center Pillars */}
            <div className="text-[10px] sm:text-xs text-gray-400 tracking-widest flex items-center gap-2 select-none">
              <span>LEARN</span>
              <span>•</span>
              <span>IMPROVE</span>
              <span>•</span>
              <span>EXPLORE</span>
              <span>•</span>
              <span>LEVEL UP</span>
            </div>

            {/* Right Slogan */}
            <div className="text-[10px] text-gray-400 tracking-widest">
              90&apos;S RETRO ARCADE LIFE RPG • LEVVO STUDIOS™
            </div>
          </div>
        </footer>
      )}

      {/* ========================================================================= */}
      {/* MODALS                                                                    */}
      {/* ========================================================================= */}
      <ArcadeAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticated={(user) => {
          setCurrentUser(user);
          setViewMode("DASHBOARD");
          loadAllData();
          showToast(`🌟 Welcome back, ${user.username}!`);
        }}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={({ ageGroup, seededTasks }) => {
          setIsOnboardingOpen(false);
          sounds.playLevelUp();
          showToast(`🌟 Welcome ${ageGroup} Hero! ${seededTasks.length} daily quests forged.`);
          if (seededTasks && seededTasks.length > 0) {
            setTasks((prev) => [...seededTasks, ...prev]);
          }
          loadAllData();
        }}
        onSkip={() => setIsOnboardingOpen(false)}
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
        onCampaignAccepted={(quests) => {
          sounds.playLevelUp();
          showToast(`⚔️ Oracle campaign forged! +${quests.length} quests enrolled.`);
          setTasks((prev) => [...quests, ...prev]);
          loadAllData();
        }}
      />

      <LevelUpCelebration
        isOpen={levelUpData.isOpen}
        newLevel={levelUpData.newLevel}
        onClose={() => setLevelUpData({ isOpen: false, newLevel: 1 })}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#120D24] border-2 border-neonCyan rounded-xl px-4 py-2.5 shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-neonCyan" />
          <span className="text-xs font-semibold text-textPrimary">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
