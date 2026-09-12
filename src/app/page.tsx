"use client";

import React, { useState, useEffect } from "react";
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
  ChevronRight,
} from "lucide-react";
import confetti from "canvas-confetti";
import { sounds } from "@/lib/sound";
import { ArcadeAuthModal } from "@/components/auth/ArcadeAuthModal";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { AiCampaignModal } from "@/components/modals/AiCampaignModal";
import { LevelUpCelebration } from "@/components/modals/LevelUpCelebration";

export default function QuestoriaHomePage() {
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; username: string } | null>(null);
  const [character, setCharacter] = useState<any>(null);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ isOpen: boolean; newLevel: number }>({
    isOpen: false,
    newLevel: 1,
  });

  // Interactive showcase quest checkboxes
  const [showcaseQuests, setShowcaseQuests] = useState([
    { id: "q1", title: "Study DSA (1 hour)", xp: "+50 XP", done: false },
    { id: "q2", title: "Read a book (20 pages)", xp: "+30 XP", done: false },
    { id: "q3", title: "Workout (30 mins)", xp: "+40 XP", done: false },
    { id: "q4", title: "Plan tomorrow", xp: "+20 XP", done: false },
  ]);

  const [showcaseGold, setShowcaseGold] = useState(545);
  const [showcaseXp, setShowcaseXp] = useState(749);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  useEffect(() => {
    checkAuth();
    loadCharacter();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/v1/auth/me");
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
      }
    } catch {
      // Guest mode
    }
  };

  const loadCharacter = async () => {
    try {
      const res = await fetch("/api/v1/character");
      const data = await res.json();
      if (data.success) {
        setCharacter(data.data);
        if (data.data.gold) setShowcaseGold(data.data.gold);
        if (data.data.currentLevelXp) setShowcaseXp(data.data.currentLevelXp);
      }
    } catch {
      // Guest defaults
    }
  };

  const handleToggleQuest = (id: string) => {
    sounds.playClick();
    setShowcaseQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, done: !q.done } : q))
    );
  };

  const handleCompleteShowcaseQuests = () => {
    sounds.playLevelUp();
    confetti({
      particleCount: 65,
      spread: 75,
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
      showToast("✨ Daily Quests Refreshed!");
      setShowcaseQuests((prev) => prev.map((q) => ({ ...q, done: false })));
    }
  };

  const handleStartJourney = () => {
    sounds.playClick();
    if (!currentUser) {
      setIsAuthOpen(true);
    } else if (character?.needsOnboarding) {
      setIsOnboardingOpen(true);
    } else {
      window.location.href = "/profile";
    }
  };

  return (
    <div className="min-h-screen bg-[#070514] text-white flex flex-col selection:bg-synthMagenta selection:text-white font-sans relative overflow-x-hidden">
      {/* ========================================================================= */}
      {/* 1. TOP NAV BAR                                                            */}
      {/* ========================================================================= */}
      <header className="w-full bg-[#09071A]/95 backdrop-blur-md border-b border-[#281A4C] sticky top-0 z-50 px-4 sm:px-8 py-3 flex items-center justify-between shadow-lg">
        {/* Left Brand */}
        <Link href="/" className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg p-1">
          <span className="text-synthMagenta text-xl select-none animate-pulse">✦</span>
          <div className="flex flex-col">
            <span className="font-arcade text-lg sm:text-xl text-[#FFE600] neon-glow-gold tracking-widest font-black leading-none group-hover:scale-105 transition-transform">
              QUESTORIA
            </span>
            <span className="font-arcade text-[9px] sm:text-[10px] text-synthMagenta tracking-wider mt-0.5 leading-none">
              SMALL STEPS. EPIC YOU.
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#120D2A] border border-[#2B1D54] rounded-xl px-2 py-1">
          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-lg bg-[#2E1045] border border-synthMagenta text-white font-arcade text-xs shadow-[0_0_10px_rgba(255,42,133,0.3)] transition-all"
          >
            Home
          </Link>
          <a
            href="#features"
            className="px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 font-sans text-xs transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 font-sans text-xs transition-colors"
          >
            How It Works
          </a>
          <a
            href="#worlds"
            className="px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 font-sans text-xs transition-colors"
          >
            Worlds
          </a>
          <a
            href="#about"
            className="px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 font-sans text-xs transition-colors"
          >
            About
          </a>
        </nav>

        {/* Right CTA Group */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Oracle Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsAiOpen(true);
            }}
            className="arcade-btn px-3.5 py-1.5 bg-gradient-to-r from-[#8A2BE2] to-[#9932CC] hover:brightness-110 text-white font-arcade text-xs rounded-lg border border-purple-300 shadow-[0_0_15px_rgba(138,43,226,0.4)] flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <Sparkles className="w-3.5 h-3.5 text-arcadeGold" />
            <span className="hidden sm:inline">✦ AI ORACLE</span>
            <span className="sm:hidden">ORACLE</span>
          </button>

          {/* Shop Button */}
          <Link
            href="/profile"
            onClick={() => sounds.playClick()}
            className="arcade-btn px-3 py-1.5 bg-[#FFE600] hover:bg-yellow-400 text-arcadeBlack font-arcade text-xs font-bold rounded-lg border border-yellow-200 shadow-[0_2px_0_#9E8200] flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>SHOP</span>
          </Link>

          {/* Login / Profile Button */}
          {currentUser ? (
            <Link
              href="/profile"
              onClick={() => sounds.playClick()}
              className="arcade-btn px-3 py-1.5 bg-neonCyan hover:bg-cyan-300 text-arcadeBlack font-arcade text-xs font-bold rounded-lg border border-cyan-200 shadow-[0_2px_0_#008B99] flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <span>{currentUser.username}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsAuthOpen(true);
              }}
              className="arcade-btn px-3 py-1.5 bg-neonCyan hover:bg-cyan-300 text-arcadeBlack font-arcade text-xs font-bold rounded-lg border border-cyan-200 shadow-[0_2px_0_#008B99] flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>LOGIN</span>
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO LANDSCAPE CANVAS (MATCHING SCREENSHOT)                            */}
      {/* ========================================================================= */}
      <section className="relative w-full min-h-[580px] sm:min-h-[640px] md:min-h-[700px] flex flex-col items-center justify-center text-center px-4 overflow-hidden border-b border-[#281A4C]">
        {/* Background Image Artwork */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
        />

        {/* Ambient Dark Gradient Vignette Overlay for Crisp Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070514]/75 via-[#070514]/50 to-[#070514] z-0" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#070514]/30 to-[#070514]/90 z-0" />

        {/* Top-Left Terminal Status Overlay */}
        <div className="absolute top-6 left-6 z-10 hidden md:flex flex-col gap-1 text-left bg-black/60 backdrop-blur-sm border border-neonCyan/30 rounded-xl p-3 shadow-[0_0_15px_rgba(0,240,255,0.15)] font-mono text-xs">
          <div className="text-neonCyan">&gt; SYSTEM: ONLINE</div>
          <div className="text-gray-300">&gt; PLAYERS: 12,428</div>
          <div className="text-phosphorGreen animate-pulse">&gt; A BETTER YOU AWAITS_</div>
        </div>

        {/* Left Floating Signpost Overlay */}
        <div className="absolute bottom-16 left-6 z-10 hidden lg:flex flex-col gap-1 text-left bg-[#1B112D]/85 backdrop-blur-sm border-2 border-synthMagenta/50 rounded-xl p-3.5 shadow-[0_0_20px_rgba(255,42,133,0.2)] font-arcade text-xs">
          <div className="text-neonCyan">• DISCIPLINE</div>
          <div className="text-neonCyan">• SKILLS</div>
          <div className="text-neonCyan">• HEALTH</div>
          <div className="text-neonCyan">• CREATIVITY</div>
          <div className="text-arcadeGold pt-1 border-t border-synthMagenta/40">A BRIGHTER YOU →</div>
        </div>

        {/* Right Floating Annotation Overlay */}
        <div className="absolute top-10 right-8 z-10 hidden lg:flex flex-col items-end text-right">
          <span className="font-arcade text-xs text-arcadeGold neon-glow-gold tracking-widest italic">
            Good Habits . Brighter Futures
          </span>
          <div className="mt-8 bg-purple-950/70 backdrop-blur-sm border border-neonCyan/60 rounded-xl px-3 py-1 text-neonCyan font-arcade text-[10px] shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            LEVEL UP A BRIGHTER YOU
          </div>
        </div>

        {/* Center Hero Content */}
        <div className="relative z-10 max-w-3xl flex flex-col items-center gap-2 pt-6 sm:pt-8">
          <span className="font-arcade text-xs sm:text-sm text-gray-300 tracking-[0.3em] uppercase">
            WELCOME TO
          </span>

          <h1 className="font-arcade text-4xl sm:text-6xl md:text-7xl text-[#FFE600] neon-glow-gold tracking-widest font-black leading-none select-none drop-shadow-[0_5px_15px_rgba(255,230,0,0.4)]">
            QUESTORIA
          </h1>

          <h2 className="font-arcade text-sm sm:text-lg md:text-xl text-synthMagenta neon-glow-magenta tracking-widest mt-1 uppercase font-bold">
            SMALL STEPS. EPIC YOU.
          </h2>

          <p className="text-sm sm:text-base text-gray-200 mt-4 max-w-xl leading-relaxed">
            Turn your real-life goals into epic quests.<br />
            Learn. Build habits. Level up. One quest at a time.
          </p>

          {/* Huge Glowing Cyan Button */}
          <button
            type="button"
            onClick={handleStartJourney}
            className="arcade-btn mt-6 px-8 py-3.5 bg-[#07192C]/80 hover:bg-neonCyan/20 border-2 border-neonCyan text-neonCyan font-arcade text-sm sm:text-base font-bold rounded-xl shadow-[0_0_25px_rgba(0,240,255,0.6)] flex items-center gap-3 transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <span>START YOUR JOURNEY</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Under-CTA Text */}
          <div className="font-mono text-[10px] sm:text-xs text-gray-400 mt-4 tracking-wider flex items-center gap-2 select-none">
            <span>FREE TO JOIN</span>
            <span>•</span>
            <span>FOR ALL AGE GROUPS</span>
            <span>•</span>
            <span>NO PRESSURE, JUST PROGRESS</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FEATURE CARDS ROW (6 COLUMNS MATCHING SCREENSHOT)                      */}
      {/* ========================================================================= */}
      <section id="features" className="w-full bg-[#09071A] border-b border-[#241744] py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Card 1 */}
          <div className="bg-[#120D2A] border border-[#2B1D54] hover:border-synthMagenta/60 rounded-xl p-4 flex flex-col items-center text-center gap-2 transition-all hover:scale-105 group">
            <Sword className="w-6 h-6 text-synthMagenta group-hover:scale-110 transition-transform" />
            <h3 className="font-arcade text-[11px] text-synthMagenta tracking-wider mt-1">
              PERSONALIZED QUESTS
            </h3>
            <p className="text-[11px] text-gray-400 font-sans leading-tight">
              Turn goals into fun daily missions
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#120D2A] border border-[#2B1D54] hover:border-neonCyan/60 rounded-xl p-4 flex flex-col items-center text-center gap-2 transition-all hover:scale-105 group">
            <Brain className="w-6 h-6 text-neonCyan group-hover:scale-110 transition-transform" />
            <h3 className="font-arcade text-[11px] text-neonCyan tracking-wider mt-1">
              AI ORACLE
            </h3>
            <p className="text-[11px] text-gray-400 font-sans leading-tight">
              Get smart quest plans with AI
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#120D2A] border border-[#2B1D54] hover:border-arcadeGold/60 rounded-xl p-4 flex flex-col items-center text-center gap-2 transition-all hover:scale-105 group">
            <BarChart3 className="w-6 h-6 text-arcadeGold group-hover:scale-110 transition-transform" />
            <h3 className="font-arcade text-[11px] text-arcadeGold tracking-wider mt-1">
              LEVEL UP
            </h3>
            <p className="text-[11px] text-gray-400 font-sans leading-tight">
              Track progress, streaks and stats
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#120D2A] border border-[#2B1D54] hover:border-pink-400/60 rounded-xl p-4 flex flex-col items-center text-center gap-2 transition-all hover:scale-105 group">
            <Trophy className="w-6 h-6 text-pink-400 group-hover:scale-110 transition-transform" />
            <h3 className="font-arcade text-[11px] text-pink-400 tracking-wider mt-1">
              EPIC REWARDS
            </h3>
            <p className="text-[11px] text-gray-400 font-sans leading-tight">
              Earn XP, coins and unique items
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-[#120D2A] border border-[#2B1D54] hover:border-cyan-400/60 rounded-xl p-4 flex flex-col items-center text-center gap-2 transition-all hover:scale-105 group">
            <Users className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
            <h3 className="font-arcade text-[11px] text-cyan-400 tracking-wider mt-1">
              FOR EVERYONE
            </h3>
            <p className="text-[11px] text-gray-400 font-sans leading-tight">
              Kids, students, professionals, seniors
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-[#120D2A] border border-[#2B1D54] hover:border-purple-400/60 rounded-xl p-4 flex flex-col items-center text-center gap-2 transition-all hover:scale-105 group">
            <Gamepad2 className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
            <h3 className="font-arcade text-[11px] text-purple-400 tracking-wider mt-1">
              MAKE LIFE FUN
            </h3>
            <p className="text-[11px] text-gray-400 font-sans leading-tight">
              Because growth should feel good
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE DASHBOARD SHOWCASE ("REAL GOALS. EPIC PROGRESS.")          */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="w-full py-12 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headline & Value Proposition */}
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
              Whether you want to learn a new skill, build better habits, stay healthy or complete a big project — Questoria turns it into a game.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleStartJourney}
                className="arcade-btn px-5 py-2.5 bg-neonCyan hover:bg-cyan-300 text-arcadeBlack font-arcade text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <span>JOIN QUESTORIA</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  showToast("🎬 Launching Questoria Arcade Demo Video!");
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
            <div className="w-full max-w-md flex flex-col gap-3 relative">
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
                      onClick={() => handleToggleQuest(q.id)}
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

                {/* Complete Quest Button */}
                <button
                  type="button"
                  onClick={handleCompleteShowcaseQuests}
                  className="arcade-btn w-full py-2.5 bg-gradient-to-r from-emerald-500 to-phosphorGreen hover:brightness-110 text-arcadeBlack font-arcade text-xs font-bold rounded-xl border border-emerald-300 shadow-[0_3px_0_#008A36] flex items-center justify-center gap-2 mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>COMPLETE QUEST</span>
                </button>
              </div>

              {/* Player Status & Rewards Shop Mini-Ribbon Below */}
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

      {/* ========================================================================= */}
      {/* 5. FOOTER BAR (MATCHING SCREENSHOT)                                       */}
      {/* ========================================================================= */}
      <footer className="w-full bg-[#05030E] border-t border-[#1C1236] py-5 px-4 sm:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-arcade text-xs">
          {/* Left Brand */}
          <div className="flex items-center gap-2">
            <span className="text-synthMagenta">✦</span>
            <span className="text-synthMagenta tracking-widest font-bold">QUESTORIA</span>
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
            SMALL STEPS. EPIC YOU.
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODALS                                                                    */}
      {/* ========================================================================= */}
      <ArcadeAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticated={(user) => {
          setCurrentUser(user);
          loadCharacter();
          showToast(`🌟 Welcome back, ${user.username}!`);
        }}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={({ ageGroup }) => {
          setIsOnboardingOpen(false);
          sounds.playLevelUp();
          showToast(`🌟 Welcome ${ageGroup} Hero! Adventure begun.`);
          loadCharacter();
        }}
        onSkip={() => setIsOnboardingOpen(false)}
      />

      <AiCampaignModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        onCampaignAccepted={(quests) => {
          sounds.playLevelUp();
          showToast(`⚔️ Oracle campaign forged! +${quests.length} quests enrolled.`);
          loadCharacter();
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
          <span className="font-arcade text-xs text-neonCyan">⚡</span>
          <span className="text-xs font-semibold text-textPrimary">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
