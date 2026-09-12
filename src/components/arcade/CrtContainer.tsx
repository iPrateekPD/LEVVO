"use client";

import React from "react";

interface CrtContainerProps {
  children: React.ReactNode;
  scanlines: boolean;
}

export function CrtContainer({ children, scanlines }: CrtContainerProps) {
  return (
    <div className="relative min-h-screen w-full max-w-full bg-arcadeBlack p-1 sm:p-4 md:p-6 lg:p-8 flex flex-col items-center justify-start overflow-hidden box-border">
      {/* Outer Arcade Cabinet Frame */}
      <div className="w-full max-w-7xl bg-cabinetSurface border-2 sm:border-4 border-cabinetBorder rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden relative box-border">
        {/* CRT Glass Bezel and Screen Wrapper */}
        <div
          className={`crt-overlay ${
            scanlines ? "crt-scanlines" : ""
          } crt-screen-bezel bg-[#0F0D1C] min-h-[85vh] p-2 sm:p-5 flex flex-col transition-all duration-200 box-border overflow-hidden`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
