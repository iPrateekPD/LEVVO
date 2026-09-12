import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateLevelFromTotalXp, calculateAttributeLevel } from "@/lib/progression";

import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionUser(req);
    const userId = session?.userId ?? "default-user-hero";

    const { id } = params;

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task || task.userId !== userId) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    if (task.status === "COMPLETED") {
      return NextResponse.json(
        { success: false, error: "Task has already been completed" },
        { status: 409 }
      );
    }

    // Atomic server-authoritative transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark task completed
      const updatedTask = await tx.task.update({
        where: { id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      // 2. Record completion in idempotency ledger
      await tx.taskCompletion.create({
        data: {
          taskId: task.id,
          userId: userId,
          completionDate: new Date(),
          awardedXp: task.xpReward,
          awardedGold: task.goldReward,
        },
      });

      // 3. Fetch profile
      const profile = await tx.profile.findUniqueOrThrow({
        where: { userId: userId },
      });

      const oldLevelStats = calculateLevelFromTotalXp(profile.totalXp);
      const newTotalXp = profile.totalXp + task.xpReward;
      const newLevelStats = calculateLevelFromTotalXp(newTotalXp);
      const didLevelUp = newLevelStats.level > oldLevelStats.level;

      // 4. Streak logic (increment if active today)
      let streakCurrent = profile.streakCurrent;
      const now = new Date();
      const lastActive = profile.lastActiveDate ? new Date(profile.lastActiveDate) : null;
      const isDifferentDay = !lastActive || lastActive.toDateString() !== now.toDateString();

      if (isDifferentDay) {
        streakCurrent += 1;
      }
      const streakLongest = Math.max(profile.streakLongest, streakCurrent);

      // 5. Update Profile
      const updatedProfile = await tx.profile.update({
        where: { userId: userId },
        data: {
          totalXp: newTotalXp,
          currentLevel: newLevelStats.level,
          gold: profile.gold + task.goldReward,
          streakCurrent,
          streakLongest,
          lastActiveDate: now,
        },
      });

      // 6. Update Attribute
      const attribute = await tx.attribute.findUnique({
        where: {
          userId_attributeCode: {
            userId: userId,
            attributeCode: task.attributeCode,
          },
        },
      });

      const newAttrXp = (attribute?.currentXp ?? 0) + task.xpReward;
      const newAttrLevel = calculateAttributeLevel(newAttrXp);

      if (attribute) {
        await tx.attribute.update({
          where: { id: attribute.id },
          data: {
            currentXp: newAttrXp,
            currentLevel: newAttrLevel,
          },
        });
      }

      // 7. Audit log in XpTransaction
      await tx.xpTransaction.create({
        data: {
          userId: userId,
          deltaXp: task.xpReward,
          deltaGold: task.goldReward,
          sourceType: "TASK_COMPLETE",
          sourceId: task.id,
          description: `Completed quest: ${task.title}`,
        },
      });

      return {
        task: updatedTask,
        awardedXp: task.xpReward,
        awardedGold: task.goldReward,
        didLevelUp,
        newLevel: newLevelStats.level,
        totalXp: newTotalXp,
        gold: updatedProfile.gold,
        streakCurrent,
        attributeUpdated: {
          code: task.attributeCode,
          newXp: newAttrXp,
          newLevel: newAttrLevel,
        },
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Failed to complete task:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
