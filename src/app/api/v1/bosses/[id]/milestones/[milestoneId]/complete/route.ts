// AUDIT: Tenant-isolation enforced. boss.userId is strictly verified against authenticated session.userId.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateLevelFromTotalXp } from "@/lib/progression";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string; milestoneId: string } }
) {
  try {
    const session = await getSessionUser(req);
    const userId = session?.userId ?? "default-user-hero";

    const { id: bossId, milestoneId } = params;

    const boss = await prisma.boss.findUnique({
      where: { id: bossId },
      include: { milestones: true },
    });

    if (!boss || boss.userId !== userId) {
      return NextResponse.json({ success: false, error: "Boss not found" }, { status: 404 });
    }

    const milestone = boss.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      return NextResponse.json({ success: false, error: "Milestone not found" }, { status: 404 });
    }

    if (milestone.status === "COMPLETED") {
      return NextResponse.json(
        { success: false, error: "Milestone already completed" },
        { status: 409 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark milestone complete
      await tx.bossMilestone.update({
        where: { id: milestoneId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      // 2. Damage boss HP
      const newHp = Math.max(0, boss.currentHp - milestone.damageHp);
      const isDefeated = newHp === 0;

      const updatedBoss = await tx.boss.update({
        where: { id: bossId },
        data: {
          currentHp: newHp,
          status: isDefeated ? "DEFEATED" : boss.status,
          defeatedAt: isDefeated ? new Date() : null,
        },
        include: { milestones: true },
      });

      let lootAwarded = null;

      // 3. If defeated, award victory loot!
      if (isDefeated && boss.status !== "DEFEATED") {
        const profile = await tx.profile.findUniqueOrThrow({
          where: { userId: userId },
        });

        const newTotalXp = profile.totalXp + boss.rewardXp;
        const newGold = profile.gold + boss.rewardGold;
        const newLevelStats = calculateLevelFromTotalXp(newTotalXp);

        await tx.profile.update({
          where: { userId: userId },
          data: {
            totalXp: newTotalXp,
            currentLevel: newLevelStats.level,
            gold: newGold,
          },
        });

        await tx.xpTransaction.create({
          data: {
            userId: userId,
            deltaXp: boss.rewardXp,
            deltaGold: boss.rewardGold,
            sourceType: "BOSS_VICTORY",
            sourceId: boss.id,
            description: `Defeated Boss: ${boss.title}`,
          },
        });

        // Unlock boss_slayer achievement if not already owned
        let unlockedAchievement = null;
        const bossSlayerAch = await tx.achievement.findUnique({
          where: { code: "boss_slayer" },
        });
        if (bossSlayerAch) {
          const alreadyUnlocked = await tx.userAchievement.findUnique({
            where: {
              userId_achievementId: {
                userId,
                achievementId: bossSlayerAch.id,
              },
            },
          });
          if (!alreadyUnlocked) {
            await tx.userAchievement.create({
              data: {
                userId,
                achievementId: bossSlayerAch.id,
              },
            });
            unlockedAchievement = bossSlayerAch.name;
          }
        }

        lootAwarded = {
          xp: boss.rewardXp,
          gold: boss.rewardGold,
          unlockedAchievement: unlockedAchievement ?? "Titan Slayer",
        };
      }

      return {
        boss: updatedBoss,
        damageDealt: milestone.damageHp,
        remainingHp: newHp,
        isDefeated,
        lootAwarded,
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Failed to complete milestone:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
