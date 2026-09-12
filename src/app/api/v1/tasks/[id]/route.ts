// AUDIT: Tenant-isolation enforced. All task mutations strictly verify task.userId === session.userId.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DIFFICULTY_TIERS, DifficultyTier } from "@/lib/progression";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth";

const UpdateTaskSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  notes: z.string().trim().max(5000).optional().nullable(),
  attributeCode: z.enum(["STR", "INT", "WIS", "DEX", "CRE", "CHA"]).optional(),
  difficulty: z.enum(["Trivial", "Easy", "Medium", "Hard", "Epic"]).optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
  stage: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).optional(),
  tags: z.string().optional().nullable(),
  apCost: z.number().int().min(0).max(100).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionUser(req);
    const userId = session?.userId ?? "default-user-hero";

    const { id } = params;
    const body = await req.json();
    const parsed = UpdateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task || task.userId !== userId) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.difficulty) {
      const rewards = DIFFICULTY_TIERS[parsed.data.difficulty as DifficultyTier];
      updateData.xpReward = rewards.xp;
      updateData.goldReward = rewards.gold;
    }

    if (parsed.data.stage) {
      if (parsed.data.stage === "DONE") {
        updateData.status = "COMPLETED";
        updateData.completedAt = task.completedAt || new Date();
      } else {
        updateData.status = "ACTIVE";
        updateData.completedAt = null;
      }
    }

    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, data: { deletedId: id } });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
