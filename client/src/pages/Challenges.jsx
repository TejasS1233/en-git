import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Target, TrendingUp, Calendar, CheckCircle2, Plus, Flame } from "lucide-react";

const CHALLENGE_TYPES = [
  { value: "commit_streak", label: "Commit Streak", icon: "🔥" },
  { value: "learn_language", label: "Learn Language", icon: "💻" },
  { value: "reach_stars", label: "Reach Stars", icon: "⭐" },
  { value: "daily_commits", label: "Daily Commits", icon: "📅" },
  { value: "contribute_repos", label: "Contribute to Repos", icon: "🤝" },
];

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    type: "",
    target: "",
    metadata: {},
  });

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await axiosInstance.get("/challenges");
      setChallenges(response.data.data);
    } catch (error) {
      toast.error("Failed to load challenges");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async () => {
    try {
      const response = await axiosInstance.post("/challenges", {
        title: newChallenge.title,
        type: newChallenge.type,
        target: Number(newChallenge.target),
        metadata: newChallenge.metadata,
      });

      setChallenges((prev) => [response.data.data, ...prev]);
      setIsDialogOpen(false);
      setNewChallenge({ title: "", type: "", target: "", metadata: {} });
      toast.success("Challenge created!");
    } catch (error) {
      toast.error("Failed to create challenge");
      console.error(error);
    }
  };

  const handleTrackProgress = async (challengeId) => {
    try {
      const response = await axiosInstance.post(`/challenges/${challengeId}/track`);
      setChallenges((prev) =>
        prev.map((c) => (c._id === challengeId ? response.data.data : c))
      );
      toast.success("Progress updated!");
    } catch (error) {
      toast.error("Failed to track progress");
      console.error(error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      case "paused":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            <Target className="h-10 w-10" />
            Challenge Mode
          </h1>
          <p className="text-muted-foreground">
            Set coding goals and track your progress
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Challenge
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Challenge</DialogTitle>
              <DialogDescription>
                Set a goal and start your coding journey
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={newChallenge.title}
                  onChange={(e) =>
                    setNewChallenge({ ...newChallenge, title: e.target.value })
                  }
                  placeholder="e.g., 30-day commit streak"
                />
              </div>

              <div>
                <Label>Challenge Type</Label>
                <Select
                  value={newChallenge.type}
                  onValueChange={(value) =>
                    setNewChallenge({ ...newChallenge, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHALLENGE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Target</Label>
                <Input
                  type="number"
                  value={newChallenge.target}
                  onChange={(e) =>
                    setNewChallenge({ ...newChallenge, target: e.target.value })
                  }
                  placeholder="e.g., 30"
                />
              </div>

              {newChallenge.type === "learn_language" && (
                <div>
                  <Label>Language</Label>
                  <Input
                    value={newChallenge.metadata.language || ""}
                    onChange={(e) =>
                      setNewChallenge({
                        ...newChallenge,
                        metadata: { language: e.target.value },
                      })
                    }
                    placeholder="e.g., TypeScript"
                  />
                </div>
              )}

              <Button onClick={handleCreateChallenge} className="w-full">
                Create Challenge
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Challenges */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Flame className="h-6 w-6 text-orange-500" />
          Active Challenges
        </h2>

        {challenges.filter((c) => c.status === "active").length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No active challenges yet</p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => setIsDialogOpen(true)}
              >
                Create your first challenge
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {challenges
              .filter((c) => c.status === "active")
              .map((challenge) => (
                <Card key={challenge._id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      <Badge className={getStatusColor(challenge.status)}>
                        {challenge.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {CHALLENGE_TYPES.find((t) => t.value === challenge.type)?.icon}{" "}
                      {CHALLENGE_TYPES.find((t) => t.value === challenge.type)?.label}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span className="font-medium">
                          {challenge.current} / {challenge.target}
                        </span>
                      </div>
                      <Progress value={challenge.progress} />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Started {new Date(challenge.startDate).toLocaleDateString()}
                    </div>

                    <Button
                      onClick={() => handleTrackProgress(challenge._id)}
                      variant="outline"
                      className="w-full"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Update Progress
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>

      {/* Completed Challenges */}
      {challenges.filter((c) => c.status === "completed").length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            Completed Challenges
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {challenges
              .filter((c) => c.status === "completed")
              .map((challenge) => (
                <Card key={challenge._id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      <Badge className="bg-green-500">Completed</Badge>
                    </div>
                    <CardDescription>
                      Completed on {new Date(challenge.updatedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={100} />
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Challenges;

