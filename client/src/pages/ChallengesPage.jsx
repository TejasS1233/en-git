import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Target,
  Trophy,
  Clock,
  TrendingUp,
  Star,
  Users,
  GitBranch,
  Sparkles,
} from "lucide-react";
import CreateChallengeDialog from "@/components/CreateChallengeDialog";
import AIChallengeDialog from "@/components/AIChallengeDialog";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

export default function ChallengesPage() {
  usePageTitle("Challenges");
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAISuggestionOpen, setIsAISuggestionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState(null);
  const [aiSuggestionData, setAiSuggestionData] = useState(null);

  useEffect(() => {
    if (user) {
      fetchChallenges();
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user, activeTab]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/challenges?status=${activeTab === "all" ? "" : activeTab}`
      );
      setChallenges(response.data.data);
    } catch (error) {
      console.error("Failed to fetch challenges:", error);
      toast.error("Failed to load challenges");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get(`/challenges/stats`);
      setStats(response.data.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleUpdateProgress = async (challengeId) => {
    try {
      await axiosInstance.patch(`/challenges/${challengeId}`, {});
      toast.success("Challenge progress updated!");
      fetchChallenges();
      fetchStats();
    } catch (error) {
      console.error("Failed to update challenge:", error);
      toast.error("Failed to update progress");
    }
  };

  const handleDeleteClick = (challenge) => {
    setChallengeToDelete(challenge);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!challengeToDelete) return;

    try {
      await axiosInstance.delete(`/challenges/${challengeToDelete._id}`);
      toast.success("Challenge deleted!");
      fetchChallenges();
      fetchStats();
      setDeleteDialogOpen(false);
      setChallengeToDelete(null);
    } catch (error) {
      console.error("Failed to delete challenge:", error);
      toast.error("Failed to delete challenge");
    }
  };

  const getChallengeIcon = (type) => {
    const iconMap = {
      followers: <Users className="h-5 w-5" />,
      stars: <Star className="h-5 w-5" />,
      repo_stars: <GitBranch className="h-5 w-5" />,
      commits: <GitBranch className="h-5 w-5" />,
      pull_requests: <GitBranch className="h-5 w-5" />,
      issues_closed: <Target className="h-5 w-5" />,
      contributions: <TrendingUp className="h-5 w-5" />,
      streak_days: <TrendingUp className="h-5 w-5" />,
      repos_created: <Plus className="h-5 w-5" />,
      forks: <GitBranch className="h-5 w-5" />,
      watchers: <Users className="h-5 w-5" />,
      languages_used: <Star className="h-5 w-5" />,
    };
    return iconMap[type] || <Target className="h-5 w-5" />;
  };

  const getChallengeTypeLabel = (type) => {
    const labelMap = {
      followers: "Followers",
      stars: "Total Stars",
      repo_stars: "Repo Stars",
      commits: "Commits",
      pull_requests: "Pull Requests",
      issues_closed: "Issues Closed",
      contributions: "Contributions",
      streak_days: "Contribution Streak",
      repos_created: "Repos Created",
      forks: "Forks",
      watchers: "Watchers",
      languages_used: "Languages Used",
    };
    return labelMap[type] || type;
  };

  const getDifficultyBadge = (difficulty) => {
    const colors = {
      easy: "bg-cyan-400",
      medium: "bg-cyan-600",
      hard: "bg-cyan-700",
      legendary: "bg-cyan-800",
    };
    return colors[difficulty] || "bg-gray-500";
  };

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-cyan-600";
      case "active":
        return "bg-cyan-500";
      case "failed":
      case "expired":
        return "bg-slate-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please log in to view challenges</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-normal mb-2">Challenges</h1>
          <p className="text-muted-foreground">Set goals and track your GitHub growth</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAISuggestionOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Ask AI
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Challenge
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-normal">{stats.active || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-normal">{stats.completed || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-normal">{stats.total || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Challenges Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading challenges...</p>
            </div>
          ) : challenges.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-normal mb-2">No challenges yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first challenge to start tracking your GitHub goals
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Challenge
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges.map((challenge) => {
                const progress =
                  ((challenge.currentValue - challenge.startValue) /
                    (challenge.targetValue - challenge.startValue)) *
                  100;
                const clampedProgress = Math.min(Math.max(progress, 0), 100);

                return (
                  <Card key={challenge._id} className="relative">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getChallengeIcon(challenge.type)}
                          <div>
                            <CardTitle className="text-lg">{challenge.title}</CardTitle>
                            <CardDescription>
                              {getChallengeTypeLabel(challenge.type)}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          <Badge className={getStatusColor(challenge.status)}>
                            {challenge.status}
                          </Badge>
                          {challenge.difficulty && (
                            <Badge className={getDifficultyBadge(challenge.difficulty)}>
                              {challenge.difficulty}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {challenge.description && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {challenge.description}
                        </p>
                      )}

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">
                              {challenge.currentValue} / {challenge.targetValue}
                            </span>
                          </div>
                          <Progress value={clampedProgress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {clampedProgress.toFixed(1)}% complete
                          </p>
                        </div>

                        {challenge.repoName && (
                          <div className="flex items-center gap-2 text-sm">
                            <GitBranch className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{challenge.repoName}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {getTimeRemaining(challenge.deadline)}
                          </span>
                        </div>

                        {challenge.rewards?.xp && (
                          <div className="flex items-center gap-2 text-sm">
                            <Trophy className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                            <span className="text-muted-foreground">
                              Reward: {challenge.rewards.xp} XP
                            </span>
                            {challenge.rewards.badge && (
                              <Badge variant="outline" className="text-xs">
                                {challenge.rewards.badge}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          {challenge.status === "active" && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateProgress(challenge._id)}
                              className="flex-1"
                            >
                              Update Progress
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteClick(challenge)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateChallengeDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) setAiSuggestionData(null);
        }}
        initialData={aiSuggestionData}
        onSuccess={() => {
          fetchChallenges();
          fetchStats();
          setAiSuggestionData(null);
        }}
      />

      <AIChallengeDialog
        open={isAISuggestionOpen}
        onOpenChange={setIsAISuggestionOpen}
        onSelectChallenge={(suggestion) => {
          setAiSuggestionData(suggestion);
          setIsAISuggestionOpen(false);
          setIsCreateDialogOpen(true);
          toast.success("Challenge suggestion loaded! Set your deadline and create.");
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Challenge?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{challengeToDelete?.title}"? This action cannot be
              undone and all progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
