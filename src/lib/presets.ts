/**
 * Age-Personalized Quest Presets & Universal Trackers Library
 * Canonical specification for Section 2.2
 */

export type AgeGroup = "Kids" | "Students" | "Adults" | "Seniors";

export interface QuestPreset {
  title: string;
  description?: string;
  attributeCode: "STR" | "INT" | "WIS" | "DEX" | "CRE" | "CHA";
  difficulty: "Trivial" | "Easy" | "Medium" | "Hard" | "Epic";
  recurrence: "NONE" | "DAILY" | "WEEKLY";
  goalCategory: string;
}

export interface AgeGroupConfig {
  id: AgeGroup;
  label: string;
  icon: string;
  subtitle: string;
  availableGoals: string[];
  presets: QuestPreset[];
}

export const AGE_GROUP_CONFIGS: Record<AgeGroup, AgeGroupConfig> = {
  Kids: {
    id: "Kids",
    label: "Young Adventurer",
    icon: "🌱",
    subtitle: "Ages 6–12 • Curiosity, learning & fun daily habits",
    availableGoals: ["Reading", "Maths", "Words", "Creativity", "Tidying Up"],
    presets: [
      {
        title: "Read 20 pages of a book",
        description: "Explore magical stories and build your reading speed.",
        attributeCode: "INT",
        difficulty: "Easy",
        recurrence: "DAILY",
        goalCategory: "Reading",
      },
      {
        title: "Learn 5 new vocabulary words",
        description: "Expand your word power and unlock new expressions.",
        attributeCode: "INT",
        difficulty: "Trivial",
        recurrence: "DAILY",
        goalCategory: "Words",
      },
      {
        title: "Solve 5 maths puzzles",
        description: "Exercise your brain with numerical problem-solving.",
        attributeCode: "INT",
        difficulty: "Easy",
        recurrence: "DAILY",
        goalCategory: "Maths",
      },
      {
        title: "Draw or paint a picture",
        description: "Create your own pixel masterpiece.",
        attributeCode: "CRE",
        difficulty: "Easy",
        recurrence: "DAILY",
        goalCategory: "Creativity",
      },
      {
        title: "Organize play space & toys",
        description: "Keep your base tidy and earned bonus discipline.",
        attributeCode: "DEX",
        difficulty: "Trivial",
        recurrence: "DAILY",
        goalCategory: "Tidying Up",
      },
    ],
  },

  Students: {
    id: "Students",
    label: "Scholar / Cadet",
    icon: "🎓",
    subtitle: "Ages 13–22 • High-leverage study, coding & fitness",
    availableGoals: ["Coding", "Fitness", "Exams", "Reading", "Projects"],
    presets: [
      {
        title: "45 min DSA practice & algorithms",
        description: "Solve a LeetCode problem or review data structures.",
        attributeCode: "INT",
        difficulty: "Medium",
        recurrence: "DAILY",
        goalCategory: "Coding",
      },
      {
        title: "Study 1 hour uninterrupted",
        description: "Deep focused revision with active recall & Feynman notes.",
        attributeCode: "INT",
        difficulty: "Medium",
        recurrence: "DAILY",
        goalCategory: "Exams",
      },
      {
        title: "Finish weekly academic assignment",
        description: "Complete homework deliverables ahead of the deadline.",
        attributeCode: "DEX",
        difficulty: "Hard",
        recurrence: "NONE",
        goalCategory: "Exams",
      },
      {
        title: "30 min workout or run",
        description: "High intensity physical workout to supercharge focus.",
        attributeCode: "STR",
        difficulty: "Medium",
        recurrence: "DAILY",
        goalCategory: "Fitness",
      },
      {
        title: "Read 1 chapter of technical book",
        description: "Absorb foundational engineering and architectural principles.",
        attributeCode: "WIS",
        difficulty: "Easy",
        recurrence: "DAILY",
        goalCategory: "Reading",
      },
    ],
  },

  Adults: {
    id: "Adults",
    label: "Guild Master",
    icon: "⚔️",
    subtitle: "Ages 23–59 • Career focus, wellness & continuous mastery",
    availableGoals: ["Work", "Fitness", "Skill-building", "Mindfulness", "Finances"],
    presets: [
      {
        title: "Complete top priority work deliverable",
        description: "Knock out the #1 high-impact project milestone before noon.",
        attributeCode: "DEX",
        difficulty: "Medium",
        recurrence: "DAILY",
        goalCategory: "Work",
      },
      {
        title: "30 min gym workout or cardio",
        description: "Compound strength training or 5km run for physical health.",
        attributeCode: "STR",
        difficulty: "Medium",
        recurrence: "DAILY",
        goalCategory: "Fitness",
      },
      {
        title: "Learn new skill for 30 min",
        description: "Practice languages, system design, or engineering craft.",
        attributeCode: "INT",
        difficulty: "Easy",
        recurrence: "DAILY",
        goalCategory: "Skill-building",
      },
      {
        title: "Review daily budget & expenses",
        description: "Maintain fiscal discipline and track gold bank reserve.",
        attributeCode: "WIS",
        difficulty: "Trivial",
        recurrence: "DAILY",
        goalCategory: "Finances",
      },
      {
        title: "10 min evening digital detox",
        description: "Unplug screens 30 mins before sleep to recharge mana.",
        attributeCode: "WIS",
        difficulty: "Trivial",
        recurrence: "DAILY",
        goalCategory: "Mindfulness",
      },
    ],
  },

  Seniors: {
    id: "Seniors",
    label: "Grand Elder",
    icon: "🧙‍♂️",
    subtitle: "Ages 60+ • Longevity, active mind, walking & tech discovery",
    availableGoals: ["Walking", "Memory", "Technology", "Reading", "Wellness"],
    presets: [
      {
        title: "Walk 20 minutes in fresh air",
        description: "Gentle brisk walk to keep circulation and vitality strong.",
        attributeCode: "STR",
        difficulty: "Easy",
        recurrence: "DAILY",
        goalCategory: "Walking",
      },
      {
        title: "Read 20 pages of inspiring literature",
        description: "Engage with classical literature, history, or philosophy.",
        attributeCode: "WIS",
        difficulty: "Easy",
        recurrence: "DAILY",
        goalCategory: "Reading",
      },
      {
        title: "Memory activity or crossword puzzle",
        description: "Sharpen cognitive recall and mental agility.",
        attributeCode: "WIS",
        difficulty: "Trivial",
        recurrence: "DAILY",
        goalCategory: "Memory",
      },
      {
        title: "Learn a modern technology tool",
        description: "Try a new mobile app, video call, or web interface.",
        attributeCode: "INT",
        difficulty: "Easy",
        recurrence: "NONE",
        goalCategory: "Technology",
      },
      {
        title: "Morning joint mobility stretching",
        description: "Gentle 10-minute flex for back, hips, and shoulders.",
        attributeCode: "STR",
        difficulty: "Trivial",
        recurrence: "DAILY",
        goalCategory: "Wellness",
      },
    ],
  },
};

export const UNIVERSAL_TRACKERS = [
  { key: "water", label: "Water (8 Glasses)", icon: "💧", target: 8, unit: "glasses" },
  { key: "cycling", label: "Cycling", icon: "🚴", target: 1, unit: "ride" },
  { key: "gym", label: "Gym Workout", icon: "🏋️", target: 1, unit: "session" },
  { key: "reading", label: "Reading", icon: "📖", target: 20, unit: "pages" },
  { key: "meditation", label: "Meditation", icon: "🧘", target: 10, unit: "mins" },
];

export function getPresetsForAgeAndGoals(
  ageGroup: AgeGroup,
  selectedGoals: string[]
): QuestPreset[] {
  const config = AGE_GROUP_CONFIGS[ageGroup];
  if (!config) return [];

  if (selectedGoals.length === 0) {
    return config.presets.slice(0, 3);
  }

  const matching = config.presets.filter((p) =>
    selectedGoals.some((g) => g.toLowerCase() === p.goalCategory.toLowerCase())
  );

  // If matching count is less than 2, fill with first presets from that age group
  if (matching.length < 2) {
    const extras = config.presets.filter((p) => !matching.includes(p));
    return [...matching, ...extras].slice(0, 3);
  }

  return matching;
}
