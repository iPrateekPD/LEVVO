import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DEFAULT_USER_ID = "default-user-hero";

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      where: { isActive: true },
      orderBy: { priceGold: "asc" },
    });

    const userInventory = await prisma.inventory.findMany({
      where: { userId: DEFAULT_USER_ID },
    });

    const ownedItemIds = new Set(userInventory.map((inv) => inv.itemId));

    const result = items.map((item) => ({
      ...item,
      isOwned: ownedItemIds.has(item.id),
      isEquipped: userInventory.find((inv) => inv.itemId === item.id)?.isEquipped ?? false,
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Failed to fetch shop items:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
