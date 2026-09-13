// AUDIT: Tenant-isolation enforced. session.userId ownership verified.
// Onboarding API: Saves ageGroup + goals to profile and seeds initial quests.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { getPresetsForAgeAndGoals, AgeGroup } from "@/lib/presets";
import { DIFFICULTY_TIERS, DifficultyTier } from "@/lib/progression";
import { z } from "zod";

export const dynamic = "force-dynamic";

const OnboardingSchema = z.object({
  ageGroup: z.enum(["Kids", "Students", "Adults", "Seniors"]).optional(),
  goals: z.array(z.string()).default([]),
  skipped: z.boolean().default(false),
});

export async function POST(req: Request) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userId;

    const body = await req.json();
    const parsed = OnboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { ageGroup, goals, skipped } = parsed.data;

    // Update Profile
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        ageGroup: skipped ? "Adults" : (ageGroup || null),
        goals: JSON.stringify(goals),
      },
    });

    const seededTasks = [];

    // If not skipped and ageGroup provided, seed matching quests
    if (!skipped && ageGroup) {
      const presets = getPresetsForAgeAndGoals(ageGroup as AgeGroup, goals);

      for (const p of presets) {
        const tier = DIFFICULTY_TIERS[p.difficulty as DifficultyTier];
        const task = await prisma.task.create({
          data: {
            userId,
            title: p.title,
            description: p.description,
            attributeCode: p.attributeCode,
            difficulty: p.difficulty,
            xpReward: tier.xp,
            goldReward: tier.gold,
            apCost: 10,
            status: "ACTIVE",
            stage: "TODO",
            isRecurring: p.recurrence !== "NONE",
            recurrence: p.recurrence,
            tags: p.goalCategory.toLowerCase(),
          },
        });
        seededTasks.push(task);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: updatedProfile,
        seededTasks,
      },
    });
  } catch (error) {
    console.error("Failed to complete onboarding:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
