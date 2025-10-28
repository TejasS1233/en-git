import { useState, useEffect } from "react";
import {
  Github,
  Sparkles,
  TrendingUp,
  Search,
  ExternalLink,
  Star,
  GitFork,
  Users,
  BookOpen,
  Loader2,
  Code,
  Settings as SettingsIcon,
  Trophy,
  Target,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Badge } from "./components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Separator } from "./components/ui/separator";
import { calculateProfileScore } from "./lib/extensionProfileScore";
import engitIcon from "/engit-icon.png";

function ExtensionApp() {
  const [username, setUsername] = useState("");
  const [username2, setUsername2] = useState("");
  const [currentPageUser, setCurrentPageUser] = useState(null);
  const [currentRepo, setCurrentRepo] = useState(null); // { owner, repo }
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState("light");

  // ---------------- THEME HANDLING ----------------
  useEffect(() => {
    // Load theme from storage or system preference
    chrome.storage.local.get(["theme"], (result) => {
      if (result.theme) {
        setTheme(result.theme);
        document.documentElement.classList.toggle("dark", result.theme === "dark");
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initialTheme = prefersDark ? "dark" : "light";
        setTheme(initialTheme);
        document.documentElement.classList.toggle("dark", prefersDark);
      }
    });
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    chrome.storage.local.set({ theme: newTheme });
  };

  // ---------------- EXISTING LOGIC ----------------
  useEffect(() => {
    // Get username or repo from current GitHub page if applicable
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url?.includes("github.com")) {
        const url = tabs[0].url;
        const pathname = new URL(url).pathname;
        const parts = pathname.split("/").filter(Boolean);

        // Check if it's a repository page (has at least 2 parts: owner/repo)
        if (
          parts.length >= 2 &&
          parts[0] !== "orgs" &&
          parts[0] !== "marketplace" &&
          parts[0] !== "trending"
        ) {
          // It's a repo page - store repo info
          setCurrentRepo({ owner: parts[0], repo: parts[1] });
          setCurrentPageUser(null); // Clear user detection
          setUsername(parts[0]);
        } else if (
          parts.length === 1 &&
          parts[0] !== "orgs" &&
          parts[0] !== "marketplace" &&
          parts[0] !== "trending"
        ) {
          // It's a user profile page - auto-fetch stats
          const detectedUser = parts[0];
          setCurrentPageUser(detectedUser);
          setUsername(detectedUser);
          fetchQuickStats(detectedUser);
        }
      }
    });

    // Load recent analyses from storage
    chrome.storage.local.get(["recentAnalyses"], (result) => {
      if (result.recentAnalyses) {
        setRecentAnalyses(result.recentAnalyses.slice(0, 5));
      }
    });
  }, []);

  const fetchQuickStats = async (user) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch from GitHub API directly (no CORS issues in extensions)
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${user}`),
        fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=100`),
      ]);

      if (!userRes.ok) {
        throw new Error("User not found");
      }

      const userData = await userRes.json();
      const reposData = await reposRes.json();

      // Calculate quick stats
      const totalStars = reposData.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      const totalForks = reposData.reduce((sum, repo) => sum + repo.forks_count, 0);

      // Get top languages
      const languages = {};
      reposData.forEach((repo) => {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
      });
      const topLanguages = Object.entries(languages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([lang]) => lang);

      // Get most starred repo
      const mostStarred = reposData.reduce(
        (max, repo) => (repo.stargazers_count > (max?.stargazers_count || 0) ? repo : max),
        null
      );

      setStats({
        user: userData,
        repos: reposData.length,
        totalStars,
        totalForks,
        topLanguages,
        mostStarred,
        publicRepos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveToRecent = (user) => {
    chrome.storage.local.get(["recentAnalyses"], (result) => {
      const recent = result.recentAnalyses || [];
      const updated = [user, ...recent.filter((u) => u !== user)].slice(0, 10);
      chrome.storage.local.set({ recentAnalyses: updated });
    });
  };

  const handleSearch = () => {
    if (!username.trim()) return;
    fetchQuickStats(username);
    saveToRecent(username);
  };

  const analyzeProfile = () => {
    if (!username.trim()) return;
    saveToRecent(username);
    chrome.tabs.create({
      url: `https://en-git.vercel.app/stats/${username}`,
    });
  };

  const analyzeRepository = () => {
    if (!currentRepo) return;
    chrome.tabs.create({
      url: `https://en-git.vercel.app/repo/${currentRepo.owner}/${currentRepo.repo}`,
    });
  };

  const compareUsers = () => {
    if (!username.trim() || !username2.trim()) return;
    chrome.tabs.create({
      url: `https://en-git.vercel.app/compare/${username}/${username2}`,
    });
  };

  const openDashboard = () => {
    chrome.tabs.create({
      url: "https://en-git.vercel.app",
    });
  };

  const openSettings = () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL("settings.html"),
    });
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 to-blue-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-shrink-0">
            <img
              src={new URL("/engit-icon.png", import.meta.url).href}
              alt="en-git"
              className="h-6 w-auto"
            />
            <h1 className="text-xl font-bold text-white whitespace-nowrap">en-git</h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Theme Toggle Button*/}
            <Button onClick={toggleTheme} size="sm" variant="secondary" className="gap-1">
              {theme === "light" ? "Dark" : "Light"}
            </Button>
            <Button onClick={openSettings} size="sm" variant="secondary" className="gap-1">
              <SettingsIcon className="h-3 w-3" />
              Settings
            </Button>
            <Button onClick={openDashboard} size="sm" variant="secondary" className="gap-1">
              <ExternalLink className="h-3 w-3" />
              Full App
            </Button>
          </div>
        </div>
        <p className="text-xs text-white/80 mt-1">Quick GitHub Stats</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Repository Context */}
        {currentRepo && !loading && !stats && (
          <Card className="border-sky-500/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-sky-500" />
                <div>
                  <CardTitle className="text-base">Repository Detected</CardTitle>
                  <CardDescription className="text-xs">
                    {currentRepo.owner}/{currentRepo.repo}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button onClick={analyzeRepository} className="w-full" size="sm">
                <Sparkles className="h-3 w-3 mr-1" />
                Analyze Repository
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Profile Context */}
        {currentPageUser && !loading && !stats && (
          <Card className="border-blue-500/20">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Detected GitHub profile:{" "}
                <span className="font-semibold text-foreground">@{currentPageUser}</span>
              </p>
              <Button onClick={() => fetchQuickStats(currentPageUser)} size="sm" className="w-full">
                <Sparkles className="h-3 w-3 mr-1" />
                Load Stats
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="py-8 flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
              <p className="text-sm text-muted-foreground">Loading stats...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive/50">
            <CardContent className="pt-4">
              <p className="text-sm text-destructive">{error}</p>
              <Button onClick={() => setError(null)} size="sm" variant="outline" className="mt-2">
                Dismiss
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Display */}
        {stats && !loading && (
          <Card className="border-sky-500/20">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={stats.user.avatar_url} alt={stats.user.login} />
                  <AvatarFallback>{stats.user.login[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">
                    {stats.user.name || stats.user.login}
                  </CardTitle>
                  <CardDescription className="text-xs">@{stats.user.login}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Bio */}
              {stats.user.bio && (
                <p className="text-xs text-muted-foreground line-clamp-2">{stats.user.bio}</p>
              )}

              {/* Profile Score */}
              {(() => {
                const profileScore = calculateProfileScore(stats);
                if (!profileScore) return null;

                return (
                  <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-gray-900 border-2 border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-purple-500" />
                        <span className="text-xs font-semibold">Profile Score</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                          {profileScore.score}
                        </span>
                        <span className="text-xs text-muted-foreground">/100</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{profileScore.ratingIcon}</span>
                      <Badge variant="outline" className="text-xs">
                        {profileScore.rating} Developer
                      </Badge>
                    </div>
                    {profileScore.tips.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-purple-200 dark:border-purple-800">
                        <p className="text-xs font-medium flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Quick Wins:
                        </p>
                        {profileScore.tips.map((tip, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-xs bg-white/50 dark:bg-gray-900/50 p-2 rounded"
                          >
                            <Badge variant="secondary" className="text-[10px] px-1 py-0">
                              +{tip.points}
                            </Badge>
                            <span className="flex-1">{tip.tip}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Repos</p>
                    <p className="text-sm font-semibold">{stats.publicRepos}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Stars</p>
                    <p className="text-sm font-semibold">{stats.totalStars}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <Users className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Followers</p>
                    <p className="text-sm font-semibold">{stats.followers}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <GitFork className="h-4 w-4 text-sky-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Forks</p>
                    <p className="text-sm font-semibold">{stats.totalForks}</p>
                  </div>
                </div>
              </div>

              {/* Top Languages */}
              {stats.topLanguages.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-2 flex items-center gap-1">
                    <Code className="h-3 w-3" />
                    Top Languages
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {stats.topLanguages.map((lang, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Most Starred Repo */}
              {stats.mostStarred && stats.mostStarred.stargazers_count > 0 && (
                <div>
                  <p className="text-xs font-medium mb-1">Most Starred Repo</p>
                  <div className="p-2 rounded-lg bg-muted/50 text-xs">
                    <p className="font-semibold truncate">{stats.mostStarred.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {stats.mostStarred.stargazers_count}
                      </span>
                      {stats.mostStarred.language && (
                        <span className="flex items-center gap-1">
                          <Code className="h-3 w-3" />
                          {stats.mostStarred.language}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={analyzeProfile} size="sm" className="w-full">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Deep Dive
                </Button>
                <Button
                  onClick={() => setUsername2("")}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Compare
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual Search */}
        {!stats && !loading && (
          <Tabs defaultValue="analyze" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="analyze">
                <Search className="h-4 w-4 mr-1" />
                Analyze
              </TabsTrigger>
              <TabsTrigger value="compare">
                <TrendingUp className="h-4 w-4 mr-1" />
                Compare
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analyze" className="space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quick Stats</CardTitle>
                  <CardDescription className="text-xs">
                    View GitHub profile stats instantly
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter GitHub username..."
                      className="w-full"
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                  <Button onClick={handleSearch} className="w-full" disabled={!username.trim()}>
                    <Search className="h-4 w-4 mr-2" />
                    Load Stats
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Analyses */}
              {recentAnalyses.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Recent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {recentAnalyses.map((user, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => {
                            setUsername(user);
                            fetchQuickStats(user);
                          }}
                        >
                          {user}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="compare" className="space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Compare Users</CardTitle>
                  <CardDescription className="text-xs">Side-by-side comparison</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">First User</label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username1"
                      className="w-full mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Second User</label>
                    <Input
                      value={username2}
                      onChange={(e) => setUsername2(e.target.value)}
                      placeholder="username2"
                      className="w-full mt-1"
                    />
                  </div>
                  <Button
                    onClick={compareUsers}
                    className="w-full"
                    disabled={!username.trim() || !username2.trim()}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Compare Users
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

export default ExtensionApp;
