import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Flame, Trophy, TrendingUp, Calendar } from "lucide-react";
import { getStreakLeaderboard } from "@/lib/activityStreak";
import { Skeleton } from "./ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function StreakLeaderboard({ limit = 20 }) {
  const [currentLeaderboard, setCurrentLeaderboard] = useState([]);
  const [longestLeaderboard, setLongestLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("current");

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        setLoading(true);
        const [currentRes, longestRes] = await Promise.all([
          getStreakLeaderboard("current", limit),
          getStreakLeaderboard("longest", limit),
        ]);
        setCurrentLeaderboard(currentRes.data.leaderboard || []);
        setLongestLeaderboard(longestRes.data.leaderboard || []);
      } catch (error) {
        console.error("Error fetching leaderboards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboards();
  }, [limit]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderLeaderboard = (leaderboard, type) => {
    if (!leaderboard || leaderboard.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Flame className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No streaks recorded yet. Be the first!</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {leaderboard.map((entry, index) => {
          const isTop3 = index < 3;
          const streakValue = type === "current" ? entry.currentStreak : entry.longestStreak;

          return (
            <div
              key={entry._id || index}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                isTop3
                  ? "bg-linear-to-r from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30 border-orange-200 dark:border-orange-800"
                  : "bg-card hover:bg-accent/50"
              }`}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-12 h-12 shrink-0">
                {isTop3 ? (
                  <div className="text-2xl">
                    {index === 0 && "🥇"}
                    {index === 1 && "🥈"}
                    {index === 2 && "🥉"}
                  </div>
                ) : (
                  <div className="text-lg font-bold text-muted-foreground">#{entry.rank}</div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold truncate">{entry.username}</span>
                  {entry.isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {entry.totalAnalyses} analyses
                  </span>
                  {entry.lastActivityDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(entry.lastActivityDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Streak Count */}
              <div className="flex items-center gap-2 shrink-0">
                <Flame
                  className={`h-5 w-5 ${
                    entry.isActive ? "text-orange-500 animate-pulse" : "text-gray-400"
                  }`}
                />
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {streakValue}
                  </div>
                  <div className="text-xs text-muted-foreground">days</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Streak Leaderboard
        </CardTitle>
        <CardDescription>
          Top users with the most consistent profile analysis activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="current" className="gap-2">
              <Flame className="h-4 w-4" />
              Current Streaks
            </TabsTrigger>
            <TabsTrigger value="longest" className="gap-2">
              <Trophy className="h-4 w-4" />
              Longest Streaks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="mt-0">
            {renderLeaderboard(currentLeaderboard, "current")}
          </TabsContent>

          <TabsContent value="longest" className="mt-0">
            {renderLeaderboard(longestLeaderboard, "longest")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
