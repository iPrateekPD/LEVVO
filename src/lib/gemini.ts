/**
 * AI Game Master: Procedural Quest & Campaign Generation
 * Powered by Google Gemini API with Zero-Downtime Deterministic Fallbacks
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
}

const STATIC_FALLBACK_CAMPAIGNS: Record<string, GeneratedCampaign> = {
  coding: {
    campaignTitle: "Trial of the Code Sovereign",
    themeLore: "Master the ancient syntax, defeat runtime daemons, and construct digital kingdoms.",
    primaryAttribute: "INT",
    quests: [
      {
        title: "Setup Architecture & Core Data Schema",
        description: "Model the database tables and establish relational constraints.",
        attributeCode: "INT",
        difficulty: "Medium",
        estimatedMinutes: 60,
      },
      {
        title: "Implement Core CRUD API Routes",
        description: "Build validated server-side endpoints with Zod schemas.",
        attributeCode: "INT",
        difficulty: "Hard",
        estimatedMinutes: 90,
      },
      {
        title: "Craft Interactive Frontend Components",
        description: "Assemble responsive UI widgets with instant tactile feedback.",
        attributeCode: "INT",
        difficulty: "Medium",
        estimatedMinutes: 60,
      },
      {
        title: "Write Test Suite & Benchmark Performance",
        description: "Verify edge cases, security authorization, and load time.",
        attributeCode: "INT",
        difficulty: "Medium",
        estimatedMinutes: 45,
      },
    ],
    bossChallenge: {
      bossTitle: "The Production Deployment Boss",
      totalHp: 600,
      lore: "Deploy the application to the live edge server with zero runtime exceptions.",
    },
  },
  fitness: {
    campaignTitle: "Gauntlet of the Iron Titan",
    themeLore: "Forge physical resilience, shatter sluggish lethargy, and elevate your vitality.",
    primaryAttribute: "STR",
    quests: [
      {
        title: "30-Minute High Intensity Strength Workout",
        description: "Perform 4 sets of compound movements with proper form.",
        attributeCode: "STR",
        difficulty: "Medium",
        estimatedMinutes: 30,
      },
      {
        title: "Hydration & Nutritional Discipline",
        description: "Drink 2.5L water and log balanced protein intake.",
        attributeCode: "STR",
        difficulty: "Easy",
        estimatedMinutes: 15,
      },
      {
        title: "Mobility & Deep Muscle Stretching",
        description: "15 minutes of recovery yoga or foam rolling.",
        attributeCode: "STR",
        difficulty: "Easy",
        estimatedMinutes: 15,
      },
      {
        title: "8 Hours of Restful Sleep",
        description: "Screens off 45 minutes before sleep for optimal hormone recovery.",
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
  general: {
    campaignTitle: "Odyssey of Real-World Mastery",
    themeLore: "Transform unstructured ambition into disciplined daily execution.",
    primaryAttribute: "DEX",
    quests: [
      {
        title: "Define Target Deliverable & Outline Milestones",
        description: "Write down the exact scope and eliminate unnecessary fluff.",
        attributeCode: "DEX",
        difficulty: "Easy",
        estimatedMinutes: 20,
      },
      {
        title: "Deep Work Sprint (60 Minutes Uninterrupted)",
        description: "Zero notifications, full focus on primary objective.",
        attributeCode: "INT",
        difficulty: "Medium",
        estimatedMinutes: 60,
      },
      {
        title: "Review Daily Progress & Organize Workspace",
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

export async function generateCampaignWithAI(goalText: string): Promise<GeneratedCampaign> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "your-gemini-api-key") {
    // Intelligent keyword matching to pick thematic template
    const lower = goalText.toLowerCase();
    if (lower.includes("code") || lower.includes("program") || lower.includes("react") || lower.includes("app") || lower.includes("web") || lower.includes("tech") || lower.includes("study")) {
      return STATIC_FALLBACK_CAMPAIGNS.coding;
    }
    if (lower.includes("gym") || lower.includes("workout") || lower.includes("fit") || lower.includes("run") || lower.includes("weight") || lower.includes("health")) {
      return STATIC_FALLBACK_CAMPAIGNS.fitness;
    }
    return STATIC_FALLBACK_CAMPAIGNS.general;
  }

  try {
    const prompt = `You are the Master Control AI Game Master of Life-RPG, an 80s retro-arcade productivity system.
Convert this real-world goal into a structured, balanced RPG campaign:
"${goalText}"

Return ONLY a raw JSON object with this exact structure:
{
  "campaignTitle": "Short Epic Campaign Name",
  "themeLore": "Brief 1-sentence retro game flavor text",
  "primaryAttribute": "STR" | "INT" | "WIS" | "DEX" | "CRE" | "CHA",
  "quests": [
    {
      "title": "Clear actionable task name",
      "description": "Short explanation",
      "attributeCode": "STR" | "INT" | "WIS" | "DEX" | "CRE" | "CHA",
      "difficulty": "Easy" | "Medium" | "Hard",
      "estimatedMinutes": 30
    }
  ],
  "bossChallenge": {
    "bossTitle": "Thematic Boss Name",
    "totalHp": 500,
    "lore": "Description of final milestone"
  }
}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      console.warn("Gemini API call failed, using fallback:", res.status);
      return STATIC_FALLBACK_CAMPAIGNS.general;
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return STATIC_FALLBACK_CAMPAIGNS.general;

    const parsed = JSON.parse(rawText) as GeneratedCampaign;
    return parsed;
  } catch (err) {
    console.error("AI campaign generation error, falling back to static template:", err);
    return STATIC_FALLBACK_CAMPAIGNS.general;
  }
}
