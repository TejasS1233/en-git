import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function WidgetGenerator() {
  usePageTitle("Widget Generator - Embed Your GitHub Stats");

  const [username, setUsername] = useState("TejasS1233");
  const [widgetType, setWidgetType] = useState("card");
  const [theme, setTheme] = useState("dark");
  const [copied, setCopied] = useState(false);

  const baseUrl = "https://en-git.onrender.com"; // Backend URL
  const widgetUrl = `${baseUrl}/widget/${username}?type=${widgetType}&theme=${theme}`;
  const profileUrl = "https://en-git.vercel.app/stats/" + username; // Frontend URL

  const markdownCode = `[![en-git stats](${widgetUrl})](${profileUrl})`;
  const htmlCode = `<a href="${profileUrl}"><img src="${widgetUrl}" alt="en-git stats" /></a>`;
  const directUrl = widgetUrl;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${type} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const widgetSizes = {
    card: { width: 300, height: 180 },
    full: { width: 495, height: 195 },
    stats: { width: 400, height: 120 },
    compact: { width: 350, height: 100 },
    badge: { width: 200, height: 80 },
    rank: { width: 250, height: 100 },
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Widget Generator
        </h1>
        <p className="text-xl text-muted-foreground">
          Embed your GitHub stats anywhere - README, portfolio, blog
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customize Your Widget</CardTitle>
              <CardDescription>Configure your widget appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">GitHub Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter GitHub username"
                />
              </div>

              {/* Widget Type */}
              <div className="space-y-2">
                <Label>Widget Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["card", "full", "stats", "compact", "badge", "rank"].map((type) => (
                    <Button
                      key={type}
                      variant={widgetType === type ? "default" : "outline"}
                      onClick={() => setWidgetType(type)}
                      className="capitalize"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => setTheme("dark")}
                  >
                    Dark
                  </Button>
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => setTheme("light")}
                  >
                    Light
                  </Button>
                </div>
              </div>

              {/* Widget Info */}
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">
                  <strong>Size:</strong> {widgetSizes[widgetType].width}x
                  {widgetSizes[widgetType].height}px
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Updates:</strong> Every 30 minutes
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Embed Codes */}
          <Card>
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
              <CardDescription>Copy and paste into your project</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="markdown">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="markdown">Markdown</TabsTrigger>
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="url">Direct URL</TabsTrigger>
                </TabsList>

                <TabsContent value="markdown" className="space-y-2">
                  <Label>For GitHub README</Label>
                  <div className="relative">
                    <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto">
                      {markdownCode}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(markdownCode, "Markdown code")}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="html" className="space-y-2">
                  <Label>For Websites</Label>
                  <div className="relative">
                    <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto">
                      {htmlCode}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(htmlCode, "HTML code")}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="url" className="space-y-2">
                  <Label>Direct Image URL</Label>
                  <div className="relative">
                    <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto break-all">
                      {directUrl}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(directUrl, "URL")}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>See how your widget looks</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[300px]">
              <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={widgetUrl}
                  alt="en-git widget preview"
                  className="border rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                />
              </a>
            </CardContent>
          </Card>

          {/* Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Widget Types</CardTitle>
              <CardDescription>Choose the style that fits your needs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Card (300x180)</p>
                <p className="text-xs text-muted-foreground">
                  Full profile card with avatar, score, and stats
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Stats (400x120)</p>
                <p className="text-xs text-muted-foreground">
                  Horizontal stats bar with key metrics
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Badge (200x80)</p>
                <p className="text-xs text-muted-foreground">Compact score badge</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Rank (250x100)</p>
                <p className="text-xs text-muted-foreground">Leaderboard rank with trophy</p>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-blue-600">💡 Pro Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Widgets update automatically every 30 minutes</p>
              <p>• Works on GitHub, GitLab, Bitbucket, and any website</p>
              <p>• Click the widget to visit your full profile</p>
              <p>• Analyze your profile first to appear on the leaderboard</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
