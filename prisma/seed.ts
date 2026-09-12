import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Life-RPG database...");

  // 1. Clean existing records
  await prisma.xpTransaction.deleteMany({});
  await prisma.taskCompletion.deleteMany({});
  await prisma.bossMilestone.deleteMany({});
  await prisma.boss.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.item.deleteMany({});
  await prisma.attribute.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create default player identity
  const user = await prisma.user.create({
    data: {
      id: "default-user-hero",
      email: "hero@liferpg.dev",
      name: "Pixel Explorer",
      profile: {
        create: {
          username: "EXPLORER",
          title: "Novice Explorer",
          totalXp: 720,
          currentLevel: 3,
          gold: 85,
          streakCurrent: 5,
          streakLongest: 8,
          momentumScore: 72,
          activeTheme: "synthwave",
          avatarId: "pixel_knight",
          sfxEnabled: true,
          lastActiveDate: new Date(),
        },
      },
    },
  });

  // 3. Initialize 6 Canonical Attributes
  const initialAttributes = [
    { code: "INT", xp: 320, level: 3 },
    { code: "STR", xp: 140, level: 2 },
    { code: "WIS", xp: 80, level: 1 },
    { code: "DEX", xp: 110, level: 2 },
    { code: "CRE", xp: 50, level: 1 },
    { code: "CHA", xp: 20, level: 1 },
  ];

  for (const attr of initialAttributes) {
    await prisma.attribute.create({
      data: {
        userId: user.id,
        attributeCode: attr.code,
        currentXp: attr.xp,
        currentLevel: attr.level,
      },
    });
  }

  // 4. Create Initial Starter Quests
  const starterQuests = [
    {
      title: "Read for 20 minutes",
      description: "Build your knowledge by reading a chapter of technical or non-fiction book.",
      attributeCode: "INT",
      difficulty: "Medium",
      xpReward: 50,
      goldReward: 25,
      status: "ACTIVE",
    },
    {
      title: "Exercise or take a brisk walk",
      description: "Physical activity to increase vitality and clear the mind.",
      attributeCode: "STR",
      difficulty: "Easy",
      xpReward: 25,
      goldReward: 10,
      status: "ACTIVE",
    },
    {
      title: "Practice a coding problem",
      description: "Sharpen algorithmic thinking on LeetCode or a project bug.",
      attributeCode: "INT",
      difficulty: "Medium",
      xpReward: 50,
      goldReward: 25,
      status: "ACTIVE",
    },
    {
      title: "Write a journal entry",
      description: "Reflect on today's challenges and outline tomorrow's focus.",
      attributeCode: "WIS",
      difficulty: "Trivial",
      xpReward: 10,
      goldReward: 5,
      status: "ACTIVE",
    },
  ];

  for (const q of starterQuests) {
    await prisma.task.create({
      data: {
        userId: user.id,
        ...q,
      },
    });
  }

  // 5. Create Default Boss Battle
  const boss = await prisma.boss.create({
    data: {
      userId: user.id,
      title: "Final Year Capstone Project",
      description: "Complete and successfully deploy the complete software architecture.",
      totalHp: 1000,
      currentHp: 750,
      status: "ACTIVE",
      rewardXp: 500,
      rewardGold: 250,
      milestones: {
        create: [
          {
            title: "Literature Review & Problem Statement",
            damageHp: 250,
            status: "COMPLETED",
            completedAt: new Date(),
          },
          {
            title: "System Architecture & Relational Schema",
            damageHp: 250,
            status: "PENDING",
          },
          {
            title: "Core Backend CRUD & Auth APIs",
            damageHp: 250,
            status: "PENDING",
          },
          {
            title: "Frontend Retro Arcade UI & Verification",
            damageHp: 250,
            status: "PENDING",
          },
        ],
      },
    },
  });

  // 6. Seed Shop Items
  const items = [
    {
      id: "theme_synthwave",
      name: "Synthwave Neon",
      itemType: "THEME",
      description: "Classic neon magenta & cyan arcade cabinet styling.",
      priceGold: 0,
      assetKey: "theme_synthwave",
    },
    {
      id: "theme_gameboy",
      name: "Monochrome 1989",
      itemType: "THEME",
      description: "Nostalgic 4-shade green phosphor handheld display.",
      priceGold: 120,
      assetKey: "theme_gameboy",
    },
    {
      id: "theme_cyberpunk",
      name: "Cyberpunk Matrix",
      itemType: "THEME",
      description: "Electric lime and deep terminal green interface.",
      priceGold: 180,
      assetKey: "theme_cyberpunk",
    },
    {
      id: "badge_titan_slayer",
      name: "Titan Slayer",
      itemType: "BADGE",
      description: "Awarded to warriors who fell massive 1000+ HP project bosses.",
      priceGold: 50,
      assetKey: "badge_titan",
    },
    {
      id: "reward_espresso",
      name: "Reward: Artisanal Espresso",
      itemType: "CUSTOM_REWARD",
      description: "Redeem 40 Gold to treat yourself to a premium coffee break.",
      priceGold: 40,
      assetKey: "reward_coffee",
    },
    {
      id: "reward_gaming",
      name: "Reward: 1h Guilt-Free Gaming",
      itemType: "CUSTOM_REWARD",
      description: "Redeem 75 Gold for 1 uninterrupted hour of your favorite game.",
      priceGold: 75,
      assetKey: "reward_gamepad",
    },
  ];

  for (const item of items) {
    await prisma.item.create({ data: item });
  }

  // Equip default theme
  await prisma.inventory.create({
    data: {
      userId: user.id,
      itemId: "theme_synthwave",
      isEquipped: true,
    },
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
