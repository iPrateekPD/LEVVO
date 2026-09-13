// AUDIT: Tenant-isolation enforced. Session.userId ownership strictly validated.
// Predefined Trackers API: Manages daily micro-counters with 1-hour anti-farm throttle for XP rewards.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateLevelFromTotalXp } from "@/lib/progression";
import { getSessionUser } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const TrackerUpdateSchema = z.object({
  trackerKey: z.string().trim().min(1).max(50),
  delta: z.number().int().min(-1).max(1),
});

export async function GET(req: Request) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userId;

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const logs = await prisma.trackerLog.findMany({
      where: {
        userId,
        date: todayStr,
      },
    });

    const trackerCounts: Record<string, number> = {};
    for (const log of logs) {
      trackerCounts[log.trackerKey] = log.count;
    }

    return NextResponse.json({ success: true, data: trackerCounts });
  } catch (error) {
    console.error("Failed to fetch tracker logs:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userId;

    const body = await req.json();
    const parsed = TrackerUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { trackerKey, delta } = parsed.data;
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    // Find or create tracker log
    const existingLog = await prisma.trackerLog.findUnique({
      where: {
        userId_trackerKey_date: {
          userId,
          trackerKey,
          date: todayStr,
        },
      },
    });

    const currentCount = existingLog?.count ?? 0;
    const newCount = Math.max(0, currentCount + delta);

    let awardedXp = 0;
    let awardedGold = 0;
    let throttled = false;

    // Check 1-hour anti-farm throttle if incrementing
    if (delta > 0) {
      const lastAwarded = existingLog?.lastAwardedAt ? new Date(existingLog.lastAwardedAt).getTime() : 0;
      const oneHourMs = 60 * 60 * 1000;
      const canAwardXp = !lastAwarded || now.getTime() - lastAwarded >= oneHourMs;

      if (canAwardXp) {
        awardedXp = 10;
        awardedGold = 5;
      } else {
        throttled = true;
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Upsert tracker log
      const updatedLog = await tx.trackerLog.upsert({
        where: {
          userId_trackerKey_date: {
            userId,
            trackerKey,
            date: todayStr,
          },
        },
        create: {
          userId,
          trackerKey,
          date: todayStr,
          count: newCount,
          lastAwardedAt: awardedXp > 0 ? now : null,
        },
        update: {
          count: newCount,
          lastAwardedAt: awardedXp > 0 ? now : undefined,
        },
      });

      let updatedProfile = null;

      // 2. Award XP/Gold if not throttled
      if (awardedXp > 0) {
        const profile = await tx.profile.findUniqueOrThrow({
          where: { userId },
        });

        const oldLevelStats = calculateLevelFromTotalXp(profile.totalXp);
        const newTotalXp = profile.totalXp + awardedXp;
        const newLevelStats = calculateLevelFromTotalXp(newTotalXp);
        const newGold = profile.gold + awardedGold;

        updatedProfile = await tx.profile.update({
          where: { userId },
          data: {
            totalXp: newTotalXp,
            currentLevel: newLevelStats.level,
            gold: newGold,
            lastActiveDate: now,
          },
        });

        // 3. Write XP transaction ledger
        await tx.xpTransaction.create({
          data: {
            userId,
            deltaXp: awardedXp,
            deltaGold: awardedGold,
            sourceType: "TRACKER_INCREMENT",
            sourceId: trackerKey,
            description: `Daily tracker: ${trackerKey.toUpperCase()} (+1)`,
          },
        });
      }

      return {
        log: updatedLog,
        awardedXp,
        awardedGold,
        throttled,
        profile: updatedProfile,
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Failed to update tracker:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
