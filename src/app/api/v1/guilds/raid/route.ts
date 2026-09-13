import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const RaidAttackSchema = z.object({
  damage: z.number().int().min(1).max(500).default(100),
});

export async function POST(req: Request) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userId;

    const body = await req.json();
    const parsed = RaidAttackSchema.safeParse(body);

    const damage = parsed.success ? parsed.data.damage : 100;

    const guild = await prisma.guild.findFirst({
      include: {
        bosses: {
          where: { status: "ACTIVE" },
          take: 1,
        },
      },
    });

    if (!guild || !guild.bosses[0]) {
      return NextResponse.json({ success: false, error: "No active raid boss found" }, { status: 404 });
    }

    const boss = guild.bosses[0];
    const newHp = Math.max(0, boss.currentHp - damage);
    const isDefeated = newHp === 0;

    await prisma.guildBoss.update({
      where: { id: boss.id },
      data: {
        currentHp: newHp,
        status: isDefeated ? "DEFEATED" : "ACTIVE",
      },
    });

    // Reward player with gold and XP for raid participation
    await prisma.profile.update({
      where: { userId },
      data: {
        totalXp: { increment: 50 },
        gold: { increment: 25 },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        bossId: boss.id,
        damageDealt: damage,
        currentHp: newHp,
        isDefeated,
        rewardXp: 50,
        rewardGold: 25,
      },
    });
  } catch (error) {
    console.error("Failed to execute raid attack:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
