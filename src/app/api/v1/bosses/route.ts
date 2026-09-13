// AUDIT: Tenant-isolation enforced. Boss creation and querying strictly enforce session.userId ownership.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const CreateBossSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().trim().max(1000).optional(),
  milestones: z
    .array(
      z.object({
        title: z.string().trim().min(2, "Milestone title is required").max(120),
        damageHp: z.number().int().min(50, "Each milestone must deal at least 50 HP damage").max(2000),
      })
    )
    .min(2, "Boss requires between 2 and 10 milestones")
    .max(10, "Boss requires between 2 and 10 milestones"),
});

export async function GET(req: Request) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userId;

    const bosses = await prisma.boss.findMany({
      where: { userId },
      include: {
        milestones: {
          orderBy: { damageHp: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: bosses });
  } catch (error) {
    console.error("Failed to fetch bosses:", error);
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
    const parsed = CreateBossSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { title, description, milestones } = parsed.data;
    const totalHp = milestones.reduce((sum, m) => sum + m.damageHp, 0);

    const boss = await prisma.boss.create({
      data: {
        userId,
        title,
        description: description || null,
        totalHp,
        currentHp: totalHp,
        status: "ACTIVE",
        rewardXp: Math.floor(totalHp * 0.5),
        rewardGold: Math.floor(totalHp * 0.25),
        milestones: {
          create: milestones.map((m) => ({
            title: m.title,
            damageHp: m.damageHp,
            status: "PENDING",
          })),
        },
      },
      include: {
        milestones: true,
      },
    });

    return NextResponse.json({ success: true, data: boss }, { status: 201 });
  } catch (error) {
    console.error("Failed to create boss:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
