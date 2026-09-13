"use client";

import React, { useState } from "react";
import Image from "next/image";
import { UserPlus, LogIn, Sparkles, ShieldCheck, X } from "lucide-react";
import { sounds } from "@/lib/sound";
import { useEscapeKey } from "@/lib/useEscapeKey";

interface ArcadeAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (user: { id: string; email: string; username: string }) => void;
}

export function ArcadeAuthModal({ isOpen, onClose, onAuthenticated }: ArcadeAuthModalProps) {
  const [mode, setMode] = useState<"LOGIN" | "SIGNUP">("LOGIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    sounds.playClick();

    const endpoint = mode === "SIGNUP" ? "/api/v1/auth/signup" : "/api/v1/auth/login";
    const payload = mode === "SIGNUP" ? { email, password, username } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Authentication failed");
        return;
      }

      sounds.playLevelUp();
      const user = data.data?.user || data.user;
      if (typeof window !== "undefined" && user) {
        localStorage.setItem("levvo_is_logged_in", "true");
        localStorage.setItem("levvo_cached_user", JSON.stringify(user));
      }
      onAuthenticated(user);
      onClose();
      setEmail("");
      setPassword("");
      setUsername("");
    } catch {
      setError("Network error while connecting to auth server");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setError(null);
    sounds.playClick();

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "hero@liferpg.dev",
          password: "password123",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Demo login failed");
        return;
      }

      sounds.playLevelUp();
      const user = data.data?.user || data.user;
      if (typeof window !== "undefined" && user) {
        localStorage.setItem("levvo_is_logged_in", "true");
        localStorage.setItem("levvo_cached_user", JSON.stringify(user));
      }
      onAuthenticated(user);
      onClose();
    } catch {
      setError("Network error during demo login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-cabinetSurface border-2 border-synthMagenta rounded-2xl w-full max-w-md p-6 shadow-[0_0_40px_rgba(255,42,133,0.35)] relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 text-textSecondary hover:text-white p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Arcade Cabinet Header */}
        <div className="text-center mb-5">
          <Image
            src="/logo.png"
            alt="LEVVO"
            width={48}
            height={48}
            className="w-12 h-12 object-contain drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] mb-2 inline-block"
            priority
          />
          <h2 className="font-arcade text-lg text-arcadeGold neon-glow-gold tracking-wider">
            {mode === "LOGIN" ? "PLAYER ACCESS" : "ENROLL NEW HERO"}
          </h2>
          <p className="font-arcade text-[10px] text-neonCyan tracking-widest mt-1">
            INSERT COIN / AUTHENTICATE
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#120E22] border border-cabinetBorder rounded-xl mb-4">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setMode("LOGIN");
              setError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              mode === "LOGIN"
                ? "bg-synthMagenta text-white shadow-sm font-arcade text-[11px]"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            LOG IN
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setMode("SIGNUP");
              setError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              mode === "SIGNUP"
                ? "bg-synthMagenta text-white shadow-sm font-arcade text-[11px]"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            SIGN UP
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded bg-arcadeRed/20 border border-arcadeRed text-arcadeRed text-xs font-medium">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {mode === "SIGNUP" && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-textSecondary">Hero Handle (Username) *</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., PixelKnight"
                required
                className="w-full bg-[#120D24] border border-cabinetBorder rounded-lg px-3 py-2 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus:border-neonCyan"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-textSecondary">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="player@liferpg.dev"
              required
              className="w-full bg-[#120D24] border border-cabinetBorder rounded-lg px-3 py-2 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus:border-neonCyan"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-textSecondary">Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#120D24] border border-cabinetBorder rounded-lg px-3 py-2 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus:border-neonCyan"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="arcade-btn w-full mt-2 py-2.5 bg-gradient-to-r from-synthMagenta to-pink-600 hover:brightness-110 text-white font-arcade text-xs rounded-xl border border-pink-300 shadow-[0_3px_0_#9E0045] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            {mode === "LOGIN" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>
              {loading
                ? "AUTHENTICATING..."
                : mode === "LOGIN"
                ? "START ADVENTURE"
                : "FORGE HERO & START"}
            </span>
          </button>
        </form>

        {/* Quick Demo Shortcut */}
        <div className="mt-4 pt-3 border-t border-cabinetBorder/60 flex flex-col items-center gap-2 text-center">
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={loading}
            className="text-xs text-neonCyan hover:text-cyan-300 font-medium flex items-center gap-1.5 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Quick Login with Seed Demo Account (Explorer)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
