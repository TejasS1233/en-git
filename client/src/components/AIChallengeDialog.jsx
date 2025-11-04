import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Target, TrendingUp, Zap } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

export default function AIChallengeDialog({ open, onOpenChange, onSelectChallenge }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const handleGetSuggestions = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(`/challenges/ai-suggest`, {
        githubUsername: user.githubUsername,
      });
      setSuggestions(response.data.data || []);
    } catch (error) {
      console.error("Failed to get AI suggestions:", error);
      toast.error("Failed to get AI suggestions");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    onSelectChallenge(suggestion);
    onOpenChange(false);
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: "bg-green-500",
      medium: "bg-yellow-500",
      hard: "bg-orange-500",
      legendary: "bg-purple-500",
    };
    return colors[difficulty] || "bg-gray-500";
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return <Target className="h-4 w-4" />;
      case "medium":
        return <TrendingUp className="h-4 w-4" />;
      case "hard":
      case "legendary":
        return <Zap className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Challenge Suggestions
          </DialogTitle>
          <DialogDescription>
            Get personalized challenge recommendations based on your GitHub profile
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {suggestions.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Click the button below to get AI-powered challenge suggestions tailored to your
                profile
              </p>
              <Button onClick={handleGetSuggestions} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing your profile...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Suggestions
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-3">
                {suggestions.map((suggestion, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{suggestion.title}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {suggestion.description}
                          </CardDescription>
                        </div>
                        <Badge className={getDifficultyColor(suggestion.difficulty)}>
                          <span className="flex items-center gap-1">
                            {getDifficultyIcon(suggestion.difficulty)}
                            {suggestion.difficulty}
                          </span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Target: {suggestion.targetValue}</span>
                        <span>•</span>
                        <span>Reward: {suggestion.xp} XP</span>
                        <span>•</span>
                        <span>{suggestion.duration}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={handleGetSuggestions}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting new suggestions...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get More Suggestions
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
