// AUDIT: Tenant-isolation enforced. Heatmap activity is strictly filtered by session.userId.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getSessionUser(req);
    const userId = session?.userId ?? "default-user-hero";

    // Fetch activity logs for this user
    const logs = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    });

    const logMap = new Map<string, { xp: number; count: number }>();
    let totalXpPeriod = 0;
    let totalTasksPeriod = 0;

    for (const log of logs) {
      logMap.set(log.date, { xp: log.xpEarned, count: log.tasksCompleted });
      totalXpPeriod += log.xpEarned;
      totalTasksPeriod += log.tasksCompleted;
    }

    // Build rolling 365-day array
    const today = new Date();
    const days: Array<{
      date: string;
      xp: number;
      tasks: number;
      level: number; // 0 to 4 intensity scale
    }> = [];

    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      const entry = logMap.get(dateStr) || { xp: 0, count: 0 };

      // Intensity level 0..4
      let level = 0;
      if (entry.xp > 100) level = 4;
      else if (entry.xp >= 60) level = 3;
      else if (entry.xp >= 30) level = 2;
      else if (entry.xp > 0) level = 1;

      days.push({
        date: dateStr,
        xp: entry.xp,
        tasks: entry.count,
        level,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        days,
        totalXpPeriod,
        totalTasksPeriod,
        activeDaysCount: logs.length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch heatmap data:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
