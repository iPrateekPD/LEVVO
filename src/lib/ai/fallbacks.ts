/**
 * Hand-tuned, resilient static fallback campaigns for zero-downtime AI Game Master.
 * Specced in docs/05 §4.1.
 */

export interface GeneratedQuest {
  title: string;
  description: string;
  attributeCode: "STR" | "INT" | "WIS" | "DEX" | "CRE" | "CHA";
  difficulty: "Trivial" | "Easy" | "Medium" | "Hard" | "Epic";
  estimatedMinutes: number;
}

export interface GeneratedCampaign {
  campaignTitle: string;
  themeLore: string;
  primaryAttribute: "STR" | "INT" | "WIS" | "DEX" | "CRE" | "CHA";
  quests: GeneratedQuest[];
  bossChallenge: {
    bossTitle: string;
    totalHp: number;
    lore: string;
  };
  isFallback?: boolean;
}

export const STATIC_FALLBACK_CAMPAIGNS: Record<string, GeneratedCampaign> = {
  coding: {
    campaignTitle: "The Codebreaker's Gauntlet",
    themeLore: "Master the ancient syntax, vanquish runtime daemons, and conquer the digital void.",
    primaryAttribute: "INT",
    isFallback: true,
    quests: [
      {
        title: "Setup Dev Environment & Hello World",
        description: "Configure local toolchain, install dependencies, and verify runtime compiler.",
        attributeCode: "INT",
        difficulty: "Easy",
        estimatedMinutes: 30,
      },
      {
        title: "Build Core Data Model & Schema",
        description: "Design relational database schema and verify data integrity constraints.",
        attributeCode: "INT",
        difficulty: "Medium",
        estimatedMinutes: 60,
      },
      {
        title: "Implement API Endpoints & Auth",
        description: "Write tested server endpoints for primary CRUD operations with tenant isolation.",
        attributeCode: "INT",
        difficulty: "Hard",
        estimatedMinutes: 120,
      },
      {
        title: "Write Test Suite & Refactor",
        description: "Verify edge cases, error handlers, and optimize database queries.",
        attributeCode: "INT",
        difficulty: "Medium",
        estimatedMinutes: 45,
      },
    ],
    bossChallenge: {
      bossTitle: "The Production Deployment Boss",
      totalHp: 500,
      lore: "Deploy the application to the live edge server without runtime errors.",
    },
  },

  fitness: {
    campaignTitle: "Gauntlet of the Iron Titan",
    themeLore: "Forge physical resilience, shatter sluggish lethargy, and elevate your vitality.",
    primaryAttribute: "STR",
    isFallback: true,
    quests: [
      {
        title: "30-Minute High Intensity Strength Workout",
        description: "Perform 4 sets of compound movements with strict form and discipline.",
        attributeCode: "STR",
        difficulty: "Medium",
        estimatedMinutes: 30,
      },
      {
        title: "Hydration & Nutritional Discipline",
        description: "Drink 2.5L water and log balanced protein intake for cell repair.",
        attributeCode: "STR",
        difficulty: "Easy",
        estimatedMinutes: 15,
      },
      {
        title: "Mobility & Deep Muscle Stretching",
        description: "15 minutes of recovery yoga or foam rolling to prevent stiffness.",
        attributeCode: "STR",
        difficulty: "Easy",
        estimatedMinutes: 15,
      },
      {
        title: "8 Hours of Restful Sleep",
        description: "Power down screens 45 minutes before sleep for optimal CNS recovery.",
        attributeCode: "STR",
        difficulty: "Medium",
        estimatedMinutes: 480,
      },
    ],
    bossChallenge: {
      bossTitle: "The Plateau Destroyer",
      totalHp: 500,
      lore: "Conquer a new personal record across endurance or strength.",
    },
  },

  study: {
    campaignTitle: "The Grand Scholar's Trial",
    themeLore: "Absorb deep academic knowledge and transmute raw concepts into permanent wisdom.",
    primaryAttribute: "WIS",
    isFallback: true,
    quests: [
      {
        title: "Survey Syllabus & Gather Authoritative Sources",
        description: "Map key curriculum modules and gather required textbooks and papers.",
        attributeCode: "WIS",
        difficulty: "Easy",
        estimatedMinutes: 30,
      },
      {
        title: "Feynman Technique Active Recall Session",
        description: "Explain difficult core principles in simple plain language without notes.",
        attributeCode: "WIS",
        difficulty: "Medium",
        estimatedMinutes: 60,
      },
      {
        title: "Solve 10 Complex Problem Sets",
        description: "Work through challenging sample exam questions under timed conditions.",
        attributeCode: "INT",
        difficulty: "Hard",
        estimatedMinutes: 90,
      },
      {
        title: "Synthesize Concise One-Page Summary Sheet",
        description: "Distill the entire topic down to fundamental equations, axioms, and edge cases.",
        attributeCode: "WIS",
        difficulty: "Medium",
        estimatedMinutes: 45,
      },
    ],
    bossChallenge: {
      bossTitle: "The Certification Exam",
      totalHp: 500,
      lore: "Pass the comprehensive practice exam with score >= 85%.",
    },
  },

  generic: {
    campaignTitle: "Odyssey of Real-World Mastery",
    themeLore: "Transform unstructured ambition into disciplined daily execution.",
    primaryAttribute: "DEX",
    isFallback: true,
    quests: [
      {
        title: "Define Target Deliverable & Outline Milestones",
        description: "Write down the exact scope and eliminate unnecessary distractions.",
        attributeCode: "DEX",
        difficulty: "Easy",
        estimatedMinutes: 20,
      },
      {
        title: "Deep Work Sprint (60 Minutes Uninterrupted)",
        description: "Zero notifications, full focus on primary deliverable.",
        attributeCode: "INT",
        difficulty: "Medium",
        estimatedMinutes: 60,
      },
      {
        title: "Review Daily Progress & Clear Workspace",
        description: "Clear clutter and celebrate completed milestones.",
        attributeCode: "WIS",
        difficulty: "Trivial",
        estimatedMinutes: 10,
      },
    ],
    bossChallenge: {
      bossTitle: "The Monolith of Procrastination",
      totalHp: 500,
      lore: "Execute the critical milestone you have been avoiding all week.",
    },
  },
};

export function getFallbackCampaign(goalText: string): GeneratedCampaign {
  const lower = goalText.toLowerCase();
  if (
    lower.includes("code") ||
    lower.includes("program") ||
    lower.includes("react") ||
    lower.includes("app") ||
    lower.includes("web") ||
    lower.includes("tech") ||
    lower.includes("dev") ||
    lower.includes("software")
  ) {
    return STATIC_FALLBACK_CAMPAIGNS.coding;
  }
  if (
    lower.includes("gym") ||
    lower.includes("workout") ||
    lower.includes("fit") ||
    lower.includes("run") ||
    lower.includes("weight") ||
    lower.includes("exercise") ||
    lower.includes("health")
  ) {
    return STATIC_FALLBACK_CAMPAIGNS.fitness;
  }
  if (
    lower.includes("study") ||
    lower.includes("exam") ||
    lower.includes("read") ||
    lower.includes("learn") ||
    lower.includes("course") ||
    lower.includes("paper") ||
    lower.includes("school") ||
    lower.includes("college")
  ) {
    return STATIC_FALLBACK_CAMPAIGNS.study;
  }
  return STATIC_FALLBACK_CAMPAIGNS.generic;
}
