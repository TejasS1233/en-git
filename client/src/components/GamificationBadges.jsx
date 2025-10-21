import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Trophy, Award, Star, Zap } from "lucide-react";
import { calculateBadges, getScoreFromBadges } from "../lib/gamification";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

const BADGE_ICONS = {
  Polyglot: "🌐",
  "Night Owl": "🦉",
  "Early Bird": "🐦",
  "Open Source Hero": "⭐",
  "Consistent Coder": "🔥",
  "Star Collector": "✨",
  "Early Adopter": "🚀",
  Collaborator: "🤝",
  "Issue Hunter": "🎯",
};

const TIER_COLORS = {
  Bronze: "bg-amber-700/20 text-amber-600 border-amber-600/30",
  Silver: "bg-slate-400/20 text-slate-300 border-slate-400/30",
  Gold: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
};

const TIER_ICONS = {
  Bronze: "🥉",
  Silver: "🥈",
  Gold: "🥇",
};

export function GamificationBadges({ insights }) {
  const [mintingId, setMintingId] = useState(null);
  const badges = calculateBadges(insights);
  const totalScore = getScoreFromBadges(badges);

  if (!badges || badges.length === 0) {
    return null;
  }

  return (
    <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Achievements Unlocked
            </CardTitle>
            <CardDescription>
              Earned {badges.length} badge{badges.length !== 1 ? "s" : ""} • Total Score:{" "}
              {totalScore}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-bold text-yellow-600">{totalScore}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((badge, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="text-3xl flex-shrink-0">{BADGE_ICONS[badge.name] || "🏆"}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm truncate">{badge.name}</h4>
                  {badge.tier && (
                    <Badge variant="outline" className={`text-xs ${TIER_COLORS[badge.tier] || ""}`}>
                      {TIER_ICONS[badge.tier]} {badge.tier}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{badge.description}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Award className="h-3 w-3 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-600">+{badge.points} pts</span>
                </div>
                <div className="mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={mintingId === badge.id}
                    onClick={async () => {
                      try {
                        setMintingId(badge.id);
                        const res = await axiosInstance.post("/badges/mint", {
                          badgeId: badge.id,
                          metadataURI: "",
                        });
                        toast.success("Badge minted on-chain");
                      } catch (e) {
                        toast.error(e?.response?.data?.message || "Failed to mint badge");
                      } finally {
                        setMintingId(null);
                      }
                    }}
                  >
                    {mintingId === badge.id ? "Minting..." : "Mint as NFT"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {badges.length >= 5 && (
          <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-500" />
              <p className="text-sm font-medium">
                Amazing! You've unlocked {badges.length} achievements. Keep coding! 🎉
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
