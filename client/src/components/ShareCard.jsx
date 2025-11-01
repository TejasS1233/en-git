import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Share2,
  Download,
  Loader2,
  Copy,
  Trophy,
  BarChart3,
  Code2,
  Activity,
  Star,
  Package,
  Users,
  Sparkles,
  Check,
} from "lucide-react";
import { generateShareCard, downloadShareCard } from "../lib/shareCard";
import { toast } from "sonner";

const WIDGET_TYPES = [
  {
    id: "card",
    name: "Profile Card",
    icon: Users,
    description: "Compact profile overview",
    size: "300×180",
  },
  {
    id: "stats",
    name: "Stats Bar",
    icon: BarChart3,
    description: "Horizontal stats display",
    size: "400×120",
  },
  {
    id: "full",
    name: "Full Profile",
    icon: Sparkles,
    description: "Complete profile showcase",
    size: "495×195",
  },
  {
    id: "trophy",
    name: "Achievements",
    icon: Trophy,
    description: "Show your unlocked achievements",
    size: "400×170+",
  },
  {
    id: "languages",
    name: "Languages",
    icon: Code2,
    description: "Programming language breakdown",
    size: "500×320",
  },
  {
    id: "activity",
    name: "Activity Trend",
    icon: Activity,
    description: "Weekly contribution graph",
    size: "800×240",
  },
  {
    id: "score",
    name: "Profile Score",
    icon: Star,
    description: "Score breakdown with progress",
    size: "600×420",
  },
];

const THEMES = [
  { id: "dark", name: "Dark", bg: "from-gray-900 to-gray-800" },
  { id: "light", name: "Light", bg: "from-gray-100 to-white" },
];

export function ShareCard({ insights, username }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState("card");
  const [selectedTheme, setSelectedTheme] = useState("dark");
  const [copied, setCopied] = useState(false);

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

  const baseUrl =
    import.meta.env.VITE_API_BASE_URL?.replace("/api/v1", "") || "http://localhost:8000";
  const widgetUrl = `${baseUrl}/widget/${username}?type=${selectedWidget}&theme=${selectedTheme}`;
  const markdownCode = `[![en-git stats](${widgetUrl})](${window.location.origin}/stats/${username})`;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Widget Showcase */}
      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-cyan-500" />
                Embeddable Widgets
              </CardTitle>
              <CardDescription className="mt-1">
                Add live widgets to your GitHub README or website
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              Auto-updates every 30min
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Widget Type Selector */}
          <div>
            <h3 className="text-sm font-medium mb-3">Choose Widget Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {WIDGET_TYPES.map((widget) => {
                const Icon = widget.icon;
                return (
                  <button
                    key={widget.id}
                    onClick={() => setSelectedWidget(widget.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedWidget === widget.id
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-border hover:border-cyan-500/50 hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-5 w-5 mb-2 text-cyan-500" />
                    <div className="text-sm font-medium">{widget.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{widget.size}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Selector */}
          <div>
            <h3 className="text-sm font-medium mb-3">Theme</h3>
            <div className="flex gap-2">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    selectedTheme === theme.id
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-border hover:border-cyan-500/50"
                  }`}
                >
                  <div className={`h-8 rounded bg-gradient-to-r ${theme.bg} mb-2`} />
                  <div className="text-sm font-medium">{theme.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Widget Preview */}
          <div>
            <h3 className="text-sm font-medium mb-3">Preview</h3>
            <div className="flex justify-center p-6 rounded-lg bg-muted/20 border border-border">
              <img
                src={widgetUrl}
                alt="en-git widget preview"
                className="rounded-lg shadow-2xl max-w-full"
                style={{ maxHeight: "500px" }}
              />
            </div>
          </div>

          {/* Code Snippets */}
          <Tabs defaultValue="markdown" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="markdown">Markdown</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="url">Direct URL</TabsTrigger>
            </TabsList>

            <TabsContent value="markdown" className="space-y-2">
              <div className="relative">
                <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto">
                  <code>{markdownCode}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(markdownCode)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="html" className="space-y-2">
              <div className="relative">
                <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto">
                  <code>{`<a href="${window.location.origin}/stats/${username}">
  <img src="${widgetUrl}" alt="en-git stats" />
</a>`}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() =>
                    handleCopy(
                      `<a href="${window.location.origin}/stats/${username}">\n  <img src="${widgetUrl}" alt="en-git stats" />\n</a>`
                    )
                  }
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-2">
              <div className="relative">
                <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto">
                  <code>{widgetUrl}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(widgetUrl)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => window.open("/widgets", "_blank")}
              variant="default"
              className="flex-1"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Advanced Customization
            </Button>
          </div>

          {/* Info Box */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
            <div className="flex gap-3">
              <Sparkles className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-cyan-500">Pro Tips:</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Widgets update automatically every 30 minutes</li>
                  <li>• Works in GitHub READMEs, websites, and documentation</li>
                  <li>• Customize colors with URL parameters (accent, success, purple)</li>
                  <li>• All widgets are cached for fast loading</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Card Generator */}
      <Card className="border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-purple-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-pink-500" />
            Social Media Share Card
          </CardTitle>
          <CardDescription>
            Create a beautiful card to share your GitHub stats on Twitter, LinkedIn, and more
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!previewUrl ? (
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full"
              size="lg"
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
              <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 bg-muted/20">
                <img
                  src={previewUrl}
                  alt="Share Card Preview"
                  className="w-full rounded-lg shadow-2xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleDownload} variant="default">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={handleGenerate} variant="outline" disabled={generating}>
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Regenerate"}
                </Button>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                <div className="flex gap-3">
                  <Sparkles className="h-5 w-5 text-pink-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-pink-500">Perfect for:</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Twitter/X posts (1200×630px optimized)</li>
                      <li>• LinkedIn updates</li>
                      <li>• Blog posts and articles</li>
                      <li>• Portfolio showcases</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
