import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Flame, TrendingUp, Calendar, Award, Zap } from "lucide-react";
import { getStreakStatus, getStreakEmoji, getStreakLevel } from "@/lib/activityStreak";
import { Skeleton } from "./ui/skeleton";
import { Progress } from "./ui/progress";

export function ActivityStreakBadge({ userId, username, compact = false }) {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        setLoading(true);
        const response = await getStreakStatus(userId, username);
        setStreak(response.data);
      } catch (error) {
        console.error("Error fetching streak:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, [userId, username]);

  if (loading) {
    return compact ? (
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-4 w-12" />
      </div>
    ) : (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!streak) return null;

  const streakLevel = getStreakLevel(streak.currentStreak);
  const emoji = getStreakEmoji(streak.currentStreak);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative">
          <Flame
            className={`h-5 w-5 ${
              streak.currentStreak > 0 && streak.isActive
                ? "text-orange-500 animate-pulse"
                : "text-gray-400"
            }`}
          />
          {streak.currentStreak > 0 && (
            <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
              {streak.currentStreak > 99 ? "99+" : streak.currentStreak}
            </div>
          )}
        </div>
        <span className="text-sm font-medium">
          {streak.currentStreak > 0 ? `${streak.currentStreak} day streak` : "Start your streak!"}
        </span>
      </div>
    );
  }

  return (
    <Card className="border-2 border-orange-200 dark:border-orange-800 bg-linear-to-br from-orange-50 to-white dark:from-orange-950 dark:to-gray-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Analysis Streak
            </CardTitle>
            <CardDescription>Keep analyzing profiles daily!</CardDescription>
          </div>
          <div className="text-4xl">{emoji}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Streak */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-linear-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30">
          <div>
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {streak.currentStreak}
            </p>
            <p className="text-xs text-muted-foreground">consecutive days</p>
          </div>
          <Badge
            variant="secondary"
            className={`text-${streakLevel.color}-600 dark:text-${streakLevel.color}-400`}
          >
            {streakLevel.level}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Award className="h-4 w-4" />
              <span>Best Streak</span>
            </div>
            <p className="text-2xl font-bold">{streak.longestStreak}</p>
          </div>

          <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span>Total Analyses</span>
            </div>
            <p className="text-2xl font-bold">{streak.totalAnalyses}</p>
          </div>
        </div>

        {/* Status Message */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {streak.hasActivityToday ? (
            <span className="text-green-600 dark:text-green-400 font-medium">
              ✓ Activity recorded today! Come back tomorrow to continue your streak.
            </span>
          ) : streak.isActive ? (
            <span className="text-yellow-600 dark:text-yellow-400 font-medium">
              ⚡ Analyze a profile today to maintain your streak!
            </span>
          ) : (
            <span className="text-muted-foreground">
              Start analyzing profiles to build your streak!
            </span>
          )}
        </div>

        {/* Progress to next milestone */}
        {streak.currentStreak > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Next milestone
              </span>
              <span className="font-medium">
                {streak.currentStreak < 7
                  ? "7 days"
                  : streak.currentStreak < 30
                  ? "30 days"
                  : streak.currentStreak < 100
                  ? "100 days"
                  : "365 days"}
              </span>
            </div>
            <Progress
              value={
                streak.currentStreak < 7
                  ? (streak.currentStreak / 7) * 100
                  : streak.currentStreak < 30
                  ? (streak.currentStreak / 30) * 100
                  : streak.currentStreak < 100
                  ? (streak.currentStreak / 100) * 100
                  : (streak.currentStreak / 365) * 100
              }
              className="h-2"
            />
          </div>
        )}

        {/* Last Activity */}
        {streak.lastActivityDate && (
          <p className="text-xs text-muted-foreground text-center">
            Last activity: {new Date(streak.lastActivityDate).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function StreakIndicator({ userId, username }) {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        setLoading(true);
        const response = await getStreakStatus(userId, username);
        setStreak(response.data);
      } catch (error) {
        console.error("Error fetching streak:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, [userId, username]);

  if (loading || !streak || streak.currentStreak === 0) return null;

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800">
      <Flame className="h-3 w-3 text-orange-500 animate-pulse" />
      <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">
        {streak.currentStreak}
      </span>
    </div>
  );
}
