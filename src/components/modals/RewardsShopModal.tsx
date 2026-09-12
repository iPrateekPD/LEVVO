"use client";

import React, { useState, useEffect } from "react";
import { X, ShoppingBag, Coins, Check, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { sounds } from "@/lib/sound";

interface ShopItem {
  id: string;
  name: string;
  itemType: string;
  description: string;
  priceGold: number;
  isOwned: boolean;
  isEquipped: boolean;
}

interface RewardsShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  gold: number;
  onGoldUpdated: (newGold: number) => void;
}

export function RewardsShopModal({
  isOpen,
  onClose,
  gold,
  onGoldUpdated,
}: RewardsShopModalProps) {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadShop();
    }
  }, [isOpen]);

  const loadShop = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/shop/items");
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch {
      setError("Failed to load shop items");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (item: ShopItem) => {
    if (item.isOwned && item.itemType !== "CUSTOM_REWARD") return;
    if (gold < item.priceGold) return;

    setPurchasingId(item.id);
    setError(null);
    sounds.playClick();

    try {
      const res = await fetch("/api/v1/shop/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Purchase failed");
        return;
      }

      sounds.playLevelUp();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.5 },
        colors: ["#FFE600", "#FF2A85", "#00F0FF"],
      });

      onGoldUpdated(data.data.remainingGold);
      // Refresh items
      loadShop();
    } catch {
      setError("Transaction failed");
    } finally {
      setPurchasingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cabinetSurface border-2 border-arcadeGold rounded-2xl w-full max-w-xl p-5 shadow-[0_0_35px_rgba(255,230,0,0.25)] relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 text-textSecondary hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 pr-6">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-arcadeGold" />
            <h2 className="font-arcade text-base text-arcadeGold tracking-wider">
              ARCADE REWARDS SHOP
            </h2>
          </div>

          <div className="flex items-center gap-1.5 bg-arcadeBlack px-3 py-1.5 rounded-lg border border-arcadeGold/50">
            <Coins className="w-4 h-4 text-arcadeGold" />
            <span className="font-arcade text-xs text-arcadeGold">{gold} GP</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded bg-arcadeRed/20 border border-arcadeRed text-arcadeRed text-xs">
            {error}
          </div>
        )}

        {/* Item Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((item) => {
            const canAfford = gold >= item.priceGold;
            const alreadyOwned = item.isOwned && item.itemType !== "CUSTOM_REWARD";

            return (
              <div
                key={item.id}
                className="bg-[#151026] border border-cabinetBorder rounded-xl p-3 flex flex-col justify-between gap-2.5"
              >
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-semibold text-sm text-textPrimary">{item.name}</span>
                    <span className="text-[9px] font-arcade px-1.5 py-0.5 rounded bg-cabinetBorder/60 text-textSecondary">
                      {item.itemType}
                    </span>
                  </div>
                  <p className="text-xs text-textSecondary mt-1 leading-snug">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-cabinetBorder/50">
                  <div className="flex items-center gap-1 font-arcade text-xs text-arcadeGold">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{item.priceGold} GP</span>
                  </div>

                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={alreadyOwned || !canAfford || purchasingId === item.id}
                    className={`px-3 py-1.5 rounded-lg font-arcade text-[10px] transition-all ${
                      alreadyOwned
                        ? "bg-phosphorGreen/20 text-phosphorGreen border border-phosphorGreen/40 cursor-default"
                        : canAfford
                        ? "arcade-btn bg-arcadeGold hover:bg-yellow-400 text-arcadeBlack border border-yellow-200 shadow-[0_2px_0_#9E8200]"
                        : "bg-cabinetBorder text-textMuted cursor-not-allowed"
                    }`}
                  >
                    {alreadyOwned ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3" /> OWNED
                      </span>
                    ) : purchasingId === item.id ? (
                      "BUYING..."
                    ) : canAfford ? (
                      "UNLOCK"
                    ) : (
                      "NEED GOLD"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
