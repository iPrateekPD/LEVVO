// AUDIT: Tenant-isolation enforced. Profile updates and purchases strictly isolated to session.userId.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { z } from "zod";
import { AGE_GROUP_CONFIGS, AgeGroup, FREE_AVATARS, PREMIUM_AVATARS } from "@/lib/presets";

export const dynamic = "force-dynamic";

const UpdateProfileSchema = z.object({
  username: z.string().trim().min(3).max(30).optional(),
  avatarId: z.string().trim().optional(),
  ageGroup: z.enum(["Kids", "Students", "Adults", "Seniors"]).optional(),
  goals: z.array(z.string()).optional(),
  activeTheme: z.enum(["synthwave", "gameboy"]).optional(),
  sfxEnabled: z.boolean().optional(),
  addPresetsForEra: z.boolean().optional(),
  unlockAvatar: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userId;

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    const inventory = await prisma.inventory.findMany({
      where: { userId },
    });

    const ownedAvatarIds = new Set([
      ...FREE_AVATARS.map((a) => a.id),
      ...inventory.map((inv) => inv.itemId),
      profile.avatarId,
    ]);

    const completedQuestsCount = await prisma.task.count({
      where: { userId, status: "COMPLETED" },
    });

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          ...profile,
          goals: profile.goals ? JSON.parse(profile.goals) : [],
        },
        ownedAvatarIds: Array.from(ownedAvatarIds),
        stats: {
          completedQuestsCount,
          totalXp: profile.totalXp,
          currentLevel: profile.currentLevel,
          gold: profile.gold,
          streakCurrent: profile.streakCurrent,
          streakLongest: profile.streakLongest,
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userId;

    const body = await req.json();
    const parsed = UpdateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const {
      username,
      avatarId,
      ageGroup,
      goals,
      activeTheme,
      sfxEnabled,
      addPresetsForEra,
      unlockAvatar,
    } = parsed.data;

    // Fetch current profile
    const currentProfile = await prisma.profile.findUniqueOrThrow({
      where: { userId },
    });

    // Handle premium avatar unlocking if requested
    let targetAvatarId = avatarId;
    if (unlockAvatar) {
      const premiumMeta = PREMIUM_AVATARS.find((p) => p.id === unlockAvatar);
      if (!premiumMeta) {
        return NextResponse.json({ success: false, error: "Invalid avatar to unlock" }, { status: 400 });
      }

      if (currentProfile.gold < premiumMeta.price) {
        return NextResponse.json(
          { success: false, error: `Insufficient Gold! Need ${premiumMeta.price} GP.` },
          { status: 400 }
        );
      }

      // Check if already in inventory
      const existing = await prisma.inventory.findUnique({
        where: {
          userId_itemId: {
            userId,
            itemId: unlockAvatar,
          },
        },
      });

      if (!existing) {
        await prisma.$transaction(async (tx) => {
          // Ensure item exists in Item table
          await tx.item.upsert({
            where: { id: unlockAvatar },
            create: {
              id: unlockAvatar,
              name: premiumMeta.name,
              itemType: "AVATAR",
              description: `Legendary Avatar: ${premiumMeta.name}`,
              priceGold: premiumMeta.price,
              assetKey: unlockAvatar,
            },
            update: {},
          });

          await tx.inventory.create({
            data: {
              userId,
              itemId: unlockAvatar,
              isEquipped: true,
            },
          });

          await tx.profile.update({
            where: { userId },
            data: {
              gold: currentProfile.gold - premiumMeta.price,
              avatarId: unlockAvatar,
            },
          });

          await tx.xpTransaction.create({
            data: {
              userId,
              deltaXp: 0,
              deltaGold: -premiumMeta.price,
              sourceType: "SHOP_PURCHASE",
              sourceId: unlockAvatar,
              description: `Unlocked Premium Avatar: ${premiumMeta.name}`,
            },
          });
        });
      }
      targetAvatarId = unlockAvatar;
    }

    // Check username collision
    if (username && username !== currentProfile.username) {
      const existingUser = await prisma.profile.findFirst({
        where: {
          username: { equals: username },
          userId: { not: userId },
        },
      });
      if (existingUser) {
        return NextResponse.json({ success: false, error: "Username is already taken" }, { status: 409 });
      }
    }

    // Optional seeding of era presets if requested
    let seededCount = 0;
    if (addPresetsForEra && ageGroup) {
      const eraConfig = AGE_GROUP_CONFIGS[ageGroup as AgeGroup];
      if (eraConfig) {
        for (const preset of eraConfig.presets.slice(0, 3)) {
          await prisma.task.create({
            data: {
              userId,
              title: preset.title,
              description: preset.description || `${eraConfig.label} daily habit`,
              attributeCode: preset.attributeCode,
              difficulty: preset.difficulty,
              xpReward: preset.difficulty === "Trivial" ? 10 : preset.difficulty === "Easy" ? 25 : 50,
              goldReward: preset.difficulty === "Trivial" ? 5 : preset.difficulty === "Easy" ? 15 : 25,
              apCost: 10,
              status: "ACTIVE",
              stage: "TODO",
              recurrence: preset.recurrence,
            },
          });
          seededCount++;
        }
      }
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        username: username ?? undefined,
        avatarId: targetAvatarId ?? undefined,
        ageGroup: ageGroup ?? undefined,
        goals: goals ? JSON.stringify(goals) : undefined,
        activeTheme: activeTheme ?? undefined,
        sfxEnabled: sfxEnabled !== undefined ? sfxEnabled : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          ...updatedProfile,
          goals: updatedProfile.goals ? JSON.parse(updatedProfile.goals) : [],
        },
        seededCount,
      },
    });
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
