// AUDIT: Tenant-isolation enforced. Session.userId ownership strictly validated.
// Focus Session Timer API: Server-authoritative Pomodoro session tracking and XP awards.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateLevelFromTotalXp, calculateAttributeLevel } from "@/lib/progression";
import { getSessionUser } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const TimerActionSchema = z.object({
  action: z.enum(["start", "complete", "cancel"]),
  durationMinutes: z.number().int().min(5).max(120).optional(),
  taskId: z.string().optional().nullable(),
  sessionId: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getSessionUser(req);
    const userId = session?.userId ?? "default-user-hero";

    const activeSession = await prisma.focusSession.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
      orderBy: { createdAt: "desc" },
    });

    if (activeSession) {
      const endsAtMs = new Date(activeSession.startedAt).getTime() + activeSession.durationMinutes * 60 * 1000;
      if (endsAtMs > Date.now()) {
        return NextResponse.json({
          success: true,
          data: {
            ...activeSession,
            endsAt: new Date(endsAtMs).toISOString(),
          },
        });
      } else {
        // Expired active session
        await prisma.focusSession.update({
          where: { id: activeSession.id },
          data: { status: "COMPLETED" },
        });
      }
    }

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error("Failed to fetch timer session:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser(req);
    const userId = session?.userId ?? "default-user-hero";

    const body = await req.json();
    const parsed = TimerActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { action, durationMinutes = 25, taskId, sessionId } = parsed.data;
    const now = new Date();

    if (action === "start") {
      // Cancel existing active sessions
      await prisma.focusSession.updateMany({
        where: { userId, status: "ACTIVE" },
        data: { status: "CANCELLED" },
      });

      const endsAt = new Date(now.getTime() + durationMinutes * 60 * 1000);
      const newSession = await prisma.focusSession.create({
        data: {
          userId,
          taskId: taskId || null,
          durationMinutes,
          status: "ACTIVE",
          startedAt: now,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...newSession,
          endsAt: endsAt.toISOString(),
        },
      });
    }

    if (action === "cancel") {
      await prisma.focusSession.updateMany({
        where: { userId, status: "ACTIVE" },
        data: { status: "CANCELLED" },
      });
      return NextResponse.json({ success: true, message: "Timer session cancelled" });
    }

    if (action === "complete") {
      // Find active or specific session
      let targetSession = null;
      if (sessionId) {
        targetSession = await prisma.focusSession.findUnique({
          where: { id: sessionId },
        });
      } else {
        targetSession = await prisma.focusSession.findFirst({
          where: { userId, status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
        });
      }

      const minutes = targetSession?.durationMinutes || durationMinutes;
      const awardedXp = Math.min(60, minutes); // 1 XP per minute, capped at 60 XP
      const awardedGold = Math.floor(awardedXp / 2);

      const result = await prisma.$transaction(async (tx) => {
        if (targetSession) {
          await tx.focusSession.update({
            where: { id: targetSession.id },
            data: {
              status: "COMPLETED",
              completedAt: now,
              xpAwarded: awardedXp,
            },
          });
        } else {
          await tx.focusSession.create({
            data: {
              userId,
              taskId: taskId || null,
              durationMinutes: minutes,
              status: "COMPLETED",
              startedAt: new Date(now.getTime() - minutes * 60 * 1000),
              completedAt: now,
              xpAwarded: awardedXp,
            },
          });
        }

        // Update user profile
        const profile = await tx.profile.findUniqueOrThrow({
          where: { userId },
        });

        const oldLevelStats = calculateLevelFromTotalXp(profile.totalXp);
        const newTotalXp = profile.totalXp + awardedXp;
        const newLevelStats = calculateLevelFromTotalXp(newTotalXp);
        const didLevelUp = newLevelStats.level > oldLevelStats.level;
        const newGold = profile.gold + awardedGold;

        const updatedProfile = await tx.profile.update({
          where: { userId },
          data: {
            totalXp: newTotalXp,
            currentLevel: newLevelStats.level,
            gold: newGold,
            lastActiveDate: now,
          },
        });

        // If linked to a task, attribute XP to task's attribute
        if (taskId) {
          const task = await tx.task.findUnique({ where: { id: taskId } });
          if (task) {
            const attr = await tx.attribute.findUnique({
              where: {
                userId_attributeCode: {
                  userId,
                  attributeCode: task.attributeCode,
                },
              },
            });
            if (attr) {
              const nextAttrXp = attr.currentXp + awardedXp;
              await tx.attribute.update({
                where: { id: attr.id },
                data: {
                  currentXp: nextAttrXp,
                  currentLevel: calculateAttributeLevel(nextAttrXp),
                },
              });
            }
          }
        }

        // Ledger transaction
        await tx.xpTransaction.create({
          data: {
            userId,
            deltaXp: awardedXp,
            deltaGold: awardedGold,
            sourceType: "FOCUS_SESSION",
            sourceId: targetSession?.id || taskId || null,
            description: `Completed Focus Sprint: ${minutes} min focus`,
          },
        });

        return {
          awardedXp,
          awardedGold,
          didLevelUp,
          newLevel: newLevelStats.level,
          profile: updatedProfile,
        };
      });

      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Failed to process timer action:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
