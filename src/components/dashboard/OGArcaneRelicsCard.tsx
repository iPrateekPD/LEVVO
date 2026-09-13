"use client";

import React from "react";
import { Gamepad2, Sparkles, Shield, Zap, Sword, Flame } from "lucide-react";
import { sounds } from "@/lib/sound";

interface OGArcaneRelicsCardProps {
  onTriggerKonami: () => void;
  isKonamiActive?: boolean;
}

export function OGArcaneRelicsCard({
  onTriggerKonami,
  isKonamiActive = false,
}: OGArcaneRelicsCardProps) {
  const relics = [
    {
      id: "zelda-sword",
      name: "Master Sword",
      game: "The Legend of Zelda",
      icon: "🗡️",
      effect: "+35 DMG to Daily Boss Malakor",
      tag: "EQUIPPED",
      color: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
    },
    {
      id: "mario-shroom",
      name: "1-UP Mushroom",
      game: "Super Mario Bros",
      icon: "🍄",
      effect: "Streak Shield: 1 Day Revival",
      tag: "ACTIVE",
      color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    },
    {
      id: "pokemon-badge",
      name: "Thunder Badge",
      game: "Pokémon Red/Blue",
      icon: "⚡",
      effect: "+20% Focus & INT Quest EXP",
      tag: "BUFFED",
      color: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    },
    {
      id: "sonic-ring",
      name: "Golden Rings",
      game: "Sonic The Hedgehog",
      icon: "🪙",
      effect: "+10 Gold on Early Bird Clears",
      tag: "x100",
      color: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    },
  ];

  return (
    <div className="bg-[#0C1022]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.07]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
              OG Arcana & 90&apos;s Relics
            </h3>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[9px] font-arcade text-[#FFE600] bg-amber-500/15 border border-amber-500/30">
          RETRO VAULT
        </span>
      </div>

      {/* Relics Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {relics.map((relic) => (
          <div
            key={relic.id}
            className="p-2.5 rounded-xl bg-[#101427]/80 border border-white/[0.06] hover:border-cyan-500/40 transition-all group flex flex-col justify-between gap-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl group-hover:scale-110 transition-transform select-none">
                {relic.icon}
              </span>
              <span
                className={`text-[8px] font-mono px-1.5 py-0.2 rounded border font-semibold ${relic.color}`}
              >
                {relic.tag}
              </span>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-100 group-hover:text-cyan-300 transition-colors leading-tight">
                {relic.name}
              </div>
              <div className="text-[9px] text-slate-400 font-mono">
                {relic.game}
              </div>
            </div>

            <div className="text-[10px] text-slate-300 leading-snug mt-0.5">
              {relic.effect}
            </div>
          </div>
        ))}
      </div>

      {/* Konami Code Cheat Button */}
      <button
        type="button"
        onClick={() => {
          sounds.playLevelUp();
          onTriggerKonami();
        }}
        className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all group ${
          isKonamiActive
            ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.2)]"
            : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] text-slate-300 hover:text-white"
        }`}
        title="Trigger legendary Konami Code cheat code"
      >
        <div className="flex items-center gap-2">
          <span className="text-base select-none">🕹️</span>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-arcade text-[#FFE600] tracking-wider leading-none">
              KONAMI SECRET CODE
            </span>
            <span className="font-mono text-[9px] text-slate-400 mt-0.5">
              ↑ ↑ ↓ ↓ ← → ← → B A
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] group-hover:bg-amber-500/20 group-hover:text-amber-300 transition-colors">
          {isKonamiActive ? "ACTIVE ✓" : "ACTIVATE ⚡"}
        </span>
      </button>
    </div>
  );
}
