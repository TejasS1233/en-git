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

  const [widgetCategory, setWidgetCategory] = useState("profile"); // profile or repo
  const [username, setUsername] = useState("TejasS1233");
  const [repoPath, setRepoPath] = useState("TejasS1233/en-git");
  const [widgetType, setWidgetType] = useState("card");
  const [theme, setTheme] = useState("dark");
  const [copied, setCopied] = useState(false);
  const [accentColor, setAccentColor] = useState("#58a6ff");
  const [successColor, setSuccessColor] = useState("#3fb950");
  const [purpleColor, setPurpleColor] = useState("#a855f7");

  const baseUrl = "https://en-git.onrender.com"; // Backend URL
  const colorParams = `&accent=${encodeURIComponent(accentColor)}&success=${encodeURIComponent(successColor)}&purple=${encodeURIComponent(purpleColor)}`;

  // Determine URL based on widget category
  const isRepoWidget = widgetCategory === "repo";
  const repoParam = isRepoWidget ? `&repo=${encodeURIComponent(repoPath)}` : "";
  const widgetUrl = `${baseUrl}/widget/${isRepoWidget ? "repo" : username}?type=${widgetType}&theme=${theme}${colorParams}${repoParam}`;
  const profileUrl = isRepoWidget
    ? `https://github.com/${repoPath}`
    : "https://en-git.vercel.app/stats/" + username; // Frontend URL

  const markdownCode = `[![en-git stats](${widgetUrl})](${profileUrl})`;
  const htmlCode = `<a href="${profileUrl}"><img src="${widgetUrl}" alt="en-git stats" /></a>`;
  const directUrl = widgetUrl;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${type} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const profileWidgets = [
    "card",
    "full",
    "score",
    "skills",
    "languages",
    "activity",
    "commits",
    "stats",
    "trophy",
  ];
  const repoWidgets = ["repo", "contributors"];

  const widgetSizes = {
    card: { width: 300, height: 180 },
    full: { width: 495, height: 195 },
    score: { width: 600, height: 420 },
    repo: { width: 700, height: 550 },
    contributors: { width: 650, height: 550 },
    skills: { width: 600, height: 400 },
    languages: { width: 500, height: 320 },
    activity: { width: 800, height: 240 },
    commits: { width: 700, height: 280 },
    stats: { width: 400, height: 120 },
    trophy: { width: 350, height: 150 },
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-800 via-cyan-600 to-cyan-800 dark:from-cyan-300 dark:via-cyan-400 dark:to-cyan-300 bg-clip-text text-transparent leading-[1.2] pb-2 mb-4">
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
              {/* Widget Category Tabs */}
              <div className="space-y-2">
                <Label>Widget Category</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={widgetCategory === "profile" ? "default" : "outline"}
                    onClick={() => {
                      setWidgetCategory("profile");
                      setWidgetType("card");
                    }}
                  >
                    Profile Widgets
                  </Button>
                  <Button
                    variant={widgetCategory === "repo" ? "default" : "outline"}
                    onClick={() => {
                      setWidgetCategory("repo");
                      setWidgetType("repo");
                    }}
                  >
                    Repository Widgets
                  </Button>
                </div>
              </div>

              {/* Username or Repo Path */}
              <div className="space-y-2">
                <Label htmlFor="input">
                  {widgetCategory === "repo" ? "Repository (owner/repo)" : "GitHub Username"}
                </Label>
                <Input
                  id="input"
                  value={widgetCategory === "repo" ? repoPath : username}
                  onChange={(e) =>
                    widgetCategory === "repo"
                      ? setRepoPath(e.target.value)
                      : setUsername(e.target.value)
                  }
                  placeholder={
                    widgetCategory === "repo" ? "e.g., facebook/react" : "e.g., TejasS1233"
                  }
                />
              </div>

              {/* Widget Type */}
              <div className="space-y-2">
                <Label>
                  {widgetCategory === "profile" ? "Profile Widget Type" : "Repository Widget Type"}
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {(widgetCategory === "profile" ? profileWidgets : repoWidgets).map((type) => (
                    <Button
                      key={type}
                      variant={widgetType === type ? "default" : "outline"}
                      onClick={() => setWidgetType(type)}
                      className="capitalize text-xs cursor-pointer"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {widgetCategory === "profile"
                    ? "8 profile widgets available"
                    : "2 repository widgets available"}
                </p>
              </div>

              {/* Theme */}
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <Button
                    className="cursor-pointer"
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => setTheme("dark")}
                  >
                    Dark
                  </Button>
                  <Button
                    className="cursor-pointer"
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
                <div className="grid grid-cols-3 gap-2 mt-5">
                  <div>
                    <Label htmlFor="accent" className="text-xs">
                      Accent
                    </Label>
                    <Input
                      id="accent"
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="h-10 cursor-pointer mt-2"
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
                      className="h-10 cursor-pointer mt-2"
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
                      className="h-10 cursor-pointer mt-2"
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
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription className="mt-1.5">See how your widget looks</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
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
                  className="border rounded-lg transition-colors"
                />
              </a>
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
                <TabsList className="grid w-full grid-cols-3 mb-5">
                  <TabsTrigger value="markdown">Markdown</TabsTrigger>
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="url">Direct URL</TabsTrigger>
                </TabsList>

                <TabsContent value="markdown" className="space-y-2">
                  <Label>For GitHub README</Label>
                  <div className="relative">
                    <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto mt-3">
                      {markdownCode}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 cursor-pointer bg-[#656769]"
                      onClick={() => copyToClipboard(markdownCode, "Markdown code")}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="html" className="space-y-2">
                  <Label>For Websites</Label>
                  <div className="relative">
                    <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto mt-3">
                      {htmlCode}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 cursor-pointer bg-[#656769]"
                      onClick={() => copyToClipboard(htmlCode, "HTML code")}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="url" className="space-y-2">
                  <Label>Direct Image URL</Label>
                  <div className="relative">
                    <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto break-all mt-3">
                      {directUrl}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 cursor-pointer bg-[#656769]"
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
      </div>
    </div>
  );
}
