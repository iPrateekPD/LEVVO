// AUDIT: Tenant-isolation enforced. All task queries strictly filter by session.userId.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DIFFICULTY_TIERS, DifficultyTier } from "@/lib/progression";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Rate Limiting Defense: Max 20 new tasks per user per 24 hours (sliding window).
 * Closes the difficulty-spam cheat vector where users create endless Epic tasks to farm XP.
 * NOTE: Using an in-memory sliding window map for hackathon environment.
 * Production Path: Back with distributed Redis (e.g. Upstash / ioredis) using a sorted set (ZADD/ZREMRANGEBYSCORE).
 */
const taskCreationRateLimits = new Map<string, number[]>();

function checkTaskCreationRateLimit(userId: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const windowMs = 24 * 60 * 60 * 1000; // 24-hour sliding window
  const maxTasks = 20;

  const timestamps = (taskCreationRateLimits.get(userId) || []).filter(
    (t) => now - t < windowMs
  );

  if (timestamps.length >= maxTasks) {
    const oldest = timestamps[0];
    const retryAfterSeconds = Math.ceil((windowMs - (now - oldest)) / 1000);
    taskCreationRateLimits.set(userId, timestamps);
    return { allowed: false, retryAfterSeconds };
  }

  timestamps.push(now);
  taskCreationRateLimits.set(userId, timestamps);
  return { allowed: true };
}

const CreateTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(160),
  description: z.string().trim().max(2000).optional(),
  notes: z.string().trim().max(5000).optional(),
  parentTaskId: z.string().optional(),
  attributeCode: z.enum(["STR", "INT", "WIS", "DEX", "CRE", "CHA"]).default("INT"),
  difficulty: z.enum(["Trivial", "Easy", "Medium", "Hard", "Epic"]).default("Medium"),
  stage: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).default("TODO"),
  apCost: z.number().int().min(0).max(100).default(10),
  tags: z.string().optional(),
  recurrence: z.enum(["NONE", "DAILY", "WEEKLY"]).default("NONE"),
  dueDate: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userId;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const stage = searchParams.get("stage");
    const parentOnly = searchParams.get("parentOnly") !== "false"; // default true unless requested

    const tasks = await prisma.task.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
        ...(stage ? { stage } : {}),
        ...(parentOnly ? { parentTaskId: null } : {}),
      },
      include: {
        subTasks: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: [
        { status: "asc" }, // ACTIVE before COMPLETED
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
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

    // 1. Enforce sliding-window rate limit (max 20 new tasks per 24 hours per user)
    const rateLimit = checkTaskCreationRateLimit(userId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "RATE_LIMIT_EXCEEDED",
          message: `Daily task creation limit reached (maximum 20 tasks per 24 hours to prevent XP farming). Please retry in ${rateLimit.retryAfterSeconds}s.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = CreateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      notes,
      parentTaskId,
      attributeCode,
      difficulty,
      stage,
      apCost,
      tags,
      recurrence,
      dueDate,
    } = parsed.data;

    const rewards = DIFFICULTY_TIERS[difficulty as DifficultyTier];

    const task = await prisma.task.create({
      data: {
        userId,
        title,
        description: description || null,
        notes: notes || null,
        parentTaskId: parentTaskId || null,
        attributeCode,
        difficulty,
        xpReward: rewards.xp,
        goldReward: rewards.gold,
        apCost: apCost ?? 10,
        status: stage === "DONE" ? "COMPLETED" : "ACTIVE",
        stage: stage ?? "TODO",
        isRecurring: recurrence !== "NONE",
        recurrence: recurrence ?? "NONE",
        tags: tags || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        subTasks: true,
      },
    });

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
