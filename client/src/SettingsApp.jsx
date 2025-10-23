import { useState, useEffect } from "react";
import {
  Palette,
  Keyboard,
  Type,
  Moon,
  Sun,
  Bookmark,
  Sparkles,
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Code,
  Github,
  Info,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Label } from "./components/ui/label";
import { Switch } from "./components/ui/switch";
import { Separator } from "./components/ui/separator";
import { ScrollArea } from "./components/ui/scroll-area";
import { Slider } from "./components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "./components/ui/tooltip";

const DEFAULT_SETTINGS = {
  theme: {
    enabled: false,
    primaryColor: "#6366f1",
    accentColor: "#8b5cf6",
    backgroundColor: "#0d1117",
    textColor: "#c9d1d9",
  },
  font: {
    enabled: false,
    family: "Consolas, Monaco, monospace",
    size: 14,
  },
  darkMode: {
    autoToggle: false,
    schedule: { start: "20:00", end: "07:00" },
  },
  shortcuts: {
    enabled: true,
    quickSearch: "Ctrl+K",
    newRepo: "Ctrl+Shift+N",
    viewIssues: "Ctrl+Shift+I",
  },
  enhancements: {
    contributionStats: true,
    repoCards: true,
    enhancedProfile: true,
  },
};

function SettingsApp() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    // Load settings from storage
    chrome.storage.sync.get(["extensionSettings", "bookmarkedRepos"], (result) => {
      if (result.extensionSettings) {
        setSettings(result.extensionSettings);
      }
      if (result.bookmarkedRepos) {
        setBookmarks(result.bookmarkedRepos);
      }
    });
  }, []);

  const saveSettings = () => {
    chrome.storage.sync.set({ extensionSettings: settings }, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

      // Send message to content script to apply settings
      chrome.tabs.query({ url: "https://github.com/*" }, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, {
            action: "applySettings",
            settings: settings,
          });
        });
      });
    });
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const updateTheme = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      theme: { ...prev.theme, [key]: value },
    }));
  };

  const updateFont = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      font: { ...prev.font, [key]: value },
    }));
  };

  const updateEnhancement = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      enhancements: { ...prev.enhancements, [key]: value },
    }));
  };

  const removeBookmark = (index) => {
    const updated = bookmarks.filter((_, i) => i !== index);
    setBookmarks(updated);
    chrome.storage.sync.set({ bookmarkedRepos: updated });
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white">en-git Settings</h1>
            <p className="text-sm text-white/80 mt-1">Customize your GitHub experience</p>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="p-6 space-y-4">
          <Tabs defaultValue="theme" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="theme">
                <Palette className="h-4 w-4 mr-2" />
                Theme
              </TabsTrigger>
              <TabsTrigger value="editor">
                <Code className="h-4 w-4 mr-2" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="shortcuts">
                <Keyboard className="h-4 w-4 mr-2" />
                Shortcuts
              </TabsTrigger>
              <TabsTrigger value="bookmarks">
                <Bookmark className="h-4 w-4 mr-2" />
                Bookmarks
              </TabsTrigger>
            </TabsList>

            {/* Theme Settings */}
            <TabsContent value="theme" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Custom GitHub Theme</CardTitle>
                  <CardDescription>
                    Personalize GitHub's appearance with custom colors
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="theme-enabled">Enable Custom Theme</Label>
                      <Tooltip>
                        <TooltipTrigger type="button" className="cursor-help text-muted-foreground hover:text-foreground">
                          <Info className="h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Apply custom colors to GitHub's interface</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      id="theme-enabled"
                      checked={settings.theme.enabled}
                      onCheckedChange={(checked) => updateTheme("enabled", checked)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="primary-color">Primary Color</Label>
                        <Tooltip>
                          <TooltipTrigger type="button" className="cursor-help text-muted-foreground hover:text-foreground">
                            <Info className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Main color for links, buttons, and highlights</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          id="primary-color"
                          type="color"
                          value={settings.theme.primaryColor}
                          onChange={(e) => updateTheme("primaryColor", e.target.value)}
                          className="w-16 h-10 p-1 cursor-pointer"
                          disabled={!settings.theme.enabled}
                        />
                        <Input
                          type="text"
                          value={settings.theme.primaryColor}
                          onChange={(e) => updateTheme("primaryColor", e.target.value)}
                          className="w-24 text-xs"
                          disabled={!settings.theme.enabled}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="accent-color">Accent Color</Label>
                        <Tooltip>
                          <TooltipTrigger type="button" className="cursor-help text-muted-foreground hover:text-foreground">
                            <Info className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Secondary color for accents and highlights</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          id="accent-color"
                          type="color"
                          value={settings.theme.accentColor}
                          onChange={(e) => updateTheme("accentColor", e.target.value)}
                          className="w-16 h-10 p-1 cursor-pointer"
                          disabled={!settings.theme.enabled}
                        />
                        <Input
                          type="text"
                          value={settings.theme.accentColor}
                          onChange={(e) => updateTheme("accentColor", e.target.value)}
                          className="w-24 text-xs"
                          disabled={!settings.theme.enabled}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="bg-color">Background Color</Label>
                        <Tooltip>
                          <TooltipTrigger type="button" className="cursor-help text-muted-foreground hover:text-foreground">
                            <Info className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Color for page backgrounds</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          id="bg-color"
                          type="color"
                          value={settings.theme.backgroundColor}
                          onChange={(e) => updateTheme("backgroundColor", e.target.value)}
                          className="w-16 h-10 p-1 cursor-pointer"
                          disabled={!settings.theme.enabled}
                        />
                        <Input
                          type="text"
                          value={settings.theme.backgroundColor}
                          onChange={(e) => updateTheme("backgroundColor", e.target.value)}
                          className="w-24 text-xs"
                          disabled={!settings.theme.enabled}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="text-color">Text Color</Label>
                        <Tooltip>
                          <TooltipTrigger type="button" className="cursor-help text-muted-foreground hover:text-foreground">
                            <Info className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Color for text content</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          id="text-color"
                          type="color"
                          value={settings.theme.textColor}
                          onChange={(e) => updateTheme("textColor", e.target.value)}
                          className="w-16 h-10 p-1 cursor-pointer"
                          disabled={!settings.theme.enabled}
                        />
                        <Input
                          type="text"
                          value={settings.theme.textColor}
                          onChange={(e) => updateTheme("textColor", e.target.value)}
                          className="w-24 text-xs"
                          disabled={!settings.theme.enabled}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  {settings.theme.enabled && (
                    <div
                      className="p-4 rounded-lg border-2"
                      style={{
                        backgroundColor: settings.theme.backgroundColor,
                        borderColor: settings.theme.primaryColor,
                        color: settings.theme.textColor,
                      }}
                    >
                      <p className="font-semibold" style={{ color: settings.theme.primaryColor }}>
                        Preview
                      </p>
                      <p className="text-sm mt-2">
                        This is how your GitHub will look with these colors.
                      </p>
                      <Button
                        className="mt-3"
                        size="sm"
                        style={{
                          backgroundColor: settings.theme.accentColor,
                          color: "white",
                        }}
                      >
                        Button Example
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Enhancements</CardTitle>
                  <CardDescription>Additional visual improvements for GitHub</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div>
                        <Label>Enhanced Contribution Graph</Label>
                        <p className="text-xs text-muted-foreground">Show detailed stats on hover</p>
                      </div>
                      <Tooltip>
                        <TooltipTrigger type="button" className="cursor-help text-muted-foreground hover:text-foreground">
                          <Info className="h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Shows detailed contribution statistics when hovering over the contribution graph</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      checked={settings.enhancements.contributionStats}
                      onCheckedChange={(checked) => updateEnhancement("contributionStats", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div>
                        <Label>Enhanced Repository Cards</Label>
                        <p className="text-xs text-muted-foreground">Add quick stats to repo cards</p>
                      </div>
                      <Tooltip>
                        <TooltipTrigger type="button" className="cursor-help text-muted-foreground hover:text-foreground">
                          <Info className="h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Adds additional statistics to repository cards for quick insights</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      checked={settings.enhancements.repoCards}
                      onCheckedChange={(checked) => updateEnhancement("repoCards", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div>
                        <Label>Enhanced Profile</Label>
                        <p className="text-xs text-muted-foreground">
                          Show additional profile insights
                        </p>
                      </div>
                      <Tooltip>
                        <TooltipTrigger type="button" className="cursor-help text-muted-foreground hover:text-foreground">
                          <Info className="h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Provides additional insights and statistics on GitHub profiles</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      checked={settings.enhancements.enhancedProfile}
                      onCheckedChange={(checked) => updateEnhancement("enhancedProfile", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Editor Settings */}
            <TabsContent value="editor" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Code Editor Customization</CardTitle>
                  <CardDescription>Customize how code appears on GitHub</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="font-enabled">Enable Custom Font</Label>
                      <Tooltip>
                        <TooltipTrigger type="button" className="cursor-help text-muted-foreground hover:text-foreground">
                          <Info className="h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Use custom fonts in GitHub's code editor</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      id="font-enabled"
                      checked={settings.font.enabled}
                      onCheckedChange={(checked) => updateFont("enabled", checked)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="font-family">Font Family</Label>
                      <Tooltip>
                        <TooltipTrigger type="button" className="cursor-help text-muted-foreground hover:text-foreground">
                          <Info className="h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Choose a font for code display</p>
                        </TooltipContent>
                      </Tooltip>
                      <select
                        id="font-family"
                        value={settings.font.family}
                        onChange={(e) => updateFont("family", e.target.value)}
                        disabled={!settings.font.enabled}
                        className="w-full mt-2 p-2 rounded-md border bg-background"
                      >
                        <option value="Consolas, Monaco, monospace">Consolas</option>
                        <option value="'Fira Code', monospace">Fira Code</option>
                        <option value="'Source Code Pro', monospace">Source Code Pro</option>
                        <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                        <option value="'Cascadia Code', monospace">Cascadia Code</option>
                        <option value="'SF Mono', monospace">SF Mono</option>
                        <option value="monospace">System Monospace</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-between mb-2 w-full">
                        <Label htmlFor="font-size">Font Size: {settings.font.size}px</Label>
                        <Tooltip>
                          <TooltipTrigger type="button" className="cursor-help text-muted-foreground hover:text-foreground ml-2">
                            <Info className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Adjust the size of the code font</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Slider
                        id="font-size"
                        min={10}
                        max={24}
                        step={1}
                        value={[settings.font.size]}
                        onValueChange={(value) => updateFont("size", value[0])}
                        disabled={!settings.font.enabled}
                      />
                    </div>

                    {/* Preview */}
                    {settings.font.enabled && (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                        <pre
                          style={{
                            fontFamily: settings.font.family,
                            fontSize: `${settings.font.size}px`,
                          }}
                        >
                          {`function hello() {\n  console.log("Hello, World!");\n}`}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Shortcuts Settings */}
            <TabsContent value="shortcuts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Keyboard Shortcuts</CardTitle>
                  <CardDescription>Quick actions for faster GitHub navigation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="shortcuts-enabled">Enable Shortcuts</Label>
                      <Tooltip>
                        <TooltipTrigger type="button" className="cursor-help text-muted-foreground hover:text-foreground">
                          <Info className="h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enable keyboard shortcuts for faster navigation</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      id="shortcuts-enabled"
                      checked={settings.shortcuts.enabled}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          shortcuts: { ...prev.shortcuts, enabled: checked },
                        }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Quick Search</p>
                          <p className="text-xs text-muted-foreground">Open search anywhere</p>
                        </div>
                        <kbd className="px-2 py-1 bg-background rounded text-xs">Ctrl+K</kbd>
                      </div>
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">New Repository</p>
                          <p className="text-xs text-muted-foreground">Create new repository</p>
                        </div>
                        <kbd className="px-2 py-1 bg-background rounded text-xs">Ctrl+Shift+N</kbd>
                      </div>
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">View Issues</p>
                          <p className="text-xs text-muted-foreground">Open issues page</p>
                        </div>
                        <kbd className="px-2 py-1 bg-background rounded text-xs">Ctrl+Shift+I</kbd>
                      </div>
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Toggle Dark Mode</p>
                          <p className="text-xs text-muted-foreground">Switch theme quickly</p>
                        </div>
                        <kbd className="px-2 py-1 bg-background rounded text-xs">Ctrl+Shift+D</kbd>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bookmarks Tab */}
            <TabsContent value="bookmarks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">Bookmarked Repositories
                    <Tooltip>
                      <TooltipTrigger type="button" className="cursor-help text-muted-foreground hover:text-foreground">
                        <Info className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Save your favorite repositories for quick access</p>
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                  <CardDescription>Quick access to your favorite repositories</CardDescription>
                </CardHeader>
                <CardContent>
                  {bookmarks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bookmark className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No bookmarks yet</p>
                      <p className="text-xs mt-1">
                        Visit a repository on GitHub and click the bookmark button
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {bookmarks.map((bookmark, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Github className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{bookmark.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {bookmark.owner}/{bookmark.repo}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => chrome.tabs.create({ url: bookmark.url })}
                            >
                              Open
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => removeBookmark(index)}>
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save/Reset Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={saveSettings} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {saved ? "Saved!" : "Save Settings"}
            </Button>
            <Button onClick={resetSettings} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export default SettingsApp;
