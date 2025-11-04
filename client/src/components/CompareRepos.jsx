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
  Calendar,
  Users,
  GitCommit,
  GitPullRequest,
  Award,
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
} from "recharts";

export default function CompareRepos() {
  const [repo1Input, setRepo1Input] = useState("");
  const [repo2Input, setRepo2Input] = useState("");
  const [repo1Data, setRepo1Data] = useState(null);
  const [repo2Data, setRepo2Data] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRepoData = async (repoFullName) => {
    const [owner, repo] = repoFullName.split("/");
    if (!owner || !repo) {
      throw new Error("Invalid repository format. Use: owner/repo");
    }

    const response = await api.get(`/repository/${owner}/${repo}`);
    // Map the response to match expected structure
    const data = response.data.data;
    return {
      repo: data.repository,
      healthScore: data.healthScore,
    };
  };

  const handleCompare = async () => {
    if (!repo1Input.trim() || !repo2Input.trim()) {
      toast.error("Please enter both repository names");
      return;
    }

    try {
      setLoading(true);
      const [data1, data2] = await Promise.all([
        fetchRepoData(repo1Input.trim()),
        fetchRepoData(repo2Input.trim()),
      ]);

      console.log("Repo 1 Data:", data1);
      console.log("Repo 2 Data:", data2);

      setRepo1Data(data1);
      setRepo2Data(data2);
    } catch (error) {
      console.error("Failed to fetch repositories:", error);
      toast.error(error.response?.data?.message || "Failed to fetch repositories");
    } finally {
      setLoading(false);
    }
  };

  const getWinner = (value1, value2) => {
    if (value1 > value2) return "repo1";
    if (value2 > value1) return "repo2";
    return "tie";
  };

  const calculateWinner = () => {
    if (!repo1Data || !repo2Data) return null;

    let score1 = 0;
    let score2 = 0;

    // Stars
    if (repo1Data.repo.stargazers_count > repo2Data.repo.stargazers_count) score1++;
    else if (repo2Data.repo.stargazers_count > repo1Data.repo.stargazers_count) score2++;

    // Forks
    if (repo1Data.repo.forks_count > repo2Data.repo.forks_count) score1++;
    else if (repo2Data.repo.forks_count > repo1Data.repo.forks_count) score2++;

    // Health Score
    if (repo1Data.healthScore.score > repo2Data.healthScore.score) score1++;
    else if (repo2Data.healthScore.score > repo1Data.healthScore.score) score2++;

    // Watchers
    if (repo1Data.repo.watchers_count > repo2Data.repo.watchers_count) score1++;
    else if (repo2Data.repo.watchers_count > repo1Data.repo.watchers_count) score2++;

    // Lower open issues is better
    if (repo1Data.repo.open_issues_count < repo2Data.repo.open_issues_count) score1++;
    else if (repo2Data.repo.open_issues_count < repo1Data.repo.open_issues_count) score2++;

    return { score1, score2 };
  };

  const getRadarData = () => {
    if (!repo1Data || !repo2Data) return [];

    const maxStars = Math.max(repo1Data.repo.stargazers_count, repo2Data.repo.stargazers_count);
    const maxForks = Math.max(repo1Data.repo.forks_count, repo2Data.repo.forks_count);
    const maxWatchers = Math.max(repo1Data.repo.watchers_count, repo2Data.repo.watchers_count);
    const maxHealth = 100;
    const maxIssues = Math.max(repo1Data.repo.open_issues_count, repo2Data.repo.open_issues_count);

    return [
      {
        metric: "Stars",
        [repo1Data.repo.name]: (repo1Data.repo.stargazers_count / maxStars) * 100,
        [repo2Data.repo.name]: (repo2Data.repo.stargazers_count / maxStars) * 100,
      },
      {
        metric: "Forks",
        [repo1Data.repo.name]: (repo1Data.repo.forks_count / maxForks) * 100,
        [repo2Data.repo.name]: (repo2Data.repo.forks_count / maxForks) * 100,
      },
      {
        metric: "Watchers",
        [repo1Data.repo.name]: (repo1Data.repo.watchers_count / maxWatchers) * 100,
        [repo2Data.repo.name]: (repo2Data.repo.watchers_count / maxWatchers) * 100,
      },
      {
        metric: "Health",
        [repo1Data.repo.name]: (repo1Data.healthScore.score / maxHealth) * 100,
        [repo2Data.repo.name]: (repo2Data.healthScore.score / maxHealth) * 100,
      },
      {
        metric: "Activity",
        [repo1Data.repo.name]:
          maxIssues > 0 ? 100 - (repo1Data.repo.open_issues_count / maxIssues) * 100 : 50,
        [repo2Data.repo.name]:
          maxIssues > 0 ? 100 - (repo2Data.repo.open_issues_count / maxIssues) * 100 : 50,
      },
    ];
  };

  const StatComparison = ({ label, value1, value2, icon: Icon, format = (v) => v }) => {
    const winner = getWinner(value1, value2);

    return (
      <div className="flex items-center justify-between py-3 border-b last:border-0">
        <div className="flex items-center gap-2 flex-1">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-8">
          <span
            className={`text-sm font-bold ${
              winner === "repo1" ? "text-green-600" : "text-muted-foreground"
            }`}
          >
            {format(value1)}
          </span>
          <span className="text-xs text-muted-foreground">vs</span>
          <span
            className={`text-sm font-bold ${
              winner === "repo2" ? "text-green-600" : "text-muted-foreground"
            }`}
          >
            {format(value2)}
          </span>
        </div>
      </div>
    );
  };

  const winner = calculateWinner();
  const radarData = getRadarData();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Input Section */}
      <Card className="border-2 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl sm:text-3xl">
            <Code className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            Compare GitHub Repositories
          </CardTitle>
          <CardDescription className="text-sm sm:text-base mt-2.5">
            Enter two repository names to see a detailed side-by-side comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="owner/repo (e.g., facebook/react)"
              value={repo1Input}
              onChange={(e) => setRepo1Input(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCompare()}
              disabled={loading}
              className="flex-1"
            />
            <span className="text-muted-foreground self-center font-bold">VS</span>
            <Input
              placeholder="owner/repo (e.g., vuejs/vue)"
              value={repo2Input}
              onChange={(e) => setRepo2Input(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCompare()}
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={handleCompare} disabled={loading} className="whitespace-nowrap">
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
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

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Fetching repository data...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Results */}
      {repo1Data && repo2Data && repo1Data.repo && repo2Data.repo && winner && (
        <>
          {/* Winner Banner */}
          {winner.score1 !== winner.score2 && (
            <Card className="border-2 border-yellow-500 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
              <CardContent className="py-6">
                <div className="flex items-center justify-center gap-4">
                  <Trophy className="h-12 w-12 text-yellow-500" />
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">
                      {winner.score1 > winner.score2
                        ? repo1Data.repo.full_name
                        : repo2Data.repo.full_name}{" "}
                      Wins!
                    </h2>
                    <p className="text-muted-foreground">
                      Score: {Math.max(winner.score1, winner.score2)} -{" "}
                      {Math.min(winner.score1, winner.score2)}
                    </p>
                  </div>
                  <Trophy className="h-12 w-12 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Repository Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Repo 1 */}
            <Card className={winner.score1 > winner.score2 ? "border-2 border-green-500" : ""}>
              <CardHeader>
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    {repo1Data.repo.full_name}
                  </CardTitle>
                  <CardDescription>
                    {repo1Data.repo.description || "No description"}
                  </CardDescription>
                  {winner.score1 > winner.score2 && (
                    <Badge className="bg-green-500">
                      <Trophy className="h-3 w-3 mr-1" />
                      Winner
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    <Star className="h-3 w-3 mr-1" />
                    {repo1Data.repo.stargazers_count.toLocaleString()} stars
                  </Badge>
                  <Badge variant="secondary">
                    <GitFork className="h-3 w-3 mr-1" />
                    {repo1Data.repo.forks_count.toLocaleString()} forks
                  </Badge>
                  <Badge variant="secondary">
                    <Eye className="h-3 w-3 mr-1" />
                    {repo1Data.repo.watchers_count.toLocaleString()} watchers
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground">Health Score</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{repo1Data.healthScore.score}</span>
                    <Badge>{repo1Data.healthScore.grade}</Badge>
                  </div>
                </div>
                <Progress value={repo1Data.healthScore.score} className="h-2" />
              </CardContent>
            </Card>

            {/* Repo 2 */}
            <Card className={winner.score2 > winner.score1 ? "border-2 border-green-500" : ""}>
              <CardHeader>
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    {repo2Data.repo.full_name}
                  </CardTitle>
                  <CardDescription>
                    {repo2Data.repo.description || "No description"}
                  </CardDescription>
                  {winner.score2 > winner.score1 && (
                    <Badge className="bg-green-500">
                      <Trophy className="h-3 w-3 mr-1" />
                      Winner
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    <Star className="h-3 w-3 mr-1" />
                    {repo2Data.repo.stargazers_count.toLocaleString()} stars
                  </Badge>
                  <Badge variant="secondary">
                    <GitFork className="h-3 w-3 mr-1" />
                    {repo2Data.repo.forks_count.toLocaleString()} forks
                  </Badge>
                  <Badge variant="secondary">
                    <Eye className="h-3 w-3 mr-1" />
                    {repo2Data.repo.watchers_count.toLocaleString()} watchers
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground">Health Score</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{repo2Data.healthScore.score}</span>
                    <Badge>{repo2Data.healthScore.grade}</Badge>
                  </div>
                </div>
                <Progress value={repo2Data.healthScore.score} className="h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Detailed Comparison Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
              <TabsTrigger value="overview" className="text-xs sm:text-sm px-3 sm:px-4">
                Overview
              </TabsTrigger>
              <TabsTrigger value="stats" className="text-xs sm:text-sm px-3 sm:px-4">
                Statistics
              </TabsTrigger>
              <TabsTrigger value="health" className="text-xs sm:text-sm px-3 sm:px-4">
                Health
              </TabsTrigger>
              <TabsTrigger value="radar" className="text-xs sm:text-sm px-3 sm:px-4">
                Radar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Repo 1 Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>{repo1Data.repo.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Language</span>
                      <Badge>{repo1Data.repo.language || "N/A"}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">License</span>
                      <span className="text-sm">{repo1Data.repo.license?.name || "None"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span className="text-sm">
                        {new Date(repo1Data.repo.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span className="text-sm">
                        {new Date(repo1Data.repo.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Open Issues</span>
                      <Badge variant="outline">{repo1Data.repo.open_issues_count}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Repo 2 Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>{repo2Data.repo.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Language</span>
                      <Badge>{repo2Data.repo.language || "N/A"}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">License</span>
                      <span className="text-sm">{repo2Data.repo.license?.name || "None"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span className="text-sm">
                        {new Date(repo2Data.repo.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span className="text-sm">
                        {new Date(repo2Data.repo.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Open Issues</span>
                      <Badge variant="outline">{repo2Data.repo.open_issues_count}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Statistics Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StatComparison
                    label="Stars"
                    value1={repo1Data.repo.stargazers_count}
                    value2={repo2Data.repo.stargazers_count}
                    icon={Star}
                    format={(v) => v.toLocaleString()}
                  />
                  <StatComparison
                    label="Forks"
                    value1={repo1Data.repo.forks_count}
                    value2={repo2Data.repo.forks_count}
                    icon={GitFork}
                    format={(v) => v.toLocaleString()}
                  />
                  <StatComparison
                    label="Watchers"
                    value1={repo1Data.repo.watchers_count}
                    value2={repo2Data.repo.watchers_count}
                    icon={Eye}
                    format={(v) => v.toLocaleString()}
                  />
                  <StatComparison
                    label="Open Issues"
                    value1={repo1Data.repo.open_issues_count}
                    value2={repo2Data.repo.open_issues_count}
                    icon={AlertCircle}
                    format={(v) => v.toLocaleString()}
                  />
                  <StatComparison
                    label="Size (KB)"
                    value1={repo1Data.repo.size}
                    value2={repo2Data.repo.size}
                    icon={TrendingUp}
                    format={(v) => v.toLocaleString()}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="health" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Repo 1 Health */}
                <Card>
                  <CardHeader>
                    <CardTitle>{repo1Data.repo.name} Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold mb-2">{repo1Data.healthScore.score}</div>
                      <Badge className="text-lg px-4 py-1">{repo1Data.healthScore.grade}</Badge>
                    </div>
                    <Progress value={repo1Data.healthScore.score} className="h-3" />
                    <div className="space-y-2 mt-4">
                      {repo1Data.healthScore.factors?.map((factor, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{factor.factor}</span>
                          <Badge variant="outline">+{factor.points}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Repo 2 Health */}
                <Card>
                  <CardHeader>
                    <CardTitle>{repo2Data.repo.name} Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold mb-2">{repo2Data.healthScore.score}</div>
                      <Badge className="text-lg px-4 py-1">{repo2Data.healthScore.grade}</Badge>
                    </div>
                    <Progress value={repo2Data.healthScore.score} className="h-3" />
                    <div className="space-y-2 mt-4">
                      {repo2Data.healthScore.factors?.map((factor, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{factor.factor}</span>
                          <Badge variant="outline">+{factor.points}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="radar">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Radar</CardTitle>
                  <CardDescription>Normalized comparison across multiple metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name={repo1Data.repo.name}
                          dataKey={repo1Data.repo.name}
                          stroke="#667eea"
                          fill="#667eea"
                          fillOpacity={0.5}
                        />
                        <Radar
                          name={repo2Data.repo.name}
                          dataKey={repo2Data.repo.name}
                          stroke="#f59e0b"
                          fill="#f59e0b"
                          fillOpacity={0.5}
                        />
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
