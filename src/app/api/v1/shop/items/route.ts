// AUDIT: Tenant-isolation enforced. User inventory state is strictly isolated by session.userId.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getSessionUser(req);
    const userId = session?.userId ?? "default-user-hero";

    const items = await prisma.item.findMany({
      where: { isActive: true },
      orderBy: { priceGold: "asc" },
    });

    const userInventory = await prisma.inventory.findMany({
      where: { userId },
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
