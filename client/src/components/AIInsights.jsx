import { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  Lightbulb,
  Target,
  Briefcase,
  BookOpen,
  Loader2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { getAIInsights } from "../lib/github";

export function AIInsights({ username, onInsightsGenerated }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAIInsights = async () => {
    if (!username || username.trim() === "") {
      setError("Username is required to generate AI insights");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getAIInsights(username);
      console.log("AI Insights Response:", response.data);
      setInsights(response.data);
      // Pass insights to parent component
      if (onInsightsGenerated) {
        onInsightsGenerated(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch AI insights:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to generate AI insights. The AI service might be temporarily unavailable.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!insights && !loading) {
    return (
      <Card className="border-purple-500/20 bg-linear-to-br from-purple-500/5 to-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI-Powered Career Insights
          </CardTitle>
          <CardDescription>
            Get personalized career advice, growth recommendations, and learning paths powered by AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchAIInsights} className="w-full" variant="default">
            <Sparkles className="h-4 w-4 mr-2" />
            Generate AI Insights
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border-purple-500/20">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-cyan-600" />
            <p className="text-sm text-muted-foreground">Analyzing your profile with AI...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button onClick={fetchAIInsights} variant="outline" size="sm">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const { insights: aiData, learningPath } = insights || {};
  console.log("Rendering AI Insights:", { aiData, learningPath, insights });

  return (
    <div className="space-y-6">
      {/* Career Summary */}
      {aiData?.summary && (
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Career Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{aiData.summary}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Strengths */}
        {aiData?.strengths && aiData.strengths.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                Your Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {aiData.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Badge
                      variant="outline"
                      className="mt-0.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
                    >
                      {idx + 1}
                    </Badge>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Growth Areas */}
        {aiData?.growthAreas && aiData.growthAreas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                Growth Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {aiData.growthAreas.map((area, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Badge
                      variant="outline"
                      className="mt-0.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
                    >
                      {idx + 1}
                    </Badge>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recommended Projects */}
      {aiData?.projects && aiData.projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              Project Ideas to Build Next
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {aiData.projects.map((project, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Badge className="mt-0.5">{idx + 1}</Badge>
                  <span className="text-sm">{project}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Career Paths */}
      {aiData?.careerPaths && aiData.careerPaths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              Recommended Career Paths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {aiData.careerPaths.map((path, idx) => (
                <Badge key={idx} variant="secondary" className="text-sm px-3 py-1">
                  {path}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Path */}
      {learningPath?.phases && learningPath.phases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              6-Month Learning Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {learningPath.phases.map((phase, idx) => (
                <div key={idx} className="border-l-2 border-indigo-500 pl-4 py-2">
                  <h4 className="font-semibold text-sm mb-2">{phase.months}</h4>
                  {phase.skills && (
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground mb-1">Skills to learn:</p>
                      <div className="flex flex-wrap gap-1">
                        {phase.skills.map((skill, skillIdx) => (
                          <Badge key={skillIdx} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {phase.project && (
                    <p className="text-xs mt-2">
                      <strong>Project:</strong> {phase.project}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw text fallback */}
      {aiData?.rawText && !aiData?.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-xs">{aiData.rawText}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button onClick={fetchAIInsights} variant="outline" size="sm">
          <Sparkles className="h-4 w-4 mr-2" />
          Regenerate Insights
        </Button>
      </div>
    </div>
  );
}
