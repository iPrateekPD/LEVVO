/**
 * Canonical Life-RPG Mathematical Progression Engine
 * Authoritative XP, Leveling, and Attribute Calculations
 */

export const CANONICAL_ATTRIBUTES = [
  { code: "STR", name: "Strength", color: "#FF3366", icon: "dumbbell", desc: "Fitness & Physical Health" },
  { code: "INT", name: "Intellect", color: "#00F0FF", icon: "brain", desc: "Coding, Learning & Research" },
  { code: "WIS", name: "Wisdom", color: "#A855F7", icon: "sparkles", desc: "Mindfulness & Reflection" },
  { code: "DEX", name: "Discipline", color: "#FFE600", icon: "target", desc: "Consistency & Daily Habits" },
  { code: "CRE", name: "Creativity", color: "#FF2A85", icon: "palette", desc: "Art, Design & Novelty" },
  { code: "CHA", name: "Charisma", color: "#00FF66", icon: "users", desc: "Social, Community & Voice" },
] as const;

export type AttributeCode = (typeof CANONICAL_ATTRIBUTES)[number]["code"];

export const DIFFICULTY_TIERS = {
  Trivial: { xp: 10, gold: 5, label: "<5 min" },
  Easy: { xp: 25, gold: 10, label: "15-30 min" },
  Medium: { xp: 50, gold: 25, label: "1 hour" },
  Hard: { xp: 100, gold: 50, label: "Half-day" },
  Epic: { xp: 250, gold: 100, label: "Milestone" },
} as const;

export type DifficultyTier = keyof typeof DIFFICULTY_TIERS;

/**
 * Calculates XP required to advance from level L to level L + 1
 * Formula: floor(100 * L^1.5)
 */
export function getXpRequiredForLevel(level: number): number {
  if (level < 1) return 100;
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Calculates cumulative XP needed to reach a given level from level 1
 */
export function getCumulativeXpForLevel(targetLevel: number): number {
  if (targetLevel <= 1) return 0;
  let total = 0;
  for (let l = 1; l < targetLevel; l++) {
    total += getXpRequiredForLevel(l);
  }
  return total;
}

/**
 * Derives current level and progress from total accumulated XP
 */
export function calculateLevelFromTotalXp(totalXp: number): {
  level: number;
  currentLevelXp: number;
  xpToNextLevel: number;
  progressPercent: number;
} {
  let level = 1;
  let xpCounter = totalXp;

  while (true) {
    const required = getXpRequiredForLevel(level);
    if (xpCounter < required) {
      const progressPercent = Math.min(100, Math.max(0, Math.floor((xpCounter / required) * 100)));
      return {
        level,
        currentLevelXp: xpCounter,
        xpToNextLevel: required - xpCounter,
        progressPercent,
      };
    }
    xpCounter -= required;
    level++;
  }
}

/**
 * Sub-level formula for independent character attributes
 */
export function calculateAttributeLevel(attributeXp: number): number {
  if (attributeXp <= 0) return 1;
  return Math.max(1, Math.floor(Math.pow(attributeXp / 100, 0.667)) + 1);
}

/**
 * Momentum Score: 0 to 100 rating based on recent activity
 */
export function calculateMomentum(completionsCount7Days: number): number {
  return Math.min(100, Math.max(10, Math.round(completionsCount7Days * 12.5)));
}
