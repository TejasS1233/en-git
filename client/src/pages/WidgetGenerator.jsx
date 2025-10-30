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
  const [accentColor, setAccentColor] = useState("#58a6ff");
  const [successColor, setSuccessColor] = useState("#3fb950");
  const [purpleColor, setPurpleColor] = useState("#a855f7");

  const baseUrl = "https://en-git.onrender.com"; // Backend URL
  const colorParams = `&accent=${encodeURIComponent(accentColor)}&success=${encodeURIComponent(successColor)}&purple=${encodeURIComponent(purpleColor)}`;
  const repoParam = widgetType === "repo" ? `&repo=${encodeURIComponent(username)}` : "";
  const widgetUrl = `${baseUrl}/widget/${widgetType === "repo" ? "repo" : username}?type=${widgetType}&theme=${theme}${colorParams}${repoParam}`;
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
    score: { width: 600, height: 420 },
    repo: { width: 600, height: 550 },
    skills: { width: 600, height: 400 },
    languages: { width: 500, height: 320 },
    activity: { width: 800, height: 240 },
    commits: { width: 700, height: 280 },
    stats: { width: 400, height: 120 },
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black bg-linear-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
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
                <Label htmlFor="username">
                  {widgetType === "repo" ? "Repository (owner/repo)" : "GitHub Username"}
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    widgetType === "repo" ? "e.g., TejasS1233/en-git" : "Enter GitHub username"
                  }
                />
              </div>

              {/* Widget Type */}
              <div className="space-y-2">
                <Label>Widget Type (9 Available)</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    "card",
                    "full",
                    "score",
                    "repo",
                    "skills",
                    "languages",
                    "activity",
                    "commits",
                    "stats",
                  ].map((type) => (
                    <Button
                      key={type}
                      variant={widgetType === type ? "default" : "outline"}
                      onClick={() => setWidgetType(type)}
                      className="capitalize text-xs"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Want custom widgets? Check out our{" "}
                  <a
                    href="https://github.com/TejasS1233/en-git/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Custom Widget Builder
                  </a>{" "}
                  feature request!
                </p>
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

              {/* Custom Colors */}
              <div className="space-y-2">
                <Label>Custom Colors (Optional)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="accent" className="text-xs">
                      Accent
                    </Label>
                    <Input
                      id="accent"
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="h-10 cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="success" className="text-xs">
                      Success
                    </Label>
                    <Input
                      id="success"
                      type="color"
                      value={successColor}
                      onChange={(e) => setSuccessColor(e.target.value)}
                      className="h-10 cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="purple" className="text-xs">
                      Purple
                    </Label>
                    <Input
                      id="purple"
                      type="color"
                      value={purpleColor}
                      onChange={(e) => setPurpleColor(e.target.value)}
                      className="h-10 cursor-pointer"
                    />
                  </div>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>See how your widget looks</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const img = document.querySelector("#widget-preview");
                  if (img) {
                    img.src = widgetUrl + "&t=" + Date.now();
                    toast.success("Widget reloaded!");
                  }
                }}
              >
                Reload
              </Button>
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[300px]">
              <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                <img
                  id="widget-preview"
                  src={widgetUrl}
                  alt="en-git widget preview"
                  className="border rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                />
              </a>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-blue-600">💡 Pro Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Widgets update automatically every 30 minutes</p>
              <p>• Customize colors to match your brand or style</p>
              <p>• Works on GitHub, GitLab, Bitbucket, and any website</p>
              <p>• Click the widget to visit your full profile</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
