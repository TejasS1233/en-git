import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Award, TrendingUp, CheckCircle2, AlertCircle, Clock, RotateCw } from "lucide-react";

export function RepoHealthScore({
  healthScore,
  repository,
  issues,
  pullRequests,
  commits,
  onRefresh,
  loading,
  lastUpdated,
}) {
  const getHealthColor = (score) => {
    if (score >= 80) return "from-green-500/80 to-emerald-500/80";
    if (score >= 60) return "from-blue-500/80 to-cyan-500/80";
    if (score >= 40) return "from-slate-400/80 to-slate-500/80";
    return "from-rose-500/80 to-pink-500/80";
  };

  const getHealthBgColor = (score) => {
    if (score >= 80) return "from-green-500/10 to-emerald-500/10";
    if (score >= 60) return "from-blue-500/10 to-cyan-500/10";
    if (score >= 40) return "from-slate-500/10 to-slate-600/10";
    return "from-rose-500/10 to-pink-500/10";
  };

  const getHealthBorderColor = (score) => {
    if (score >= 80) return "border-green-500/30";
    if (score >= 60) return "border-blue-500/30";
    if (score >= 40) return "border-yellow-500/30";
    return "border-rose-500/30";
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Award className="h-6 w-6" />
            Repository Health Score
          </CardTitle>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <p className="text-sm text-muted-foreground hidden sm:block">
                Last updated: {lastUpdated}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="gap-2"
            >
              <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Main Score Display */}
        <div className="space-y-6 mb-8">
          {/* Big Score Card */}
          <div
            className={`relative overflow-hidden rounded-xl border-2 ${getHealthBorderColor(healthScore.score)} p-8 bg-card`}
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left flex-1">
                <div className="text-muted-foreground text-sm font-semibold uppercase tracking-wider mb-2">
                  Health Score
                </div>
                <div className="flex items-baseline gap-3">
                  <div
                    className={`text-8xl md:text-9xl font-semibold bg-linear-to-br ${getHealthColor(healthScore.score)} bg-clip-text text-transparent leading-none`}
                  >
                    {healthScore.score}
                  </div>
                  <div className="text-4xl font-bold text-muted-foreground">/100</div>
                </div>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-border">
                  <span className="text-2xl font-medium">Grade {healthScore.grade}</span>
                </div>
              </div>
              <div className="text-center md:text-right">
                <div className="text-2xl font-bold mb-1">
                  {healthScore.score >= 80
                    ? "Excellent!"
                    : healthScore.score >= 60
                      ? "Good Job!"
                      : healthScore.score >= 40
                        ? "Keep Going!"
                        : "Needs Work"}
                </div>
                <div className="text-muted-foreground text-sm">
                  {healthScore.score >= 80
                    ? "Outstanding repository health"
                    : healthScore.score >= 60
                      ? "Solid repository maintenance"
                      : healthScore.score >= 40
                        ? "Room for improvement"
                        : "Requires attention"}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="p-6 rounded-xl border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xl font-bold">Overall Health</span>
              <span className="text-3xl font-semibold">{healthScore.percentage}%</span>
            </div>
            <Progress value={healthScore.percentage} className="h-6" />
          </div>

          {/* Score Factors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {healthScore.factors.map((factor, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-base font-medium block truncate">{factor.factor}</span>
                </div>
                <Badge variant="outline" className="shrink-0 font-bold text-base px-3 py-1">
                  +{factor.points}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Improvement Suggestions */}
        {healthScore.score < 100 && (
          <div className="pt-8 border-t mt-8">
            <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Unlock {100 - healthScore.score} More Points
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!repository.description && (
                <div className="flex items-start gap-3 p-4 rounded-xl border">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Add a description</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Help others understand your project (+10 pts)
                    </p>
                  </div>
                </div>
              )}
              {!repository.license && (
                <div className="flex items-start gap-3 p-4 rounded-xl border">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Add a license</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Clarify usage rights (+10 pts)
                    </p>
                  </div>
                </div>
              )}
              {(!repository.topics || repository.topics.length === 0) && (
                <div className="flex items-start gap-3 p-4 rounded-xl border">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Add topics</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Improve discoverability (+10 pts)
                    </p>
                  </div>
                </div>
              )}
              {repository.topics &&
                repository.topics.length > 0 &&
                repository.topics.length < 5 && (
                  <div className="flex items-start gap-3 p-4 rounded-xl border">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">Add more topics</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        You have {repository.topics.length} topics. Add more!
                      </p>
                    </div>
                  </div>
                )}
              {(Date.now() - new Date(repository.pushed_at)) / (1000 * 60 * 60 * 24) > 90 && (
                <div className="flex items-start gap-3 p-4 rounded-xl border">
                  <Clock className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Update more frequently</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Last updated{" "}
                      {Math.floor(
                        (Date.now() - new Date(repository.pushed_at)) / (1000 * 60 * 60 * 24)
                      )}{" "}
                      days ago (+10-20 pts)
                    </p>
                  </div>
                </div>
              )}
              {healthScore.score >= 80 && (
                <div className="md:col-span-2 flex items-start gap-3 p-4 rounded-xl border-2 border-green-600">
                  <Award className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-lg">Excellent repository health!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Keep up the great work maintaining this project!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
