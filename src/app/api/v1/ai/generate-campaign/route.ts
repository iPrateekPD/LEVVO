import { NextResponse } from "next/server";
import { generateCampaignWithAI } from "@/lib/gemini";
import { z } from "zod";

const GenerateCampaignSchema = z.object({
  goalText: z.string().trim().min(3, "Please provide a goal description").max(500),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = GenerateCampaignSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid goal input" },
        { status: 400 }
      );
    }

    const campaign = await generateCampaignWithAI(parsed.data.goalText);
    return NextResponse.json({ success: true, data: campaign });
  } catch (error) {
    console.error("Failed to generate campaign:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
