import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGithubInsights, getGithubRecommendations } from "@/lib/github";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
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
  Download,
  Upload,
  Twitter,
  Linkedin,
  Copy,
  Github,
  AtSign,
} from "lucide-react";
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
  isBookmarked,
  getSearchHistory,
  addToSearchHistory,
  clearSearchHistory,
  exportBookmarks,
  importBookmarks,
  getBookmarkStats,
} from "@/lib/localStorage";
import { exportToPDF } from "@/lib/pdfExport";
import { InsightsLoadingSkeleton } from "@/components/ui/skeleton-components";
import { AIInsights } from "@/components/AIInsights";
import { GamificationBadges } from "@/components/GamificationBadges";
import { SkillRadarChart } from "@/components/SkillRadarChart";
import { TechStackBadges } from "@/components/TechStackBadges";
import { ShareCard } from "@/components/ShareCard";
import { ContributionHeatmap } from "@/components/ContributionHeatmap";
import ProfileScore from "@/components/ProfileScore";
import { ProfileAnalysisTips } from "@/components/AnalysisTips";
import {
  generateTweetText,
  copyToClipboard,
  shareOnTwitter,
  shareOnLinkedIn,
} from "@/lib/socialShare";
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
import { validateGithubUsername } from "@/lib/utils";

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
  const [error, setError] = useState(null);
  const [usernameError, setUsernameError] = useState("");

  // Historical data states
  const [timePeriod, setTimePeriod] = useState("month");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [trends, setTrends] = useState(null);
  const [progressReport, setProgressReport] = useState(null);

  useEffect(() => {
    setBookmarks(getBookmarks());
    setSearchHistory(getSearchHistory());
  }, []);

  useEffect(() => {
    if (urlUsername) {
      // Validate URL param before fetching
      const res = validateGithubUsername(urlUsername);
      if (!res.valid) {
        setError(res.message);
        return;
      }
      fetchData(res.value);
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

      if (!insResponse?.data?.data || !recResponse?.data?.data) {
        throw new Error("Received incomplete data from the server.");
      }

      setInsights(insResponse.data.data);
      setRecommendations(recResponse.data.data);

      const insTime = new Date(insResponse.data.lastUpdated);
      const recTime = new Date(recResponse.data.lastUpdated);
      setLastUpdated(insTime > recTime ? insTime.toLocaleString() : recTime.toLocaleString());

      // Add to search history
      addToSearchHistory(user, insResponse.data.data.user);
      setSearchHistory(getSearchHistory());

      // Load historical data
      loadHistoricalData(user);

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

  const handleExportBookmarks = async () => {
    const result = exportBookmarks();
    if (result.success) {
      toast.success(`Exported ${result.count} bookmarks successfully!`);
    } else {
      toast.error(`Export failed: ${result.error}`);
    }
  };

  const handleImportBookmarks = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/json") {
      toast.error("Please select a valid JSON file");
      return;
    }

    importBookmarks(file).then((result) => {
      if (result.success) {
        toast.success(`Imported ${result.imported} bookmarks (${result.skipped} skipped)`);
        setBookmarks(getBookmarks());
      } else {
        toast.error(`Import failed: ${result.error}`);
      }
    });
  };

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
    const res = validateGithubUsername(username);
    if (!res.valid) {
      setUsernameError(res.message);
      toast.error(res.message);
      return;
    }
    setUsernameError("");
    navigate(`/stats/${res.value}`);
  }

  async function loadHistoricalData(user) {
    setLoadingHistory(true);
    try {
      const [comparisonData, trendsData, progressData] = await Promise.all([
        getStatsComparison(user, timePeriod).catch((err) => {
          console.error("Comparison fetch error:", err);
          return null;
        }),
        getStatsTrends(user, timePeriod).catch((err) => {
          console.error("Trends fetch error:", err);
          return null;
        }),
        getProgressReport(user).catch((err) => {
          console.error("Progress report fetch error:", err);
          return null;
        }),
      ]);

      console.log("Historical data received:", { comparisonData, trendsData, progressData });

      // Extract data from response structure
      setComparison(comparisonData?.data || comparisonData);
      setTrends(trendsData?.data || trendsData);
      setProgressReport(progressData?.data || progressData);
    } catch (err) {
      console.error("Failed to load historical data:", err);
      toast.error("Failed to load historical data");
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleCreateSnapshot() {
    if (!insights) {
      toast.error("No insights data to snapshot");
      return;
    }

    try {
      const response = await createStatsSnapshot(insights.user.login, insights);
      console.log("Snapshot created:", response);
      toast.success("Snapshot created successfully!");
      // Reload historical data to include the new snapshot
      await loadHistoricalData(insights.user.login);
    } catch (err) {
      console.error("Failed to create snapshot:", err);
      toast.error(err.response?.data?.message || "Failed to create snapshot");
    }
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <div className="text-center space-y-4 sm:space-y-6 pt-4 pb-3 px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-400 bg-clip-text text-transparent animate-gradient-subtle animate-fade-in">
            Analyze Any GitHub Profile
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto font-medium px-2">
            Get instant insights on languages, repos, and coding activity. Compare developers and
            track your progress.
          </p>
        </div>

        <div className="border-beam-wrapper max-w-3xl mx-auto shadow-[0_20px_60px_-15px_rgba(59,130,246,0.4),0_10px_30px_-10px_rgba(147,51,234,0.3)]">
          <Card className="border-beam-card border-0">
            <CardHeader className="pb-4 sm:pb-6 pt-8 sm:pt-12 text-center px-4 sm:px-6">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                <Github className="h-6 w-6 sm:h-7 sm:w-7 text-teal-500 flex-shrink-0" />
                <CardTitle className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold font-mono">
                  Enter GitHub Username
                </CardTitle>
              </div>
              <CardDescription className="text-sm sm:text-base md:text-lg lg:text-xl mt-3 sm:mt-4 px-2">
                Get instant insights and recommendations for any public profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-8 md:px-12 pb-8 sm:pb-12">
              <form onSubmit={handleFetch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <AtSign className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  <Input
                    placeholder="octocat"
                    value={username}
                    onChange={(e) => {
                      const val = e.target.value;
                      setUsername(val);
                      const res = validateGithubUsername(val);
                      setUsernameError(res.valid || val.trim() === "" ? "" : res.message);
                    }}
                    disabled={loading}
                    className="text-lg sm:text-xl h-12 sm:h-14 pl-12 sm:pl-14 pr-4 sm:pr-6 font-medium"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading || !!usernameError || username.trim() === ""}
                  aria-disabled={loading || !!usernameError || username.trim() === ""}
                  className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold shadow-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 w-full sm:w-auto"
                  size="lg"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />}
                  {loading ? "Analyzing..." : "Analyze Profile"}
                </Button>
              </form>
              {usernameError && (
                <p className="text-sm text-red-500 mt-1" role="alert">
                  {usernameError}
                </p>
              )}

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
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-base font-semibold">
                      <Bookmark className="h-5 w-5 text-primary" />
                      <span>Bookmarked Profiles</span>
                      <Badge variant="secondary" className="ml-2">
                        {getBookmarkStats().total}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleExportBookmarks}>
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("import-bookmarks").click()}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Import
                      </Button>
                      <input
                        id="import-bookmarks"
                        type="file"
                        accept=".json"
                        onChange={handleImportBookmarks}
                        style={{ display: "none" }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {bookmarks.map((item) => (
                      <Badge
                        key={item.username}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent text-base py-2 px-3"
                        onClick={() => handleHistoryClick(item.username)}
                      >
                        <Star className="h-4 w-4 mr-1 fill-current text-yellow-500" />
                        {item.username}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Show tips when no profile has been searched yet */}
        {!insights && !loading && !error && <ProfileAnalysisTips />}

        {/* Action Buttons */}
        {insights && (
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 px-4">
            <Button
              variant="outline"
              onClick={() => fetchData(insights.user.login, true)}
              disabled={loading}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <History className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
            <Button
              variant="outline"
              onClick={toggleBookmark}
              disabled={loading}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <Bookmark
                className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${bookmarked ? "fill-current" : ""}`}
              />
              <span className="hidden sm:inline">
                {bookmarked ? "Bookmarked" : "Bookmark Profile"}
              </span>
              <span className="sm:hidden">{bookmarked ? "Saved" : "Bookmark"}</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleExportPDF}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <FileDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Export to PDF</span>
              <span className="sm:hidden">Export</span>
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
              insights={insights} // Pass full insights for social sharing
            />

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="activity" className="text-xs sm:text-sm">
                  Activity
                </TabsTrigger>
                <TabsTrigger value="skills" className="text-xs sm:text-sm">
                  Skills
                </TabsTrigger>
                <TabsTrigger value="score" className="text-xs sm:text-sm">
                  Score
                </TabsTrigger>
                <TabsTrigger value="history" className="text-xs sm:text-sm">
                  History
                </TabsTrigger>
                <TabsTrigger value="ai" className="text-xs sm:text-sm">
                  AI
                </TabsTrigger>
                <TabsTrigger value="share" className="text-xs sm:text-sm">
                  Share
                </TabsTrigger>
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

              <TabsContent value="score" className="space-y-6 mt-6">
                <ProfileScore insights={insights} />
              </TabsContent>

              <TabsContent value="history" className="space-y-6 mt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl sm:text-2xl font-bold">Historical Stats</h2>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Select
                      value={timePeriod}
                      onValueChange={(value) => {
                        setTimePeriod(value);
                        if (insights) loadHistoricalData(insights.user.login);
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-[150px]">
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
                    <Button
                      onClick={handleCreateSnapshot}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
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

function ProfileSummary({ user, reposCount, domain, lastUpdated, insights }) {
  // Add insights prop for social sharing

  const handleCopyTweet = async () => {
    const tweetText = generateTweetText(insights);
    const success = await copyToClipboard(tweetText);
    if (success) {
      toast.success("Tweet copied to clipboard! 📋");
    } else {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleShareTwitter = () => {
    shareOnTwitter(insights);
    toast.success("Opening Twitter... 🐦");
  };

  const handleShareLinkedIn = async () => {
    toast.success("Content copied to clipboard! 📋");
    await shareOnLinkedIn(insights);
    toast.info("Opening LinkedIn - paste your content! 💼");
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start gap-2">
        <CardTitle className="text-lg sm:text-xl">Profile Summary</CardTitle>
        {lastUpdated && (
          <p className="text-xs sm:text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        )}
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
        <Avatar className="h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0">
          <AvatarImage src={user.avatar_url} alt={user.login} />
          <AvatarFallback>{user.login?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2 min-w-0 w-full">
          <h2 className="text-xl sm:text-2xl font-bold truncate">{user.name || user.login}</h2>
          <p className="text-muted-foreground text-sm line-clamp-2">{user.bio || "No bio"}</p>
          <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
            <span className="whitespace-nowrap">
              <strong>{user.public_repos || 0}</strong> repos
            </span>
            <span className="whitespace-nowrap">
              <strong>{user.followers || 0}</strong> followers
            </span>
            <span className="whitespace-nowrap">
              <strong>{user.following || 0}</strong> following
            </span>
          </div>

          {/* Social Share Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyTweet}
              className="gap-1 text-xs sm:text-sm"
            >
              <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Copy Stats</span>
              <span className="sm:hidden">Copy</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareTwitter}
              className="gap-1 text-xs sm:text-sm hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <Twitter className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
              Tweet
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareLinkedIn}
              className="gap-1 text-xs sm:text-sm hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <Linkedin className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              Share
            </Button>
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
  console.log("LanguagesChart received:", languages);

  // Add defensive checks
  if (!languages) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Programming Languages</CardTitle>
          <CardDescription>Distribution based on repository code</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground">
          No language data available
        </CardContent>
      </Card>
    );
  }

  const { top3, percentages } = languages;

  // Convert percentages array to chart data format
  let chartData = [];
  if (Array.isArray(percentages)) {
    chartData = percentages.map(([name, value]) => ({
      name,
      value: typeof value === "number" ? value : parseFloat(value) || 0,
    }));
  } else if (typeof percentages === "object") {
    // Handle object format
    chartData = Object.entries(percentages).map(([name, value]) => ({
      name,
      value: typeof value === "number" ? value : parseFloat(value) || 0,
    }));
  }

  // Group small languages into "Other" (anything below 2%)
  const THRESHOLD = 2.0;
  const mainLanguages = chartData.filter((d) => d.value >= THRESHOLD).slice(0, 7);
  const smallLanguages = chartData.filter((d) => d.value < THRESHOLD);

  // Add "Other" category if there are small languages
  if (smallLanguages.length > 0) {
    const otherTotal = smallLanguages.reduce((sum, d) => sum + d.value, 0);
    if (otherTotal > 0) {
      mainLanguages.push({
        name: "Other",
        value: otherTotal,
        tooltip: `${smallLanguages.length} languages: ${smallLanguages.map((l) => l.name).join(", ")}`,
      });
    }
  }

  const finalChartData = mainLanguages;

  // If no data or all zeros, show a message
  if (!finalChartData.length || finalChartData.every((d) => d.value === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Programming Languages</CardTitle>
          <CardDescription>Distribution based on repository code</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground">
          No language data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Programming Languages</CardTitle>
        <CardDescription>Distribution based on repository code</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4 flex-wrap">
          {top3 &&
            Array.isArray(top3) &&
            top3.map(([lang, pct], i) => (
              <Badge key={i} style={{ backgroundColor: COLORS[i] }} className="text-white">
                {lang}: {pct}%
              </Badge>
            ))}
        </div>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={finalChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => (value >= 3 ? `${name}: ${value.toFixed(1)}%` : "")}
                labelLine={({ value }) => value >= 3}
              >
                {finalChartData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => {
                  if (props.payload.tooltip) {
                    return [`${value.toFixed(1)}%`, props.payload.tooltip];
                  }
                  return [`${value.toFixed(1)}%`, name];
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
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
  console.log("CommitTimingChart received:", commitTimes);

  // Add defensive checks
  if (!commitTimes || !commitTimes.hours || !Array.isArray(commitTimes.hours)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Commit Activity by Hour (UTC)
          </CardTitle>
          <CardDescription>No recent commit activity found</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground">
          No commit data available
        </CardContent>
      </Card>
    );
  }

  const { hours, profile } = commitTimes;
  const chartData = hours.map((count, h) => ({
    hour: `${h}:00`,
    count: typeof count === "number" ? count : parseInt(count) || 0,
  }));

  // Check if there's any data
  const hasData = hours.some((count) => count > 0);

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Commit Activity by Hour (UTC)
          </CardTitle>
          <CardDescription>No recent commit activity found</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground">
          No commit data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Commit Activity by Hour (UTC)
        </CardTitle>
        <CardDescription>
          You're a <Badge variant="secondary">{profile || "developer"}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 11 }}
                interval={2}
                angle={-45}
                textAnchor="end"
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function WeeklyActivityChart({ weekly }) {
  console.log("WeeklyActivityChart received:", weekly);

  // Add defensive checks
  if (!weekly || !Array.isArray(weekly)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Weekly Activity</CardTitle>
          <CardDescription>No recent activity found</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground">
          No weekly activity data available
        </CardContent>
      </Card>
    );
  }

  const chartData = weekly.slice(-12).map(([week, count]) => ({
    week,
    count: typeof count === "number" ? count : parseInt(count) || 0,
  }));

  console.log("WeeklyActivityChart chartData:", chartData);

  // Check if there's any data
  const hasData = chartData.length > 0 && chartData.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Weekly Activity</CardTitle>
          <CardDescription>No recent activity found</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground">
          No weekly activity data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Weekly Activity</CardTitle>
        <CardDescription>Public events over recent weeks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
                    className="font-semibold text-primary hover:underline dark:hover:text-foreground"
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
  <div key={i} className="p-3 border rounded hover:bg-accent transition group"> {/* Added 'group' */}
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
       // Added 'dark:group-hover:text-white'
      className="font-semibold text-primary hover:underline dark:group-hover:text-white"
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
