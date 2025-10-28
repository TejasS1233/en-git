import { useState, useEffect } from "react";
import {
  BookOpen,
  GraduationCap,
  Loader2,
  ExternalLink,
  Sparkles,
  AlertCircle,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { getLearningRecommendations } from "../lib/github";
import { toast } from "sonner";

export function LearningRecommendations({ username, insights }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchRecommendations = async () => {
    if (!username || username.trim() === "") {
      setError("Username is required to generate learning recommendations");
      return;
    }

    setLoading(true);
    setError(null);
    setHasFetched(true);
    
    try {
      const response = await getLearningRecommendations(username);
      console.log("Learning Recommendations Response:", response.data);
      setRecommendations(response.data);
      toast.success("Learning recommendations generated!");
    } catch (err) {
      console.error("Failed to fetch learning recommendations:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to generate learning recommendations. The service might be temporarily unavailable.";
      setError(errorMsg);
      toast.error("Failed to load learning recommendations");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch recommendations when username or insights change
  useEffect(() => {
    if (username && insights && !hasFetched) {
      fetchRecommendations();
    }
  }, [username, insights, hasFetched]);

  const getPlatformIcon = (platform) => {
    const platformLower = platform.toLowerCase();
    if (platformLower.includes("youtube")) return "📺";
    if (platformLower.includes("udemy")) return "🎓";
    if (platformLower.includes("coursera")) return "🎯";
    if (platformLower.includes("nptel")) return "📚";
    if (platformLower.includes("edx")) return "💼";
    if (platformLower.includes("freecodecamp")) return "🔥";
    if (platformLower.includes("pluralsight")) return "⚡";
    return "📖";
  };

  const getPriceColor = (price) => {
    if (price.toLowerCase() === "free") return "default";
    if (price.toLowerCase() === "paid") return "destructive";
    return "secondary";
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty.toLowerCase() === "beginner") return "secondary";
    if (difficulty.toLowerCase() === "intermediate") return "default";
    return "destructive";
  };

  if (!hasFetched && !loading) {
    return (
      <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-green-500" />
            AI-Powered Learning Recommendations
          </CardTitle>
          <CardDescription>
            Get personalized course recommendations based on your GitHub activity and skill gaps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchRecommendations} className="w-full" variant="default">
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Recommendations
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border-green-500/20">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-500" />
            <p className="text-sm text-muted-foreground">
              Analyzing your skills and generating recommendations...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button onClick={fetchRecommendations} variant="outline" size="sm">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!recommendations || !recommendations.recommendations) {
    return null;
  }

  const { skillGaps, recommendations: courses } = recommendations;

  return (
    <div className="space-y-6">
      {/* Skill Gaps Section */}
      {skillGaps && skillGaps.length > 0 && (
        <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-orange-500" />
              Areas for Growth
            </CardTitle>
            <CardDescription>
              Skills to focus on based on your current GitHub profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {skillGaps.map((gap, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <TrendingUp className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{gap}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Recommended Courses
          </CardTitle>
          <CardDescription>
            {courses.length} personalized course recommendations across multiple platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses.map((course, idx) => (
              <div
                key={idx}
                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getPlatformIcon(course.platform)}</span>
                      <h3 className="font-semibold text-lg">{course.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={getPriceColor(course.price)}>{course.price}</Badge>
                      <Badge variant={getDifficultyColor(course.difficulty)}>
                        {course.difficulty}
                      </Badge>
                      <Badge variant="outline">{course.platform}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{course.explanation}</p>
                    {course.skills && course.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {course.skills.map((skill, skillIdx) => (
                          <Badge key={skillIdx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex-shrink-0"
                  >
                    <a
                      href={course.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Visit
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Refetch Button */}
          <div className="mt-6 pt-4 border-t">
            <Button
              onClick={fetchRecommendations}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Refresh Recommendations
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

