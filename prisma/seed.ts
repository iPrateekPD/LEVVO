import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Life-RPG database...");

  // 1. Clean existing records
  await prisma.userAchievement.deleteMany({});
  await prisma.achievement.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.guildBoss.deleteMany({});
  await prisma.guildMember.deleteMany({});
  await prisma.guild.deleteMany({});
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
          totalXp: 1450,
          currentLevel: 4,
          gold: 445,
          currentAp: 85,
          maxAp: 100,
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
    { code: "INT", xp: 470, level: 3 },
    { code: "STR", xp: 175, level: 2 },
    { code: "WIS", xp: 100, level: 2 },
    { code: "DEX", xp: 135, level: 2 },
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

  // 4. Create Initial Starter Quests with Kanban Stages & Notes
  const parentEpic = await prisma.task.create({
    data: {
      userId: user.id,
      title: "Build High-Performance Search Engine",
      description: "Design and implement an in-memory inverted index with rank scoring.",
      notes: "### Search Architecture Blueprint\n- **Inverted Index**: Tokenize lowercase text, eliminate stopwords.\n- **BM25 Scoring**: $IDF \\times \\frac{TF \\times (k_1 + 1)}{TF + k_1 \\times (1 - b + b \\times \\frac{|D|}{avgdl})}$\n- **Benchmark Goal**: Sub-5ms query response time.",
      attributeCode: "INT",
      difficulty: "Epic",
      xpReward: 200,
      goldReward: 100,
      apCost: 35,
      status: "ACTIVE",
      stage: "IN_PROGRESS",
      tags: "Coding, Rust, Algorithms",
    },
  });

  // Subtasks for parentEpic
  await prisma.task.createMany({
    data: [
      {
        userId: user.id,
        parentTaskId: parentEpic.id,
        title: "Write inverted index tokenizer",
        description: "Tokenize inputs into sanitized terms.",
        attributeCode: "INT",
        difficulty: "Easy",
        xpReward: 30,
        goldReward: 15,
        apCost: 10,
        status: "COMPLETED",
        stage: "DONE",
      },
      {
        userId: user.id,
        parentTaskId: parentEpic.id,
        title: "Implement BM25 scoring algorithm",
        description: "Calculate term frequency and inverse document frequency.",
        attributeCode: "INT",
        difficulty: "Medium",
        xpReward: 60,
        goldReward: 30,
        apCost: 15,
        status: "ACTIVE",
        stage: "IN_PROGRESS",
      },
      {
        userId: user.id,
        parentTaskId: parentEpic.id,
        title: "Benchmark latency under 10k QPS",
        description: "Stress test system with mock query load.",
        attributeCode: "INT",
        difficulty: "Hard",
        xpReward: 110,
        goldReward: 55,
        apCost: 20,
        status: "ACTIVE",
        stage: "TODO",
      },
    ],
  });

  // Other standard quests across Kanban stages
  const starterQuests = [
    {
      title: "Read for 20 minutes",
      description: "Build your knowledge by reading a chapter of technical or non-fiction book.",
      notes: "Reading *Designing Data-Intensive Applications* Chapter 3 (Storage and Retrieval).",
      attributeCode: "INT",
      difficulty: "Medium",
      xpReward: 50,
      goldReward: 25,
      apCost: 15,
      status: "ACTIVE",
      stage: "TODO",
      tags: "Reading, Learning",
    },
    {
      title: "Exercise or take a brisk walk",
      description: "Physical activity to increase vitality and clear the mind.",
      notes: "30 min outdoor jog + 10 min core stretching.",
      attributeCode: "STR",
      difficulty: "Easy",
      xpReward: 25,
      goldReward: 10,
      apCost: 10,
      status: "ACTIVE",
      stage: "IN_PROGRESS",
      tags: "Health, Cardio",
    },
    {
      title: "Review Daily Progress & Organize Workspace",
      description: "Reflect on today's challenges and outline tomorrow's focus.",
      notes: "Inbox zero + review calendar for tomorrow.",
      attributeCode: "WIS",
      difficulty: "Trivial",
      xpReward: 10,
      goldReward: 5,
      apCost: 5,
      status: "ACTIVE",
      stage: "REVIEW",
      tags: "Mindfulness, Routine",
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

  // 5. Seed Activity Logs for the 365-Day Consistency Heatmap
  const today = new Date();
  for (let i = 60; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    // Seed activity pattern (alternating intensity, weekends lighter)
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const tasks = isWeekend ? (i % 3 === 0 ? 1 : 0) : (i % 5 === 0 ? 4 : 2);
    const xp = tasks * 35 + (i % 4 === 0 ? 25 : 0);

    if (tasks > 0) {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          date: dateStr,
          tasksCompleted: tasks,
          xpEarned: xp,
        },
      });
    }
  }

  // 6. Create Default Boss Battle
  await prisma.boss.create({
    data: {
      userId: user.id,
      title: "Final Year Capstone Project",
      description: "Complete and successfully deploy the complete software architecture.",
      totalHp: 1000,
      currentHp: 500,
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
            status: "COMPLETED",
            completedAt: new Date(),
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

  // 7. Seed Guild & Shared World Boss
  const guild = await prisma.guild.create({
    data: {
      name: "The Pixel Vanguard",
      tag: "VNGD",
      description: "Elite cohort of full-stack engineers and digital craftspeople.",
      level: 3,
      members: {
        create: [
          {
            userId: user.id,
            role: "LEADER",
          },
        ],
      },
      bosses: {
        create: [
          {
            title: "The Hydra of Procrastination",
            totalHp: 5000,
            currentHp: 3850,
            status: "ACTIVE",
            rewardXp: 1500,
            rewardGold: 750,
          },
        ],
      },
    },
  });

  // 8. Seed Shop Items
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

  // 9. Seed Achievement Catalog
  const achievements = [
    {
      code: "first_quest",
      name: "First Quest",
      description: "Completed your first quest (+10 XP total)",
      assetKey: "badge_first_quest",
    },
    {
      code: "streak_7",
      name: "Week-Long Dedication",
      description: "Maintained a 7-day consistency streak",
      assetKey: "badge_streak_7",
    },
    {
      code: "boss_slayer",
      name: "Titan Slayer",
      description: "Defeated an epic boss battle",
      assetKey: "badge_boss_slayer",
    },
    {
      code: "level_5",
      name: "Level 5 Ascendant",
      description: "Reached Character Level 5",
      assetKey: "badge_level_5",
    },
    {
      code: "gold_1000",
      name: "Gold Hoarder",
      description: "Accumulated over 1,000 gold pieces",
      assetKey: "badge_gold_1000",
    },
  ];

  for (const ach of achievements) {
    await prisma.achievement.create({ data: ach });
  }

  // Equip default theme
  await prisma.inventory.create({
    data: {
      userId: user.id,
      itemId: "theme_synthwave",
      isEquipped: true,
    },
  });

  console.log("✅ Rich seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
