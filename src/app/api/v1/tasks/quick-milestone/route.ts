// AUDIT: Tenant-isolation enforced. Session.userId ownership strictly validated.
// Quick milestone: Creates and immediately completes a task server-side in 1 transaction.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateLevelFromTotalXp, DIFFICULTY_TIERS, DifficultyTier } from "@/lib/progression";
import { getSessionUser } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const QuickMilestoneSchema = z.object({
  title: z.string().trim().min(2, "Task title required").max(160),
  difficulty: z.enum(["Trivial", "Easy", "Medium"]).default("Trivial"),
});

export async function POST(req: Request) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userId;

    const body = await req.json();
    const parsed = QuickMilestoneSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { title, difficulty } = parsed.data;
    const tierConfig = DIFFICULTY_TIERS[difficulty as DifficultyTier];
    const xpReward = tierConfig.xp;
    const goldReward = tierConfig.gold;

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const completionDate = new Date(`${todayStr}T00:00:00.000Z`);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create completed task
      const task = await tx.task.create({
        data: {
          userId,
          title,
          description: "Quick milestone logged from dashboard",
          attributeCode: "WIS",
          difficulty,
          xpReward,
          goldReward,
          apCost: 5,
          status: "COMPLETED",
          stage: "DONE",
          completedAt: now,
        },
      });

      // 2. Log completion
      await tx.taskCompletion.create({
        data: {
          taskId: task.id,
          userId,
          completionDate,
          awardedXp: xpReward,
          awardedGold: goldReward,
        },
      });

      // 3. Update profile
      const profile = await tx.profile.findUniqueOrThrow({
        where: { userId },
      });

      const oldLevelStats = calculateLevelFromTotalXp(profile.totalXp);
      const newTotalXp = profile.totalXp + xpReward;
      const newLevelStats = calculateLevelFromTotalXp(newTotalXp);
      const didLevelUp = newLevelStats.level > oldLevelStats.level;
      const newGold = profile.gold + goldReward;

      const updatedProfile = await tx.profile.update({
        where: { userId },
        data: {
          totalXp: newTotalXp,
          currentLevel: newLevelStats.level,
          gold: newGold,
          lastActiveDate: now,
        },
      });

      // 4. Ledger transaction
      await tx.xpTransaction.create({
        data: {
          userId,
          deltaXp: xpReward,
          deltaGold: goldReward,
          sourceType: "QUICK_MILESTONE",
          sourceId: task.id,
          description: `Quick Win: ${title}`,
        },
      });

      return {
        task,
        awardedXp: xpReward,
        awardedGold: goldReward,
        didLevelUp,
        newLevel: newLevelStats.level,
        profile: updatedProfile,
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Failed to log quick milestone:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
