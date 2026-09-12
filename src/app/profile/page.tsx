"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Coins,
  Flame,
  Volume2,
  VolumeX,
  Palette,
  Check,
  Lock,
  Sparkles,
  Edit2,
  Save,
  Trophy,
  Shield,
  Zap,
} from "lucide-react";
import { CrtContainer } from "@/components/arcade/CrtContainer";
import { sounds } from "@/lib/sound";
import confetti from "canvas-confetti";
import { FREE_AVATARS, PREMIUM_AVATARS } from "@/app/api/v1/profile/route";
import { AGE_GROUP_CONFIGS, AgeGroup } from "@/lib/presets";

const ALL_AVATARS = [
  ...FREE_AVATARS.map((a) => ({ ...a, isPremium: false })),
  ...PREMIUM_AVATARS.map((a) => ({ ...a, isPremium: true })),
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [ownedAvatarIds, setOwnedAvatarIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Editable fields
  const [isEditingName, setIsEditingName] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup>("Students");
  const [addPresetsOnAgeChange, setAddPresetsOnAgeChange] = useState(false);

  // Unlock modal
  const [avatarToUnlock, setAvatarToUnlock] = useState<{ id: string; name: string; icon: string; price: number } | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Preferences
  const [activeTheme, setActiveTheme] = useState<"synthwave" | "gameboy">("synthwave");
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/v1/profile");
      const data = await res.json();
      if (data.success) {
        setProfile(data.data.profile);
        setStats(data.data.stats);
        setOwnedAvatarIds(data.data.ownedAvatarIds);
        setUsernameInput(data.data.profile.username);
        setSelectedAgeGroup((data.data.profile.ageGroup as AgeGroup) || "Students");
        setActiveTheme((data.data.profile.activeTheme as "synthwave" | "gameboy") || "synthwave");
        setSfxEnabled(data.data.profile.sfxEnabled ?? true);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUsername = async () => {
    if (!usernameInput.trim() || usernameInput.trim() === profile?.username) {
      setIsEditingName(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        sounds.playClick();
        setProfile(data.data.profile);
        setIsEditingName(false);
        showToast("✨ Hero codename updated!");
      } else {
        showToast(data.error || "Failed to update codename");
      }
    } catch {
      showToast("Network error updating codename");
    }
  };

  const handleSelectAvatar = async (avatarId: string, isPremium: boolean) => {
    sounds.playClick();
    const isOwned = ownedAvatarIds.includes(avatarId) || !isPremium;

    if (!isOwned) {
      const premiumItem = PREMIUM_AVATARS.find((p) => p.id === avatarId);
      if (premiumItem) {
        setAvatarToUnlock(premiumItem);
      }
      return;
    }

    // Equip owned or free avatar
    try {
      const res = await fetch("/api/v1/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarId }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.data.profile);
        showToast("🎨 Avatar equipped!");
      }
    } catch {
      showToast("Failed to equip avatar");
    }
  };

  const handleConfirmUnlock = async () => {
    if (!avatarToUnlock) return;
    setIsUnlocking(true);

    try {
      const res = await fetch("/api/v1/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unlockAvatar: avatarToUnlock.id }),
      });
      const data = await res.json();
      if (data.success) {
        sounds.playLevelUp();
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#FFE600", "#FF2A85", "#00F0FF"],
        });

        setProfile(data.data.profile);
        setOwnedAvatarIds((prev) => [...prev, avatarToUnlock.id]);
        setAvatarToUnlock(null);
        showToast(`👑 Unlocked & equipped ${avatarToUnlock.name}! (-500 GP)`);
      } else {
        showToast(data.error || "Failed to unlock avatar");
      }
    } catch {
      showToast("Network error unlocking avatar");
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleAgeGroupChange = async (newGroup: AgeGroup) => {
    sounds.playClick();
    setSelectedAgeGroup(newGroup);

    try {
      const res = await fetch("/api/v1/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ageGroup: newGroup,
          addPresetsForEra: addPresetsOnAgeChange,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.data.profile);
        if (data.data.seededCount > 0) {
          showToast(`🌟 Age group set to ${newGroup}! +${data.data.seededCount} new quest presets added.`);
        } else {
          showToast(`🌟 Age group updated to ${newGroup}`);
        }
      }
    } catch {
      showToast("Failed to update age group");
    }
  };

  const handleToggleTheme = async (theme: "synthwave" | "gameboy") => {
    sounds.playClick();
    setActiveTheme(theme);

    try {
      await fetch("/api/v1/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeTheme: theme }),
      });
      showToast(`🎨 Theme switched to ${theme.toUpperCase()}`);
    } catch {
      // ignore
    }
  };

  const handleToggleSfx = async () => {
    const nextState = !sfxEnabled;
    setSfxEnabled(nextState);
    sounds.setMuted(!nextState);
    if (nextState) sounds.playClick();

    try {
      await fetch("/api/v1/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sfxEnabled: nextState }),
      });
      showToast(nextState ? "🔊 Arcade Sound FX Enabled" : "🔇 Sound FX Muted");
    } catch {
      // ignore
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-arcadeBlack flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-synthMagenta border-t-transparent rounded-full animate-spin" />
        <span className="font-arcade text-xs text-neonCyan neon-glow-cyan mt-3">
          RETRIEVING HERO PROFILE ARCHIVE...
        </span>
      </div>
    );
  }

  const currentAvatarMeta =
    ALL_AVATARS.find((a) => a.id === profile.avatarId) || ALL_AVATARS[0];

  return (
    <div className={activeTheme === "gameboy" ? "theme-gameboy min-h-screen" : "min-h-screen"}>
      <CrtContainer scanlines={true}>
        {/* Navigation Header */}
        <header className="w-full max-w-4xl mx-auto mb-6 flex items-center justify-between border-b-2 border-cabinetBorder pb-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cabinetSurface hover:bg-[#21193D] border border-cabinetBorder text-neonCyan hover:text-white font-arcade text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO ARCADE HUD</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/60 border border-arcadeGold/40 text-arcadeGold">
              <Coins className="w-4 h-4" />
              <span className="font-arcade text-xs">{profile.gold} GP</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/60 border border-arcadeRed/40 text-arcadeRed">
              <Flame className="w-4 h-4" />
              <span className="font-arcade text-xs">{profile.streakCurrent} DAYS</span>
            </div>
          </div>
        </header>

        <main className="w-full max-w-4xl mx-auto flex flex-col gap-6">
          {/* Section 1: Hero Banner & Large Avatar Card */}
          <section className="bg-cabinetSurface/95 border-2 border-cabinetBorder rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-synthMagenta/15 rounded-full blur-3xl pointer-events-none" />

            {/* Large Avatar Frame */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-[#25103E] to-[#120824] border-4 border-neonCyan rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(0,240,255,0.5)] shrink-0">
              <span className="text-6xl sm:text-7xl select-none animate-pulse">
                {currentAvatarMeta.icon}
              </span>
              <span className="absolute -bottom-3 bg-synthMagenta text-white font-arcade text-xs px-2.5 py-1 rounded-full border-2 border-pink-300 shadow-md">
                LVL {profile.currentLevel}
              </span>
            </div>

            {/* Hero Details & Inline Edit */}
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-2.5 min-w-0">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                {!isEditingName ? (
                  <div className="flex items-center gap-2">
                    <h1 className="font-arcade text-xl sm:text-2xl text-neonCyan neon-glow-cyan tracking-wider">
                      {profile.username}
                    </h1>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1.5 text-textSecondary hover:text-white rounded hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                      title="Edit Codename"
                      aria-label="Edit Codename"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="bg-[#120D24] border border-neonCyan rounded px-2.5 py-1 font-arcade text-sm text-neonCyan outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveUsername}
                      className="p-1.5 bg-phosphorGreen text-arcadeBlack rounded font-arcade text-xs hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                      title="Save Codename"
                      aria-label="Save Codename"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setUsernameInput(profile.username);
                        setIsEditingName(false);
                      }}
                      className="p-1.5 text-textSecondary hover:text-white text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Age Group Badge */}
                {profile.ageGroup && (
                  <span className="font-arcade text-[10px] bg-purple-900/70 text-purple-300 border border-purple-400/50 px-2 py-0.5 rounded-full uppercase">
                    {profile.ageGroup} HERO
                  </span>
                )}
              </div>

              <div className="text-xs text-textSecondary font-mono">{profile.title}</div>

              {/* Goals Chips */}
              {profile.goals && profile.goals.length > 0 && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-1">
                  <span className="text-[10px] text-textMuted uppercase font-arcade">Primary Goals:</span>
                  {profile.goals.map((g: string) => (
                    <span
                      key={g}
                      className="text-[11px] bg-cabinetSurface border border-cabinetBorder px-2.5 py-0.5 rounded-md text-textPrimary font-medium"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Section 2: Avatar Picker Grid */}
          <section className="bg-cabinetSurface/90 border-2 border-cabinetBorder rounded-xl p-5 shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-cabinetBorder">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-synthMagenta" />
                <h2 className="font-arcade text-xs text-synthMagenta neon-glow-magenta tracking-wider">
                  AVATAR WARDROBE
                </h2>
              </div>
              <span className="text-[10px] font-arcade text-textSecondary">
                {ownedAvatarIds.length} / {ALL_AVATARS.length} UNLOCKED
              </span>
            </div>

            {/* Free Tier */}
            <div>
              <span className="text-[11px] font-arcade text-neonCyan mb-2.5 block">
                FREE ARCADE AVATARS
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                {FREE_AVATARS.map((av) => {
                  const isEquipped = profile.avatarId === av.id;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => handleSelectAvatar(av.id, false)}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                        isEquipped
                          ? "bg-gradient-to-b from-[#340F47] to-[#160A24] border-neonCyan shadow-[0_0_15px_rgba(0,240,255,0.4)] scale-105"
                          : "bg-[#120D24] border-cabinetBorder hover:border-neonCyan/60 hover:bg-[#1A1236]"
                      }`}
                    >
                      <span className="text-3xl select-none group-hover:scale-110 transition-transform">
                        {av.icon}
                      </span>
                      <span className="text-[10px] font-medium text-textPrimary text-center truncate w-full">
                        {av.name}
                      </span>
                      {isEquipped && (
                        <span className="text-[8px] font-arcade bg-neonCyan text-arcadeBlack px-1.5 rounded font-bold">
                          EQUIPPED
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Premium Tier (500 GP) */}
            <div className="pt-3 border-t border-cabinetBorder">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-arcade text-arcadeGold">
                  PREMIUM LEGENDARY AVATARS (500 GP)
                </span>
                <span className="text-[10px] font-mono text-textMuted">
                  Unlocked with quest gold
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PREMIUM_AVATARS.map((av) => {
                  const isOwned = ownedAvatarIds.includes(av.id);
                  const isEquipped = profile.avatarId === av.id;

                  return (
                    <div
                      key={av.id}
                      className={`p-3.5 rounded-xl border-2 flex items-center justify-between gap-3 transition-all ${
                        isEquipped
                          ? "bg-[#2D163B] border-arcadeGold shadow-[0_0_15px_rgba(255,230,0,0.3)]"
                          : isOwned
                          ? "bg-[#140F26] border-cabinetBorder hover:border-arcadeGold/50"
                          : "bg-[#0E0A1E] border-cabinetBorder/70 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-4xl select-none relative">
                          {av.icon}
                          {!isOwned && (
                            <div className="absolute -top-1 -right-1 bg-black/80 rounded-full p-0.5 border border-arcadeGold">
                              <Lock className="w-3 h-3 text-arcadeGold" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-textPrimary">{av.name}</div>
                          <div className="font-arcade text-[10px] text-arcadeGold mt-0.5">
                            {isOwned ? (
                              <span className="text-phosphorGreen">OWNED</span>
                            ) : (
                              `${av.price} GP`
                            )}
                          </div>
                        </div>
                      </div>

                      {isEquipped ? (
                        <span className="font-arcade text-[9px] bg-arcadeGold text-arcadeBlack px-2 py-1 rounded font-bold">
                          ACTIVE
                        </span>
                      ) : isOwned ? (
                        <button
                          type="button"
                          onClick={() => handleSelectAvatar(av.id, true)}
                          className="px-3 py-1 rounded bg-neonCyan/20 hover:bg-neonCyan/40 text-neonCyan border border-neonCyan font-arcade text-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                        >
                          EQUIP
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAvatarToUnlock(av)}
                          className="arcade-btn px-3 py-1 rounded bg-arcadeGold hover:bg-yellow-400 text-arcadeBlack font-arcade text-[10px] font-bold border border-yellow-200 shadow-[0_2px_0_#9E8200] flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                        >
                          <Lock className="w-3 h-3" />
                          <span>UNLOCK</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Section 3: Age Group & Presets Configuration */}
          <section className="bg-cabinetSurface/90 border-2 border-cabinetBorder rounded-xl p-5 shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-cabinetBorder">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-neonCyan" />
                <h2 className="font-arcade text-xs text-neonCyan neon-glow-cyan tracking-wider">
                  AGE GROUP & PRESET LIBRARY
                </h2>
              </div>
              <span className="text-[10px] text-textSecondary font-mono">
                Changes your quest recommendation ecosystem
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(["Kids", "Students", "Adults", "Seniors"] as AgeGroup[]).map((group) => {
                const config = AGE_GROUP_CONFIGS[group];
                const isSelected = selectedAgeGroup === group;

                return (
                  <button
                    key={group}
                    type="button"
                    onClick={() => handleAgeGroupChange(group)}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                      isSelected
                        ? "bg-purple-900/40 border-synthMagenta shadow-[0_0_12px_rgba(255,42,133,0.3)]"
                        : "bg-[#140F24] border-cabinetBorder hover:border-purple-500/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{config.icon}</span>
                      {isSelected && <Check className="w-4 h-4 text-synthMagenta stroke-[3]" />}
                    </div>
                    <div className="font-arcade text-xs text-textPrimary mt-1">{group}</div>
                    <div className="text-[10px] text-textSecondary line-clamp-1">
                      {config.subtitle.split("•")[1] || config.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-2 text-xs text-textSecondary">
              <input
                type="checkbox"
                id="addPresets"
                checked={addPresetsOnAgeChange}
                onChange={(e) => setAddPresetsOnAgeChange(e.target.checked)}
                className="rounded border-cabinetBorder accent-synthMagenta focus:ring-synthMagenta"
              />
              <label htmlFor="addPresets" className="cursor-pointer select-none">
                Automatically seed daily quest presets when switching age group
              </label>
            </div>
          </section>

          {/* Section 4: Lifetime Stats Summary */}
          {stats && (
            <section className="bg-cabinetSurface/90 border-2 border-cabinetBorder rounded-xl p-5 shadow-lg flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-cabinetBorder">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-arcadeGold" />
                  <h2 className="font-arcade text-xs text-arcadeGold tracking-wider">
                    LIFETIME STATS SUMMARY
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-[#120D24] p-3 rounded-xl border border-cabinetBorder">
                  <div className="text-[10px] font-mono text-textSecondary uppercase">Quests Completed</div>
                  <div className="font-arcade text-base text-textPrimary mt-1">{stats.completedQuestsCount}</div>
                </div>
                <div className="bg-[#120D24] p-3 rounded-xl border border-cabinetBorder">
                  <div className="text-[10px] font-mono text-textSecondary uppercase">Total XP Banked</div>
                  <div className="font-arcade text-base text-neonCyan mt-1">{stats.totalXp}</div>
                </div>
                <div className="bg-[#120D24] p-3 rounded-xl border border-cabinetBorder">
                  <div className="text-[10px] font-mono text-textSecondary uppercase">Current Streak</div>
                  <div className="font-arcade text-base text-arcadeRed mt-1">{stats.streakCurrent} Days</div>
                </div>
                <div className="bg-[#120D24] p-3 rounded-xl border border-cabinetBorder">
                  <div className="text-[10px] font-mono text-textSecondary uppercase">Best Streak</div>
                  <div className="font-arcade text-base text-arcadeGold mt-1">{stats.streakLongest} Days</div>
                </div>
              </div>
            </section>
          )}

          {/* Section 5: Arcade Preferences & Theme Controls */}
          <section className="bg-cabinetSurface/90 border-2 border-cabinetBorder rounded-xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Palette className="w-5 h-5 text-synthMagenta" />
              <div>
                <div className="font-arcade text-xs text-textPrimary">VISUAL THEME</div>
                <div className="text-[10px] text-textSecondary font-mono">Arcade Palette Display</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => handleToggleTheme("synthwave")}
                className={`px-3 py-1.5 rounded-lg border font-arcade text-[10px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                  activeTheme === "synthwave"
                    ? "bg-synthMagenta text-white border-pink-400 shadow-[0_0_8px_rgba(255,42,133,0.4)] font-bold"
                    : "bg-[#140F24] border-cabinetBorder text-textSecondary"
                }`}
              >
                SYNTHWAVE (DEFAULT)
              </button>

              <button
                type="button"
                onClick={() => handleToggleTheme("gameboy")}
                className={`px-3 py-1.5 rounded-lg border font-arcade text-[10px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                  activeTheme === "gameboy"
                    ? "bg-[#9bbc0f] text-[#0f380f] border-[#306230] font-bold"
                    : "bg-[#140F24] border-cabinetBorder text-textSecondary"
                }`}
              >
                GAMEBOY MONO
              </button>

              <div className="h-6 w-[1px] bg-cabinetBorder mx-1" />

              <button
                type="button"
                onClick={handleToggleSfx}
                className="p-2 rounded-lg bg-[#140F24] hover:bg-[#20153D] border border-cabinetBorder text-textSecondary hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                title={sfxEnabled ? "Mute Sound Effects" : "Enable Sound Effects"}
                aria-label={sfxEnabled ? "Mute Sound Effects" : "Enable Sound Effects"}
              >
                {sfxEnabled ? <Volume2 className="w-4 h-4 text-phosphorGreen" /> : <VolumeX className="w-4 h-4 text-textMuted" />}
              </button>
            </div>
          </section>
        </main>

        {/* Modal: Unlock Premium Avatar Confirmation */}
        {avatarToUnlock && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-cabinetSurface border-2 border-arcadeGold rounded-2xl w-full max-w-sm p-5 shadow-[0_0_30px_rgba(255,230,0,0.35)] flex flex-col items-center text-center gap-3.5">
              <div className="text-6xl p-3 bg-[#1B112D] border border-cabinetBorder rounded-2xl">
                {avatarToUnlock.icon}
              </div>
              <h3 className="font-arcade text-sm text-arcadeGold">UNLOCK {avatarToUnlock.name.toUpperCase()}?</h3>
              <p className="text-xs text-textSecondary">
                This legendary avatar costs <span className="text-arcadeGold font-arcade">{avatarToUnlock.price} GP</span>. Your current gold reserve: <span className="text-arcadeGold font-arcade">{profile.gold} GP</span>.
              </p>

              {profile.gold < avatarToUnlock.price ? (
                <div className="text-xs text-arcadeRed font-semibold bg-arcadeRed/10 border border-arcadeRed/30 px-3 py-1.5 rounded-lg w-full">
                  Insufficient Gold! Complete more daily quests to earn GP.
                </div>
              ) : null}

              <div className="flex items-center gap-2 w-full pt-2">
                <button
                  type="button"
                  onClick={() => setAvatarToUnlock(null)}
                  className="flex-1 py-2 rounded-lg bg-cabinetBorder text-xs text-textSecondary hover:text-white font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUnlock}
                  disabled={profile.gold < avatarToUnlock.price || isUnlocking}
                  className="flex-1 py-2 rounded-lg bg-arcadeGold hover:bg-yellow-400 text-arcadeBlack font-arcade text-xs font-bold border border-yellow-200 shadow-[0_3px_0_#9E8200] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  {isUnlocking ? "UNLOCKING..." : "CONFIRM (500 GP)"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#120D24] border-2 border-neonCyan rounded-xl px-4 py-2.5 shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center gap-2 animate-bounce">
            <span className="font-arcade text-xs text-neonCyan">⚡</span>
            <span className="text-xs font-semibold text-textPrimary">{toastMessage}</span>
          </div>
        )}
      </CrtContainer>
    </div>
  );
}
