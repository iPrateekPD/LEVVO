import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Probe database connectivity
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: "connected",
      service: "life-rpg-arcade-engine",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "degraded",
        database: "disconnected",
        error: error?.message,
      },
      { status: 503 }
    );
  }
}
