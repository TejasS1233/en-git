import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { calculateProfileScore, getImprovementPlan } from "@/lib/profileScore";
import { TrendingUp, Target, Lightbulb, Trophy, CheckCircle2 } from "lucide-react";

export default function ProfileScore({ insights }) {
  if (!insights) return null;

  const profileScore = calculateProfileScore(insights);
  if (!profileScore) return null;

  const improvementPlan = getImprovementPlan(profileScore);

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-gray-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Profile Score</CardTitle>
              <CardDescription>Your GitHub profile strength</CardDescription>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-600 dark:text-purple-400">
                {profileScore.score}
              </div>
              <div className="text-sm text-gray-500">out of 100</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Rating Badge */}
          <div className="flex items-center gap-3">
            <span className="text-4xl">{profileScore.ratingIcon}</span>
            <div>
              <Badge
                className={`text-lg ${profileScore.ratingColor} bg-opacity-10`}
                variant="outline"
              >
                {profileScore.rating} Developer
              </Badge>
              <p className="text-sm text-gray-500 mt-1">
                {profileScore.score >= 90 && "You're in the top 1% of developers!"}
                {profileScore.score >= 75 &&
                  profileScore.score < 90 &&
                  "You're an expert developer!"}
                {profileScore.score >= 60 &&
                  profileScore.score < 75 &&
                  "Great progress! Keep it up!"}
                {profileScore.score >= 40 &&
                  profileScore.score < 60 &&
                  "You're on the right track!"}
                {profileScore.score < 40 && "Lots of room to grow!"}
              </p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="space-y-3 pt-4">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Score Breakdown
            </h4>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Profile Completeness</span>
                  <span className="font-medium">{profileScore.breakdown.profile}%</span>
                </div>
                <Progress value={profileScore.breakdown.profile} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Repository Quality</span>
                  <span className="font-medium">{profileScore.breakdown.repositories}%</span>
                </div>
                <Progress value={profileScore.breakdown.repositories} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Skills & Diversity</span>
                  <span className="font-medium">{profileScore.breakdown.skills}%</span>
                </div>
                <Progress value={profileScore.breakdown.skills} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Community Engagement</span>
                  <span className="font-medium">{profileScore.breakdown.community}%</span>
                </div>
                <Progress value={profileScore.breakdown.community} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Activity & Consistency</span>
                  <span className="font-medium">{profileScore.breakdown.activity}%</span>
                </div>
                <Progress value={profileScore.breakdown.activity} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      {profileScore.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Your Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {profileScore.achievements.slice(0, 8).map((achievement, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{achievement}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Improvement Tips */}
      {profileScore.tips.length > 0 && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              How to Improve
            </CardTitle>
            <CardDescription>Quick wins to boost your score</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {profileScore.tips.map((tip, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                  +{tip.points}
                </div>
                <div>
                  <Badge variant="outline" className="mb-1 text-xs">
                    {tip.category}
                  </Badge>
                  <p className="text-sm">{tip.tip}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Improvement Plan */}
      {improvementPlan && (
        <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-gray-900">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              Your Improvement Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-4 rounded-lg bg-white dark:bg-gray-900 border">
              <div>
                <p className="text-sm text-gray-500">Timeframe</p>
                <p className="font-semibold">{improvementPlan.timeframe}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Current Score</p>
                <p className="text-2xl font-bold text-purple-600">{profileScore.score}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Potential Score</p>
                <p className="text-2xl font-bold text-green-600">
                  {improvementPlan.potentialScore}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Gain</p>
                <p className="text-2xl font-bold text-blue-600">
                  +{improvementPlan.potentialScore - profileScore.score}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-sm">Priority Actions:</p>
              {improvementPlan.priority.map((tip, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center font-bold text-green-600 dark:text-green-400 text-xs">
                    {idx + 1}
                  </span>
                  <span>{tip.tip}</span>
                  <Badge variant="secondary" className="ml-auto">
                    +{tip.points}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
