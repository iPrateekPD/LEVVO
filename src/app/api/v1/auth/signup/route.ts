import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { z } from "zod";

const SignupSchema = z.object({
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = SignupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password, username } = parsed.data;

    // Check existing email
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Check existing username
    const existingUsername = await prisma.profile.findUnique({
      where: { username },
    });
    if (existingUsername) {
      return NextResponse.json(
        { success: false, error: "This hero handle is already claimed" },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);

    // Create user and initialize profile + attributes in transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name: username,
          passwordHash,
          profile: {
            create: {
              username,
              title: "Novice Wanderer",
              totalXp: 0,
              currentLevel: 1,
              gold: 50, // Starter bonus
              streakCurrent: 1,
              streakLongest: 1,
              momentumScore: 50,
              activeTheme: "synthwave",
              avatarId: "pixel_knight",
              sfxEnabled: true,
              lastActiveDate: new Date(),
            },
          },
        },
        include: { profile: true },
      });

      // Initialize 6 Canonical Attributes
      const attributes = ["STR", "INT", "WIS", "DEX", "CRE", "CHA"];
      for (const code of attributes) {
        await tx.attribute.create({
          data: {
            userId: user.id,
            attributeCode: code,
            currentXp: 0,
            currentLevel: 1,
          },
        });
      }

      // Starter Welcome Quest
      await tx.task.create({
        data: {
          userId: user.id,
          title: "Complete your first real-world task",
          description: "Take a step toward your goals today and claim your first XP reward!",
          attributeCode: "DEX",
          difficulty: "Easy",
          xpReward: 25,
          goldReward: 10,
          status: "ACTIVE",
        },
      });

      // Default Starter Boss
      await tx.boss.create({
        data: {
          userId: user.id,
          title: "The Procrastination Golem",
          description: "Overcome inertia by clearing your first set of deliverables.",
          totalHp: 500,
          currentHp: 500,
          status: "ACTIVE",
          rewardXp: 300,
          rewardGold: 150,
          milestones: {
            create: [
              {
                title: "Define your weekly priorities",
                damageHp: 250,
                status: "PENDING",
              },
              {
                title: "Execute 2 hours of deep focused work",
                damageHp: 250,
                status: "PENDING",
              },
            ],
          },
        },
      });

      return user;
    });

    // Generate session token
    const token = createSessionToken(newUser.id);

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            username: newUser.profile?.username,
          },
        },
      },
      { status: 201 }
    );

    // Set secure HTTP-only cookie
    const isLocalhost = req.headers.get("host")?.includes("localhost") || req.headers.get("host")?.includes("127.0.0.1");
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && !isLocalhost,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
