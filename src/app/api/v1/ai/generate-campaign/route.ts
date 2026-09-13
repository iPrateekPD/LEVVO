// AUDIT: Tenant-isolation enforced. AI campaign requests are authenticated and rate-limited per session.userId.
// Proposal Only: This endpoint NEVER writes to the database directly. Tasks are created only upon user acceptance.

import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { getFallbackCampaign, GeneratedCampaign } from "@/lib/ai/fallbacks";

export const dynamic = "force-dynamic";

/**
 * Cost Control & Spam Defense: Max 5 AI generations per hour per user (sliding window).
 */
const aiRateLimits = new Map<string, number[]>();

function checkAiRateLimit(userId: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour sliding window
  const maxRequests = 5;

  const timestamps = (aiRateLimits.get(userId) || []).filter(
    (t) => now - t < windowMs
  );

  if (timestamps.length >= maxRequests) {
    const oldest = timestamps[0];
    const retryAfterSeconds = Math.ceil((windowMs - (now - oldest)) / 1000);
    aiRateLimits.set(userId, timestamps);
    return { allowed: false, retryAfterSeconds };
  }

  timestamps.push(now);
  aiRateLimits.set(userId, timestamps);
  return { allowed: true };
}

const GenerateCampaignSchema = z.object({
  goalText: z.string().trim().min(3, "Please provide a goal description").max(500),
});

export async function POST(req: Request) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userId;

    // 1. Enforce 5/hour rate limit
    const rateLimit = checkAiRateLimit(userId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "RATE_LIMIT_EXCEEDED",
          message: `AI campaign generation limit reached (5 per hour). Please retry in ${rateLimit.retryAfterSeconds}s.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = GenerateCampaignSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid goal input" },
        { status: 400 }
      );
    }

    const goalText = parsed.data.goalText;
    const apiKey = process.env.GEMINI_API_KEY;

    // If API key is missing, immediately return thematic fallback
    if (!apiKey || apiKey.trim() === "" || apiKey === "your-gemini-api-key") {
      const fallback = getFallbackCampaign(goalText);
      return NextResponse.json({
        success: true,
        data: fallback,
        notice: "Generated from curated RPG campaign blueprint (Resilient offline mode).",
      });
    }

    // 2. Call Gemini with 5-second strict timeout and structured responseSchema
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const prompt = `You are the Master Control AI Game Master of Life-RPG, a retro-arcade productivity system.
Convert this real-world goal into a structured, balanced RPG campaign:
"${goalText}"`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  campaignTitle: { type: "STRING" },
                  themeLore: { type: "STRING" },
                  primaryAttribute: {
                    type: "STRING",
                    enum: ["STR", "INT", "WIS", "DEX", "CRE", "CHA"],
                  },
                  quests: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        title: { type: "STRING" },
                        description: { type: "STRING" },
                        attributeCode: {
                          type: "STRING",
                          enum: ["STR", "INT", "WIS", "DEX", "CRE", "CHA"],
                        },
                        difficulty: {
                          type: "STRING",
                          enum: ["Easy", "Medium", "Hard"],
                        },
                        estimatedMinutes: { type: "INTEGER" },
                      },
                      required: [
                        "title",
                        "description",
                        "attributeCode",
                        "difficulty",
                        "estimatedMinutes",
                      ],
                    },
                  },
                  bossChallenge: {
                    type: "OBJECT",
                    properties: {
                      bossTitle: { type: "STRING" },
                      totalHp: { type: "INTEGER" },
                      lore: { type: "STRING" },
                    },
                    required: ["bossTitle", "totalHp", "lore"],
                  },
                },
                required: [
                  "campaignTitle",
                  "themeLore",
                  "primaryAttribute",
                  "quests",
                  "bossChallenge",
                ],
              },
            },
          }),
        }
      );

      clearTimeout(timeout);

      if (!res.ok) {
        console.warn(`Gemini API returned status ${res.status}, falling back to static blueprint`);
        const fallback = getFallbackCampaign(goalText);
        return NextResponse.json({
          success: true,
          data: fallback,
          notice: "Gemini quota or status limit encountered; using curated RPG campaign blueprint.",
        });
      }

      const data = await res.json();
      const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawJson) {
        const fallback = getFallbackCampaign(goalText);
        return NextResponse.json({
          success: true,
          data: fallback,
          notice: "Using curated RPG campaign blueprint.",
        });
      }

      const campaign = JSON.parse(rawJson) as GeneratedCampaign;
      return NextResponse.json({
        success: true,
        data: { ...campaign, isFallback: false },
        notice: null,
      });
    } catch (err) {
      clearTimeout(timeout);
      console.warn("Gemini call timed out (5s) or failed, using static fallback:", err);
      const fallback = getFallbackCampaign(goalText);
      return NextResponse.json({
        success: true,
        data: fallback,
        notice: "AI response timed out (>5s); using curated RPG campaign blueprint.",
      });
    }
  } catch (error) {
    console.error("Failed to generate campaign:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
