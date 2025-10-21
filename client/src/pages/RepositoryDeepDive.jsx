import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  GitFork,
  Star,
  Eye,
  AlertCircle,
  GitPullRequest,
  Code,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  History, // Import the History icon
} from "lucide-react";
import { getRepositoryInsights } from "@/lib/github";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#667eea", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];

export default function RepositoryDeepDive() {
  const { owner, repo } = useParams();
  const navigate = useNavigate();

  const [ownerInput, setOwnerInput] = useState(owner || "");
  const [repoInput, setRepoInput] = useState(repo || "");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [error, setError] = useState(null); // Add error state

  // Auto-fetch when URL params are present
  useEffect(() => {
    if (owner && repo) {
      fetchRepositoryWithParams(owner, repo);
    }
  }, [owner, repo]);

  async function fetchRepositoryWithParams(ownerParam, repoParam, refresh = false) {
    setLoading(true);
    setError(null); // Clear previous errors
    setLastUpdated("");
    try {
      const response = await getRepositoryInsights(ownerParam, repoParam, refresh);
      if (!response?.data) {
        throw new Error("Received no data for this repository.");
      }
      setData(response.data);
      setLastUpdated(new Date(response.lastUpdated).toLocaleString());
    } catch (err) {
      console.error(err);
      setError("Failed to load repository data.");
      toast.error("Failed to load repository data.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchRepository() {
    if (!ownerInput || !repoInput) {
      toast.error("Please enter both owner and repository name");
      return;
    }

    setLoading(true);
    try {
      // This initial fetch doesn't need refresh=true
      const response = await getRepositoryInsights(ownerInput, repoInput);
      setData(response.data);
      toast.success("Repository analyzed!");
      navigate(`/repo/${ownerInput}/${repoInput}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to fetch repository data");
    } finally {
      setLoading(false);
    }
  }

  const getHealthColor = (score) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getHealthBg = (score) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (!data) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 sm:mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl sm:text-3xl">
                <Code className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
                Repository Deep Dive
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Analyze any GitHub repository with detailed insights and health metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Owner</label>
                    <Input
                      placeholder="facebook"
                      value={ownerInput}
                      onChange={(e) => setOwnerInput(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Repository</label>
                    <Input
                      placeholder="react"
                      value={repoInput}
                      onChange={(e) => setRepoInput(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <Button onClick={fetchRepository} className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Analyze Repository
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const {
    repository,
    languages,
    commits,
    contributors,
    issues,
    pullRequests,
    healthScore,
    commitFrequency,
  } = data;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        {/* Add Refresh Button and Timestamp here */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => fetchRepositoryWithParams(owner, repo, true)}
            disabled={loading || !owner || !repo}
          >
            <History className="h-4 w-4 mr-2" />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          {lastUpdated && <p className="text-sm text-muted-foreground hidden sm:block">Last updated: {lastUpdated}</p>}
        </div>
      </div>

      {error && <div className="text-red-500 text-center my-4">{error}</div>}

      {/* Repository Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={repository.owner.avatar_url}
                  alt={repository.owner.login}
                  className="h-12 w-12 rounded-full"
                />
                <div>
                  <CardTitle className="text-2xl">{repository.full_name}</CardTitle>
                  <CardDescription>{repository.description}</CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="secondary">
                  <Star className="h-3 w-3 mr-1" />
                  {repository.stargazers_count.toLocaleString()} stars
                </Badge>
                <Badge variant="secondary">
                  <GitFork className="h-3 w-3 mr-1" />
                  {repository.forks_count.toLocaleString()} forks
                </Badge>
                <Badge variant="secondary">
                  <Eye className="h-3 w-3 mr-1" />
                  {repository.watchers_count.toLocaleString()} watchers
                </Badge>
                <Badge variant="secondary">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {repository.open_issues_count} open issues
                </Badge>
                {repository.license && <Badge variant="outline">{repository.license.name}</Badge>}
              </div>
              {repository.topics?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {repository.topics.map((topic) => (
                    <Badge
                      key={topic}
                      className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Health Score */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Repository Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-4">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getHealthColor(healthScore.score)}`}>
                {healthScore.grade}
              </div>
              <div className="text-2xl font-semibold mt-2">{healthScore.score}/100</div>
            </div>
            <div className="flex-1">
              <Progress value={healthScore.percentage} className="h-4 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {healthScore.factors.map((factor, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>{factor.factor}</span>
                    <Badge variant="outline" className="ml-auto">
                      +{factor.points}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Improvement Suggestions */}
          {healthScore.score < 100 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                How to Improve Your Score ({100 - healthScore.score} points available)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {!repository.description && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-600">Add a description</p>
                      <p className="text-muted-foreground mt-1">
                        Help others understand what your project does (+10 pts)
                      </p>
                    </div>
                  </div>
                )}
                {!repository.license && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-600">Add a license</p>
                      <p className="text-muted-foreground mt-1">
                        Choose a license to clarify usage rights (+10 pts)
                      </p>
                    </div>
                  </div>
                )}
                {(!repository.topics || repository.topics.length === 0) && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-600">Add topics</p>
                      <p className="text-muted-foreground mt-1">
                        Tag your repo to improve discoverability (+10 pts)
                      </p>
                    </div>
                  </div>
                )}
                {repository.topics &&
                  repository.topics.length > 0 &&
                  repository.topics.length < 5 && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-600">Add more topics</p>
                        <p className="text-muted-foreground mt-1">
                          You have {repository.topics.length} topics. Add more for better
                          discoverability!
                        </p>
                      </div>
                    </div>
                  )}
                {(Date.now() - new Date(repository.pushed_at)) / (1000 * 60 * 60 * 24) > 90 && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <Clock className="h-4 w-4 text-orange-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-600">Update more frequently</p>
                      <p className="text-muted-foreground mt-1">
                        Last updated{" "}
                        {Math.floor(
                          (Date.now() - new Date(repository.pushed_at)) / (1000 * 60 * 60 * 24)
                        )}{" "}
                        days ago (+10-20 pts)
                      </p>
                    </div>
                  </div>
                )}
                {(Date.now() - new Date(repository.pushed_at)) / (1000 * 60 * 60 * 24) > 7 &&
                  (Date.now() - new Date(repository.pushed_at)) / (1000 * 60 * 60 * 24) <= 90 && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <Clock className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-600">Keep your momentum</p>
                        <p className="text-muted-foreground mt-1">
                          Update within a week to maintain your +20 pts bonus
                        </p>
                      </div>
                    </div>
                  )}
                {issues.closeRate >= 50 && issues.closeRate < 80 && issues.total > 0 && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-600">Improve issue close rate</p>
                      <p className="text-muted-foreground mt-1">
                        Current: {issues.closeRate}%. Get to 80%+ for full points (+
                        {20 - Math.floor(issues.closeRate * 0.2)} more pts available)
                      </p>
                    </div>
                  </div>
                )}
                {issues.closeRate < 50 && issues.total > 0 && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-600">Close more issues</p>
                      <p className="text-muted-foreground mt-1">
                        Current close rate: {issues.closeRate}% (target: 50%+ for +20 pts)
                      </p>
                    </div>
                  </div>
                )}
                {pullRequests.mergeRate >= 50 &&
                  pullRequests.mergeRate < 80 &&
                  pullRequests.total > 0 && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <GitPullRequest className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-600">Improve PR merge rate</p>
                        <p className="text-muted-foreground mt-1">
                          Current: {pullRequests.mergeRate}%. Get to 80%+ for full points (+
                          {20 - Math.floor(pullRequests.mergeRate * 0.2)} more pts available)
                        </p>
                      </div>
                    </div>
                  )}
                {pullRequests.mergeRate < 50 && pullRequests.total > 0 && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <GitPullRequest className="h-4 w-4 text-orange-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-600">Merge more pull requests</p>
                      <p className="text-muted-foreground mt-1">
                        Current merge rate: {pullRequests.mergeRate}% (target: 50%+ for +20 pts)
                      </p>
                    </div>
                  </div>
                )}
                {commits.total >= 20 && commits.total < 50 && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Code className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-600">Increase commit activity</p>
                      <p className="text-muted-foreground mt-1">
                        {commits.total} commits. Reach 50+ for maximum points (+5 more pts
                        available)
                      </p>
                    </div>
                  </div>
                )}
                {commits.total < 20 && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <Code className="h-4 w-4 text-orange-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-600">Increase commit activity</p>
                      <p className="text-muted-foreground mt-1">
                        {commits.total} commits (target: 20+ for +5 pts, 50+ for +10 pts)
                      </p>
                    </div>
                  </div>
                )}
                {healthScore.score >= 80 && (
                  <div className="md:col-span-2 flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <Award className="h-4 w-4 text-green-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-green-600">Excellent repository health! 🎉</p>
                      <p className="text-muted-foreground mt-1">
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

      <Tabs defaultValue="languages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1">
          <TabsTrigger value="languages" className="text-xs sm:text-sm">
            Languages
          </TabsTrigger>
          <TabsTrigger value="commits" className="text-xs sm:text-sm">
            Commits
          </TabsTrigger>
          <TabsTrigger value="contributors" className="text-xs sm:text-sm">
            Contributors
          </TabsTrigger>
          <TabsTrigger value="issues" className="text-xs sm:text-sm">
            Issues & PRs
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs sm:text-sm">
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="languages">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Language Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={languages}
                        dataKey="percentage"
                        nameKey="language"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `${entry.language} (${entry.percentage}%)`}
                      >
                        {languages.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Language Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {languages.map((lang, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{lang.language}</span>
                        <span className="text-muted-foreground">{lang.percentage}%</span>
                      </div>
                      <Progress value={parseFloat(lang.percentage)} />
                      <div className="text-xs text-muted-foreground">
                        {(lang.bytes / 1024).toFixed(2)} KB
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="commits">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Commit Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Commits</span>
                  <span className="font-semibold">{commits.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Conventional Commits</span>
                  <span className="font-semibold">{commits.conventionalCommitPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Message Length</span>
                  <span className="font-semibold">{commits.avgMessageLength} chars</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Top Author</span>
                  <span className="font-semibold">{commits.authors[0]?.name}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commit Frequency (Weekly)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={commitFrequency}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" hide />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#667eea" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Commits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commits.recentCommits.map((commit) => (
                  <div
                    key={commit.sha}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <Badge variant="outline" className="font-mono">
                      {commit.sha}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{commit.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {commit.author} • {new Date(commit.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributors">
          <Card>
            <CardHeader>
              <CardTitle>Top Contributors</CardTitle>
              <CardDescription>Top 10 contributors by commit count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contributors.map((contributor, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <Badge className={getHealthBg(100 - idx * 10)}>{idx + 1}</Badge>
                      <img
                        src={contributor.avatar_url}
                        alt={contributor.login}
                        className="h-10 w-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{contributor.login}</p>
                        <p className="text-sm text-muted-foreground">
                          {contributor.contributions} contributions ({contributor.percentage}%)
                        </p>
                      </div>
                    </div>
                    <Progress value={parseFloat(contributor.percentage)} className="w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Issues
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total</span>
                  <Badge variant="secondary">{issues.total}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Open</span>
                  <Badge className="bg-green-500">{issues.open}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Closed</span>
                  <Badge variant="outline">{issues.closed}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Close Rate</span>
                  <span className="font-semibold">{issues.closeRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Avg Time to Close</span>
                  <span className="font-semibold">{issues.avgTimeToCloseDays} days</span>
                </div>
                <Progress value={parseFloat(issues.closeRate)} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitPullRequest className="h-5 w-5" />
                  Pull Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total</span>
                  <Badge variant="secondary">{pullRequests.total}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Open</span>
                  <Badge className="bg-blue-500">{pullRequests.open}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Merged</span>
                  <Badge className="bg-purple-500">{pullRequests.merged}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Merge Rate</span>
                  <span className="font-semibold">{pullRequests.mergeRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Avg Time to Merge</span>
                  <span className="font-semibold">{pullRequests.avgTimeToMergeDays} days</span>
                </div>
                <Progress value={parseFloat(pullRequests.mergeRate)} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Commits by Hour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={commits.hourDistribution.map((count, hour) => ({
                        hour: `${hour}:00`,
                        count,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#667eea" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commits by Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={commits.dayDistribution.map((count, day) => ({
                        day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day],
                        count,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Repository Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium">
                        {new Date(repository.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="font-medium">
                        {new Date(repository.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Last Push</p>
                      <p className="font-medium">
                        {new Date(repository.pushed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
