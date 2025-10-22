import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Users,
  Trophy,
  GitFork,
  Star,
  Code,
  Calendar,
  TrendingUp,
  Zap,
  Award,
  Target,
  History, // Add History icon
} from "lucide-react";
import { getGithubInsights } from "@/lib/github";
import { toast } from "sonner";
import { validateGithubUsername } from "@/lib/utils";

export default function CompareUsers() {
  const { user1: urlUser1, user2: urlUser2 } = useParams();
  const navigate = useNavigate();

  const [user1Input, setUser1Input] = useState(urlUser1 || "");
  const [user2Input, setUser2Input] = useState(urlUser2 || "");
  const [user1Data, setUser1Data] = useState(null);
  const [user2Data, setUser2Data] = useState(null);
  const [loading, setLoading] = useState(false);
  const [winner, setWinner] = useState(null);
  const [user1LastUpdated, setUser1LastUpdated] = useState("");
  const [user2LastUpdated, setUser2LastUpdated] = useState("");
  const [error, setError] = useState(null); // Add error state
  const [user1Error, setUser1Error] = useState("");
  const [user2Error, setUser2Error] = useState("");

  useEffect(() => {
    if (urlUser1 && urlUser2) {
      const v1 = validateGithubUsername(urlUser1);
      const v2 = validateGithubUsername(urlUser2);
      if (!v1.valid || !v2.valid) {
        setError(!v1.valid ? v1.message : v2.message);
        return;
      }
      fetchComparison(v1.value, v2.value);
    }
  }, [urlUser1, urlUser2]);

  async function fetchComparison(username1, username2, refresh = false) {
    if (!username1 || !username2) {
      toast.error("Please enter both usernames");
      return;
    }

    setLoading(true);
    setError(null); // Clear previous errors
    setUser1LastUpdated("");
    setUser2LastUpdated("");
    try {
      const [res1, res2] = await Promise.all([
        getGithubInsights(username1, refresh),
        getGithubInsights(username2, refresh),
      ]);

      // Check for valid data in both responses
      if (!res1?.data || !res2?.data) {
        throw new Error("Could not fetch data for one or both users.");
      }

      setUser1Data(res1.data);
      setUser2Data(res2.data);
      setUser1LastUpdated(new Date(res1.lastUpdated).toLocaleString());
      setUser2LastUpdated(new Date(res2.lastUpdated).toLocaleString());

      const scores = calculateScores(res1.data, res2.data);
      setWinner(scores);

      toast.success("Comparison complete!");
    } catch (err) {
      console.error(err);
      setError("Failed to compare users. Please check the usernames and try again.");
      toast.error("Failed to compare users.");
    } finally {
      setLoading(false);
    }
  }

  function handleCompare(e) {
    e.preventDefault();
    const v1 = validateGithubUsername(user1Input);
    const v2 = validateGithubUsername(user2Input);
    if (!v1.valid || !v2.valid) {
      const msg = !v1.valid ? v1.message : v2.message;
      setUser1Error(!v1.valid ? v1.message : "");
      setUser2Error(!v2.valid ? v2.message : "");
      toast.error(msg);
      return;
    }
    setUser1Error("");
    setUser2Error("");
    navigate(`/compare/${v1.value}/${v2.value}`);
  }

  function calculateScores(data1, data2) {
    const scores = {
      user1: 0,
      user2: 0,
      categories: {},
    };

    // Repositories count
    scores.categories.repos = {
      user1: data1.reposCount,
      user2: data2.reposCount,
      winner: data1.reposCount > data2.reposCount ? 1 : data1.reposCount < data2.reposCount ? 2 : 0,
    };
    if (scores.categories.repos.winner === 1) scores.user1++;
    if (scores.categories.repos.winner === 2) scores.user2++;

    // Total stars
    const stars1 = data1.topStarred?.reduce((sum, r) => sum + (r.stargazers_count || 0), 0) || 0;
    const stars2 = data2.topStarred?.reduce((sum, r) => sum + (r.stargazers_count || 0), 0) || 0;
    scores.categories.stars = {
      user1: stars1,
      user2: stars2,
      winner: stars1 > stars2 ? 1 : stars1 < stars2 ? 2 : 0,
    };
    if (scores.categories.stars.winner === 1) scores.user1++;
    if (scores.categories.stars.winner === 2) scores.user2++;

    // Followers
    const followers1 = data1.user.followers || 0;
    const followers2 = data2.user.followers || 0;
    scores.categories.followers = {
      user1: followers1,
      user2: followers2,
      winner: followers1 > followers2 ? 1 : followers1 < followers2 ? 2 : 0,
    };
    if (scores.categories.followers.winner === 1) scores.user1++;
    if (scores.categories.followers.winner === 2) scores.user2++;

    // Languages diversity
    const langCount1 = data1.languages?.percentages?.size || 0;
    const langCount2 = data2.languages?.percentages?.size || 0;
    scores.categories.languages = {
      user1: langCount1,
      user2: langCount2,
      winner: langCount1 > langCount2 ? 1 : langCount1 < langCount2 ? 2 : 0,
    };
    if (scores.categories.languages.winner === 1) scores.user1++;
    if (scores.categories.languages.winner === 2) scores.user2++;

    // Top language percentage
    const topLang1 = data1.languages?.top3?.[0]?.[1] || 0;
    const topLang2 = data2.languages?.top3?.[0]?.[1] || 0;
    scores.categories.specialization = {
      user1: topLang1,
      user2: topLang2,
      winner: topLang1 > topLang2 ? 1 : topLang1 < topLang2 ? 2 : 0,
    };
    if (scores.categories.specialization.winner === 1) scores.user1++;
    if (scores.categories.specialization.winner === 2) scores.user2++;

    return scores;
  }

  function getRadarData() {
    if (!user1Data || !user2Data) return [];

    const stars1 =
      user1Data.topStarred?.reduce((sum, r) => sum + (r.stargazers_count || 0), 0) || 0;
    const stars2 =
      user2Data.topStarred?.reduce((sum, r) => sum + (r.stargazers_count || 0), 0) || 0;

    const maxRepos = Math.max(user1Data.reposCount, user2Data.reposCount);
    const maxStars = Math.max(stars1, stars2);
    const maxFollowers = Math.max(user1Data.user.followers || 0, user2Data.user.followers || 0);
    const maxLangs = Math.max(
      user1Data.languages?.percentages?.size || 0,
      user2Data.languages?.percentages?.size || 0
    );

    return [
      {
        metric: "Repos",
        [user1Data.user.login]: (user1Data.reposCount / maxRepos) * 100,
        [user2Data.user.login]: (user2Data.reposCount / maxRepos) * 100,
      },
      {
        metric: "Stars",
        [user1Data.user.login]: (stars1 / maxStars) * 100,
        [user2Data.user.login]: (stars2 / maxStars) * 100,
      },
      {
        metric: "Followers",
        [user1Data.user.login]: ((user1Data.user.followers || 0) / maxFollowers) * 100,
        [user2Data.user.login]: ((user2Data.user.followers || 0) / maxFollowers) * 100,
      },
      {
        metric: "Languages",
        [user1Data.user.login]: ((user1Data.languages?.percentages?.size || 0) / maxLangs) * 100,
        [user2Data.user.login]: ((user2Data.languages?.percentages?.size || 0) / maxLangs) * 100,
      },
      {
        metric: "Following",
        [user1Data.user.login]:
          ((user1Data.user.following || 0) /
            Math.max(user1Data.user.following || 0, user2Data.user.following || 0)) *
          100,
        [user2Data.user.login]:
          ((user2Data.user.following || 0) /
            Math.max(user1Data.user.following || 0, user2Data.user.following || 0)) *
          100,
      },
    ];
  }

  if (!user1Data || !user2Data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl sm:text-3xl">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
                Compare GitHub Users
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Enter two GitHub usernames to see a detailed side-by-side comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCompare} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">User 1</label>
                    <Input
                      placeholder="octocat"
                      value={user1Input}
                      onChange={(e) => {
                        const val = e.target.value;
                        setUser1Input(val);
                        const res = validateGithubUsername(val);
                        setUser1Error(res.valid || val.trim() === "" ? "" : res.message);
                      }}
                      disabled={loading}
                    />
                    {user1Error && (
                      <p className="text-sm text-red-500" role="alert">
                        {user1Error}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">User 2</label>
                    <Input
                      placeholder="torvalds"
                      value={user2Input}
                      onChange={(e) => {
                        const val = e.target.value;
                        setUser2Input(val);
                        const res = validateGithubUsername(val);
                        setUser2Error(res.valid || val.trim() === "" ? "" : res.message);
                      }}
                      disabled={loading}
                    />
                    {user2Error && (
                      <p className="text-sm text-red-500" role="alert">
                        {user2Error}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    loading ||
                    !!user1Error ||
                    !!user2Error ||
                    !user1Input.trim() ||
                    !user2Input.trim()
                  }
                  aria-disabled={
                    loading ||
                    !!user1Error ||
                    !!user2Error ||
                    !user1Input.trim() ||
                    !user2Input.trim()
                  }
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Trophy className="h-4 w-4 mr-2" />
                      Compare Users
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const radarData = getRadarData();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        <Button
          variant="outline"
          onClick={() => fetchComparison(urlUser1, urlUser2, true)}
          disabled={loading || !urlUser1 || !urlUser2}
        >
          <History className="h-4 w-4 mr-2" />
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error && <div className="text-red-500 text-center my-4">{error}</div>}

      {/* Winner Banner */}
      {winner && winner.user1 !== winner.user2 && (
        <Card className="mb-6 border-2 border-yellow-500 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
          <CardContent className="py-6">
            <div className="flex items-center justify-center gap-4">
              <Trophy className="h-12 w-12 text-yellow-500" />
              <div className="text-center">
                <h2 className="text-2xl font-bold">
                  {winner.user1 > winner.user2 ? user1Data.user.login : user2Data.user.login} Wins!
                </h2>
                <p className="text-muted-foreground">
                  Score: {Math.max(winner.user1, winner.user2)} -{" "}
                  {Math.min(winner.user1, winner.user2)}
                </p>
              </div>
              <Trophy className="h-12 w-12 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* User 1 Card */}
        <Card className={winner?.user1 > winner?.user2 ? "border-2 border-green-500" : ""}>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user1Data.user.avatar_url} />
                <AvatarFallback>{user1Data.user.login[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle>{user1Data.user.name || user1Data.user.login}</CardTitle>
                <CardDescription>@{user1Data.user.login}</CardDescription>
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {user1LastUpdated}
                </p>
                {winner?.user1 > winner?.user2 && (
                  <Badge className="mt-2 bg-green-500">
                    <Trophy className="h-3 w-3 mr-1" />
                    Winner
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {user1Data.user.bio && (
              <p className="text-sm text-muted-foreground">{user1Data.user.bio}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                <Star className="h-3 w-3 mr-1" />
                {winner?.categories.stars.user1 || 0} stars
              </Badge>
              <Badge variant="secondary">
                <GitFork className="h-3 w-3 mr-1" />
                {user1Data.reposCount} repos
              </Badge>
              <Badge variant="secondary">
                <Users className="h-3 w-3 mr-1" />
                {user1Data.user.followers || 0} followers
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* User 2 Card */}
        <Card className={winner?.user2 > winner?.user1 ? "border-2 border-green-500" : ""}>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user2Data.user.avatar_url} />
                <AvatarFallback>{user2Data.user.login[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle>{user2Data.user.name || user2Data.user.login}</CardTitle>
                <CardDescription>@{user2Data.user.login}</CardDescription>
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {user2LastUpdated}
                </p>
                {winner?.user2 > winner?.user1 && (
                  <Badge className="mt-2 bg-green-500">
                    <Trophy className="h-3 w-3 mr-1" />
                    Winner
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {user2Data.user.bio && (
              <p className="text-sm text-muted-foreground">{user2Data.user.bio}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                <Star className="h-3 w-3 mr-1" />
                {winner?.categories.stars.user2 || 0} stars
              </Badge>
              <Badge variant="secondary">
                <GitFork className="h-3 w-3 mr-1" />
                {user2Data.reposCount} repos
              </Badge>
              <Badge variant="secondary">
                <Users className="h-3 w-3 mr-1" />
                {user2Data.user.followers || 0} followers
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="languages" className="text-xs sm:text-sm">
            Languages
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs sm:text-sm">
            Activity
          </TabsTrigger>
          <TabsTrigger value="radar" className="text-xs sm:text-sm">
            Radar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Score Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(winner.categories).map(([key, data]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{key}</span>
                    <span className="text-muted-foreground">
                      {data.user1} vs {data.user2}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Progress
                        value={(data.user1 / Math.max(data.user1, data.user2)) * 100}
                        className={data.winner === 1 ? "bg-green-500/20" : ""}
                      />
                      <p className="text-xs text-muted-foreground">{user1Data.user.login}</p>
                    </div>
                    <div className="space-y-1">
                      <Progress
                        value={(data.user2 / Math.max(data.user1, data.user2)) * 100}
                        className={data.winner === 2 ? "bg-green-500/20" : ""}
                      />
                      <p className="text-xs text-muted-foreground">{user2Data.user.login}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="languages" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User 1 Languages */}
            <Card>
              <CardHeader>
                <CardTitle>{user1Data.user.login}'s Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(user1Data.languages?.top3 || []).map(([lang, percent], idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{lang}</span>
                        <span className="text-muted-foreground">{percent}%</span>
                      </div>
                      <Progress value={percent} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User 2 Languages */}
            <Card>
              <CardHeader>
                <CardTitle>{user2Data.user.login}'s Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(user2Data.languages?.top3 || []).map(([lang, percent], idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{lang}</span>
                        <span className="text-muted-foreground">{percent}%</span>
                      </div>
                      <Progress value={percent} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User 1 Activity */}
            <Card>
              <CardHeader>
                <CardTitle>{user1Data.user.login}'s Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Domain</span>
                  <Badge>{user1Data.domain?.domain || "Generalist"}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coding Style</span>
                  <span>
                    {user1Data.commitTimes?.profile === "night-coder"
                      ? "🌙 Night Coder"
                      : "🌅 Early Bird"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Top Repo</span>
                  <span className="text-sm">{user1Data.topStarred?.[0]?.name || "N/A"}</span>
                </div>
              </CardContent>
            </Card>

            {/* User 2 Activity */}
            <Card>
              <CardHeader>
                <CardTitle>{user2Data.user.login}'s Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Domain</span>
                  <Badge>{user2Data.domain?.domain || "Generalist"}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coding Style</span>
                  <span>
                    {user2Data.commitTimes?.profile === "night-coder"
                      ? "🌙 Night Coder"
                      : "🌅 Early Bird"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Top Repo</span>
                  <span className="text-sm">{user2Data.topStarred?.[0]?.name || "N/A"}</span>
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
                      name={user1Data.user.login}
                      dataKey={user1Data.user.login}
                      stroke="#667eea"
                      fill="#667eea"
                      fillOpacity={0.5}
                    />
                    <Radar
                      name={user2Data.user.login}
                      dataKey={user2Data.user.login}
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
    </div>
  );
}
