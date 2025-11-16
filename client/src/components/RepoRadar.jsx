import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Radar,
  Star,
  GitFork,
  Eye,
  TrendingUp,
  Users,
  ExternalLink,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Link } from "react-router-dom";

export default function RepoRadar({ owner, repo, language, topics = [], stars = 0 }) {
  const [similarRepos, setSimilarRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState(null);

  useEffect(() => {
    if (owner && repo && expanded) {
      fetchSimilarRepos();
    }
  }, [owner, repo, expanded]);

  const fetchSimilarRepos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/repository/${owner}/${repo}/similar`, {
        params: {
          language,
          topics: topics?.join(",") || "",
          stars,
        },
      });
      setSimilarRepos(response.data.data.repositories || []);
      setSearchCriteria({
        query: response.data.data.query,
        totalFound: response.data.data.totalFound,
      });
      toast.success("Found similar repositories!");
    } catch (err) {
      console.error("Failed to fetch similar repos:", err);
      setError(err.response?.data?.message || "Failed to fetch similar repositories");
      toast.error("Failed to fetch similar repositories");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (expanded) {
      fetchSimilarRepos();
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num;
  };

  const getRepoAge = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} days old`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months old`;
    return `${Math.floor(diffDays / 365)} years old`;
  };

  if (!expanded) {
    return (
      <Card className="border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 transition-all">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Radar className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Repo Radar</CardTitle>
                <CardDescription>Discover similar, lesser-known repositories</CardDescription>
              </div>
            </div>
            <Sparkles className="h-5 w-5 text-purple-500 animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Find hidden gems similar to this repository. Discover new projects to contribute to or
            gain insights from.
          </p>
          <Button
            onClick={() => setExpanded(true)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Radar className="h-4 w-4 mr-2" />
            Scan for Similar Repositories
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-purple-500/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Radar className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Repo Radar</CardTitle>
              <CardDescription>
                {loading
                  ? "Scanning for similar repositories..."
                  : `Found ${similarRepos.length} similar repositories`}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
            className="ml-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-3" />
            <p className="text-destructive font-medium">{error}</p>
            <Button onClick={fetchSimilarRepos} variant="outline" className="mt-4">
              Try Again
            </Button>
          </div>
        ) : similarRepos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Radar className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No similar repositories found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting the filters or check back later
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search Criteria Info */}
            {searchCriteria && (
              <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                        Matches found based on:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {language && (
                          <Badge variant="secondary" className="text-xs">
                            Language: {language}
                          </Badge>
                        )}
                        {topics && topics.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Topics: {topics.slice(0, 3).join(", ")}
                          </Badge>
                        )}
                        {stars > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Similar popularity ({stars < 100 ? "5-60" : "10-80%"} stars)
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          Active in last 2 years
                        </Badge>
                      </div>
                      {searchCriteria.totalFound > 10 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Showing top 10 of {searchCriteria.totalFound} results
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Lesser-known repositories similar to{" "}
                <strong>
                  {owner}/{repo}
                </strong>
              </span>
            </div>

            {similarRepos.map((similarRepo, index) => (
              <Card
                key={similarRepo.id}
                className="hover:shadow-lg transition-all border-purple-500/20 hover:border-purple-500/40"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Link
                          to={`/repo/${similarRepo.owner.login}/${similarRepo.name}`}
                          className="font-semibold text-lg hover:underline text-primary"
                        >
                          {similarRepo.owner.login}/{similarRepo.name}
                        </Link>
                        <a
                          href={similarRepo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {similarRepo.description || "No description available"}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-4 mb-3">
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">
                        {formatNumber(similarRepo.stargazers_count)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <GitFork className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{formatNumber(similarRepo.forks_count)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Eye className="h-4 w-4 text-green-500" />
                      <span className="font-medium">
                        {formatNumber(similarRepo.watchers_count)}
                      </span>
                    </div>
                    {similarRepo.open_issues_count > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">{similarRepo.open_issues_count}</span>
                      </div>
                    )}
                  </div>

                  {/* Language and topics */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {similarRepo.language && (
                      <Badge variant="secondary" className="text-xs">
                        {similarRepo.language}
                      </Badge>
                    )}
                    {similarRepo.topics?.slice(0, 3).map((topic) => (
                      <Badge key={topic} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>

                  {/* Additional info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {getRepoAge(similarRepo.created_at)}
                    </span>
                    <span>Updated {new Date(similarRepo.updated_at).toLocaleDateString()}</span>
                  </div>

                  {/* Why this is recommended */}
                  {similarRepo.matchReason && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground italic">
                        💡 {similarRepo.matchReason}
                      </p>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="mt-4 flex gap-2">
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link to={`/repo/${similarRepo.owner.login}/${similarRepo.name}`}>
                        Analyze Repository
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <a href={similarRepo.html_url} target="_blank" rel="noopener noreferrer">
                        View on GitHub
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Want to contribute? These repositories have active maintainers and welcome
                contributors!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
