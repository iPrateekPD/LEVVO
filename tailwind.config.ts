import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        arcadeBlack: "#0B0C16",
        cabinetSurface: "#141324",
        cabinetSurfaceLight: "#1F1A3A",
        cabinetBorder: "#2B254A",
        neonCyan: "#00F0FF",
        synthMagenta: "#FF2A85",
        arcadeGold: "#FFE600",
        phosphorGreen: "#00FF66",
        arcadeRed: "#FF3366",
        textPrimary: "#EDEBF7",
        textSecondary: "#9F9BB8",
        textMuted: "#5E5879",
      },
      fontFamily: {
        arcade: ["var(--font-arcade)", "'Press Start 2P'", "monospace"],
        sans: ["var(--font-outfit)", "'Outfit'", "sans-serif"],
      },
      boxShadow: {
        neonCyan: "0 0 15px rgba(0, 240, 255, 0.4)",
        synthMagenta: "0 0 15px rgba(255, 42, 133, 0.4)",
        arcadeGold: "0 0 15px rgba(255, 230, 0, 0.4)",
        phosphorGreen: "0 0 15px rgba(0, 255, 102, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
