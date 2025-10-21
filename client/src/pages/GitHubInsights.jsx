import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGithubInsights, getGithubRecommendations } from "@/lib/github";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import {
  Loader2,
  TrendingUp,
  Star,
  GitFork,
  Clock,
  Sparkles,
  Bookmark,
  FileDown,
  X,
  History,
} from "lucide-react";
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
  isBookmarked,
  getSearchHistory,
  addToSearchHistory,
  clearSearchHistory,
} from "@/lib/localStorage";
import { exportToPDF } from "@/lib/pdfExport";
import { InsightsLoadingSkeleton } from "@/components/ui/skeleton-components";
import { AIInsights } from "@/components/AIInsights";
import { GamificationBadges } from "@/components/GamificationBadges";
import { SkillRadarChart } from "@/components/SkillRadarChart";
import { TechStackBadges } from "@/components/TechStackBadges";
import { ShareCard } from "@/components/ShareCard";
import { ContributionHeatmap } from "@/components/ContributionHeatmap";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HistoricalChart } from "@/components/HistoricalChart";
import { TrendsComparison } from "@/components/TrendsComparison";
import { ProgressReport } from "@/components/ProgressReport";
import {
  createStatsSnapshot,
  getStatsComparison,
  getStatsTrends,
  getProgressReport,
} from "@/lib/statsHistory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export default function GitHubInsightsPage() {
  const { username: urlUsername } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState(urlUsername || "");
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    setBookmarks(getBookmarks());
    setSearchHistory(getSearchHistory());
  }, []);

  useEffect(() => {
    if (urlUsername) {
      fetchData(urlUsername);
      setBookmarked(isBookmarked(urlUsername));
    }
  }, [urlUsername]);

  async function fetchData(user, refresh = false) {
    setLoading(true);
    setError(null); // Clear previous errors
    setLastUpdated("");
    try {
      const [insResponse, recResponse] = await Promise.all([
        getGithubInsights(user, refresh),
        getGithubRecommendations(user, refresh),
      ]);

      if (!insResponse?.data || !recResponse?.data) {
        throw new Error("Received incomplete data from the server.");
      }

      setInsights(insResponse.data);
      setRecommendations(recResponse.data);

      const insTime = new Date(insResponse.lastUpdated);
      const recTime = new Date(recResponse.lastUpdated);
      setLastUpdated(insTime > recTime ? insTime.toLocaleString() : recTime.toLocaleString());

      // Add to search history
      addToSearchHistory(user, insResponse.data.user);
      setSearchHistory(getSearchHistory());

      toast.success("Insights loaded!");
    } catch (err) {
      console.error(err);
      setError("Failed to load insights. Please try again later.");
      toast.error("Failed to load insights.");
    } finally {
      setLoading(false);
    }
  }

  function toggleBookmark() {
    if (!insights) return;

    if (bookmarked) {
      removeBookmark(insights.user.login);
      setBookmarked(false);
      toast.success("Removed from bookmarks");
    } else {
      addBookmark(insights.user.login, insights.user);
      setBookmarked(true);
      toast.success("Added to bookmarks");
    }
    setBookmarks(getBookmarks());
  }

  function handleExportPDF() {
    if (!insights) return;
    toast.promise(exportToPDF(insights, recommendations, aiInsights), {
      loading: "Generating PDF...",
      success: "PDF downloaded successfully!",
      error: "Failed to generate PDF",
    });
  }

  function handleHistoryClick(user) {
    navigate(`/stats/${user}`);
  }

  function handleClearHistory() {
    clearSearchHistory();
    setSearchHistory([]);
    toast.success("Search history cleared");
  }

  async function handleFetch(e) {
    e?.preventDefault();
    if (!username.trim()) return toast.error("Please enter a GitHub username");
    navigate(`/stats/${username.trim()}`);
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground text-lg">
            Analyze your GitHub profile, discover top languages, trending projects, and personalized
            recommendations.
          </p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Enter GitHub Username</CardTitle>
            <CardDescription>
              Get insights and recommendations for any public profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleFetch} className="flex gap-2">
              <Input
                placeholder="octocat"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Analyze
              </Button>
            </form>

            {/* Search History */}
            {searchHistory.length > 0 && !urlUsername && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <History className="h-4 w-4" />
                    <span>Recent Searches</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearHistory}
                    className="h-6 text-xs"
                  >
                    Clear
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((item) => (
                    <Badge
                      key={item.username}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => handleHistoryClick(item.username)}
                    >
                      {item.username}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Bookmarks */}
            {bookmarks.length > 0 && !urlUsername && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bookmark className="h-4 w-4" />
                  <span>Bookmarked Profiles</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {bookmarks.map((item) => (
                    <Badge
                      key={item.username}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => handleHistoryClick(item.username)}
                    >
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {item.username}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {insights && (
          <div className="flex justify-center items-center gap-3">
            <Button variant="outline" onClick={() => fetchData(insights.user.login, true)} disabled={loading}>
              <History className="h-4 w-4 mr-2" />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="outline" onClick={toggleBookmark} disabled={loading}>
              <Bookmark className={`h-4 w-4 mr-2 ${bookmarked ? "fill-current" : ""}`} />
              {bookmarked ? "Bookmarked" : "Bookmark Profile"}
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <FileDown className="h-4 w-4 mr-2" />
              Export to PDF
            </Button>
          </div>
        )}

        {loading && <InsightsLoadingSkeleton />}
        {error && <div className="text-red-500 text-center my-4">{error}</div>}

        {insights && !loading && (
          <>
            <ProfileSummary
              user={insights.user}
              reposCount={insights.reposCount}
              domain={insights.domain}
              lastUpdated={lastUpdated} // Pass timestamp to summary component
            />

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="ai">AI Insights</TabsTrigger>
                <TabsTrigger value="share">Share</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <LanguagesChart languages={insights.languages} />
                  <TopRepos topStarred={insights.topStarred} topActive={insights.topActive} />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <TopicsCloud topics={insights.topics} />
                  <CommitTimingChart commitTimes={insights.commitTimes} />
                </div>
                <GamificationBadges insights={insights} />
                {recommendations && <RecommendationsSection recommendations={recommendations} />}
              </TabsContent>

              <TabsContent value="activity" className="space-y-6 mt-6">
                <WeeklyActivityChart weekly={insights.weekly} />
                <ContributionHeatmap insights={insights} />
              </TabsContent>

              <TabsContent value="skills" className="space-y-6 mt-6">
                <SkillRadarChart insights={insights} />
                <TechStackBadges insights={insights} />
              </TabsContent>

              <TabsContent value="history" className="space-y-6 mt-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Historical Stats</h2>
                  <div className="flex gap-2">
                    <Select
                      value={timePeriod}
                      onValueChange={(value) => {
                        setTimePeriod(value);
                        if (insights) loadHistoricalData(insights.user.login);
                      }}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Time period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">Last Week</SelectItem>
                        <SelectItem value="month">Last Month</SelectItem>
                        <SelectItem value="3months">Last 3 Months</SelectItem>
                        <SelectItem value="6months">Last 6 Months</SelectItem>
                        <SelectItem value="year">Last Year</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleCreateSnapshot} variant="outline">
                      Capture Snapshot
                    </Button>
                  </div>
                </div>

                {loadingHistory && (
                  <div className="text-center py-8">Loading historical data...</div>
                )}

                {!loadingHistory && comparison && (
                  <TrendsComparison comparison={comparison} period={timePeriod} />
                )}

                {!loadingHistory && trends && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {trends.followers?.length > 0 && (
                      <HistoricalChart
                        data={trends.followers}
                        metricName="Followers"
                        color="#8884d8"
                      />
                    )}
                    {trends.repos?.length > 0 && (
                      <HistoricalChart
                        data={trends.repos}
                        metricName="Repositories"
                        color="#82ca9d"
                      />
                    )}
                    {trends.stars?.length > 0 && (
                      <HistoricalChart
                        data={trends.stars}
                        metricName="Total Stars"
                        color="#ffc658"
                      />
                    )}
                  </div>
                )}

                {!loadingHistory && progressReport && <ProgressReport report={progressReport} />}

                {!loadingHistory && !comparison && !trends && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-muted-foreground mb-4">
                        No historical data available yet.
                      </p>
                      <Button onClick={handleCreateSnapshot}>Create First Snapshot</Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="ai" className="space-y-6">
                <AIInsights username={insights.user.login} onInsightsGenerated={setAiInsights} />
              </TabsContent>

              <TabsContent value="share" className="space-y-6 mt-6">
                <ShareCard insights={insights} username={insights.user.login} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

function ProfileSummary({ user, reposCount, domain, lastUpdated }) { // Add lastUpdated prop
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-start">
        <CardTitle>Profile Summary</CardTitle>
        {lastUpdated && <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>}
      </CardHeader>
      <CardContent className="flex items-start gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.avatar_url} alt={user.login} />
          <AvatarFallback>{user.login?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <h2 className="text-2xl font-bold">{user.name || user.login}</h2>
          <p className="text-muted-foreground">{user.bio || "No bio"}</p>
          <div className="flex gap-4 text-sm">
            <span>
              <strong>{user.public_repos || 0}</strong> repos
            </span>
            <span>
              <strong>{user.followers || 0}</strong> followers
            </span>
            <span>
              <strong>{user.following || 0}</strong> following
            </span>
          </div>
          <div className="flex gap-2 flex-wrap mt-2">
            <Badge variant="secondary">Domain: {domain?.domain || "Generalist"}</Badge>
            <Badge variant="outline">{reposCount} Repositories Analyzed</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LanguagesChart({ languages }) {
  const { top3, percentages } = languages;
  const chartData = percentages.slice(0, 10).map(([name, value]) => ({ name, value }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Programming Languages</CardTitle>
        <CardDescription>Distribution based on repository code</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4 flex-wrap">
          {top3.map(([lang, pct], i) => (
            <Badge key={i} style={{ backgroundColor: COLORS[i] }} className="text-white">
              {lang}: {pct}%
            </Badge>
          ))}
        </div>
        <ChartContainer
          config={Object.fromEntries(
            chartData.map(({ name }, i) => [name, { label: name, color: COLORS[i] }])
          )}
          className="h-[250px] w-full"
        >
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
              {chartData.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function TopRepos({ topStarred, topActive }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Starred & Active Repos</CardTitle>
        <CardDescription>Your top repositories by stars and activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" /> Most Starred
          </h3>
          <div className="space-y-1">
            {topStarred.map((r, i) => (
              <div key={i} className="flex justify-between text-sm">
                <a
                  href={r.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {r.name}
                </a>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {r.stargazers_count}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" /> Most Active
          </h3>
          <div className="space-y-1">
            {topActive.map((r, i) => (
              <div key={i} className="flex justify-between text-sm">
                <a
                  href={r.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {r.name}
                </a>
                <span className="text-muted-foreground">
                  {r.open_issues_count} issues • {r.forks_count} forks
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TopicsCloud({ topics }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Topics / Tags</CardTitle>
        <CardDescription>Frequently used tags in your repositories</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {topics.slice(0, 20).map(([t, count], i) => (
            <Badge key={i} variant="outline" className="text-sm">
              {t} ({count})
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CommitTimingChart({ commitTimes }) {
  const { hours, profile } = commitTimes;
  const chartData = hours.map((count, h) => ({ hour: `${h}:00`, count }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Commit Activity by Hour (UTC)
        </CardTitle>
        <CardDescription>
          You're a <Badge variant="secondary">{profile}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ count: { label: "Commits", color: "#8884d8" } }}
          className="h-[200px] w-full"
        >
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
            <YAxis />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={{ fill: "rgba(136, 132, 216, 0.1)" }}
            />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function WeeklyActivityChart({ weekly }) {
  const chartData = weekly.slice(-12).map(([week, count]) => ({ week, count }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Weekly Activity</CardTitle>
        <CardDescription>Public events over recent weeks</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ count: { label: "Events", color: "#82ca9d" } }}
          className="h-[250px] w-full"
        >
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function RecommendationsSection({ recommendations }) {
  const { trendingMatches, personalIdeas, trendingSample } = recommendations;
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-2">
        <Sparkles className="h-6 w-6" />
        Personalized Recommendations
      </h2>
      {trendingMatches && trendingMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Trending Projects That Match Your Skills</CardTitle>
            <CardDescription>
              Contribute to these based on your top languages/topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trendingMatches.slice(0, 5).map((item, i) => (
                <div key={i} className="p-3 border rounded hover:bg-accent transition">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary hover:underline"
                  >
                    {item.fullName}
                  </a>
                  <p className="text-sm text-muted-foreground">
                    {item.description || "No description"}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {item.language && <Badge variant="secondary">{item.language}</Badge>}
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {item.stars}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {personalIdeas && personalIdeas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Project Ideas for You</CardTitle>
            <CardDescription>Explore these concepts to grow your portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {personalIdeas.slice(0, 5).map((idea, i) => (
                <div key={i} className="p-3 border rounded bg-muted/50">
                  <h3 className="font-semibold">{idea.title}</h3>
                  <p className="text-sm text-muted-foreground">{idea.description}</p>
                  <Badge variant="outline" className="mt-2">
                    {idea.tag}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {trendingSample && trendingSample.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Currently Trending on GitHub</CardTitle>
            <CardDescription>Today's popular repositories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trendingSample.slice(0, 5).map((item, i) => (
                <div key={i} className="p-3 border rounded hover:bg-accent transition">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary hover:underline"
                  >
                    {item.fullName}
                  </a>
                  <p className="text-sm text-muted-foreground">
                    {item.description || "No description"}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {item.language && <Badge variant="secondary">{item.language}</Badge>}
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {item.stars}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
