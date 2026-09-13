// AUDIT: Tenant-isolation enforced. task.userId is strictly verified against authenticated session.userId.
// Zero-trust perimeter: Request body is completely ignored; rewards and attributes are derived strictly from database.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  calculateLevelFromTotalXp,
  calculateAttributeLevel,
  calculateWeightedMomentum,
} from "@/lib/progression";
import { getSessionUser } from "@/lib/auth";

function getLocalDateString(date: Date, timeZone: string = "UTC"): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().split("T")[0];
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    // 1. Authenticate user from session (tenant-isolation)
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userId;

    const { id } = params;

    // 2. Fetch task with tenant check
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task || task.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    if (task.status === "COMPLETED") {
      return NextResponse.json(
        { success: false, error: "TASK_ALREADY_COMPLETED" },
        { status: 409 }
      );
    }

    // 3. Fetch user profile for timezone and boost status
    const profile = await prisma.profile.findUniqueOrThrow({
      where: { userId },
    });

    const now = new Date();
    const tz = profile.timezone || "UTC";
    const todayStr = getLocalDateString(now, tz);
    const completionDate = new Date(`${todayStr}T00:00:00.000Z`);

    // 4. Idempotency check via composite key [taskId, completionDate]
    const existingCompletion = await prisma.taskCompletion.findUnique({
      where: {
        taskId_completionDate: {
          taskId: task.id,
          completionDate,
        },
      },
    });

    if (existingCompletion) {
      return NextResponse.json(
        { success: false, error: "TASK_ALREADY_COMPLETED", message: "Task has already been completed today" },
        { status: 409 }
      );
    }

    // 5. Atomic server-authoritative transaction
    const result = await prisma.$transaction(async (tx) => {
      // 5.1 Mark task completed and stage DONE
      const updatedTask = await tx.task.update({
        where: { id },
        data: {
          status: "COMPLETED",
          stage: "DONE",
          completedAt: now,
        },
      });

      // 5.2 Daily XP cap check (600 XP max per day)
      const todayActivity = await tx.activityLog.findUnique({
        where: {
          userId_date: {
            userId,
            date: todayStr,
          },
        },
      });

      const currentDayXp = todayActivity?.xpEarned ?? 0;
      const isDailyCapReached = currentDayXp >= 600;

      // Check if recovery XP boost is currently active (+50%)
      const isBoostActive = profile.boostExpiresAt && new Date(profile.boostExpiresAt) > now;
      const boostMultiplier = isBoostActive ? 1.5 : 1.0;

      let awardedXp = 0;
      let awardedGold = 0;

      if (!isDailyCapReached) {
        const potentialXp = Math.round(task.xpReward * boostMultiplier);
        // Award up to 600 daily limit
        awardedXp = Math.min(potentialXp, 600 - currentDayXp);
        awardedGold = task.goldReward;
      }

      // Check if this is a Recovery Quest to activate +50% XP boost for rest of day
      const isRecoveryQuest =
        (task.tags && task.tags.toLowerCase().includes("recovery")) ||
        task.title.toLowerCase().includes("recovery");

      let boostExpiresAt = profile.boostExpiresAt;
      if (isRecoveryQuest) {
        // Boost expires at local midnight tonight
        boostExpiresAt = new Date(`${todayStr}T23:59:59.999Z`);
      }

      // 5.3 Record completion in idempotency ledger
      await tx.taskCompletion.create({
        data: {
          taskId: task.id,
          userId,
          completionDate,
          awardedXp,
          awardedGold,
        },
      });

      // 5.4 Streak calculation (Non-punitive, frozen on inactivity, never hard reset)
      let streakCurrent = profile.streakCurrent;
      if (!profile.lastActiveDate) {
        streakCurrent = 1;
      } else {
        const lastActiveStr = getLocalDateString(new Date(profile.lastActiveDate), tz);
        const lastActiveDateObj = new Date(`${lastActiveStr}T00:00:00.000Z`);
        const diffDays = Math.round(
          (completionDate.getTime() - lastActiveDateObj.getTime()) / (24 * 60 * 60 * 1000)
        );

        if (diffDays === 0) {
          // Same calendar day completion: maintain streak
          streakCurrent = Math.max(1, profile.streakCurrent);
        } else if (diffDays === 1) {
          // Consecutive day: increment streak
          streakCurrent = (profile.streakCurrent || 0) + 1;
        } else {
          // 2+ days ago: Streak paused/frozen! Do not reset; resume from frozen value
          streakCurrent = Math.max(1, profile.streakCurrent);
        }
      }
      const streakLongest = Math.max(profile.streakLongest, streakCurrent);

      // 5.5 Update today's ActivityLog
      await tx.activityLog.upsert({
        where: {
          userId_date: {
            userId,
            date: todayStr,
          },
        },
        create: {
          userId,
          date: todayStr,
          tasksCompleted: 1,
          xpEarned: awardedXp,
        },
        update: {
          tasksCompleted: { increment: 1 },
          xpEarned: { increment: awardedXp },
        },
      });

      // 5.6 Compute 7-day weighted momentum score from activity logs
      const past7Dates: string[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        past7Dates.push(getLocalDateString(d, tz));
      }

      const recentLogs = await tx.activityLog.findMany({
        where: {
          userId,
          date: { in: past7Dates },
        },
      });

      const dailyXpLast7Days = past7Dates.map((dateStr) => {
        if (dateStr === todayStr) {
          return currentDayXp + awardedXp;
        }
        const log = recentLogs.find((l) => l.date === dateStr);
        return log?.xpEarned ?? 0;
      });

      const newMomentum = calculateWeightedMomentum(dailyXpLast7Days);

      // 5.7 Update Profile totals
      const oldLevelStats = calculateLevelFromTotalXp(profile.totalXp);
      const newTotalXp = profile.totalXp + awardedXp;
      const newLevelStats = calculateLevelFromTotalXp(newTotalXp);
      const didLevelUp = newLevelStats.level > oldLevelStats.level;
      const newGold = profile.gold + awardedGold;
      const newAp = Math.max(0, (profile.currentAp ?? 100) - (task.apCost ?? 10));

      const updatedProfile = await tx.profile.update({
        where: { userId },
        data: {
          totalXp: newTotalXp,
          currentLevel: newLevelStats.level,
          gold: newGold,
          currentAp: newAp,
          streakCurrent,
          streakLongest,
          momentumScore: newMomentum,
          lastActiveDate: now,
          boostExpiresAt,
        },
      });

      // 5.8 Update Attribute
      const attribute = await tx.attribute.findUnique({
        where: {
          userId_attributeCode: {
            userId,
            attributeCode: task.attributeCode,
          },
        },
      });

      let newAttrXp = 0;
      let newAttrLevel = 1;
      if (attribute) {
        newAttrXp = attribute.currentXp + awardedXp;
        newAttrLevel = calculateAttributeLevel(newAttrXp);
        await tx.attribute.update({
          where: { id: attribute.id },
          data: {
            currentXp: newAttrXp,
            currentLevel: newAttrLevel,
          },
        });
      }

      // 5.9 Audit ledger in XpTransaction
      if (awardedXp > 0 || awardedGold > 0) {
        await tx.xpTransaction.create({
          data: {
            userId,
            deltaXp: awardedXp,
            deltaGold: awardedGold,
            sourceType: "TASK_COMPLETE",
            sourceId: task.id,
            description: `Completed quest: ${task.title}${isBoostActive ? " (50% Boost Active)" : ""}`,
          },
        });
      }

      // 5.10 Check Achievement unlocks: first_quest
      let unlockedAchievement: string | null = null;
      const firstQuestAch = await tx.achievement.findUnique({
        where: { code: "first_quest" },
      });
      if (firstQuestAch) {
        const existingUserAch = await tx.userAchievement.findUnique({
          where: {
            userId_achievementId: {
              userId,
              achievementId: firstQuestAch.id,
            },
          },
        });
        if (!existingUserAch) {
          await tx.userAchievement.create({
            data: {
              userId,
              achievementId: firstQuestAch.id,
            },
          });
          unlockedAchievement = firstQuestAch.name;
        }
      }

      // 5.11 Task Recurrence auto-spawn
      let spawnedTask = null;
      const isRecurringTask =
        task.recurrence === "DAILY" ||
        task.recurrence === "WEEKLY" ||
        (task.isRecurring && task.recurrenceRule);

      if (isRecurringTask) {
        const recurrenceType =
          task.recurrence === "WEEKLY" || task.recurrenceRule === "WEEKLY"
            ? "WEEKLY"
            : "DAILY";
        const advanceDays = recurrenceType === "WEEKLY" ? 7 : 1;
        const baseDueDate = task.dueDate ? new Date(task.dueDate) : now;
        const nextDueDate = new Date(baseDueDate.getTime() + advanceDays * 24 * 60 * 60 * 1000);

        spawnedTask = await tx.task.create({
          data: {
            userId,
            parentTaskId: task.parentTaskId,
            title: task.title,
            description: task.description,
            notes: task.notes,
            attributeCode: task.attributeCode,
            difficulty: task.difficulty,
            xpReward: task.xpReward,
            goldReward: task.goldReward,
            apCost: task.apCost,
            status: "ACTIVE",
            stage: "TODO",
            isRecurring: true,
            recurrence: recurrenceType,
            recurrenceRule: task.recurrenceRule,
            tags: task.tags,
            dueDate: nextDueDate,
          },
        });
      }

      return {
        task: updatedTask,
        spawnedRecurringTask: spawnedTask,
        awardedXp,
        awardedGold,
        didLevelUp,
        newLevel: newLevelStats.level,
        totalXp: newTotalXp,
        gold: updatedProfile.gold,
        streakCurrent,
        momentumScore: newMomentum,
        dailyCapReached: isDailyCapReached,
        dailyCapMessage: isDailyCapReached
          ? "Daily XP cap reached — the work still counts!"
          : null,
        unlockedAchievement,
        boostActive: !!(boostExpiresAt && new Date(boostExpiresAt) > now),
        attributeUpdated: {
          code: task.attributeCode,
          newXp: newAttrXp,
          newLevel: newAttrLevel,
        },
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "TASK_ALREADY_COMPLETED", message: "Task has already been completed today" },
        { status: 409 }
      );
    }
    console.error("Failed to complete task:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
