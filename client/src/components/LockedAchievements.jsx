import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import * as Icons from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TIER_COLORS = {
  Bronze: "#CD7F32",
  Silver: "#C0C0C0",
  Gold: "#FFD700",
  Platinum: "#E5E4E2",
  Diamond: "#B9F2FF",
  Legendary: "#FF6B35",
};

export default function LockedAchievements({ username }) {
  const [achievements, setAchievements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");

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
            <Icons.Target className="h-5 w-5" />
            Goals to Unlock
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

  if (!achievements) {
    return null;
  }

  const displayAchievements =
    categoryFilter === "all"
      ? achievements.locked
      : achievements.locked.filter((a) => a.category === categoryFilter);

  const categories = [
    { value: "all", label: "All", icon: Icons.Grid3x3 },
    { value: "score", label: "Score", icon: Icons.TrendingUp },
    { value: "stars", label: "Stars", icon: Icons.Star },
    { value: "repos", label: "Repos", icon: Icons.Package },
    { value: "followers", label: "Followers", icon: Icons.Users },
    { value: "languages", label: "Languages", icon: Icons.Code2 },
    { value: "activity", label: "Activity", icon: Icons.Flame },
    { value: "special", label: "Special", icon: Icons.Sparkles },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icons.Target className="h-5 w-5" />
              Goals to Unlock
            </CardTitle>
            <CardDescription className="mt-1">
              {achievements.locked.length} achievements waiting to be unlocked
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {achievements.completionPercentage}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  categoryFilter === cat.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Locked Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {displayAchievements.slice(0, 8).map((achievement) => (
              <LockedAchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </AnimatePresence>
        </div>

        {displayAchievements.length > 8 && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            +{displayAchievements.length - 8} more locked achievements
          </div>
        )}

        {displayAchievements.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Icons.CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p>All achievements in this category unlocked!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LockedAchievementCard({ achievement }) {
  const tierColor = TIER_COLORS[achievement.tier.name];
  const IconComponent = achievement.secret ? Icons.Lock : Icons[achievement.icon] || Icons.Star;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
    >
      {/* Tier Badge */}
      <div className="absolute top-2 right-2">
        <Badge variant="outline" style={{ borderColor: tierColor, color: tierColor }}>
          {achievement.tier.name}
        </Badge>
      </div>

      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${tierColor}20` }}
          >
            <IconComponent className="w-6 h-6" style={{ color: tierColor }} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm mb-1">
            {achievement.secret ? "Secret Achievement" : achievement.name}
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            {achievement.secret ? "Keep exploring to unlock this secret!" : achievement.description}
          </p>

          {/* Progress Bar */}
          {!achievement.secret && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span className="font-bold" style={{ color: tierColor }}>
                  {achievement.progress}%
                </span>
              </div>
              <Progress value={achievement.progress} className="h-2" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
