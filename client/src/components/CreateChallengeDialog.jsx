import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

const CHALLENGE_TYPES = {
  growth: [
    { value: "followers", label: "Gain Followers", icon: "", difficulty: "easy" },
    { value: "stars", label: "Total Stars", icon: "", difficulty: "medium" },
    { value: "repo_stars", label: "Repository Stars", icon: "", difficulty: "medium" },
    { value: "forks", label: "Repository Forks", icon: "", difficulty: "hard" },
    { value: "watchers", label: "Repository Watchers", icon: "", difficulty: "medium" },
  ],
  activity: [
    { value: "commits", label: "Make Commits", icon: "", difficulty: "easy" },
    { value: "pull_requests", label: "Create Pull Requests", icon: "", difficulty: "medium" },
    { value: "issues_closed", label: "Close Issues", icon: "", difficulty: "medium" },
    { value: "contributions", label: "Daily Contributions", icon: "", difficulty: "hard" },
    { value: "repos_created", label: "Create Repositories", icon: "", difficulty: "easy" },
  ],
  streak: [
    { value: "streak_days", label: "Contribution Streak", icon: "", difficulty: "hard" },
    {
      value: "languages_used",
      label: "Use Different Languages",
      icon: "",
      difficulty: "legendary",
    },
  ],
};

const DIFFICULTY_COLORS = {
  easy: "bg-cyan-400",
  medium: "bg-cyan-600",
  hard: "bg-cyan-700",
  legendary: "bg-cyan-800",
};

const DIFFICULTY_XP = {
  easy: 100,
  medium: 250,
  hard: 500,
  legendary: 1000,
};

export default function CreateChallengeDialog({ open, onOpenChange, onSuccess, initialData }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "followers",
    category: "growth",
    targetValue: "",
    repoName: "",
    deadline: "",
    difficulty: "medium",
  });

  // Pre-fill form when initialData is provided
  useEffect(() => {
    if (initialData && open) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        type: initialData.type || "followers",
        category: initialData.category || "growth",
        targetValue: initialData.targetValue?.toString() || "",
        repoName: initialData.repoName || "",
        deadline: "",
        difficulty: initialData.difficulty || "medium",
      });
    }
  }, [initialData, open]);

  const needsRepoName = ["repo_stars", "forks", "watchers"].includes(formData.type);

  const selectedChallenge = Object.values(CHALLENGE_TYPES)
    .flat()
    .find((c) => c.value === formData.type);

  const estimatedXP = selectedChallenge ? DIFFICULTY_XP[selectedChallenge.difficulty] : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.targetValue || !formData.deadline) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (needsRepoName && !formData.repoName) {
      toast.error("Repository name is required for this challenge type");
      return;
    }

    try {
      setLoading(true);

      await axiosInstance.post(`/challenges`, {
        ...formData,
        targetValue: parseInt(formData.targetValue),
        githubUsername: user.githubUsername,
        difficulty: selectedChallenge?.difficulty || "medium",
        rewards: {
          xp: estimatedXP,
          badge: selectedChallenge?.difficulty === "legendary" ? "legendary_achiever" : null,
        },
      });

      toast.success("Challenge created successfully!");
      setFormData({
        title: "",
        description: "",
        type: "followers",
        category: "growth",
        targetValue: "",
        repoName: "",
        deadline: "",
        difficulty: "medium",
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create challenge:", error);
      toast.error(error.response?.data?.message || "Failed to create challenge");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Challenge</DialogTitle>
          <DialogDescription>
            Set a goal to track your GitHub growth and achievements
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Reach 100 followers"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description for your challenge"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Challenge Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => {
                handleChange("category", value);
                const firstType = CHALLENGE_TYPES[value][0].value;
                handleChange("type", firstType);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="growth">Growth Challenges</SelectItem>
                <SelectItem value="activity">Activity Challenges</SelectItem>
                <SelectItem value="streak">Streak Challenges</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Challenge Type *</Label>
            <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHALLENGE_TYPES[formData.category].map((challenge) => (
                  <SelectItem key={challenge.value} value={challenge.value}>
                    {challenge.icon} {challenge.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedChallenge && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <span>Difficulty:</span>
                <Badge className={DIFFICULTY_COLORS[selectedChallenge.difficulty]}>
                  {selectedChallenge.difficulty}
                </Badge>
                <span>•</span>
                <span>Reward: {estimatedXP} XP</span>
              </div>
            )}
          </div>

          {needsRepoName && (
            <div className="space-y-2">
              <Label htmlFor="repoName">Repository Name *</Label>
              <Input
                id="repoName"
                placeholder="e.g., username/repo-name"
                value={formData.repoName}
                onChange={(e) => handleChange("repoName", e.target.value)}
                required={needsRepoName}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="targetValue">Target Value *</Label>
            <Input
              id="targetValue"
              type="number"
              min="1"
              placeholder="e.g., 100"
              value={formData.targetValue}
              onChange={(e) => handleChange("targetValue", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline *</Label>
            <Input
              id="deadline"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={formData.deadline}
              onChange={(e) => handleChange("deadline", e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Challenge"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
