"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Tv, Sparkles, ShoppingBag } from "lucide-react";
import { sounds } from "@/lib/sound";

interface ArcadeMarqueeProps {
  scanlines: boolean;
  onToggleScanlines: () => void;
  onOpenShop: () => void;
  onOpenAiModal: () => void;
}

export function ArcadeMarquee({
  scanlines,
  onToggleScanlines,
  onOpenShop,
  onOpenAiModal,
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
        <h1 className="font-arcade text-xl sm:text-2xl md:text-3xl text-[#FFE600] tracking-wider neon-glow-gold">
          QUESTORIA
        </h1>
        <p className="font-arcade text-[9px] sm:text-[11px] text-synthMagenta tracking-widest uppercase mt-1 neon-glow-magenta">
          Small steps. Epic you.
        </p>
      </div>

      {/* Right Controls: Tactile Arcade Deck */}
      <div className="flex items-center gap-2">
        {/* AI Campaign Generator */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenAiModal();
          }}
          className="arcade-btn flex items-center gap-1.5 px-3 py-1.5 bg-[#8A2BE2] hover:bg-[#9B42F5] text-white border border-purple-300 rounded-md font-arcade text-[10px] shadow-[0_3px_0_#4B0082]"
          title="AI Quest Oracle"
        >
          <Sparkles className="w-3.5 h-3.5 text-arcadeGold" />
          <span className="hidden md:inline">AI ORACLE</span>
        </button>

        {/* Rewards Shop */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenShop();
          }}
          className="arcade-btn flex items-center gap-1.5 px-3 py-1.5 bg-arcadeGold hover:bg-yellow-300 text-arcadeBlack border border-yellow-200 rounded-md font-arcade text-[10px] shadow-[0_3px_0_#9E8200]"
          title="Rewards Shop"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-arcadeBlack" />
          <span className="hidden md:inline">SHOP</span>
        </button>

        {/* CRT Scanline Toggle */}
        <button
          onClick={() => {
            sounds.playClick();
            onToggleScanlines();
          }}
          className={`arcade-btn p-1.5 rounded-md border text-[11px] shadow-[0_3px_0_#110B22] ${
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
          className={`arcade-btn p-1.5 rounded-md border text-[11px] shadow-[0_3px_0_#110B22] ${
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
