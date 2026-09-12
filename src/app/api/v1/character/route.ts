import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateLevelFromTotalXp, calculateAttributeLevel, CANONICAL_ATTRIBUTES } from "@/lib/progression";

// Single active user ID for zero-auth frictionless local hackathon demonstration
const DEFAULT_USER_ID = "default-user-hero";

export async function GET() {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: DEFAULT_USER_ID },
    });

    if (!profile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    const attributes = await prisma.attribute.findMany({
      where: { userId: DEFAULT_USER_ID },
    });

    const levelStats = calculateLevelFromTotalXp(profile.totalXp);

    const mappedAttributes = CANONICAL_ATTRIBUTES.map((canon) => {
      const match = attributes.find((a) => a.attributeCode === canon.code);
      const currentXp = match?.currentXp ?? 0;
      return {
        ...canon,
        currentXp,
        currentLevel: calculateAttributeLevel(currentXp),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        username: profile.username,
        title: profile.title,
        totalXp: profile.totalXp,
        currentLevel: levelStats.level,
        currentLevelXp: levelStats.currentLevelXp,
        xpToNextLevel: levelStats.xpToNextLevel,
        progressPercent: levelStats.progressPercent,
        gold: profile.gold,
        streakCurrent: profile.streakCurrent,
        streakLongest: profile.streakLongest,
        momentumScore: profile.momentumScore,
        activeTheme: profile.activeTheme,
        avatarId: profile.avatarId,
        sfxEnabled: profile.sfxEnabled,
        attributes: mappedAttributes,
      },
    });
  } catch (error) {
    console.error("Failed to fetch character:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
