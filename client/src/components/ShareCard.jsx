import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Share2, Download, Loader2 } from "lucide-react";
import { generateShareCard, downloadShareCard } from "../lib/shareCard";
import { toast } from "sonner";

export function ShareCard({ insights, username }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const blob = await generateShareCard(insights);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      toast.success("Share card generated!");
    } catch (error) {
      console.error("Failed to generate share card:", error);
      toast.error("Failed to generate share card");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadShareCard(insights, username);
      toast.success("Share card downloaded!");
    } catch (error) {
      console.error("Failed to download share card:", error);
      toast.error("Failed to download share card");
    }
  };

  const baseUrl = "https://en-git.onrender.com"; // Backend URL
  const widgetUrl = `${baseUrl}/widget/${username}?type=card&theme=dark`;

  return (
    <div className="space-y-6">
      {/* Widget Embed Section */}
      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-cyan-500" />
            Embeddable Widget
          </CardTitle>
          <CardDescription>Add a live widget to your GitHub README or website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Widget Preview */}
          <div className="flex justify-center p-4 rounded-lg bg-muted/20">
            <img src={widgetUrl} alt="en-git widget" className="rounded-lg shadow-lg" />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(
                  `[![en-git stats](${widgetUrl})](${window.location.origin}/stats/${username})`
                );
                toast.success("Markdown code copied!");
              }}
              variant="outline"
              className="flex-1"
            >
              Copy Markdown
            </Button>
            <Button onClick={() => window.open("/widgets", "_blank")} variant="default">
              Customize
            </Button>
          </div>

          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">
              💡 Widget updates automatically every 30 minutes with your latest stats!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Share Card Generator */}
      <Card className="border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-purple-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-pink-500" />
            Share Card Generator
          </CardTitle>
          <CardDescription>
            Create a beautiful card to share your GitHub stats on social media
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!previewUrl ? (
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full"
              variant="default"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Generate Share Card
                </>
              )}
            </Button>
          ) : (
            <>
              <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-2 bg-muted/20">
                <img
                  src={previewUrl}
                  alt="Share Card Preview"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleDownload} className="flex-1" variant="default">
                  <Download className="h-4 w-4 mr-2" />
                  Download Card
                </Button>
                <Button onClick={handleGenerate} variant="outline" disabled={generating}>
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Regenerate"}
                </Button>
              </div>

              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">
                  💡 Perfect size for Twitter/X cards (1200x630px). Share your coding journey! 🚀
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
