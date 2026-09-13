"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { sounds } from "@/lib/sound";
import { TaskItem } from "@/components/quests/QuestCard";
import { ArcadeTimer } from "./ArcadeTimer";
import { RetroArcadeZone } from "./RetroArcadeZone";
import { PredefinedTrackers } from "./PredefinedTrackers";
import { JourneyProgress } from "./JourneyProgress";
import { QuickMilestone } from "./QuickMilestone";

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
  onLogout,
  onRefresh,
}: ModernAppDashboardProps) {
  // Active Sidebar Nav Tab
  const [activeTab, setActiveTab] = useState<"HOME" | "TODAY" | "GOALS" | "FOCUS" | "PROGRESS" | "ARCADE" | "PROFILE">("HOME");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Time-aware greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  // Filter tasks based on search
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    return tasks.filter((t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  const activeTasks = useMemo(() => filteredTasks.filter((t) => t.status === "ACTIVE"), [filteredTasks]);
  const completedTasks = useMemo(() => filteredTasks.filter((t) => t.status === "COMPLETED"), [filteredTasks]);

  const navItems = [
    { id: "HOME", label: "Home", icon: Home },
    { id: "TODAY", label: "Today", icon: CheckCircle2, count: activeTasks.length },
    { id: "GOALS", label: "Goals", icon: Target },
    { id: "FOCUS", label: "Focus", icon: Clock },
    { id: "PROGRESS", label: "Progress", icon: BarChart3 },
    { id: "ARCADE", label: "Arcade", icon: Gamepad2 },
    { id: "PROFILE", label: "Profile", icon: User },
  ] as const;

  // Determine user display name
  const displayName = character?.username || currentUser.username || "Adventurer";
  const firstName = displayName.split(" ")[0];

  return (
    <div className="min-h-screen bg-[#080A14] text-white flex flex-col md:flex-row relative selection:bg-synthMagenta selection:text-white font-sans overflow-x-hidden">
      {/* ========================================================================= */}
      {/* 1. LEFT MODERN SIDEBAR                                                    */}
      {/* ========================================================================= */}
      <aside
        className={`w-64 bg-[#0B0E1B] border-r border-[#192038] flex flex-col shrink-0 z-40 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? "fixed inset-y-0 left-0 shadow-2xl" : "hidden md:flex"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-[#192038]/60">
          <Link
            href="/"
            onClick={() => {
              sounds.playClick();
              setActiveTab("HOME");
            }}
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-synthMagenta to-[#8A2BE2] flex items-center justify-center border border-synthMagenta/60 shadow-[0_0_12px_rgba(255,42,133,0.4)]">
              <Gamepad2 className="w-5 h-5 text-arcadeGold animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-arcade text-lg text-[#FFE600] neon-glow-gold tracking-widest font-black leading-none group-hover:scale-105 transition-transform">
                LEVVO
              </span>
              <span className="font-arcade text-[8px] text-gray-400 tracking-wider mt-0.5 leading-none">
                SMALL STEPS. EPIC YOU.
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-gray-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1.5 overflow-y-auto">
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
                className={`w-full px-3.5 py-2.5 rounded-xl font-medium text-xs flex items-center justify-between transition-all ${
                  isActive
                    ? "bg-[#161F38] text-white font-semibold border-l-4 border-synthMagenta shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-[#11172A]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-synthMagenta" : "text-gray-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {"count" in item && item.count !== undefined && item.count > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#201435] border border-synthMagenta/40 text-synthMagenta text-[10px] font-arcade">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Sidebar Pixel Character & Quote Widget */}
        <div className="p-4 border-t border-[#192038]/60 flex items-center gap-3 bg-[#0E1222]/50">
          <div className="w-10 h-10 rounded-lg bg-black/40 border border-[#232D4B] flex items-center justify-center shrink-0 text-xl select-none">
            🧙‍♂️
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-arcade text-[10px] text-arcadeGold leading-tight truncate">
              {character?.title || "Hero"}
            </span>
            <span className="text-[10px] text-gray-400 italic leading-snug truncate">
              &ldquo;Discipline today, a brighter tomorrow.&rdquo;
            </span>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT AREA (APP BAR + CLEAN 2-COLUMN DASHBOARD)                 */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top App Bar (Search + Notifications + User Menu) */}
        <header className="h-16 bg-[#0B0E1B]/95 border-b border-[#192038] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
          {/* Mobile Menu Toggle + Left Breadcrumb */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#141B30]"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Input (Matching Screenshot: Search anything... ⌘K) */}
            <div className="relative w-full max-w-xs sm:max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anything..."
                className="w-full bg-[#12162A] border border-[#212A45] rounded-xl pl-9 pr-12 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-synthMagenta transition-colors"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[9px] text-gray-500 bg-[#0B0E1B] px-1.5 py-0.5 rounded border border-[#212A45]">
                ⌘K
              </span>
            </div>
          </div>

          {/* Right Action Icons & User Badge */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Ask AI Quick Button */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onOpenAiOracle();
              }}
              className="arcade-btn hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-900/60 to-purple-800/40 border border-purple-500/40 text-purple-200 text-xs font-arcade hover:brightness-110 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-arcadeGold" />
              <span>ASK AI</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setNotificationsOpen(!notificationsOpen);
                }}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#141B30] relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-arcadeRed absolute top-2 right-2 ring-2 ring-[#0B0E1B]" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#12162A] border border-[#212A45] rounded-xl shadow-2xl p-3 z-50 text-xs animate-in fade-in zoom-in-95">
                  <div className="font-arcade text-[10px] text-arcadeGold uppercase tracking-wider pb-2 border-b border-[#212A45]">
                    DAILY BRIEFING
                  </div>
                  <div className="py-2 flex flex-col gap-2 text-gray-300">
                    <p>⚔️ {activeTasks.length} active quests ready for action!</p>
                    <p>🔥 Streak maintained: {character?.streakCurrent || 1} days strong.</p>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Chip (Matching Screenshot: Circle Initials + Name) */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#192038]">
              <Link
                href="/profile"
                onClick={() => sounds.playClick()}
                className="flex items-center gap-2 group p-1 rounded-xl hover:bg-[#141B30] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center font-bold text-xs text-white shadow-sm ring-1 ring-cyan-400/40">
                  {firstName.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-gray-200 group-hover:text-white leading-tight">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono leading-none">
                    Lv. {character?.currentLevel || 1}
                  </span>
                </div>
              </Link>

              {/* Logout button */}
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-arcadeRed/20 transition-colors text-xs"
                title="Log out"
              >
                ✕
              </button>
            </div>
          </div>
        </header>

        {/* ===================================================================== */}
        {/* 3. TAB CANVAS CONTENT                                                 */}
        {/* ===================================================================== */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex flex-col gap-6">
          {/* TAB 1: HOME (THE CLEAN REDESIGNED DASHBOARD OVERVIEW) */}
          {activeTab === "HOME" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* ------------------------------------------------------------- */}
              {/* LEFT MAIN COLUMN (8 of 12 columns)                            */}
              {/* ------------------------------------------------------------- */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {/* 1. HERO GREETING BANNER CARD (WITH CASTLE ARTWORK) */}
                <div className="relative w-full rounded-2xl overflow-hidden border border-[#212A45] shadow-xl min-h-[220px] sm:min-h-[260px] flex flex-col justify-between p-6 sm:p-8 bg-[#0D1224]">
                  {/* Background Castle Pixel Art with Vignette */}
                  <div
                    className="absolute inset-0 bg-cover bg-right sm:bg-center z-0 scale-100 opacity-60"
                    style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E1B] via-[#0B0E1B]/85 to-transparent z-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E1B] via-transparent to-transparent z-0" />

                  {/* Left Greeting Text */}
                  <div className="relative z-10 max-w-md flex flex-col gap-1 text-left">
                    <span className="text-xs sm:text-sm text-gray-300 font-medium">
                      {greeting},
                    </span>
                    <h1 className="font-arcade text-3xl sm:text-4xl text-[#FFE600] neon-glow-gold tracking-wider font-black drop-shadow-md">
                      {firstName}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-300 mt-1 leading-relaxed">
                      Small steps today, a brighter you tomorrow.
                    </p>
                  </div>

                  {/* Quote Bubble Overlay (Matching Screenshot) */}
                  <div className="relative z-10 mt-6 flex items-center justify-between flex-wrap gap-3">
                    <div className="inline-flex items-center gap-2 bg-[#090C18]/80 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 text-xs text-gray-300 shadow-lg">
                      <span className="text-synthMagenta font-serif text-sm">&ldquo;</span>
                      <span>A better you is a series of small wins.</span>
                      <span className="text-synthMagenta font-serif text-sm">&rdquo;</span>
                    </div>

                    {/* Right Tag on Artwork */}
                    <div className="hidden sm:flex font-arcade text-xs text-amber-200/90 tracking-widest italic drop-shadow">
                      Progress Lives Here
                    </div>
                  </div>
                </div>

                {/* 2. TODAY'S FOCUS (QUEST / TASK LIST CARD) */}
                <div className="bg-[#0E1326] border border-[#212A45] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#1E2742]">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base select-none">☀️</span>
                      <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                        Today&apos;s Focus
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#18213D] border border-[#2A375F] text-gray-300 text-[11px] font-medium">
                        {activeTasks.length} tasks
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        onOpenCreateQuest();
                      }}
                      className="arcade-btn px-3.5 py-1.5 bg-[#4F46E5] hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Task</span>
                    </button>
                  </div>

                  {/* Task List Items (Clean Modern List matching Screenshot) */}
                  {filteredTasks.length === 0 ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#18213D] flex items-center justify-center text-gray-400">
                        <Check className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-gray-400 font-medium">No tasks found for today</p>
                      <button
                        type="button"
                        onClick={onOpenCreateQuest}
                        className="text-xs text-synthMagenta hover:underline font-semibold"
                      >
                        + Create your first quest
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {filteredTasks.map((t) => {
                        const isDone = t.status === "COMPLETED";
                        const xpReward = t.xpReward || (t.difficulty === "Hard" ? 50 : t.difficulty === "Medium" ? 40 : 30);
                        const duration = t.difficulty === "Hard" ? "~ 45 min" : t.difficulty === "Medium" ? "~ 30 min" : "~ 15 min";
                        const categoryName = (
                          { INT: "Learning", STR: "Health", WIS: "Mindset", DEX: "Focus", CRE: "Creative", CHA: "Social" } as Record<string, string>
                        )[t.attributeCode] || "General";

                        return (
                          <div
                            key={t.id}
                            className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                              isDone
                                ? "bg-[#11172A]/50 border-[#1C253E] text-gray-400 opacity-80"
                                : "bg-[#131930] border-[#222C4A] hover:border-synthMagenta/50 text-white"
                            }`}
                          >
                            {/* Checkbox & Title */}
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => {
                                  sounds.playClick();
                                  if (!isDone) onCompleteTask(t.id);
                                }}
                                disabled={isDone}
                                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                                  isDone
                                    ? "bg-emerald-500 border-emerald-400 text-black shadow-sm"
                                    : "border-gray-500 hover:border-synthMagenta bg-black/40"
                                }`}
                              >
                                {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>

                              <span
                                className={`text-xs sm:text-sm font-medium truncate ${
                                  isDone ? "line-through text-gray-400" : "text-gray-100"
                                }`}
                              >
                                {t.title}
                              </span>
                            </div>

                            {/* Tags & Actions */}
                            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                              {/* Category tag */}
                              <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-[#1D2644] border border-[#2B3860] text-[10px] text-gray-300 font-medium">
                                {categoryName}
                              </span>

                              {/* XP Reward badge */}
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[10px] font-arcade text-amber-300 font-bold">
                                +{xpReward} XP
                              </span>

                              {/* Estimated Duration */}
                              <span className="hidden md:inline-block text-[11px] text-gray-400 font-mono">
                                {duration}
                              </span>

                              {/* Done Indicator / Edit Chevron */}
                              {isDone ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                                  <Check className="w-3 h-3" />
                                  <span>Done</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => onEditTask(t)}
                                  className="p-1 text-gray-400 hover:text-white rounded transition-colors"
                                  title="Edit quest"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Encouraging Footer Banner */}
                  <div className="pt-2 border-t border-[#1E2742] flex items-center justify-between text-xs text-gray-400 select-none">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400">🚩</span>
                      <span>
                        {activeTasks.length > 0
                          ? `Keep going! ${activeTasks.length} more tasks to complete today.`
                          : "Outstanding work! All today's quests are finished."}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab("TODAY")}
                      className="text-cyan-400 hover:underline text-[11px] font-medium"
                    >
                      View All →
                    </button>
                  </div>
                </div>

                {/* 3. INSPIRATIONAL ARTWORK BANNER (MATCHING SCREENSHOT) */}
                <div className="relative w-full rounded-2xl overflow-hidden border border-[#212A45] p-6 bg-gradient-to-r from-[#0C1226] via-[#101730] to-[#0A0E1C] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl select-none shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                      🏮
                    </div>
                    <div className="flex flex-col">
                      <p className="text-xs sm:text-sm font-medium text-gray-200 italic">
                        &ldquo;Discipline today, a brighter tomorrow.&rdquo;
                      </p>
                      <span className="text-[10px] font-arcade text-amber-400 mt-1">
                        — LEVVO
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("PROGRESS")}
                    className="arcade-btn hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#192240] border border-[#2B3A68] hover:border-synthMagenta text-gray-300 hover:text-white text-xs font-arcade"
                  >
                    <span>JOURNEY</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* RIGHT SIDEBAR COLUMN (4 of 12 columns)                         */}
              {/* ------------------------------------------------------------- */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {/* 1. LEVEL & PLAYER STATS CARD (MATCHING SCREENSHOT) */}
                <div className="bg-[#0E1326] border border-[#212A45] rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-synthMagenta/20 border border-synthMagenta/40 flex items-center justify-center text-synthMagenta shadow-sm">
                        <Target className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-arcade text-xs text-white">
                          Level {character?.currentLevel || 1}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {character?.title || "Novice Explorer"}
                        </span>
                      </div>
                    </div>
                    <span className="font-arcade text-xs text-synthMagenta">
                      {character?.progressPercent || 0}%
                    </span>
                  </div>

                  {/* Smooth Gradient Progress Bar */}
                  <div className="flex flex-col gap-1.5">
                    <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-[#202947]">
                      <div
                        className="h-full bg-gradient-to-r from-neonCyan via-synthMagenta to-arcadeGold rounded-full transition-all duration-500"
                        style={{ width: `${character?.progressPercent || 0}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                      <span>{character?.currentLevelXp || 0} / {character?.xpToNextLevel || 100} XP</span>
                      <span>Total: {character?.totalXp || 0}</span>
                    </div>
                  </div>

                  {/* Mini Stats Grid: Gold & Streak */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#1E2742]">
                    <div className="bg-[#12182E] border border-[#222C4D] rounded-xl p-3 flex items-center gap-2.5">
                      <Coins className="w-5 h-5 text-arcadeGold shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-arcade text-xs text-white truncate">
                          {character?.gold || 0}
                        </span>
                        <span className="text-[10px] text-gray-400 leading-none">Gold</span>
                      </div>
                    </div>

                    <div className="bg-[#12182E] border border-[#222C4D] rounded-xl p-3 flex items-center gap-2.5">
                      <Flame className="w-5 h-5 text-arcadeRed shrink-0 animate-pulse" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-arcade text-xs text-white truncate">
                          {character?.streakCurrent || 1}
                        </span>
                        <span className="text-[10px] text-gray-400 leading-none">Day Streak</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. WISDOM QUOTE CARD */}
                <div className="bg-[#0E1326] border border-[#212A45] rounded-2xl p-4 sm:p-5 shadow-lg flex items-start gap-3">
                  <span className="text-synthMagenta font-serif text-2xl leading-none select-none">
                    &ldquo;
                  </span>
                  <p className="text-xs text-gray-300 leading-relaxed italic">
                    You&apos;re not just doing tasks. You&apos;re building a better you.
                  </p>
                </div>

                {/* 3. YOUR GOALS & HABITS (MATCHING SCREENSHOT) */}
                <div className="bg-[#0E1326] border border-[#212A45] rounded-2xl p-5 shadow-xl flex flex-col gap-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#1E2742]">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-arcadeRed" />
                      <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                        Your Goals
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("GOALS")}
                      className="text-cyan-400 hover:underline text-[11px] font-medium"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Goal Item 1 */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Laptop className="w-3.5 h-3.5 text-neonCyan" />
                          <span className="font-medium text-gray-200">Final Year Project</span>
                        </div>
                        <span className="font-mono text-[10px] text-neonCyan">60%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                        <div className="w-[60%] h-full bg-neonCyan rounded-full" />
                      </div>
                    </div>

                    {/* Goal Item 2 */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Code className="w-3.5 h-3.5 text-pink-400" />
                          <span className="font-medium text-gray-200">Learn React & DSA</span>
                        </div>
                        <span className="font-mono text-[10px] text-pink-400">45%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                        <div className="w-[45%] h-full bg-pink-400 rounded-full" />
                      </div>
                    </div>

                    {/* Tracker Sample Item: Water */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#1E2742]/60 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-base select-none">💧</span>
                        <span className="font-medium text-gray-300">Hydration</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onDecrementTracker("water")}
                          className="w-5 h-5 rounded bg-[#161F38] hover:bg-[#202B4E] flex items-center justify-center text-gray-300 text-xs"
                        >
                          -
                        </button>
                        <span className="font-arcade text-xs text-neonCyan px-1">
                          {trackerCounts["water"] || 0}/8
                        </span>
                        <button
                          type="button"
                          onClick={() => onIncrementTracker("water")}
                          className="w-5 h-5 rounded bg-[#161F38] hover:bg-[#202B4E] flex items-center justify-center text-gray-300 text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. QUICK ACTIONS (2x2 GRID MATCHING SCREENSHOT) */}
                <div className="bg-[#0E1326] border border-[#212A45] rounded-2xl p-5 shadow-xl flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white tracking-wide">
                    <Zap className="w-4 h-4 text-arcadeGold" />
                    <span>Quick Actions</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Action 1: New Task */}
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        onOpenCreateQuest();
                      }}
                      className="p-3 rounded-xl bg-[#131930] hover:bg-[#1A2242] border border-[#222C4D] hover:border-cyan-400/50 flex flex-col items-center justify-center gap-1.5 transition-all text-center group"
                    >
                      <Plus className="w-4 h-4 text-neonCyan group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-semibold text-gray-200">New Task</span>
                    </button>

                    {/* Action 2: Focus Mode */}
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setActiveTab("FOCUS");
                      }}
                      className="p-3 rounded-xl bg-[#131930] hover:bg-[#1A2242] border border-[#222C4D] hover:border-pink-400/50 flex flex-col items-center justify-center gap-1.5 transition-all text-center group"
                    >
                      <Clock className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-semibold text-gray-200">Focus Mode</span>
                    </button>

                    {/* Action 3: Ask AI */}
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        onOpenAiOracle();
                      }}
                      className="p-3 rounded-xl bg-[#131930] hover:bg-[#1A2242] border border-[#222C4D] hover:border-purple-400/50 flex flex-col items-center justify-center gap-1.5 transition-all text-center group"
                    >
                      <Sparkles className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-semibold text-gray-200">Ask AI</span>
                    </button>

                    {/* Action 4: View Progress */}
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setActiveTab("PROGRESS");
                      }}
                      className="p-3 rounded-xl bg-[#131930] hover:bg-[#1A2242] border border-[#222C4D] hover:border-emerald-400/50 flex flex-col items-center justify-center gap-1.5 transition-all text-center group"
                    >
                      <BarChart3 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-semibold text-gray-200">View Progress</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TODAY (FULL-LENGTH QUEST MANAGER) */}
          {activeTab === "TODAY" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between pb-2 border-b border-[#1E2742]">
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-neonCyan" />
                    <span>Daily Quest Log</span>
                  </h1>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Execute your missions, defeat procrastination, bank XP.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenCreateQuest}
                  className="arcade-btn px-4 py-2 bg-[#4F46E5] hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Quest</span>
                </button>
              </div>

              {/* Task list with Active & Completed */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0E1326] border border-[#212A45] rounded-2xl p-5 flex flex-col gap-3">
                  <h3 className="font-arcade text-xs text-neonCyan flex items-center gap-2">
                    <span>ACTIVE QUESTS</span>
                    <span className="px-2 py-0.5 rounded bg-[#18213D] text-[10px] text-white">
                      {activeTasks.length}
                    </span>
                  </h3>
                  <div className="flex flex-col gap-2">
                    {activeTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl bg-[#131930] border border-[#222C4D] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            type="button"
                            onClick={() => onCompleteTask(t.id)}
                            className="w-5 h-5 rounded border border-gray-500 hover:border-emerald-400 flex items-center justify-center shrink-0"
                          >
                            <Check className="w-3.5 h-3.5 opacity-0 hover:opacity-100" />
                          </button>
                          <span className="text-xs font-medium text-white truncate">{t.title}</span>
                        </div>
                        <span className="font-arcade text-[10px] text-arcadeGold">+{t.difficulty === "Hard" ? 50 : 30} XP</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0E1326] border border-[#212A45] rounded-2xl p-5 flex flex-col gap-3">
                  <h3 className="font-arcade text-xs text-emerald-400 flex items-center gap-2">
                    <span>COMPLETED TODAY</span>
                    <span className="px-2 py-0.5 rounded bg-[#18213D] text-[10px] text-white">
                      {completedTasks.length}
                    </span>
                  </h3>
                  <div className="flex flex-col gap-2">
                    {completedTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl bg-[#11172A]/50 border border-[#1C253E] flex items-center justify-between gap-3 text-gray-400"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-5 h-5 rounded bg-emerald-500 text-black flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <span className="text-xs line-through truncate">{t.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400">BANKED</span>
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
              <div className="pb-2 border-b border-[#1E2742]">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-arcadeRed" />
                  <span>Goals & Milestones</span>
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
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

          {/* TAB 4: FOCUS (ARCADE FOCUS TIMER CHAMBER) */}
          {activeTab === "FOCUS" && (
            <div className="flex flex-col gap-6">
              <div className="pb-2 border-b border-[#1E2742]">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-pink-400" />
                  <span>Focus Chamber Sprint</span>
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  Engage high-focus deep work sprints with live Pac-Man pellet corridor animations.
                </p>
              </div>

              <ArcadeTimer tasks={tasks} onSessionComplete={onTimerComplete} />
            </div>
          )}

          {/* TAB 5: PROGRESS (JOURNEY & STATS) */}
          {activeTab === "PROGRESS" && (
            <div className="flex flex-col gap-6">
              <div className="pb-2 border-b border-[#1E2742]">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  <span>Hero Journey & Progress</span>
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
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

          {/* TAB 6: ARCADE (OG 90'S VIDEOGAME ZONE: PAC-MAN, SNAKES & LADDERS, LUDO) */}
          {activeTab === "ARCADE" && (
            <div className="flex flex-col gap-6">
              <div className="pb-2 border-b border-[#1E2742]">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-arcadeGold" />
                  <span>90&apos;s Retro Arcade Zone</span>
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
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

          {/* TAB 7: PROFILE */}
          {activeTab === "PROFILE" && (
            <div className="bg-[#0E1326] border border-[#212A45] rounded-2xl p-6 flex flex-col gap-4">
              <h2 className="text-lg font-bold text-white">Hero Identity</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-3xl select-none">
                  🧙‍♂️
                </div>
                <div className="flex flex-col">
                  <span className="font-arcade text-lg text-arcadeGold">{displayName}</span>
                  <span className="text-xs text-gray-400">{currentUser.email}</span>
                  <span className="text-xs text-synthMagenta font-mono mt-1">
                    Level {character?.currentLevel || 1} • {character?.title || "Hero"}
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t border-[#1E2742] flex items-center gap-3">
                <Link
                  href="/profile"
                  className="arcade-btn px-4 py-2 bg-neonCyan text-arcadeBlack font-arcade text-xs font-bold rounded-xl flex items-center gap-2"
                >
                  <span>Open Full Wardrobe & Shop</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-4 py-2 bg-arcadeRed/20 hover:bg-arcadeRed/40 text-arcadeRed border border-arcadeRed/40 font-arcade text-xs rounded-xl"
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
