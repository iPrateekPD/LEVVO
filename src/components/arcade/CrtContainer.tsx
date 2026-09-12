"use client";

import React from "react";

interface CrtContainerProps {
  children: React.ReactNode;
  scanlines: boolean;
}

export function CrtContainer({ children, scanlines }: CrtContainerProps) {
  return (
    <div className="relative min-h-screen bg-arcadeBlack p-2 sm:p-4 md:p-6 lg:p-8 flex flex-col items-center justify-start">
      {/* Outer Arcade Cabinet Frame */}
      <div className="w-full max-w-7xl bg-cabinetSurface border-4 border-cabinetBorder rounded-2xl shadow-2xl overflow-hidden relative">
        {/* CRT Glass Bezel and Screen Wrapper */}
        <div
          className={`crt-overlay ${
            scanlines ? "crt-scanlines" : ""
          } crt-screen-bezel bg-[#0F0D1C] min-h-[85vh] p-3 sm:p-6 flex flex-col transition-all duration-200`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
