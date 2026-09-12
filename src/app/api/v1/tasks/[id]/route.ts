import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DIFFICULTY_TIERS, DifficultyTier } from "@/lib/progression";
import { z } from "zod";

const DEFAULT_USER_ID = "default-user-hero";

const UpdateTaskSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  attributeCode: z.enum(["STR", "INT", "WIS", "DEX", "CRE", "CHA"]).optional(),
  difficulty: z.enum(["Trivial", "Easy", "Medium", "Hard", "Epic"]).optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
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

    if (!task || task.userId !== DEFAULT_USER_ID) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.difficulty) {
      const rewards = DIFFICULTY_TIERS[parsed.data.difficulty as DifficultyTier];
      updateData.xpReward = rewards.xp;
      updateData.goldReward = rewards.gold;
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
    const { id } = params;

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task || task.userId !== DEFAULT_USER_ID) {
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
