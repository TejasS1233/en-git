import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trophy, Medal, Award, TrendingUp, Users, Filter, X } from "lucide-react";
import api from "@/lib/axios";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function Leaderboard() {
  usePageTitle("Global Leaderboard - Top GitHub Developers");

  const [topThree, setTopThree] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [searchUsername, setSearchUsername] = useState("");
  const [filterType, setFilterType] = useState("global");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [availableFilters, setAvailableFilters] = useState({ languages: [], topics: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableFilters();

    // Auto-detect last analyzed profile
    const lastAnalyzed = localStorage.getItem("lastAnalyzedProfile");
    if (lastAnalyzed) {
      fetchUserRank(lastAnalyzed);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    fetchStats();

    // Re-fetch user rank when filter changes
    if (currentUser && !currentUser.notFound) {
      fetchUserRank(currentUser.username);
    }
  }, [filterType, selectedLanguage, selectedTopic]);

  const fetchAvailableFilters = async () => {
    try {
      const response = await api.get("/leaderboard/filters");
      setAvailableFilters(response.data.data);
    } catch (error) {
      console.error("Failed to fetch filters:", error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      let endpoint = "/leaderboard?page=1&limit=3";

      if (filterType === "language" && selectedLanguage) {
        endpoint = `/leaderboard/language/${selectedLanguage}?page=1&limit=3`;
      } else if (filterType === "topic" && selectedTopic) {
        endpoint = `/leaderboard/topic/${selectedTopic}?page=1&limit=3`;
      }

      const response = await api.get(endpoint);
      setTopThree(response.data.data.entries);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterType("global");
    setSelectedLanguage("");
    setSelectedTopic("");
  };

  const getLeaderboardTitle = () => {
    if (filterType === "language" && selectedLanguage) {
      return `Top ${selectedLanguage} Developers`;
    }
    if (filterType === "topic" && selectedTopic) {
      return `Top ${selectedTopic} Developers`;
    }
    return "Top 3 Developers";
  };

  const fetchStats = async () => {
    try {
      let endpoint = "/leaderboard/stats";

      // Fetch filtered stats if a filter is active
      if (filterType === "language" && selectedLanguage) {
        // Use count from availableFilters for accurate total
        const langData = availableFilters.languages.find((l) => l.language === selectedLanguage);
        const totalUsers = langData?.count || 0;

        // Fetch top entries to calculate avg and top score
        const response = await api.get(
          `/leaderboard/language/${selectedLanguage}?page=1&limit=100`
        );
        const entries = response.data.data.entries;

        const avgScore =
          entries.length > 0
            ? (entries.reduce((sum, e) => sum + e.score, 0) / entries.length).toFixed(1)
            : 0;
        const topScore = entries.length > 0 ? entries[0].score : 0;
        const topUser = entries.length > 0 ? entries[0].username : null;

        setStats({ totalUsers, averageScore: avgScore, topScore, topUser });
        return;
      } else if (filterType === "topic" && selectedTopic) {
        // Use count from availableFilters for accurate total
        const topicData = availableFilters.topics.find((t) => t.topic === selectedTopic);
        const totalUsers = topicData?.count || 0;

        // Fetch top entries to calculate avg and top score
        const response = await api.get(`/leaderboard/topic/${selectedTopic}?page=1&limit=100`);
        const entries = response.data.data.entries;

        const avgScore =
          entries.length > 0
            ? (entries.reduce((sum, e) => sum + e.score, 0) / entries.length).toFixed(1)
            : 0;
        const topScore = entries.length > 0 ? entries[0].score : 0;
        const topUser = entries.length > 0 ? entries[0].username : null;

        setStats({ totalUsers, averageScore: avgScore, topScore, topUser });
        return;
      }

      // Default: fetch global stats
      const response = await api.get(endpoint);
      setStats(response.data.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchUserRank = async (username) => {
    if (!username.trim()) return;
    try {
      let endpoint = `/leaderboard/rank/${username}`;

      // Add filter parameters for niche rank
      if (filterType === "language" && selectedLanguage) {
        endpoint = `/leaderboard/rank/${username}/niche?language=${selectedLanguage}`;
      } else if (filterType === "topic" && selectedTopic) {
        endpoint = `/leaderboard/rank/${username}/niche?topic=${selectedTopic}`;
      }

      const response = await api.get(endpoint);
      const userData = response.data.data;

      // Add filter info to display
      if (filterType !== "global" && (selectedLanguage || selectedTopic)) {
        userData.nicheFilter = filterType === "language" ? selectedLanguage : selectedTopic;
        userData.nicheType = filterType;
      }

      setCurrentUser(userData);
    } catch (error) {
      console.error("Failed to fetch user rank:", error);
      if (error.response?.status === 404) {
        setCurrentUser({ notFound: true, username });
      } else {
        setCurrentUser(null);
      }
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return null;
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white";
    if (rank === 2) return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
    if (rank === 3) return "bg-gradient-to-r from-amber-600 to-orange-600 text-white";
    if (rank <= 10) return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
    return "bg-muted text-foreground";
  };

  const getGradeColor = (grade) => {
    if (grade === "A") return "text-green-600";
    if (grade === "B") return "text-blue-600";
    if (grade === "C") return "text-yellow-600";
    return "text-orange-600";
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-linear-to-br from-yellow-500 to-orange-500">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl font-black bg-linear-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
            Global Leaderboard
          </h1>
        </div>
        <p className="text-xl text-muted-foreground">
          Top GitHub developers ranked by profile score
        </p>
      </div>

      {/* Niche Filters */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">Filter by:</span>
            </div>

            <Select
              value={filterType}
              onValueChange={(value) => {
                setFilterType(value);
                setSelectedLanguage("");
                setSelectedTopic("");
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global</SelectItem>
                <SelectItem value="language">Language</SelectItem>
                <SelectItem value="topic">Topic</SelectItem>
              </SelectContent>
            </Select>

            {filterType === "language" && (
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Select language..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {availableFilters.languages && availableFilters.languages.length > 0 ? (
                    availableFilters.languages.map((lang) => (
                      <SelectItem key={lang.language} value={lang.language}>
                        {lang.language} ({lang.count} devs)
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      No languages available yet. Analyze some profiles first!
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}

            {filterType === "topic" && (
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Select topic..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {availableFilters.topics && availableFilters.topics.length > 0 ? (
                    availableFilters.topics.map((topic) => (
                      <SelectItem key={topic.topic} value={topic.topic}>
                        {topic.topic} ({topic.count} devs)
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      No topics available yet. Analyze some profiles first!
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}

            {filterType !== "global" && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {filterType !== "global" && (selectedLanguage || selectedTopic) && (
            <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm">
                {filterType === "language" && selectedLanguage && (
                  <>
                    Showing top developers who code in <strong>{selectedLanguage}</strong>
                  </>
                )}
                {filterType === "topic" && selectedTopic && (
                  <>
                    Showing top developers in <strong>{selectedTopic}</strong>
                  </>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {filterType === "language" && selectedLanguage
                      ? `${selectedLanguage} Developers`
                      : filterType === "topic" && selectedTopic
                        ? `${selectedTopic} Developers`
                        : "Total Developers"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-3xl font-bold">{stats.averageScore}</p>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-yellow-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-3xl font-bold">{stats.topScore}</p>
                  <p className="text-sm text-muted-foreground">Highest Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top 3 Leaderboard */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">{getLeaderboardTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading leaderboard...</p>
            </div>
          ) : topThree.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No developers found for this filter</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topThree.map((entry) => (
                <div
                  key={entry.username}
                  className="flex items-center gap-4 p-4 rounded-xl border-2 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer group"
                  onClick={() => navigate(`/stats/${entry.username}`)}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-16">
                    {getRankIcon(entry.rank) || (
                      <div
                        className={`w-12 h-12 rounded-full ${getRankBadge(entry.rank)} flex items-center justify-center font-bold text-lg`}
                      >
                        #{entry.rank}
                      </div>
                    )}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-14 w-14 border-2">
                    <AvatarImage src={entry.avatar} alt={entry.username} />
                    <AvatarFallback>{entry.username[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                        {entry.name || entry.username}
                      </h3>
                      <Badge variant="outline" className={getGradeColor(entry.grade)}>
                        Grade {entry.grade}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">@{entry.username}</p>
                    {entry.location && (
                      <p className="text-xs text-muted-foreground mt-1">{entry.location}</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-lg">{entry.publicRepos}</p>
                      <p className="text-muted-foreground text-xs">Repos</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">{entry.totalStars}</p>
                      <p className="text-muted-foreground text-xs">Stars</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">{entry.followers}</p>
                      <p className="text-muted-foreground text-xs">Followers</p>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className="text-3xl font-black bg-linear-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                      {entry.score}
                    </p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Find Your Position */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Find Your Position</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              placeholder="Enter GitHub username..."
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && fetchUserRank(searchUsername)}
              className="flex-1 px-4 py-2 rounded-lg border bg-background"
            />
            <Button className="cursor-pointer" onClick={() => fetchUserRank(searchUsername)}>
              Search
            </Button>
          </div>

          {currentUser && currentUser.notFound && (
            <div className="p-6 rounded-xl border-2 border-orange-500/50 bg-orange-50 dark:bg-orange-950/20 text-center">
              <p className="text-lg font-semibold mb-2">
                @{currentUser.username} hasn't been analyzed yet
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Analyze their profile first to see their ranking on the leaderboard
              </p>
              <Button onClick={() => navigate(`/stats/${currentUser.username}`)}>
                Analyze @{currentUser.username}
              </Button>
            </div>
          )}

          {currentUser && !currentUser.notFound && (
            <div
              className="flex items-center gap-4 p-4 rounded-xl border-2 border-primary/50 bg-primary/5 cursor-pointer hover:shadow-lg transition-all"
              onClick={() => navigate(`/stats/${currentUser.username}`)}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-16">
                {getRankIcon(currentUser.rank) || (
                  <div
                    className={`w-12 h-12 rounded-full ${getRankBadge(currentUser.rank)} flex items-center justify-center font-bold text-lg`}
                  >
                    #{currentUser.rank}
                  </div>
                )}
              </div>

              {/* Avatar */}
              <Avatar className="h-14 w-14 border-2">
                <AvatarImage src={currentUser.avatar} alt={currentUser.username} />
                <AvatarFallback>{currentUser.username[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg truncate">
                    {currentUser.name || currentUser.username}
                  </h3>
                  <Badge variant="outline" className={getGradeColor(currentUser.grade)}>
                    Grade {currentUser.grade}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">@{currentUser.username}</p>
                <p className="text-xs text-primary mt-1">
                  {currentUser.nicheFilter && (
                    <span className="font-semibold">
                      {currentUser.nicheType === "language" ? "Language" : "Topic"}:{" "}
                      {currentUser.nicheFilter} •{" "}
                    </span>
                  )}
                  Top {currentUser.percentile}% • Rank #{currentUser.rank} of {currentUser.total}
                </p>
              </div>

              {/* Stats */}
              <div className="hidden sm:flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="font-bold text-lg">{currentUser.publicRepos}</p>
                  <p className="text-muted-foreground text-xs">Repos</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">{currentUser.totalStars}</p>
                  <p className="text-muted-foreground text-xs">Stars</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">{currentUser.followers}</p>
                  <p className="text-muted-foreground text-xs">Followers</p>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <p className="text-3xl font-black bg-linear-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                  {currentUser.score}
                </p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
