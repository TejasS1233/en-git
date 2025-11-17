import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  GitFork,
  Eye,
  AlertCircle,
  TrendingUp,
  Code,
  Trophy,
  Users,
  GitCommit,
  GitPullRequest,
  Award,
  Plus,
  X,
  Sparkles,
  Loader2,
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";

export default function CompareRepos() {
  const [repoInputs, setRepoInputs] = useState(["", ""]);
  const [reposData, setReposData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const fetchRepoData = async (repoFullName) => {
    const [owner, repo] = repoFullName.split("/");
    if (!owner || !repo) {
      throw new Error("Invalid repository format. Use: owner/repo");
    }

    const response = await api.get(`/repository/${owner}/${repo}`);
    const data = response.data.data;
    return {
      ...data.repository,
      healthScore: data.healthScore,
      commits: data.commits,
      contributors: data.contributors,
      totalContributors: data.totalContributors,
      issues: data.issues,
      pullRequests: data.pullRequests,
      commitFrequency: data.commitFrequency,
      languages: data.languages,
    };
  };

  const handleCompare = async () => {
    const validInputs = repoInputs.filter((input) => input.trim());
    if (validInputs.length < 2) {
      toast.error("Please enter at least 2 repository names");
      return;
    }

    try {
      setLoading(true);
      setAiAnalysis(null);
      const dataPromises = validInputs.map((input) => fetchRepoData(input.trim()));
      const results = await Promise.all(dataPromises);
      setReposData(results);
      toast.success("Comparison complete!");

      // Auto-generate AI analysis
      generateAIAnalysis(results);
    } catch (error) {
      console.error("Failed to fetch repositories:", error);
      toast.error(error.response?.data?.message || "Failed to fetch repositories");
    } finally {
      setLoading(false);
    }
  };

  const generateAIAnalysis = async (repos) => {
    try {
      setLoadingAI(true);
      console.log(
        "Sending AI analysis request with repos:",
        repos.map((r) => r.full_name)
      );
      const response = await api.post("/repository/compare/ai-analysis", {
        repositories: repos,
      });
      console.log("AI analysis response:", response.data);

      // Parse the analysis text and extract winner
      const analysisText = response.data.data.analysis;
      let aiWinner = null;
      let cleanedText = analysisText;

      // Check if analysis starts with WINNER: declaration or contains "X wins"
      let winnerMatch = analysisText.match(/^WINNER:\s*(.+?)$/m);
      if (!winnerMatch) {
        // Try to find "X wins" in the verdict section (handles backticks)
        winnerMatch = analysisText.match(/`([^`]+)`\s+wins/i);
      }
      if (!winnerMatch) {
        // Try without backticks
        winnerMatch = analysisText.match(/(\S+\/\S+)\s+wins/i);
      }

      if (winnerMatch) {
        aiWinner = winnerMatch[1].trim().replace(/`/g, ""); // Remove backticks
        console.log("AI Winner detected:", aiWinner);
        // Remove the WINNER line from display text if it exists
        cleanedText = analysisText.replace(/^WINNER:\s*.+?\n\n?/m, "");
      } else {
        console.log("No AI winner detected in analysis");
      }

      setAiAnalysis({ text: cleanedText, winner: aiWinner });
      toast.success("AI analysis generated!");
    } catch (error) {
      console.error("Failed to generate AI analysis:", error);
      console.error("Error details:", error.response?.data);

      // Show fallback analysis if available
      if (error.response?.data?.data?.analysis) {
        setAiAnalysis(error.response.data.data.analysis);
        toast.warning("Using fallback AI analysis");
      } else {
        toast.error(error.response?.data?.message || "AI analysis unavailable - check server logs");
      }
    } finally {
      setLoadingAI(false);
    }
  };

  const addRepoInput = () => {
    if (repoInputs.length < 5) {
      setRepoInputs([...repoInputs, ""]);
    } else {
      toast.error("Maximum 5 repositories allowed");
    }
  };

  const removeRepoInput = (index) => {
    if (repoInputs.length > 2) {
      const newInputs = repoInputs.filter((_, i) => i !== index);
      setRepoInputs(newInputs);
    }
  };

  const updateRepoInput = (index, value) => {
    const newInputs = [...repoInputs];
    newInputs[index] = value;
    setRepoInputs(newInputs);
  };

  const calculateWinner = () => {
    if (reposData.length < 2) return null;

    const scores = reposData.map((repo, idx) => {
      let score = 0;
      score += repo.stargazers_count / 100;
      score += repo.forks_count / 10;
      score += repo.healthScore?.score || 0;
      score += repo.watchers_count / 50;
      score -= repo.open_issues_count / 10;

      // Add AI bonus if this repo was declared winner by AI (20% weight)
      if (aiAnalysis?.winner) {
        const aiWinnerName = aiAnalysis.winner.toLowerCase();
        const repoName = (repo.full_name || repo.name || "").toLowerCase();
        if (aiWinnerName.includes(repoName) || repoName.includes(aiWinnerName)) {
          score += score * 0.2; // 20% bonus for AI-declared winner
          console.log(`AI bonus applied to ${repo.full_name}: +${(score * 0.2).toFixed(2)}`);
        }
      }

      return score;
    });

    const maxScore = Math.max(...scores);
    const winnerIndex = scores.indexOf(maxScore);
    return { winnerIndex, scores };
  };

  const getStarGrowthData = () => {
    if (reposData.length === 0) return [];

    const allWeeks = new Set();
    reposData.forEach((repo) => {
      repo.commitFrequency?.forEach((item) => allWeeks.add(item.week));
    });

    const sortedWeeks = Array.from(allWeeks).sort();

    return sortedWeeks.map((week) => {
      const dataPoint = { week };
      reposData.forEach((repo, idx) => {
        const weekData = repo.commitFrequency?.find((item) => item.week === week);
        dataPoint[repo.name] = weekData?.count || 0;
      });
      return dataPoint;
    });
  };

  const getRadarData = () => {
    if (reposData.length === 0) return [];

    const metrics = ["Stars", "Forks", "Watchers", "Health", "Activity"];

    return metrics.map((metric) => {
      const dataPoint = { metric };

      reposData.forEach((repo) => {
        let value = 0;
        const maxValues = {
          Stars: Math.max(...reposData.map((r) => r.stargazers_count)),
          Forks: Math.max(...reposData.map((r) => r.forks_count)),
          Watchers: Math.max(...reposData.map((r) => r.watchers_count)),
          Health: 100,
          Activity: Math.max(...reposData.map((r) => r.commits?.total || 0)),
        };

        switch (metric) {
          case "Stars":
            value = (repo.stargazers_count / maxValues.Stars) * 100;
            break;
          case "Forks":
            value = (repo.forks_count / maxValues.Forks) * 100;
            break;
          case "Watchers":
            value = (repo.watchers_count / maxValues.Watchers) * 100;
            break;
          case "Health":
            value = repo.healthScore?.score || 0;
            break;
          case "Activity":
            value = ((repo.commits?.total || 0) / maxValues.Activity) * 100;
            break;
        }

        dataPoint[repo.name] = value;
      });

      return dataPoint;
    });
  };

  const COLORS = ["#667eea", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

  const winner = calculateWinner();
  const starGrowthData = getStarGrowthData();
  const radarData = getRadarData();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Input Section */}
      <Card className="border-2 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Code className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
            Compare GitHub Repositories
          </CardTitle>
          <CardDescription className="text-sm sm:text-base mt-2.5">
            Compare up to 5 repositories with AI-powered insights and advanced analytics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {repoInputs.map((input, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Repository ${index + 1} (e.g., facebook/react)`}
                value={input}
                onChange={(e) => updateRepoInput(index, e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCompare()}
                disabled={loading}
                className="flex-1"
              />
              {repoInputs.length > 2 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeRepoInput(index)}
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <div className="flex gap-2">
            {repoInputs.length < 5 && (
              <Button
                variant="outline"
                onClick={addRepoInput}
                disabled={loading}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Repository
              </Button>
            )}
            <Button onClick={handleCompare} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4 mr-2" />
                  Compare
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Section */}
      {reposData.length >= 2 && (
        <Card className="border-2 border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                AI-Powered Head-to-Head Analysis
              </CardTitle>
              {!loadingAI && (
                <Button
                  onClick={() => generateAIAnalysis(reposData)}
                  disabled={loadingAI}
                  variant="outline"
                  size="sm"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {aiAnalysis ? "Regenerate" : "Generate"} Analysis
                </Button>
              )}
            </div>
            <CardDescription>
              Elite AI analyst comparing repositories across momentum, community health, and
              technical maturity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAI ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
                <p className="text-lg font-semibold mb-2">Analyzing repositories...</p>
                <p className="text-sm text-muted-foreground">
                  Our AI is evaluating momentum, community health, and technical maturity
                </p>
              </div>
            ) : aiAnalysis ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="p-6 bg-background rounded-lg border">
                  <div
                    className="whitespace-pre-wrap leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: aiAnalysis.text
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\*(.*?)\*/g, "<em>$1</em>")
                        .replace(
                          /^### (.*$)/gim,
                          "<h3 class='text-lg font-semibold mt-4 mb-2'>$1</h3>"
                        )
                        .replace(/^## (.*$)/gim, "<h2 class='text-xl font-bold mt-6 mb-3'>$1</h2>")
                        .replace(/^# (.*$)/gim, "<h1 class='text-2xl font-bold mt-8 mb-4'>$1</h1>")
                        .replace(/\n\n/g, "</p><p class='mt-3'>")
                        .replace(/^(.+)$/gm, "<p>$1</p>")
                        .replace(/<p><\/p>/g, "")
                        .replace(/^- (.*$)/gim, "<li class='ml-4'>$1</li>")
                        .replace(/(<li.*<\/li>)/s, "<ul class='list-disc space-y-1 my-2'>$1</ul>"),
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="h-16 w-16 mx-auto mb-4 text-purple-500/50" />
                <h3 className="text-lg font-semibold mb-2">AI Analysis Available</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get expert insights on which repository wins and why
                </p>
                <Button onClick={() => generateAIAnalysis(reposData)} disabled={loadingAI}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate AI Analysis
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {reposData.length >= 2 && winner && (
        <>
          {/* Winner Banner */}
          <Card className="border-2 border-cyan-500">
            <CardContent className="py-6">
              <div className="flex items-center justify-center gap-4">
                <Trophy className="h-12 w-12 text-cyan-600 dark:text-cyan-400" />
                <div className="text-center">
                  <h2 className="text-2xl font-bold">
                    {reposData[winner.winnerIndex].full_name} Wins!
                  </h2>
                  <p className="text-muted-foreground">
                    Score: {winner.scores[winner.winnerIndex].toFixed(0)}
                  </p>
                  {aiAnalysis?.winner && (
                    <Badge className="mt-2 bg-cyan-600">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI-Influenced Decision
                    </Badge>
                  )}
                </div>
                <Trophy className="h-12 w-12 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          {/* Repository Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reposData.map((repo, index) => (
              <Card
                key={index}
                className={winner.winnerIndex === index ? "border-2 border-green-500" : ""}
              >
                <CardHeader>
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Code className="h-4 w-4" />
                      {repo.name}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {repo.description || "No description"}
                    </CardDescription>
                    {winner.winnerIndex === index && (
                      <Badge className="bg-cyan-600">
                        <Trophy className="h-3 w-3 mr-1" />
                        Winner
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      {repo.stargazers_count.toLocaleString()}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <GitFork className="h-3 w-3 mr-1" />
                      {repo.forks_count.toLocaleString()}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      {repo.watchers_count.toLocaleString()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Health Score</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{repo.healthScore?.score || 0}</span>
                      <Badge className="text-xs">{repo.healthScore?.grade || "N/A"}</Badge>
                    </div>
                  </div>
                  <Progress value={repo.healthScore?.score || 0} className="h-2" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts and Analytics */}
          <Tabs defaultValue="charts" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="health">Health</TabsTrigger>
              <TabsTrigger value="radar">Radar</TabsTrigger>
            </TabsList>

            <TabsContent value="charts" className="space-y-6">
              {/* Commit Velocity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitCommit className="h-5 w-5" />
                    Commit Velocity (Weekly)
                  </CardTitle>
                  <CardDescription>Commits per week over the last 12 weeks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={starGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        {reposData.map((repo, idx) => (
                          <Bar key={idx} dataKey={repo.name} fill={COLORS[idx]} />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Issue/PR Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Issue Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reposData.map((repo, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{repo.name}</span>
                            <span className="text-muted-foreground">
                              {repo.issues?.closeRate || 0}% closed
                            </span>
                          </div>
                          <Progress value={parseFloat(repo.issues?.closeRate || 0)} />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{repo.issues?.open || 0} open</span>
                            <span>{repo.issues?.closed || 0} closed</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GitPullRequest className="h-5 w-5" />
                      Pull Request Velocity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reposData.map((repo, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{repo.name}</span>
                            <span className="text-muted-foreground">
                              {repo.pullRequests?.mergeRate || 0}% merged
                            </span>
                          </div>
                          <Progress value={parseFloat(repo.pullRequests?.mergeRate || 0)} />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{repo.pullRequests?.merged || 0} merged</span>
                            <span>Avg: {repo.pullRequests?.avgTimeToMergeDays || 0}d</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Metric</th>
                          {reposData.map((repo, idx) => (
                            <th key={idx} className="text-right py-2">
                              {repo.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2">Stars</td>
                          {reposData.map((repo, idx) => (
                            <td key={idx} className="text-right">
                              {repo.stargazers_count.toLocaleString()}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Forks</td>
                          {reposData.map((repo, idx) => (
                            <td key={idx} className="text-right">
                              {repo.forks_count.toLocaleString()}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Watchers</td>
                          {reposData.map((repo, idx) => (
                            <td key={idx} className="text-right">
                              {repo.watchers_count.toLocaleString()}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Open Issues</td>
                          {reposData.map((repo, idx) => (
                            <td key={idx} className="text-right">
                              {repo.open_issues_count}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Contributors</td>
                          {reposData.map((repo, idx) => (
                            <td key={idx} className="text-right">
                              {repo.totalContributors || repo.contributors?.length || 0}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Total Commits</td>
                          {reposData.map((repo, idx) => (
                            <td key={idx} className="text-right">
                              {repo.commits?.total || 0}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Health Score</td>
                          {reposData.map((repo, idx) => (
                            <td key={idx} className="text-right font-bold">
                              {repo.healthScore?.score || 0}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="health" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reposData.map((repo, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="text-lg">{repo.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">
                          {repo.healthScore?.score || 0}
                        </div>
                        <Badge className="text-lg px-4 py-1">
                          {repo.healthScore?.grade || "N/A"}
                        </Badge>
                      </div>
                      <Progress value={repo.healthScore?.score || 0} className="h-3" />
                      <div className="space-y-2">
                        {repo.healthScore?.factors?.map((factor, fIdx) => (
                          <div key={fIdx} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{factor.factor}</span>
                            <Badge variant="outline" className="text-xs">
                              +{factor.points}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="radar">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Radar</CardTitle>
                  <CardDescription>Normalized comparison across key metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        {reposData.map((repo, idx) => (
                          <Radar
                            key={idx}
                            name={repo.name}
                            dataKey={repo.name}
                            stroke={COLORS[idx]}
                            fill={COLORS[idx]}
                            fillOpacity={0.5}
                          />
                        ))}
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
