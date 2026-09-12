"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Trophy, Flame, Play, Volume2, RotateCcw, Award } from "lucide-react";
import { sounds } from "@/lib/sound";
import confetti from "canvas-confetti";

interface RetroArcadeZoneProps {
  currentLevel?: number;
  streak?: number;
  completedTasksCount?: number;
  totalXp?: number;
  onAwardBonusXp?: (amount: number, reason: string) => void;
}

// 30-tile Snakes & Ladders Map Definition
const SNAKES_AND_LADDERS = {
  // Ladders: start -> end
  ladders: {
    4: { target: 14, name: "Workout Ladder" },
    9: { target: 20, name: "Deep Study Ladder" },
    16: { target: 26, name: "Hydration Ladder" },
  } as Record<number, { target: number; name: string }>,
  // Snakes: start -> end
  snakes: {
    18: { target: 8, name: "Doomscroll Snake" },
    24: { target: 12, name: "All-Nighter Snake" },
    28: { target: 15, name: "Procrastination Pit" },
  } as Record<number, { target: number; name: string }>,
};

export function RetroArcadeZone({
  currentLevel = 1,
  streak = 0,
  completedTasksCount = 0,
  totalXp = 0,
  onAwardBonusXp,
}: RetroArcadeZoneProps) {
  const [activeArcadeTab, setActiveArcadeTab] = useState<"PACMAN" | "SNAKES" | "LUDO">("PACMAN");

  // --- PAC-MAN STATE ---
  const [pacmanPos, setPacmanPos] = useState<number>(3);
  const [ghostScared, setGhostScared] = useState<boolean>(false);
  const [ghostsEaten, setGhostsEaten] = useState<number>(0);
  const [pacmanScore, setPacmanScore] = useState<number>(1200);

  // --- SNAKES & LADDERS STATE ---
  const [playerTile, setPlayerTile] = useState<number>(1);
  const [lastDiceRoll, setLastDiceRoll] = useState<number | null>(null);
  const [boardLog, setBoardLog] = useState<string>("Roll the dice to advance on the 90's Habit Board!");
  const [isRolling, setIsRolling] = useState<boolean>(false);

  // --- LUDO TOKENS STATE ---
  const [ludoTokens, setLudoTokens] = useState({
    red: Math.min(6, Math.max(1, Math.floor(currentLevel * 1.2))), // STR
    green: Math.min(6, Math.max(1, Math.floor(completedTasksCount / 2) + 1)), // INT
    yellow: Math.min(6, Math.max(1, Math.floor(streak / 2) + 1)), // WIS
    blue: Math.min(6, Math.max(1, Math.floor(totalXp / 500) + 1)), // CHA
  });

  // Load saved board positions from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTile = localStorage.getItem("levvo_snakes_tile");
      if (savedTile) setPlayerTile(Number(savedTile));

      const savedPacScore = localStorage.getItem("levvo_pac_score");
      if (savedPacScore) setPacmanScore(Number(savedPacScore));
    }
  }, []);

  // --- PAC-MAN HANDLERS ---
  const handleEatPellet = () => {
    sounds.playClick();
    const nextPos = (pacmanPos + 1) % 12;
    setPacmanPos(nextPos);
    setPacmanScore((prev) => {
      const updated = prev + 50;
      if (typeof window !== "undefined") localStorage.setItem("levvo_pac_score", String(updated));
      return updated;
    });

    // Special power pellet at index 6
    if (nextPos === 6) {
      sounds.playLevelUp();
      setGhostScared(true);
      setGhostsEaten((prev) => prev + 1);
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
      setTimeout(() => setGhostScared(false), 7000);
    }
  };

  // --- SNAKES & LADDERS HANDLERS ---
  const handleRollDice = () => {
    if (isRolling) return;
    sounds.playClick();
    setIsRolling(true);

    let rollCount = 0;
    const interval = setInterval(() => {
      setLastDiceRoll(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount > 8) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setLastDiceRoll(finalRoll);
        setIsRolling(false);

        // Advance player
        setPlayerTile((prev) => {
          let next = Math.min(30, prev + finalRoll);
          let message = `🎲 Rolled a ${finalRoll}! Advanced to Tile ${next}.`;

          // Check Ladder
          if (SNAKES_AND_LADDERS.ladders[next]) {
            const ladder = SNAKES_AND_LADDERS.ladders[next];
            next = ladder.target;
            message = `🪜 CLIMBED ${ladder.name.toUpperCase()}! Zoomed to Tile ${next}! (+30 Bonus XP)`;
            sounds.playLevelUp();
            confetti({ particleCount: 40, spread: 70 });
            onAwardBonusXp?.(30, ladder.name);
          }
          // Check Snake
          else if (SNAKES_AND_LADDERS.snakes[next]) {
            const snake = SNAKES_AND_LADDERS.snakes[next];
            next = snake.target;
            message = `🐍 BITTEN BY ${snake.name.toUpperCase()}! Slithered back to Tile ${next}! Stay resilient!`;
            sounds.playBossHit();
          } else {
            sounds.playComplete();
          }

          if (next >= 30) {
            message = `🏆 CONGRATULATIONS! You cleared the 90's Habit Board! Ultimate 90's Arcade Master!`;
            sounds.playLevelUp();
            confetti({ particleCount: 100, spread: 100 });
          }

          setBoardLog(message);
          if (typeof window !== "undefined") {
            localStorage.setItem("levvo_snakes_tile", String(next));
          }
          return next;
        });
      }
    }, 80);
  };

  const handleResetBoard = () => {
    sounds.playClick();
    setPlayerTile(1);
    setBoardLog("Board reset to start! Roll the dice to begin.");
    if (typeof window !== "undefined") localStorage.setItem("levvo_snakes_tile", "1");
  };

  return (
    <section className="w-full bg-[#120B24]/95 border-2 border-neonCyan/70 rounded-2xl p-4 sm:p-5 shadow-[0_0_25px_rgba(0,240,255,0.25)] flex flex-col gap-4 relative overflow-hidden">
      {/* 90's Arcade Studio Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-3 border-b border-cabinetBorder">
        <div className="flex items-center gap-2">
          <span className="text-xl select-none animate-bounce">🕹️</span>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-arcade text-xs sm:text-sm text-neonCyan neon-glow-cyan font-black tracking-wider">
                90&apos;S RETRO ARCADE ZONE
              </span>
              <span className="font-arcade text-[8px] bg-synthMagenta/20 text-synthMagenta border border-synthMagenta/50 px-1.5 py-0.5 rounded">
                OG EDITION
              </span>
            </div>
            <span className="font-mono text-[10px] text-gray-400">
              PAC-MAN • SNAKES & LADDERS • LUDO TOKENS • STREET COMBOS
            </span>
          </div>
        </div>

        {/* 90's Minigame Switcher Pills */}
        <div className="flex items-center gap-1 bg-[#1A1032] p-1 rounded-xl border border-[#2E1B50] w-full sm:w-auto justify-between">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveArcadeTab("PACMAN");
            }}
            className={`px-3 py-1.5 rounded-lg font-arcade text-[9px] sm:text-[10px] flex items-center gap-1.5 transition-all ${
              activeArcadeTab === "PACMAN"
                ? "bg-gradient-to-r from-yellow-500 to-arcadeGold text-arcadeBlack font-bold shadow-[0_0_10px_rgba(255,230,0,0.5)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span>🟡</span>
            <span>PAC-MAZE</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveArcadeTab("SNAKES");
            }}
            className={`px-3 py-1.5 rounded-lg font-arcade text-[9px] sm:text-[10px] flex items-center gap-1.5 transition-all ${
              activeArcadeTab === "SNAKES"
                ? "bg-gradient-to-r from-purple-700 to-synthMagenta text-white font-bold shadow-[0_0_10px_rgba(255,42,133,0.5)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span>🪜</span>
            <span>SNAKES & LADDERS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveArcadeTab("LUDO");
            }}
            className={`px-3 py-1.5 rounded-lg font-arcade text-[9px] sm:text-[10px] flex items-center gap-1.5 transition-all ${
              activeArcadeTab === "LUDO"
                ? "bg-gradient-to-r from-cyan-600 to-neonCyan text-arcadeBlack font-bold shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span>🎲</span>
            <span>LUDO HOME</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PAC-MAN RETRO MAZE TAB                                                 */}
      {/* ========================================================================= */}
      {activeArcadeTab === "PACMAN" && (
        <div className="bg-[#0B0818] border-2 border-[#1F173D] rounded-xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-arcade text-xs text-arcadeGold">PAC-SCORE: {pacmanScore}</span>
              <span className="font-arcade text-[9px] text-neonCyan bg-black/70 px-2 py-0.5 rounded border border-neonCyan/30">
                1UP
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-300">
                Ghosts Defeated: <strong className="text-synthMagenta">{ghostsEaten}</strong>
              </span>
              {ghostScared && (
                <span className="font-arcade text-[8px] bg-blue-600/40 text-blue-300 border border-blue-400 px-2 py-0.5 rounded animate-pulse font-bold">
                  GHOSTS SCARED! 2X XP
                </span>
              )}
            </div>
          </div>

          {/* Interactive Pac-Man Pellet Corridor */}
          <div className="relative bg-[#060410] border-2 border-blue-900 rounded-xl p-4 flex items-center justify-between overflow-x-auto gap-2 select-none">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((idx) => {
              const isPacmanHere = pacmanPos === idx;
              const isPowerPellet = idx === 6;

              return (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center min-w-[28px] h-10 relative"
                >
                  {isPacmanHere ? (
                    <div className="text-2xl animate-pulse filter drop-shadow-[0_0_8px_rgba(255,230,0,0.8)]">
                      ᗧ
                    </div>
                  ) : idx === 9 ? (
                    <div
                      className={`text-xl transition-all ${
                        ghostScared
                          ? "filter hue-rotate-180 brightness-150 animate-bounce"
                          : "filter drop-shadow-[0_0_6px_rgba(255,0,0,0.8)]"
                      }`}
                    >
                      {ghostScared ? "👻" : "👾"}
                    </div>
                  ) : idx === 11 ? (
                    <div className="text-xl filter drop-shadow-[0_0_6px_rgba(255,100,0,0.8)]">
                      {ghostScared ? "👻" : "🍒"}
                    </div>
                  ) : isPowerPellet ? (
                    <div className="w-3.5 h-3.5 rounded-full bg-arcadeGold animate-ping shadow-[0_0_10px_#FFE600]" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-yellow-200/80 shadow-[0_0_4px_#FFE600]" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Pac-Man Controls & 90s Trivia */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="text-xs text-gray-400 font-sans">
              <strong className="text-arcadeGold font-arcade text-[10px]">WAKA-WAKA RULE:</strong>{" "}
              Tap chomp or complete daily tasks to eat power pellets and scare procrastination ghosts!
            </div>
            <button
              type="button"
              onClick={handleEatPellet}
              className="arcade-btn px-4 py-2 bg-gradient-to-r from-arcadeGold to-yellow-400 hover:brightness-110 text-arcadeBlack font-arcade text-xs font-bold rounded-xl border border-yellow-200 shadow-[0_3px_0_#9E8200] flex items-center gap-2 shrink-0"
            >
              <span>CHOMP PELLET ᗧ</span>
              <span className="font-bold">+50 PTS</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SNAKES & LADDERS RETRO BOARD TAB                                       */}
      {/* ========================================================================= */}
      {activeArcadeTab === "SNAKES" && (
        <div className="bg-[#0B0818] border-2 border-[#1F173D] rounded-xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-arcade text-xs text-synthMagenta">
                HERO POSITION: TILE {playerTile} / 30
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetBoard}
                className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1"
                title="Restart Board"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* 30-Tile Grid Representation */}
          <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 p-2 bg-[#060410] border border-[#2B1B50] rounded-xl">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((tileNum) => {
              const isPlayerHere = playerTile === tileNum;
              const hasLadder = Boolean(SNAKES_AND_LADDERS.ladders[tileNum]);
              const hasSnake = Boolean(SNAKES_AND_LADDERS.snakes[tileNum]);

              return (
                <div
                  key={tileNum}
                  className={`h-11 sm:h-12 rounded-lg border flex flex-col items-center justify-between p-1 text-[9px] font-arcade transition-all relative ${
                    isPlayerHere
                      ? "bg-neonCyan/25 border-neonCyan shadow-[0_0_10px_rgba(0,240,255,0.6)] text-neonCyan font-bold"
                      : hasLadder
                      ? "bg-phosphorGreen/15 border-phosphorGreen/50 text-phosphorGreen"
                      : hasSnake
                      ? "bg-arcadeRed/15 border-arcadeRed/50 text-arcadeRed"
                      : "bg-[#140D26] border-[#22173F] text-gray-400"
                  }`}
                >
                  <span className="text-[8px] self-start leading-none opacity-80">{tileNum}</span>
                  {isPlayerHere ? (
                    <span className="text-base animate-bounce select-none">🧙‍♂️</span>
                  ) : hasLadder ? (
                    <span className="text-xs select-none" title="Ladder Up!">
                      🪜
                    </span>
                  ) : hasSnake ? (
                    <span className="text-xs select-none" title="Snake Down!">
                      🐍
                    </span>
                  ) : tileNum === 30 ? (
                    <span className="text-xs select-none">👑</span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Status Notification Log */}
          <div className="p-2.5 bg-[#140D28] border border-[#2D1B54] rounded-lg text-xs font-mono text-gray-300 flex items-center justify-between">
            <span>{boardLog}</span>
            {lastDiceRoll && (
              <span className="font-arcade text-xs text-arcadeGold bg-black/60 px-2 py-0.5 rounded border border-arcadeGold/40 shrink-0 ml-2">
                DICE: 🎲 {lastDiceRoll}
              </span>
            )}
          </div>

          {/* Action Roll Button */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-gray-400 font-sans">
              Complete quests or click Roll Dice to test your luck on the habit trail!
            </span>
            <button
              type="button"
              onClick={handleRollDice}
              disabled={isRolling}
              className="arcade-btn px-5 py-2.5 bg-gradient-to-r from-purple-700 to-synthMagenta hover:brightness-110 text-white font-arcade text-xs font-bold rounded-xl border border-pink-400 shadow-[0_3px_0_#9E0045] flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              <span>{isRolling ? "ROLLING 🎲..." : "ROLL 90'S DICE 🎲"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LUDO MASTER 4-TOKEN QUADRANT TAB                                       */}
      {/* ========================================================================= */}
      {activeArcadeTab === "LUDO" && (
        <div className="bg-[#0B0818] border-2 border-[#1F173D] rounded-xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-arcade text-xs text-neonCyan">
              LUDO LIFE QUADRANT • 4 HERO ATTRIBUTES
            </span>
            <span className="font-mono text-xs text-gray-400">
              Advance tokens toward the Center Star 🌟
            </span>
          </div>

          {/* Ludo 4 Attribute Bases Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Red Token - Strength / Fitness */}
            <div className="p-3.5 rounded-xl bg-arcadeRed/15 border-2 border-arcadeRed/50 flex flex-col justify-between gap-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-arcade text-[10px] text-arcadeRed font-bold">
                  RED TOKEN • STR
                </span>
                <span className="text-lg">🔴</span>
              </div>
              <p className="text-xs text-gray-300">Workout, Energy & Physical Vitality</p>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5, 6].map((step) => (
                  <div
                    key={step}
                    className={`h-2.5 flex-1 rounded-sm border ${
                      step <= ludoTokens.red
                        ? "bg-arcadeRed border-red-400 shadow-[0_0_6px_#FF3366]"
                        : "bg-black/50 border-gray-700"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono text-gray-400">
                Progress: Step {ludoTokens.red} of 6
              </span>
            </div>

            {/* Green Token - Intellect / Study */}
            <div className="p-3.5 rounded-xl bg-phosphorGreen/15 border-2 border-phosphorGreen/50 flex flex-col justify-between gap-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-arcade text-[10px] text-phosphorGreen font-bold">
                  GREEN TOKEN • INT
                </span>
                <span className="text-lg">🟢</span>
              </div>
              <p className="text-xs text-gray-300">Deep Work, Study & Engineering</p>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5, 6].map((step) => (
                  <div
                    key={step}
                    className={`h-2.5 flex-1 rounded-sm border ${
                      step <= ludoTokens.green
                        ? "bg-phosphorGreen border-green-400 shadow-[0_0_6px_#00FF66]"
                        : "bg-black/50 border-gray-700"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono text-gray-400">
                Progress: Step {ludoTokens.green} of 6
              </span>
            </div>

            {/* Yellow Token - Wisdom / Mindset */}
            <div className="p-3.5 rounded-xl bg-arcadeGold/15 border-2 border-arcadeGold/50 flex flex-col justify-between gap-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-arcade text-[10px] text-arcadeGold font-bold">
                  YELLOW TOKEN • WIS
                </span>
                <span className="text-lg">🟡</span>
              </div>
              <p className="text-xs text-gray-300">Meditation, Reading & Mindfulness</p>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5, 6].map((step) => (
                  <div
                    key={step}
                    className={`h-2.5 flex-1 rounded-sm border ${
                      step <= ludoTokens.yellow
                        ? "bg-arcadeGold border-yellow-300 shadow-[0_0_6px_#FFE600]"
                        : "bg-black/50 border-gray-700"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono text-gray-400">
                Progress: Step {ludoTokens.yellow} of 6
              </span>
            </div>

            {/* Blue Token - Charisma / Social */}
            <div className="p-3.5 rounded-xl bg-neonCyan/15 border-2 border-neonCyan/50 flex flex-col justify-between gap-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-arcade text-[10px] text-neonCyan font-bold">
                  BLUE TOKEN • CHA
                </span>
                <span className="text-lg">🔵</span>
              </div>
              <p className="text-xs text-gray-300">Teamwork, Family & Life Balance</p>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5, 6].map((step) => (
                  <div
                    key={step}
                    className={`h-2.5 flex-1 rounded-sm border ${
                      step <= ludoTokens.blue
                        ? "bg-neonCyan border-cyan-300 shadow-[0_0_6px_#00F0FF]"
                        : "bg-black/50 border-gray-700"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono text-gray-400">
                Progress: Step {ludoTokens.blue} of 6
              </span>
            </div>
          </div>

          <div className="p-3 bg-[#130E26] border border-[#2A1D4E] rounded-xl flex items-center justify-between text-xs text-gray-300">
            <span className="flex items-center gap-2">
              <span className="text-lg">🌟</span>
              <span>
                <strong>LUDO HOME VICTORY STAR:</strong> Reach Step 6 on all 4 color tokens to trigger the ultimate 90&apos;s Grand Prix Fanfare!
              </span>
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
