import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const StageSchema = z.object({
  stage: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionUser(req);
    const userId = session?.userId ?? "default-user-hero";

    const { id } = params;
    const body = await req.json();
    const parsed = StageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task || task.userId !== userId) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    const { stage } = parsed.data;
    const isDone = stage === "DONE";

    const updated = await prisma.task.update({
      where: { id },
      data: {
        stage,
        status: isDone ? "COMPLETED" : "ACTIVE",
        completedAt: isDone ? (task.completedAt || new Date()) : null,
      },
      include: {
        subTasks: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Failed to update task stage:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
