"use client";

import React, { useState } from "react";
import { X, Sparkles, Wand2, Check, ArrowRight } from "lucide-react";
import { GeneratedCampaign } from "@/lib/gemini";
import { sounds } from "@/lib/sound";
import { useEscapeKey } from "@/lib/useEscapeKey";

interface AiCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignAccepted: (quests: any[]) => void;
}

export function AiCampaignModal({
  isOpen,
  onClose,
  onCampaignAccepted,
}: AiCampaignModalProps) {
  const [goalText, setGoalText] = useState("");
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState<GeneratedCampaign | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!goalText.trim()) return;
    setLoading(true);
    setError(null);
    sounds.playClick();

    try {
      const res = await fetch("/api/v1/ai/generate-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalText }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate campaign");
        return;
      }

      setCampaign(data.data);
      sounds.playComplete();
    } catch {
      setError("Network error while communicating with AI Oracle");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!campaign) return;
    setLoading(true);

    try {
      const createdQuests = [];
      for (const q of campaign.quests) {
        const res = await fetch("/api/v1/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: q.title,
            description: q.description,
            attributeCode: q.attributeCode,
            difficulty: q.difficulty,
          }),
        });
        const data = await res.json();
        if (data.success) {
          createdQuests.push(data.data);
        }
      }

      sounds.playLevelUp();
      onCampaignAccepted(createdQuests);
      onClose();
      setCampaign(null);
      setGoalText("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cabinetSurface border-2 border-purple-500 rounded-2xl w-full max-w-xl p-5 shadow-[0_0_35px_rgba(138,43,226,0.35)] relative max-h-[90vh] overflow-y-auto">
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

        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-arcadeGold" />
          <h2 className="font-arcade text-base text-[#FFE600] tracking-wider">
            AI QUEST ORACLE
          </h2>
        </div>
        <p className="text-xs text-textSecondary mb-4">
          Speak your real-world ambitions. The Game Master will transform your goal into an epic
          arcade campaign.
        </p>

        {error && (
          <div className="mb-4 p-2.5 rounded bg-arcadeRed/20 border border-arcadeRed text-arcadeRed text-xs">
            {error}
          </div>
        )}

        {/* Input Field */}
        {!campaign ? (
          <div className="flex flex-col gap-3">
            <textarea
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="e.g., 'Learn React and TypeScript to build web apps', 'Train to run a 5K in 4 weeks', 'Pass final exams with top grades'..."
              rows={3}
              className="w-full bg-[#120D24] border border-cabinetBorder rounded-lg p-3 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-purple-400 resize-none"
              autoFocus
            />

            <div className="flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={loading || !goalText.trim()}
                className="arcade-btn flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-synthMagenta hover:brightness-110 text-white border border-purple-300 rounded-lg font-arcade text-xs shadow-[0_3px_0_#4B0082]"
              >
                <Wand2 className="w-4 h-4" />
                <span>{loading ? "COMMUNING WITH ORACLE..." : "GENERATE CAMPAIGN"}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Generated Campaign Preview */
          <div className="flex flex-col gap-4">
            <div className="p-3 bg-purple-950/40 border border-purple-500/50 rounded-xl">
              <span className="text-[10px] font-arcade text-arcadeGold uppercase tracking-wider">
                EPIC CAMPAIGN PROPOSAL
              </span>
              <h3 className="font-arcade text-sm text-neonCyan mt-1">{campaign.campaignTitle}</h3>
              <p className="text-xs text-textSecondary italic mt-1">{campaign.themeLore}</p>
            </div>

            {/* Quests Stream */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-textSecondary">
                Proposed Actionable Quests:
              </span>
              {campaign.quests.map((q, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-[#140F24] border border-cabinetBorder rounded-lg flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-medium text-textPrimary">{q.title}</span>
                    <p className="text-[11px] text-textSecondary mt-0.5">{q.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-arcade text-synthMagenta">{q.difficulty}</span>
                    <span className="text-[10px] bg-cabinetBorder px-1.5 py-0.5 rounded text-neonCyan">
                      {q.attributeCode}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-cabinetBorder">
              <button
                onClick={() => setCampaign(null)}
                className="text-xs text-textSecondary hover:text-textPrimary"
              >
                ← Try Another Goal
              </button>

              <button
                onClick={handleAccept}
                disabled={loading}
                className="arcade-btn flex items-center gap-2 px-5 py-2.5 bg-phosphorGreen hover:bg-emerald-400 text-arcadeBlack font-semibold border border-emerald-300 rounded-lg font-arcade text-xs shadow-[0_3px_0_#008A36]"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{loading ? "ENROLLING..." : "ACCEPT CAMPAIGN"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
