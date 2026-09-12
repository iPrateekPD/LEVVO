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
  title: "Life-RPG | Your Life Is The Game",
  description: "Transform daily tasks, fitness habits, and projects into an authentic retro arcade role-playing game.",
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
