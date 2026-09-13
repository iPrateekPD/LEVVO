// AUDIT: Tenant-isolation enforced. Subtask creation strictly verifies parentTask.userId === session.userId.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DIFFICULTY_TIERS, DifficultyTier } from "@/lib/progression";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const CreateSubTaskSchema = z.object({
  title: z.string().trim().min(1, "Subtask title is required").max(160),
  difficulty: z.enum(["Trivial", "Easy", "Medium", "Hard"]).default("Easy"),
  apCost: z.number().int().min(0).max(50).default(5),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userId;

    const { id: parentTaskId } = params;

    const parentTask = await prisma.task.findUnique({
      where: { id: parentTaskId },
    });

    if (!parentTask || parentTask.userId !== userId) {
      return NextResponse.json({ success: false, error: "Parent task not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = CreateSubTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { title, difficulty, apCost } = parsed.data;
    const rewards = DIFFICULTY_TIERS[difficulty as DifficultyTier];

    // Allocate fractional subtask rewards
    const subtask = await prisma.task.create({
      data: {
        userId,
        parentTaskId,
        title,
        attributeCode: parentTask.attributeCode,
        difficulty,
        xpReward: Math.max(10, Math.floor(rewards.xp * 0.5)),
        goldReward: Math.max(5, Math.floor(rewards.gold * 0.5)),
        apCost,
        status: "ACTIVE",
        stage: "TODO",
      },
    });

    return NextResponse.json({ success: true, data: subtask }, { status: 201 });
  } catch (error) {
    console.error("Failed to create subtask:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
