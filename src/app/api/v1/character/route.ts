import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateLevelFromTotalXp, calculateAttributeLevel, CANONICAL_ATTRIBUTES } from "@/lib/progression";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getSessionUser(req);
    const userId = session?.userId ?? "default-user-hero";

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    const attributes = await prisma.attribute.findMany({
      where: { userId },
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
        currentAp: profile.currentAp ?? 100,
        maxAp: profile.maxAp ?? 100,
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
