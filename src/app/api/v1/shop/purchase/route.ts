import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const DEFAULT_USER_ID = "default-user-hero";

const PurchaseSchema = z.object({
  itemId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = PurchaseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid item ID" }, { status: 400 });
    }

    const { itemId } = parsed.data;

    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Check profile gold
      const profile = await tx.profile.findUniqueOrThrow({
        where: { userId: DEFAULT_USER_ID },
      });

      if (profile.gold < item.priceGold) {
        throw new Error("INSUFFICIENT_GOLD");
      }

      // 2. Check if already owned
      const existing = await tx.inventory.findUnique({
        where: {
          userId_itemId: {
            userId: DEFAULT_USER_ID,
            itemId,
          },
        },
      });

      if (existing && item.itemType !== "CUSTOM_REWARD") {
        throw new Error("ALREADY_OWNED");
      }

      // 3. Deduct Gold
      const updatedProfile = await tx.profile.update({
        where: { userId: DEFAULT_USER_ID },
        data: {
          gold: profile.gold - item.priceGold,
          ...(item.itemType === "THEME" ? { activeTheme: item.id } : {}),
        },
      });

      // 4. Add to inventory if not present
      if (!existing) {
        await tx.inventory.create({
          data: {
            userId: DEFAULT_USER_ID,
            itemId,
            isEquipped: item.itemType === "THEME",
          },
        });
      }

      // 5. Log audit transaction
      await tx.xpTransaction.create({
        data: {
          userId: DEFAULT_USER_ID,
          deltaXp: 0,
          deltaGold: -item.priceGold,
          sourceType: "SHOP_PURCHASE",
          sourceId: item.id,
          description: `Purchased: ${item.name}`,
        },
      });

      return {
        item,
        remainingGold: updatedProfile.gold,
        activeTheme: updatedProfile.activeTheme,
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "INSUFFICIENT_GOLD") {
      return NextResponse.json(
        { success: false, error: "You do not have enough Gold to purchase this item" },
        { status: 422 }
      );
    }
    if (err.message === "ALREADY_OWNED") {
      return NextResponse.json(
        { success: false, error: "You already own this item" },
        { status: 409 }
      );
    }
    console.error("Purchase error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
