import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

export function AIRepoDescription({ owner, repo, repoData }) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateDescription = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/repository/${owner}/${repo}/generate-description`, {
        repoData,
      });
      setDescription(response.data.data.description);
      toast.success("Description generated!");
    } catch (error) {
      console.error("Failed to generate description:", error);
      toast.error(error.response?.data?.message || "Failed to generate description");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(description);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  if (!description && !loading) {
    return (
      <Card className="mb-8 border-2 border-purple-600">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4 flex-1">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <div>
                <p className="font-bold text-xl">AI-Powered Description</p>
                <p className="text-base text-muted-foreground mt-2">
                  Generate a compelling project description using Gemini AI
                </p>
              </div>
            </div>
            <Button
              onClick={generateDescription}
              disabled={loading}
              size="lg"
              className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all text-base px-8 py-6 shrink-0"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Generate Description
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="mb-8 border-2 border-purple-600">
        <CardContent className="pt-8 pb-8">
          <div className="flex items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
            <p className="text-lg font-medium text-muted-foreground">
              Generating description with AI...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 border-2 border-purple-600">
      <CardContent className="pt-8 pb-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <p className="font-bold text-lg">AI-Generated Description</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={copyToClipboard} variant="outline" size="default">
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                onClick={generateDescription}
                variant="outline"
                size="default"
                disabled={loading}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </div>
          <div className="p-6 rounded-xl border">
            <p className="text-lg leading-relaxed font-medium">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
