import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import * as Icons from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TIER_COLORS = {
  Bronze: "from-amber-700 to-amber-900",
  Silver: "from-gray-400 to-gray-600",
  Gold: "from-yellow-400 to-yellow-600",
  Platinum: "from-slate-300 to-slate-500",
  Diamond: "from-cyan-300 to-cyan-500",
  Legendary: "from-orange-500 to-red-600",
};

const TIER_GLOW = {
  Bronze: "shadow-amber-700/50",
  Silver: "shadow-gray-400/50",
  Gold: "shadow-yellow-400/50",
  Platinum: "shadow-slate-300/50",
  Diamond: "shadow-cyan-300/50",
  Legendary: "shadow-orange-500/50",
};

export default function UnlockedAchievements({ username }) {
  const [achievements, setAchievements] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, [username]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/achievements/${username}`
      );
      setAchievements(response.data.data);
    } catch (error) {
      console.error("Failed to fetch achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!achievements || achievements.unlockedCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
          <CardDescription>No achievements unlocked yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Show top 6 unlocked achievements
  const topAchievements = achievements.unlocked.slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icons.Trophy className="h-5 w-5" />
              Achievements
            </CardTitle>
            <CardDescription className="mt-1">
              {achievements.unlockedCount} unlocked • {achievements.completionPercentage}% complete
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {achievements.unlockedCount}/{achievements.total}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {topAchievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
        {achievements.unlockedCount > 6 && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            +{achievements.unlockedCount - 6} more achievements
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AchievementCard({ achievement }) {
  const tierColor = TIER_COLORS[achievement.tier.name];
  const tierGlow = TIER_GLOW[achievement.tier.name];
  const IconComponent = Icons[achievement.icon] || Icons.Star;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`relative p-3 rounded-lg border bg-gradient-to-br ${tierColor} border-transparent shadow-md ${tierGlow} cursor-pointer`}
    >
      {/* Tier Badge */}
      <div className="absolute top-1 right-1">
        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-black/30 text-white backdrop-blur-sm">
          {achievement.tier.name}
        </span>
      </div>

      {/* Icon */}
      <div className="flex justify-center mb-2">
        <IconComponent className="w-8 h-8 text-white" />
      </div>

      {/* Title */}
      <h3 className="font-bold text-xs text-center text-white line-clamp-2">{achievement.name}</h3>
    </motion.div>
  );
}
