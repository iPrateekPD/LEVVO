import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DIFFICULTY_TIERS, DifficultyTier } from "@/lib/progression";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const CreateTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(160),
  description: z.string().trim().max(2000).optional(),
  attributeCode: z.enum(["STR", "INT", "WIS", "DEX", "CRE", "CHA"]).default("INT"),
  difficulty: z.enum(["Trivial", "Easy", "Medium", "Hard", "Epic"]).default("Medium"),
  dueDate: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getSessionUser(req);
    const userId = session?.userId ?? "default-user-hero";

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const tasks = await prisma.task.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
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
    const userId = session?.userId ?? "default-user-hero";

    const body = await req.json();
    const parsed = CreateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { title, description, attributeCode, difficulty, dueDate } = parsed.data;
    const rewards = DIFFICULTY_TIERS[difficulty as DifficultyTier];

    const task = await prisma.task.create({
      data: {
        userId,
        title,
        description: description || null,
        attributeCode,
        difficulty,
        xpReward: rewards.xp,
        goldReward: rewards.gold,
        status: "ACTIVE",
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
