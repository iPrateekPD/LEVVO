"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Sparkles, LogIn, UserPlus } from "lucide-react";
import gsap from "gsap";
import { sounds } from "@/lib/sound";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "SIGNUP" : "LOGIN";

  const [mode, setMode] = useState<"LOGIN" | "SIGNUP">(initialMode);
  const [identifier, setIdentifier] = useState(""); // email or username for login
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // GSAP animation refs
  const cardRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP entrance animation
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        y: 35,
        opacity: 0,
        scale: 0.95,
        duration: 0.7,
        ease: "power3.out",
      });

      gsap.from(catRef.current, {
        x: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: "back.out(1.7)",
      });

      gsap.from(quoteRef.current, {
        y: 15,
        opacity: 0,
        duration: 0.6,
        delay: 0.4,
        ease: "power2.out",
      });
    });

    return () => ctx.revert();
  }, []);

  const handleTabChange = (newMode: "LOGIN" | "SIGNUP") => {
    sounds.playClick();
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);

    // Animate tab switch
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.98, opacity: 0.85 },
        { scale: 1, opacity: 1, duration: 0.25, ease: "power2.out" }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    sounds.playClick();

    try {
      if (mode === "LOGIN") {
        if (!identifier.trim() || !password) {
          setError("Please enter your email/username and password.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: identifier.trim(), password }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || "Login failed. Please check credentials.");
          sounds.playError?.();
          return;
        }

        sounds.playLevelUp();
        setSuccessMsg("🎉 Welcome back, Explorer! Entering LEVVO...");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 800);
      } else {
        // SIGNUP
        if (!email.trim() || !username.trim() || !password) {
          setError("All fields are required to register your adventurer profile.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/v1/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            username: username.trim(),
            password,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || "Registration failed. Try a different username or email.");
          return;
        }

        sounds.playLevelUp();
        setSuccessMsg("✨ Adventurer profile registered! Entering LEVVO...");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 800);
      }
    } catch {
      setError("Network error while connecting to LEVVO arcade auth realm.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    sounds.playClick();
    setIdentifier("hero@liferpg.dev");
    setPassword("password123");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: "hero@liferpg.dev", password: "password123" }),
      });
      const data = await res.json();
      if (data.success) {
        sounds.playLevelUp();
        setSuccessMsg("⚡ Quick Explorer Guest session active!");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 600);
      } else {
        setError(data.error || "Demo login failed");
      }
    } catch {
      setError("Failed to connect demo login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-[100vw] bg-[#060414] text-white flex flex-col items-center justify-between p-3 sm:p-6 relative overflow-hidden selection:bg-synthMagenta selection:text-white font-sans">
      {/* Background Magical Library Artwork */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 filter blur-[1px]"
        style={{ backgroundImage: "url('/images/library-bg.jpg')" }}
      />

      {/* Atmospheric Dark Neon Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060414]/85 via-[#0A0720]/80 to-[#060414]/90 z-0" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#060414]/40 to-[#060414]/95 z-0" />

      {/* Header Bar */}
      <header className="w-full max-w-[350px] sm:max-w-md mx-auto flex items-center justify-between z-10 pt-2 pb-3 px-1">
        <Link
          href="/"
          onClick={() => sounds.playClick()}
          className="p-2 sm:p-2.5 rounded-xl bg-black/60 hover:bg-[#1C1236] border border-cabinetBorder text-textSecondary hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          title="Return to Home"
          aria-label="Return to Home"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </Link>

        {/* Brand Header Matching Screenshot */}
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <span className="font-arcade text-xl sm:text-3xl text-[#FFE600] neon-glow-gold tracking-widest font-black leading-none">
            LEVVO
          </span>
          <span className="font-arcade text-[8px] sm:text-[10px] text-synthMagenta tracking-widest mt-1">
            90&apos;S ARCADE LIFE RPG • レボ
          </span>
        </div>

        <div className="w-8 sm:w-10" /> {/* Balance spacer */}
      </header>

      {/* Main Form Centerpiece */}
      <main className="w-full max-w-[350px] sm:max-w-md mx-auto z-10 my-auto flex flex-col items-center relative px-1">
        <div
          ref={cardRef}
          className="w-full bg-[#120B24]/90 backdrop-blur-md border-2 border-synthMagenta/70 rounded-3xl p-5 sm:p-7 shadow-[0_0_35px_rgba(255,42,133,0.3)] flex flex-col gap-4 relative box-border"
        >
          {/* Card Title & Subtitle */}
          <div className="flex flex-col items-center text-center gap-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {mode === "LOGIN" ? "Welcome Back, Player 1!" : "Join the LEVVO Guild!"}
            </h1>
            <p className="text-xs text-gray-300">
              {mode === "LOGIN"
                ? "Insert coin to resume your real-life adventure."
                : "Level up habits, study, and fitness like a 90's champion."}
            </p>
          </div>

          {/* Mode Switch Pills */}
          <div className="grid grid-cols-2 p-1 bg-[#1A1032] border border-[#2C1948] rounded-xl">
            <button
              type="button"
              onClick={() => handleTabChange("LOGIN")}
              className={`py-2 rounded-lg font-sans text-xs sm:text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                mode === "LOGIN"
                  ? "bg-gradient-to-r from-purple-700 to-synthMagenta text-white shadow-[0_0_12px_rgba(255,42,133,0.4)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("SIGNUP")}
              className={`py-2 rounded-lg font-sans text-xs sm:text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                mode === "SIGNUP"
                  ? "bg-gradient-to-r from-purple-700 to-synthMagenta text-white shadow-[0_0_12px_rgba(255,42,133,0.4)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Status Banners */}
          {error && (
            <div className="p-3 bg-arcadeRed/20 border border-arcadeRed text-arcadeRed rounded-xl text-xs flex items-center gap-2">
              <span className="font-arcade">✕</span>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-phosphorGreen/20 border border-phosphorGreen text-phosphorGreen rounded-xl text-xs flex items-center gap-2">
              <span className="font-arcade">✓</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {mode === "LOGIN" ? (
              /* LOGIN INPUTS */
              <>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Email or Username"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#170E30] border border-[#2D1B50] focus:border-neonCyan rounded-xl text-xs sm:text-sm text-white placeholder:text-gray-400 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-colors"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#170E30] border border-[#2D1B50] focus:border-neonCyan rounded-xl text-xs sm:text-sm text-white placeholder:text-gray-400 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </>
            ) : (
              /* SIGNUP INPUTS */
              <>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Hero Codename (Username)"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#170E30] border border-[#2D1B50] focus:border-neonCyan rounded-xl text-xs sm:text-sm text-white placeholder:text-gray-400 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-colors"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#170E30] border border-[#2D1B50] focus:border-neonCyan rounded-xl text-xs sm:text-sm text-white placeholder:text-gray-400 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-colors"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min 6 characters)"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#170E30] border border-[#2D1B50] focus:border-neonCyan rounded-xl text-xs sm:text-sm text-white placeholder:text-gray-400 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </>
            )}

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-gray-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#2D1B50] bg-[#170E30] text-neonCyan focus:ring-neonCyan"
                />
                <span className="text-[11px] sm:text-xs">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  showToast("🔑 Demo mode: Use identifier 'hero@liferpg.dev' or reset via admin");
                }}
                className="text-[11px] sm:text-xs text-neonCyan hover:underline focus-visible:outline-none"
              >
                Forgot password?
              </button>
            </div>

            {/* Big Neon Cyan CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="arcade-btn w-full py-3 bg-neonCyan hover:bg-cyan-300 text-arcadeBlack font-sans text-xs sm:text-sm font-bold tracking-wider rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 mt-2 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <span>{loading ? "TRANSMITTING..." : mode === "LOGIN" ? "LOGIN" : "CREATE ACCOUNT"}</span>
              <span className="font-bold text-base">→</span>
            </button>
          </form>

          {/* Social Logins Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-[1px] bg-[#2C1A48]" />
            <span className="text-[11px] text-gray-400 font-mono">Or continue with</span>
            <div className="flex-1 h-[1px] bg-[#2C1A48]" />
          </div>

          {/* Social Buttons (Google, GitHub, Discord) + 1-Click Demo */}
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="py-2 rounded-xl bg-[#170E30] hover:bg-[#231548] border border-[#2E1B52] flex items-center justify-center text-xs transition-colors group"
              title="Google Sign-In / Demo"
            >
              <span className="text-base select-none">🌐</span>
            </button>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="py-2 rounded-xl bg-[#170E30] hover:bg-[#231548] border border-[#2E1B52] flex items-center justify-center text-xs transition-colors group"
              title="GitHub Sign-In / Demo"
            >
              <span className="text-base select-none">🐙</span>
            </button>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="py-2 rounded-xl bg-[#170E30] hover:bg-[#231548] border border-[#2E1B52] flex items-center justify-center text-xs transition-colors group"
              title="Discord Sign-In / Demo"
            >
              <span className="text-base select-none">👾</span>
            </button>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="py-2 rounded-xl bg-synthMagenta/20 hover:bg-synthMagenta/40 border border-synthMagenta/60 text-synthMagenta font-arcade text-[9px] flex items-center justify-center transition-colors shadow-sm"
              title="1-Click Instant Guest Login"
            >
              GUEST
            </button>
          </div>

          {/* Bottom Switch Link */}
          <div className="text-center text-xs text-gray-300 pt-1">
            {mode === "LOGIN" ? (
              <span>
                New here?{" "}
                <button
                  type="button"
                  onClick={() => handleTabChange("SIGNUP")}
                  className="text-neonCyan hover:underline font-semibold"
                >
                  Create an account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => handleTabChange("LOGIN")}
                  className="text-neonCyan hover:underline font-semibold"
                >
                  Login
                </button>
              </span>
            )}
          </div>

          {/* Glowing Cat Companion Illustration */}
          <div
            ref={catRef}
            className="hidden md:flex absolute -right-12 -bottom-4 flex-col items-center select-none pointer-events-none"
          >
            <div className="relative text-5xl filter drop-shadow-[0_0_15px_rgba(0,255,200,0.5)] animate-bounce">
              🐱
            </div>
            <div className="text-[9px] font-arcade text-neonCyan bg-black/80 px-2 py-0.5 rounded-full border border-neonCyan/40 mt-1">
              Arcade Familiar
            </div>
          </div>
        </div>

        {/* Bottom Motivational Quote Matching Screenshot */}
        <div
          ref={quoteRef}
          className="mt-5 text-center font-arcade text-[10px] sm:text-xs text-gray-400 tracking-wider uppercase select-none px-4 max-w-[310px] leading-relaxed"
        >
          &ldquo;EVERY GREAT JOURNEY<br />BEGINS WITH A SINGLE STEP.&rdquo;
        </div>
      </main>

      {/* Footer Minimal Indicator */}
      <footer className="w-full text-center text-[9px] sm:text-[10px] text-gray-500 font-mono z-10 pb-2 px-4">
        LEVVO STUDIOS™ // 90&apos;S ARCADE HARDWARE SYSTEM 1994 • ENCRYPTED SESSION STORAGE
      </footer>

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
