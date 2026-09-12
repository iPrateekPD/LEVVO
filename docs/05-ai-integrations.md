# LIFE-RPG: AI Game Master & Procedural Intelligence Specification

> **Document Version:** 1.0.0  
> **Status:** Canonical AI Integration Specification  
> **Primary Provider:** Google Gemini API (`gemini-1.5-flash`)  
> **Author:** AI Engineer & Game Designer  
> **Last Updated:** 2026-09-12  

---

## 1. Role & Architectural Philosophy of the AI Game Master

`[PROPOSED FEATURE]` (Signature Differentiator)

### 1.1 Not a Chatbot, but a Game Engine Component
The AI Game Master in Life-RPG is **not** an open-ended conversational chatbot that distracts the user with idle small talk. In accordance with the **Low-Friction Principle**, its sole objective is to eliminate the friction of planning real-world progress.

It functions as an intelligent **procedural quest and boss designer**:
1. **Deconstructs Ambiguity:** Takes unstructured goals (*"Get in shape for summer"*, *"Learn Go programming"*) and breaks them down into actionable, bite-sized RPG quests.
2. **Maintains Game Balance:** Assigns appropriate difficulty tiers, allocates realistic XP values, and tags the correct character attributes.
3. **Compassionate Re-engagement:** Generates custom, zero-friction Recovery Quests for returning players without triggering guilt or shame.

### 1.2 The Absolute Guardrail: Zero Authoritative Bypass
```
┌────────────────────────────────────────────────────────┐
│               THE GOLDEN AI RULE OF LIFE-RPG           │
│                                                        │
│  The AI model NEVER directly alters a user's wallet,   │
│  XP balance, character level, or inventory.            │
│                                                        │
│  The AI produces PROPOSALS ONLY.                       │
│  Server-side business logic and user confirmation are  │
│  MANDATORY before database records are committed.      │
└────────────────────────────────────────────────────────┘
```

---

## 2. Core Procedural AI Capabilities

### 2.1 Capability 1: Goal-to-Campaign Generator
Transforms a broad ambition into a multi-chapter RPG campaign:
- **Input:** User's goal text (*"Pass AWS Solutions Architect exam in 6 weeks"*), daily availability (e.g., 1 hour/day).
- **Output:** 
  - Campaign Title (e.g., *"Trial of the Cloud Sovereign"*)
  - Associated Attribute: `INT` (Intellect)
  - 3–5 Chronological Chapters
  - 2–4 Concrete Quests per chapter with difficulty tags (`Easy`, `Medium`, `Hard`)
  - A Final Boss Battle (e.g., *"The Certification Exam", 500 HP*)

### 2.2 Capability 2: Project-to-Boss Battle Generator
Structures complex monolithic deliverables into boss fights:
- **Input:** Project title (*"Write Undergraduate Thesis"*), deliverables list, target completion deadline.
- **Output:**
  - Thematic Boss Name (e.g., *"The Thesis Titan of Ten Thousand Words"*)
  - Total HP Pool (calculated as sum of milestone damage, e.g., 1,000 HP)
  - 5–8 Sequential Milestones with allocated damage points (e.g., Literature Review: -150 HP, Data Analysis: -250 HP, Conclusion & Formatting: -150 HP)
  - Flavor text and victory achievement title

### 2.3 Capability 3: Life-Balance Adaptive Recommendations
- Analyzes the player's 6-attribute radar chart.
- If a player is heavily grinding `INT` (coding/studying) with 0 activity in `STR` (health) or `WIS` (rest), the AI generates a subtle **"Side Quest"**:
  - *"Touch Grass & Rehydrate"* (Attribute: `STR`, Difficulty: `Trivial`, +10 XP): *"Take a 10-minute walk outside away from screens."*
  - Promotes real-world wellness without being patronizing.

### 2.4 Capability 4: Compassionate Recovery Quests
- Triggered when a player has been inactive for $\ge 72$ hours.
- Evaluates the user's past history and outputs a single, extremely gentle quest designed to break inertia:
  - *"Clear Your Desk & Open the IDE"* (Difficulty: `Trivial`, +25 Catchup XP).

---

## 3. Gemini Prompt Architecture & Structured JSON Schemas

`[TECHNICAL DECISION]`

We utilize the official Google Gemini SDK with **Structured Outputs (`responseSchema`)** to enforce 100% deterministic JSON schemas. The model is physically constrained from returning markdown code fences or unparseable text.

### 3.1 Goal-to-Campaign Generation Schema

#### System Prompt:
```
You are the Master Control AI Game Master of Life-RPG, an 80s/90s retro-arcade productivity system.
Your mission is to transform a user's real-world goal into a structured, balanced RPG campaign.

RULES:
1. Every quest must represent a concrete, actionable real-world behavior (not vague concepts).
2. Assign one of 6 canonical attributes: 'STR' (fitness), 'INT' (study/code), 'WIS' (mindfulness), 'DEX' (habits/chores), 'CRE' (design/art), 'CHA' (social).
3. Assign a valid difficulty tier: 'Trivial' (<5 min), 'Easy' (15-30 min), 'Medium' (1 hr), 'Hard' (half-day), 'Epic' (major milestone).
4. Infuse retro-arcade gaming terminology while keeping real-world tasks crystal clear.
5. You MUST return strictly valid JSON matching the provided schema.
```

#### TypeScript & Zod Validation Schema:
```typescript
import { z } from "zod";

export const AiQuestProposalSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(300),
  attributeCode: z.enum(["STR", "INT", "WIS", "DEX", "CRE", "CHA"]),
  difficulty: z.enum(["Trivial", "Easy", "Medium", "Hard", "Epic"]),
  estimatedMinutes: z.number().int().min(5).max(480)
});

export const AiCampaignResponseSchema = z.object({
  campaignTitle: z.string().min(3).max(100),
  themeLore: z.string().max(250),
  primaryAttribute: z.enum(["STR", "INT", "WIS", "DEX", "CRE", "CHA"]),
  quests: z.array(AiQuestProposalSchema).min(3).max(8),
  bossChallenge: z.object({
    bossTitle: z.string().min(3).max(100),
    totalHp: z.number().int().min(200).max(2000),
    lore: z.string().max(200)
  })
});

export type AiCampaignResponse = z.infer<typeof AiCampaignResponseSchema>;
```

#### Calling Gemini via Server-Side API (`src/lib/gemini.ts`):
```typescript
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { AiCampaignResponseSchema } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateCampaign(goalDescription: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1200,
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          campaignTitle: { type: SchemaType.STRING },
          themeLore: { type: SchemaType.STRING },
          primaryAttribute: { 
            type: SchemaType.STRING, 
            enum: ["STR", "INT", "WIS", "DEX", "CRE", "CHA"] 
          },
          quests: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                title: { type: SchemaType.STRING },
                description: { type: SchemaType.STRING },
                attributeCode: { 
                  type: SchemaType.STRING, 
                  enum: ["STR", "INT", "WIS", "DEX", "CRE", "CHA"] 
                },
                difficulty: { 
                  type: SchemaType.STRING, 
                  enum: ["Trivial", "Easy", "Medium", "Hard", "Epic"] 
                },
                estimatedMinutes: { type: SchemaType.INTEGER }
              },
              required: ["title", "attributeCode", "difficulty", "estimatedMinutes"]
            }
          },
          bossChallenge: {
            type: SchemaType.OBJECT,
            properties: {
              bossTitle: { type: SchemaType.STRING },
              totalHp: { type: SchemaType.INTEGER },
              lore: { type: SchemaType.STRING }
            },
            required: ["bossTitle", "totalHp"]
          }
        },
        required: ["campaignTitle", "primaryAttribute", "quests", "bossChallenge"]
      }
    }
  });

  const prompt = `Convert this real-world goal into a Life-RPG campaign:\n"${goalDescription}"`;
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  // Double-validate with Zod to guarantee strict runtime integrity
  return AiCampaignResponseSchema.parse(JSON.parse(text));
}
```

---

## 4. Resilience, Guardrails & Offline Fallbacks

`[TECHNICAL DECISION]`

### 4.1 Fallback System (Zero Downtime)
If the Gemini API encounters a network timeout ($>5000\text{ ms}$), rate-limit quota exhaustion (`429`), or invalid token response, the system **never crashes or hangs**. It seamlessly falls back to pre-compiled, hand-tuned templates:

```typescript
export const STATIC_FALLBACK_CAMPAIGNS: Record<string, AiCampaignResponse> = {
  coding: {
    campaignTitle: "The Codebreaker's Gauntlet",
    themeLore: "Master the ancient syntax and conquer the digital void.",
    primaryAttribute: "INT",
    quests: [
      {
        title: "Setup Dev Environment & Hello World",
        description: "Configure local tools and verify runtime compiler.",
        attributeCode: "INT",
        difficulty: "Easy",
        estimatedMinutes: 30
      },
      {
        title: "Build Core Data Model",
        description: "Design relational schema and verify data integrity.",
        attributeCode: "INT",
        difficulty: "Medium",
        estimatedMinutes: 60
      },
      {
        title: "Implement API Endpoints",
        description: "Write tested server endpoints for primary CRUD operations.",
        attributeCode: "INT",
        difficulty: "Hard",
        estimatedMinutes: 120
      }
    ],
    bossChallenge: {
      bossTitle: "The Production Deployment Boss",
      totalHp: 500,
      lore: "Deploy the application to the live edge server without runtime errors."
    }
  }
};
```

### 4.2 Security & Data Privacy
1. **Zero PII Leakage:** Prompts only contain the user's provided goal string and attribute preference. Usernames, emails, IP addresses, and private notes are never sent to external LLM endpoints.
2. **Prompt Injection Defense:** User inputs are sanitized to strip system delimiters and wrapped in strict string boundaries.
3. **Cost Control & Rate Limiting:** Each user is restricted to a maximum of **5 AI generation requests per hour** using an in-memory/Redis sliding window counter.
