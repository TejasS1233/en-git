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
  Download,
  Upload,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Label } from "./components/ui/label";
import { Switch } from "./components/ui/switch";
import { Separator } from "./components/ui/separator";
import { ScrollArea } from "./components/ui/scroll-area";
import { Slider } from "./components/ui/slider";
import { exportRepoBookmarks, importRepoBookmarks } from "./lib/bookmarkExport";

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
  const [editingShortcut, setEditingShortcut] = useState(null);
  const [conflicts, setConflicts] = useState({});

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

  // Check for conflicts with Chrome/GitHub shortcuts
  const checkConflict = (shortcut) => {
    const conflictMap = {
      "Ctrl+Shift+I": "Chrome opens DevTools",
      "Ctrl+Shift+J": "Chrome opens Console",
      "Ctrl+/": "Chrome focuses main content",
      "Ctrl+F": "Chrome Find",
      "Ctrl+R": "Chrome Reload",
      "Ctrl+W": "Chrome Close Tab",
    };
    return conflictMap[shortcut] || null;
  };

  // Handle keyboard shortcut capture
  const handleShortcutCapture = (e, shortcutKey) => {
    e.preventDefault();
    const keys = [];
    
    if (e.ctrlKey) keys.push("Ctrl");
    if (e.altKey) keys.push("Alt");
    if (e.shiftKey) keys.push("Shift");
    if (e.metaKey) keys.push("Meta");
    
    // Only add if it's not a modifier key
    if (!["Control", "Alt", "Shift", "Meta"].includes(e.key)) {
      keys.push(e.key.toUpperCase());
    }
    
    if (keys.length > 0 && !["Control", "Alt", "Shift", "Meta"].includes(keys[keys.length - 1])) {
      const shortcut = keys.join("+");
      
      // Check for conflicts
      const conflict = checkConflict(shortcut);
      if (conflict) {
        setConflicts((prev) => ({ ...prev, [shortcutKey]: conflict }));
      } else {
        setConflicts((prev) => {
          const newConflicts = { ...prev };
          delete newConflicts[shortcutKey];
          return newConflicts;
        });
      }
      
      // Update the shortcut
      setSettings((prev) => ({
        ...prev,
        shortcuts: {
          ...prev.shortcuts,
          [shortcutKey]: shortcut,
        },
      }));
      
      // Stop editing after capturing
      setEditingShortcut(null);
    }
  };

  const removeBookmark = (index) => {
    const updated = bookmarks.filter((_, i) => i !== index);
    setBookmarks(updated);
    chrome.storage.sync.set({ bookmarkedRepos: updated });
  };

  const handleExportRepoBookmarks = async () => {
    const result = exportRepoBookmarks(bookmarks);
    if (result.success) {
      // Show success message
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      // Show error message
      console.error("Export failed:", result.error);
      alert(`Export failed: ${result.error}`);
    }
  };

  const handleImportRepoBookmarks = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/json") {
      alert("Please select a valid JSON file");
      return;
    }

    importRepoBookmarks(file, bookmarks).then((result) => {
      if (result.success) {
        setBookmarks(result.bookmarks);
        chrome.storage.sync.set({ bookmarkedRepos: result.bookmarks });
        alert(`Imported ${result.imported} bookmarks (${result.skipped} skipped)`);
      } else {
        alert(`Import failed: ${result.error}`);
      }
    });
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 to-blue-600 p-6">
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
                    <Label htmlFor="theme-enabled">Enable Custom Theme</Label>
                    <Switch
                      id="theme-enabled"
                      checked={settings.theme.enabled}
                      onCheckedChange={(checked) => updateTheme("enabled", checked)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="primary-color">Primary Color</Label>
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
                      <Label htmlFor="accent-color">Accent Color</Label>
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
                      <Label htmlFor="bg-color">Background Color</Label>
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
                      <Label htmlFor="text-color">Text Color</Label>
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
                    <div>
                      <Label>Enhanced Contribution Graph</Label>
                      <p className="text-xs text-muted-foreground">Show detailed stats on hover</p>
                    </div>
                    <Switch
                      checked={settings.enhancements.contributionStats}
                      onCheckedChange={(checked) => updateEnhancement("contributionStats", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enhanced Repository Cards</Label>
                      <p className="text-xs text-muted-foreground">Add quick stats to repo cards</p>
                    </div>
                    <Switch
                      checked={settings.enhancements.repoCards}
                      onCheckedChange={(checked) => updateEnhancement("repoCards", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enhanced Profile</Label>
                      <p className="text-xs text-muted-foreground">
                        Show additional profile insights
                      </p>
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
                    <Label htmlFor="font-enabled">Enable Custom Font</Label>
                    <Switch
                      id="font-enabled"
                      checked={settings.font.enabled}
                      onCheckedChange={(checked) => updateFont("enabled", checked)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="font-family">Font Family</Label>
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

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="font-size">Font Size: {settings.font.size}px</Label>
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
                  <CardDescription>Customize keyboard shortcuts for faster GitHub navigation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="shortcuts-enabled">Enable Shortcuts</Label>
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

                  {!settings.shortcuts.enabled && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Shortcuts Disabled</AlertTitle>
                      <AlertDescription>
                        Enable shortcuts above to customize your keyboard bindings
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-3">
                    {/* Quick Search */}
                    <div className="p-3 bg-muted rounded-lg border-2 hover:border-primary/20 transition-colors">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-medium text-sm">Quick Search</p>
                          <p className="text-xs text-muted-foreground">Open search anywhere</p>
                          {conflicts.quickSearch && (
                            <Alert variant="destructive" className="mt-2 py-2">
                              <AlertCircle className="h-3 w-3" />
                              <AlertDescription className="text-xs">
                                Conflict detected: {conflicts.quickSearch}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                        {editingShortcut === "quickSearch" ? (
                          <Input
                            className="w-36 text-center"
                            placeholder="Press keys..."
                            onKeyDown={(e) => handleShortcutCapture(e, "quickSearch")}
                            onBlur={() => setEditingShortcut(null)}
                            autoFocus
                          />
                        ) : (
                          <kbd 
                            className="px-3 py-1.5 bg-background rounded cursor-pointer hover:bg-background/80 transition-colors min-w-[120px] text-center"
                            onClick={() => editingShortcut === null && setEditingShortcut("quickSearch")}
                          >
                            {settings.shortcuts.quickSearch}
                          </kbd>
                        )}
                      </div>
                    </div>

                    {/* New Repository */}
                    <div className="p-3 bg-muted rounded-lg border-2 hover:border-primary/20 transition-colors">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-medium text-sm">New Repository</p>
                          <p className="text-xs text-muted-foreground">Create new repository</p>
                          {conflicts.newRepo && (
                            <Alert variant="destructive" className="mt-2 py-2">
                              <AlertCircle className="h-3 w-3" />
                              <AlertDescription className="text-xs">
                                Conflict detected: {conflicts.newRepo}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                        {editingShortcut === "newRepo" ? (
                          <Input
                            className="w-36 text-center"
                            placeholder="Press keys..."
                            onKeyDown={(e) => handleShortcutCapture(e, "newRepo")}
                            onBlur={() => setEditingShortcut(null)}
                            autoFocus
                          />
                        ) : (
                          <kbd 
                            className="px-3 py-1.5 bg-background rounded cursor-pointer hover:bg-background/80 transition-colors min-w-[120px] text-center"
                            onClick={() => editingShortcut === null && setEditingShortcut("newRepo")}
                          >
                            {settings.shortcuts.newRepo}
                          </kbd>
                        )}
                      </div>
                    </div>

                    {/* View Issues */}
                    <div className="p-3 bg-muted rounded-lg border-2 hover:border-primary/20 transition-colors">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-medium text-sm">View Issues</p>
                          <p className="text-xs text-muted-foreground">Open issues page</p>
                          {conflicts.viewIssues && (
                            <Alert variant="destructive" className="mt-2 py-2">
                              <AlertCircle className="h-3 w-3" />
                              <AlertDescription className="text-xs">
                                Conflict detected: {conflicts.viewIssues}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                        {editingShortcut === "viewIssues" ? (
                          <Input
                            className="w-36 text-center"
                            placeholder="Press keys..."
                            onKeyDown={(e) => handleShortcutCapture(e, "viewIssues")}
                            onBlur={() => setEditingShortcut(null)}
                            autoFocus
                          />
                        ) : (
                          <kbd 
                            className="px-3 py-1.5 bg-background rounded cursor-pointer hover:bg-background/80 transition-colors min-w-[120px] text-center"
                            onClick={() => editingShortcut === null && setEditingShortcut("viewIssues")}
                          >
                            {settings.shortcuts.viewIssues}
                          </kbd>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reset to Defaults Button */}
                  <div className="flex justify-end pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSettings((prev) => ({
                          ...prev,
                          shortcuts: DEFAULT_SETTINGS.shortcuts,
                        }));
                        setConflicts({});
                      }}
                    >
                      <RotateCcw className="h-3 w-3 mr-2" />
                      Reset to Defaults
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bookmarks Tab */}
            <TabsContent value="bookmarks" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Bookmarked Repositories</CardTitle>
                      <CardDescription>Quick access to your favorite repositories</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportRepoBookmarks}
                        disabled={bookmarks.length === 0}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("import-repo-bookmarks").click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                      </Button>
                      <input
                        id="import-repo-bookmarks"
                        type="file"
                        accept=".json"
                        onChange={handleImportRepoBookmarks}
                        style={{ display: "none" }}
                      />
                    </div>
                  </div>
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
