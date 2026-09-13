import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Volume2, VolumeX, Tv, LogIn, LogOut, User } from "lucide-react";
import { sounds } from "@/lib/sound";

interface ArcadeMarqueeProps {
  scanlines: boolean;
  onToggleScanlines: () => void;
  currentUser: { username: string; email: string } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export function ArcadeMarquee({
  scanlines,
  onToggleScanlines,
  currentUser,
  onOpenAuth,
  onLogout,
}: ArcadeMarqueeProps) {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(sounds.getMuted());
  }, []);

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) sounds.playClick();
  };

  return (
    <header className="w-full bg-gradient-to-r from-[#21092F] via-[#3B072B] to-[#140C38] border-2 border-synthMagenta rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-[0_0_20px_rgba(255,42,133,0.3)] flex flex-col sm:flex-row items-center justify-between gap-3">
      {/* Left Badge: Retro Status */}
      <div className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full bg-phosphorGreen animate-pulse shadow-[0_0_8px_#00FF66]" />
        <span className="font-arcade text-[10px] text-neonCyan tracking-wider">
          PLAYER 1 READY
        </span>
      </div>

      {/* Center: Backlit Neon Brand Title */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="font-arcade text-[8px] text-arcadeGold bg-black/60 px-1.5 py-0.5 rounded border border-yellow-400/40">
            90&apos;S ARCADE
          </span>
          <span className="font-arcade text-[8px] text-neonCyan bg-black/60 px-1.5 py-0.5 rounded border border-cyan-400/40">
            STAGE 1-1
          </span>
          <span className="font-arcade text-[8px] text-phosphorGreen bg-black/60 px-1.5 py-0.5 rounded border border-green-400/40 hidden sm:inline">
            CREDITS: 02
          </span>
        </div>
        <div className="flex items-center justify-center gap-2 sm:gap-3 mt-1">
          <Image
            src="/logo.png"
            alt="LEVVO"
            width={36}
            height={36}
            className="w-7 h-7 sm:w-9 sm:h-9 object-contain drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]"
            priority
          />
          <h1 className="font-arcade text-2xl sm:text-3xl md:text-4xl text-[#FFE600] tracking-wider neon-glow-gold">
            LEVVO
          </h1>
        </div>
        <p className="font-arcade text-[8px] sm:text-[10px] text-synthMagenta tracking-widest uppercase mt-0.5 neon-glow-magenta">
          レボ • LEVEL UP YOUR LIFE
        </p>
      </div>

      {/* Right Controls: Tactile Arcade Deck */}
      <div className="flex items-center gap-2">
        {/* Profile Link */}
        <Link
          href="/profile"
          className="arcade-btn flex items-center gap-1.5 px-3 py-1.5 bg-[#8A2BE2] hover:bg-[#9B42F5] text-white border border-purple-300 rounded-md font-arcade text-[10px] shadow-[0_3px_0_#4B0082] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          title="Player Profile"
        >
          <User className="w-3.5 h-3.5 text-arcadeGold" />
          <span className="hidden sm:inline">PROFILE</span>
        </Link>

        {/* Auth / Account Controls */}
        {currentUser ? (
          <button
            onClick={() => {
              sounds.playClick();
              onLogout();
            }}
            className="arcade-btn flex items-center gap-1.5 px-2.5 py-1.5 bg-arcadeRed/20 hover:bg-arcadeRed/30 text-arcadeRed border border-arcadeRed/50 rounded-md font-arcade text-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            title={`Logged in as ${currentUser.username}. Click to Log Out.`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">EXIT</span>
          </button>
        ) : (
          <button
            onClick={() => {
              sounds.playClick();
              onOpenAuth();
            }}
            className="arcade-btn flex items-center gap-1.5 px-3 py-1.5 bg-neonCyan hover:bg-cyan-400 text-arcadeBlack border border-cyan-200 rounded-md font-arcade text-[10px] shadow-[0_3px_0_#008A9E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            title="Login or Signup"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>LOGIN</span>
          </button>
        )}

        {/* CRT Scanline Toggle */}
        <button
          onClick={() => {
            sounds.playClick();
            onToggleScanlines();
          }}
          className={`arcade-btn p-1.5 rounded-md border text-[11px] shadow-[0_3px_0_#110B22] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            scanlines
              ? "bg-neonCyan/20 border-neonCyan text-neonCyan"
              : "bg-cabinetSurface border-cabinetBorder text-textSecondary"
          }`}
          title={scanlines ? "Turn CRT Scanlines OFF" : "Turn CRT Scanlines ON"}
        >
          <Tv className="w-4 h-4" />
        </button>

        {/* Audio Mute Toggle */}
        <button
          onClick={handleToggleSound}
          className={`arcade-btn p-1.5 rounded-md border text-[11px] shadow-[0_3px_0_#110B22] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            !isMuted
              ? "bg-phosphorGreen/20 border-phosphorGreen text-phosphorGreen"
              : "bg-cabinetSurface border-cabinetBorder text-arcadeRed"
          }`}
          title={isMuted ? "Unmute 8-bit Audio" : "Mute Audio"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
