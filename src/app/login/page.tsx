"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Sparkles, LogIn, UserPlus } from "lucide-react";
import gsap from "gsap";
import { sounds } from "@/lib/sound";

function LoginForm() {
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
        setSuccessMsg("⚡ 1-Click Guest Hero session loaded! Entering LEVVO...");
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

  const handleSocialDemoLogin = async (provider: string) => {
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
        setSuccessMsg(`⚡ Connected with ${provider} Guest Session! Entering LEVVO...`);
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 600);
      } else {
        setError(data.error || "Social demo login failed");
      }
    } catch {
      setError(`Failed to connect ${provider} login`);
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

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <Image
            src="/logo.png"
            alt="LEVVO Logo"
            width={40}
            height={40}
            className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] mb-1.5 hover:scale-105 transition-transform"
            priority
          />
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

          {/* PROMINENT 1-CLICK INSTANT GUEST DEMO ACCESS */}
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-purple-500/20 to-cyan-500/15 hover:from-amber-500/25 hover:via-purple-500/30 hover:to-cyan-500/25 border border-amber-400/40 hover:border-amber-400 text-left flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all group active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform">
                ⚡
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-arcade text-xs text-white tracking-wider font-bold">
                    INSTANT GUEST DEMO
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-400 text-black">
                    1-CLICK
                  </span>
                </div>
                <span className="text-[11px] text-gray-300 font-sans">
                  Ready-to-play Level 4 Hero · No password needed
                </span>
              </div>
            </div>
            <span className="text-amber-400 font-arcade text-xs group-hover:translate-x-1 transition-transform font-bold">
              ENTER →
            </span>
          </button>

          {/* Social Logins Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-[1px] bg-[#2C1A48]" />
            <span className="text-[11px] text-gray-400 font-mono">Or quick sign in with</span>
            <div className="flex-1 h-[1px] bg-[#2C1A48]" />
          </div>

          {/* Real App Icon: Google Only */}
          <div>
            <button
              type="button"
              onClick={() => handleSocialDemoLogin("Google")}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#170E30] hover:bg-[#231548] border border-[#2E1B52] hover:border-white/30 flex items-center justify-center gap-2.5 text-xs text-white font-medium transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              title="Continue with Google"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="text-xs font-semibold">Continue with Google</span>
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
        </div>

        {/* Bottom Motivational Quote Matching Screenshot - 1 line only */}
        <div
          ref={quoteRef}
          className="mt-5 text-center font-arcade text-[9px] sm:text-xs text-gray-400 tracking-wider uppercase select-none px-2 whitespace-nowrap"
        >
          &ldquo;EVERY GREAT JOURNEY BEGINS WITH A SINGLE STEP.&rdquo;
        </div>
      </main>

      {/* Footer Minimal Clean Indicator */}
      <footer className="w-full text-center text-xs text-gray-500 font-sans z-10 pb-4 px-4">
        LEVVO • Level up your life, one quest at a time.
      </footer>

      {/* Floating Toast Notification - Centered on screen */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[92vw] sm:max-w-md bg-[#120D24]/95 backdrop-blur-md border-2 border-neonCyan rounded-xl px-4 py-3 shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2.5 text-center">
          <Sparkles className="w-4 h-4 text-neonCyan shrink-0" />
          <span className="text-xs font-semibold text-textPrimary text-center">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0518] flex items-center justify-center text-neonCyan font-arcade text-xs">
          LOADING LEVVO ARCADE...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
