import type { Metadata } from "next";
import { Press_Start_2P, Outfit } from "next/font/google";
import "./globals.css";

const arcadeFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-arcade",
});

const outfitFont = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "LEVVO | Retro Arcade 90s Life RPG",
  description: "Level up your real life with authentic 90s retro video game mechanics: Pac-Man focus chamber, Snakes & Ladders, Ludo tokens, and daily quests.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${arcadeFont.variable} ${outfitFont.variable}`}>
      <body className="bg-arcadeBlack text-textPrimary min-h-screen antialiased selection:bg-synthMagenta selection:text-white">
        {children}
      </body>
    </html>
  );
}
