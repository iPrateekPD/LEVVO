"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical Arcade System Exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0B0C16] text-[#EDEBF7] flex items-center justify-center p-4 font-mono">
      <div className="relative w-full max-w-lg bg-[#141324] border-2 border-arcadeRed rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(255,51,102,0.3)] text-center flex flex-col items-center gap-5">
        {/* Flashing Retro Icon */}
        <div className="w-16 h-16 rounded-full bg-arcadeRed/20 border-2 border-arcadeRed flex items-center justify-center text-arcadeRed shadow-[0_0_20px_rgba(255,51,102,0.6)] animate-pulse">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Glitch Arcade Title */}
        <div className="space-y-1.5">
          <span className="font-arcade text-xs text-arcadeRed tracking-widest uppercase block">
            FATAL EXECUTION EXCEPTION
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-arcade uppercase tracking-wider">
            SYSTEM REBOOTING...
          </h1>
          <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto">
            A temporary glitch disrupted the arcade matrix. Core player state remains secure in the PostgreSQL ledger.
          </p>
        </div>

        {/* Error Details if available */}
        {error?.message && (
          <div className="w-full p-3 bg-black/60 border border-arcadeRed/40 rounded-lg text-left text-[11px] text-pink-300 font-mono overflow-x-auto">
            <code>{error.message}</code>
          </div>
        )}

        {/* Recovery CTA Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 px-4 bg-arcadeRed hover:bg-pink-600 text-white font-arcade text-xs rounded-xl shadow-[0_0_15px_rgba(255,51,102,0.6)] transition-all flex items-center justify-center gap-2 uppercase cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4 animate-spin" /> REBOOT SYSTEM
          </button>
          <Link
            href="/"
            className="py-3 px-4 bg-black/70 hover:bg-black text-gray-300 hover:text-white border border-gray-700 font-arcade text-xs rounded-xl transition-all flex items-center justify-center gap-2 uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <Home className="w-4 h-4" /> ARCADE HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
