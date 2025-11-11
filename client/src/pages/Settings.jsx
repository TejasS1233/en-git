import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import {
  Copy,
  RefreshCw,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { useTheme } from "../components/ThemeProvider";

const Settings = () => {
  const { user } = useAuth();
  const [webhookToken, setWebhookToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);

  // Theme customization state - Matches your index.css teal theme
  const [themeColors, setThemeColors] = useState({
    primary: localStorage.getItem("theme-primary") || "186 100% 20%", // #005566
    primaryForeground: localStorage.getItem("theme-primary-fg") || "0 0% 100%",
    secondary: localStorage.getItem("theme-secondary") || "52 75% 58%", // #e8d33f
    secondaryForeground: localStorage.getItem("theme-secondary-fg") || "186 100% 20%",
    accent: localStorage.getItem("theme-accent") || "52 75% 58%", // #e8d33f
    accentForeground: localStorage.getItem("theme-accent-fg") || "186 100% 20%",
    background: localStorage.getItem("theme-background") || "183 71% 98%", // #f8fcfd
    foreground: localStorage.getItem("theme-foreground") || "186 100% 20%",
    card: localStorage.getItem("theme-card") || "183 71% 98%",
    cardForeground: localStorage.getItem("theme-card-fg") || "186 100% 20%",
    muted: localStorage.getItem("theme-muted") || "184 87% 94%", // #e0fbfc
    mutedForeground: localStorage.getItem("theme-muted-fg") || "186 100% 20%",
    border: localStorage.getItem("theme-border") || "182 65% 82%", // #b8e6e8
    input: localStorage.getItem("theme-input") || "182 65% 82%",
    ring: localStorage.getItem("theme-ring") || "186 100% 20%",
  });

  const [expandedSections, setExpandedSections] = useState({
    primary: false,
    secondary: false,
    accent: false,
    base: false,
    card: false,
  });

  // Fetch webhook token on mount
  useEffect(() => {
    if (user) {
      fetchWebhookToken();
    }
  }, [user]);

  const fetchWebhookToken = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/webhook/token`, {
        withCredentials: true,
      });
      console.log("Webhook response:", response.data);
      const token = response.data?.data?.token;
      if (token) {
        setWebhookToken(token);
      } else {
        console.error("No token in response:", response.data);
        toast.error("Token not found in response");
      }
    } catch (error) {
      console.error("Error fetching webhook token:", error);
      if (error.response?.status === 401) {
        toast.error("Please log in to access webhook token");
      } else {
        toast.error("Failed to fetch webhook token");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateClick = () => {
    setShowRegenerateDialog(true);
  };

  const confirmRegenerate = async () => {
    try {
      setLoading(true);
      setShowRegenerateDialog(false);
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/webhook/regenerate-token`,
        {},
        { withCredentials: true }
      );
      setWebhookToken(response.data.data.token);
      toast.success("Token regenerated! Update your GitHub secrets.");
    } catch (error) {
      console.error("Error regenerating token:", error);
      toast.error("Failed to regenerate token");
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(webhookToken);
    setCopied(true);
    toast.success("Token copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const presetThemes = {
    default: {
      name: "Teal (Default)",
      primary: "186 100% 20%", // #005566
      primaryForeground: "0 0% 100%",
      secondary: "52 75% 58%", // #e8d33f
      secondaryForeground: "186 100% 20%",
      accent: "52 75% 58%",
      accentForeground: "186 100% 20%",
      background: "183 71% 98%", // #f8fcfd
      foreground: "186 100% 20%",
      card: "183 71% 98%",
      cardForeground: "186 100% 20%",
      muted: "184 87% 94%", // #e0fbfc
      mutedForeground: "186 100% 20%",
      border: "182 65% 82%", // #b8e6e8
      input: "182 65% 82%",
      ring: "186 100% 20%",
    },
    green: {
      name: "GitHub Green",
      primary: "142 71% 45%",
      primaryForeground: "0 0% 100%",
      secondary: "240 5% 26%",
      secondaryForeground: "0 0% 100%",
      accent: "142 71% 45%",
      accentForeground: "0 0% 100%",
      background: "0 0% 100%",
      foreground: "240 10% 3.9%",
      card: "0 0% 100%",
      cardForeground: "240 10% 3.9%",
      muted: "240 4.8% 95.9%",
      mutedForeground: "240 3.8% 46.1%",
      border: "240 5.9% 90%",
      input: "240 5.9% 90%",
      ring: "142 71% 45%",
    },
    blue: {
      name: "Ocean Blue",
      primary: "221 83% 53%",
      primaryForeground: "210 20% 98%",
      secondary: "217 32.6% 17.5%",
      secondaryForeground: "210 20% 98%",
      accent: "221 83% 53%",
      accentForeground: "222 47% 11%",
    },
    purple: {
      name: "Royal Purple",
      primary: "271 81% 56%",
      primaryForeground: "210 20% 98%",
      secondary: "217 32.6% 17.5%",
      secondaryForeground: "210 20% 98%",
      accent: "271 81% 56%",
      accentForeground: "222 47% 11%",
    },
    rose: {
      name: "Rose",
      primary: "350 89% 60%",
      primaryForeground: "210 20% 98%",
      secondary: "217 32.6% 17.5%",
      secondaryForeground: "210 20% 98%",
      accent: "350 89% 60%",
      accentForeground: "222 47% 11%",
    },
    orange: {
      name: "Orange",
      primary: "24 95% 53%",
      primaryForeground: "210 20% 98%",
      secondary: "217 32.6% 17.5%",
      secondaryForeground: "210 20% 98%",
      accent: "24 95% 53%",
      accentForeground: "222 47% 11%",
    },
  };

  const updateThemeColor = (key, value) => {
    const newColors = { ...themeColors, [key]: value };
    setThemeColors(newColors);
    document.documentElement.style.setProperty(
      `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`,
      value
    );
    localStorage.setItem(`theme-${key}`, value);
  };

  const applyPresetTheme = (presetKey) => {
    const preset = presetThemes[presetKey];
    if (preset) {
      Object.entries(preset).forEach(([key, value]) => {
        if (key !== "name") {
          document.documentElement.style.setProperty(
            `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`,
            value
          );
          localStorage.setItem(`theme-${key}`, value);
        }
      });
      setThemeColors({ ...themeColors, ...preset });
      toast.success(`Applied ${preset.name} theme`);
    }
  };

  const resetTheme = () => {
    const defaultTheme = presetThemes.default;
    applyPresetTheme("default");
    toast.success("Theme reset to default");
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Apply saved theme colors on mount
  useEffect(() => {
    Object.entries(themeColors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(
        `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`,
        value
      );
    });
  }, []);

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to access settings.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="github-actions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="github-actions">GitHub Actions</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* GitHub Actions Tab */}
        <TabsContent value="github-actions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub Actions Integration
              </CardTitle>
              <CardDescription>
                Use this token to automatically update your en-git stats via GitHub Actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Webhook Token Section */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Your Webhook Token</Label>
                <p className="text-sm text-muted-foreground">
                  Add this token as a secret in your GitHub repository to enable automatic stats
                  updates.
                </p>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={webhookToken}
                      type={showToken ? "text" : "password"}
                      readOnly
                      className="font-mono text-sm pr-10"
                      placeholder={loading ? "Loading..." : "No token generated yet"}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowToken(!showToken)}
                    >
                      {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button
                    onClick={copyToken}
                    variant="outline"
                    disabled={!webhookToken || loading}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleRegenerateClick}
                    variant="outline"
                    disabled={loading}
                    className="gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Regenerate
                  </Button>
                </div>

                <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        Regenerate Webhook Token?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will invalidate your current token. Your GitHub Actions workflows will
                        stop working until you update them with the new token.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={confirmRegenerate}>
                        Regenerate Token
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Keep this token secret! Anyone with this token can trigger stats updates for
                    your account.
                  </AlertDescription>
                </Alert>
              </div>

              <Separator />

              {/* Quick Setup */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Quick Setup</Label>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    1. Add <code className="bg-muted px-1 rounded">ENGIT_TOKEN</code> secret to your
                    GitHub repo
                  </p>
                  <p>
                    2. Create workflow file:{" "}
                    <code className="bg-muted px-1 rounded">.github/workflows/engit-stats.yml</code>
                  </p>
                  <p>3. Push and watch your stats auto-update! 🎉</p>
                </div>

                <Button
                  className="w-full gap-2"
                  onClick={() =>
                    window.open(
                      "https://github.com/TejasS1233/en-git/blob/main/.github/ADD_TO_YOUR_REPO.md",
                      "_blank"
                    )
                  }
                >
                  <ExternalLink className="h-4 w-4" />
                  View Complete Setup Guide
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Theme Customizer</CardTitle>
                <CardDescription>Customize colors and appearance</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={resetTheme}>
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Presets */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Quick Themes</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {Object.entries(presetThemes).map(([key, preset]) => (
                    <Button
                      key={key}
                      size="sm"
                      variant="outline"
                      onClick={() => applyPresetTheme(key)}
                      className="justify-start gap-2"
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: `hsl(${preset.primary})` }}
                      />
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Primary Colors */}
              <div className="space-y-2 border rounded-lg">
                <button
                  onClick={() => toggleSection("primary")}
                  className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors rounded-lg"
                >
                  <Label className="text-base font-semibold cursor-pointer">Primary Colors</Label>
                  <svg
                    className={`w-5 h-5 transition-transform ${expandedSections.primary ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {expandedSections.primary && (
                  <div className="p-4 space-y-4 border-t">
                    <div className="space-y-2">
                      <Label>Primary</Label>
                      <div className="flex gap-2">
                        <div
                          className="w-12 h-10 rounded border"
                          style={{ backgroundColor: `hsl(${themeColors.primary})` }}
                        />
                        <Input
                          value={themeColors.primary}
                          onChange={(e) => updateThemeColor("primary", e.target.value)}
                          placeholder="hsl(142 71% 45%)"
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Primary Foreground</Label>
                      <div className="flex gap-2">
                        <div
                          className="w-12 h-10 rounded border"
                          style={{ backgroundColor: `hsl(${themeColors.primaryForeground})` }}
                        />
                        <Input
                          value={themeColors.primaryForeground}
                          onChange={(e) => updateThemeColor("primaryForeground", e.target.value)}
                          placeholder="hsl(210 20% 98%)"
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Secondary Colors */}
              <div className="space-y-2 border rounded-lg">
                <button
                  onClick={() => toggleSection("secondary")}
                  className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors rounded-lg"
                >
                  <Label className="text-base font-semibold cursor-pointer">Secondary Colors</Label>
                  <svg
                    className={`w-5 h-5 transition-transform ${expandedSections.secondary ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {expandedSections.secondary && (
                  <div className="p-4 space-y-4 border-t">
                    <div className="space-y-2">
                      <Label>Secondary</Label>
                      <div className="flex gap-2">
                        <div
                          className="w-12 h-10 rounded border"
                          style={{ backgroundColor: `hsl(${themeColors.secondary})` }}
                        />
                        <Input
                          value={themeColors.secondary}
                          onChange={(e) => updateThemeColor("secondary", e.target.value)}
                          placeholder="hsl(217 32.6% 17.5%)"
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Foreground</Label>
                      <div className="flex gap-2">
                        <div
                          className="w-12 h-10 rounded border"
                          style={{ backgroundColor: `hsl(${themeColors.secondaryForeground})` }}
                        />
                        <Input
                          value={themeColors.secondaryForeground}
                          onChange={(e) => updateThemeColor("secondaryForeground", e.target.value)}
                          placeholder="hsl(210 20% 98%)"
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accent Colors */}
              <div className="space-y-2 border rounded-lg">
                <button
                  onClick={() => toggleSection("accent")}
                  className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors rounded-lg"
                >
                  <Label className="text-base font-semibold cursor-pointer">Accent Colors</Label>
                  <svg
                    className={`w-5 h-5 transition-transform ${expandedSections.accent ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {expandedSections.accent && (
                  <div className="p-4 space-y-4 border-t">
                    <div className="space-y-2">
                      <Label>Accent</Label>
                      <div className="flex gap-2">
                        <div
                          className="w-12 h-10 rounded border"
                          style={{ backgroundColor: `hsl(${themeColors.accent})` }}
                        />
                        <Input
                          value={themeColors.accent}
                          onChange={(e) => updateThemeColor("accent", e.target.value)}
                          placeholder="hsl(217 91% 60%)"
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Accent Foreground</Label>
                      <div className="flex gap-2">
                        <div
                          className="w-12 h-10 rounded border"
                          style={{ backgroundColor: `hsl(${themeColors.accentForeground})` }}
                        />
                        <Input
                          value={themeColors.accentForeground}
                          onChange={(e) => updateThemeColor("accentForeground", e.target.value)}
                          placeholder="hsl(222 47% 11%)"
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Base Colors */}
              <div className="space-y-2 border rounded-lg">
                <button
                  onClick={() => toggleSection("base")}
                  className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors rounded-lg"
                >
                  <Label className="text-base font-semibold cursor-pointer">Base Colors</Label>
                  <svg
                    className={`w-5 h-5 transition-transform ${expandedSections.base ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {expandedSections.base && (
                  <div className="p-4 space-y-4 border-t">
                    <div className="space-y-2">
                      <Label>Background</Label>
                      <div className="flex gap-2">
                        <div
                          className="w-12 h-10 rounded border"
                          style={{ backgroundColor: `hsl(${themeColors.background})` }}
                        />
                        <Input
                          value={themeColors.background}
                          onChange={(e) => updateThemeColor("background", e.target.value)}
                          placeholder="hsl(222 47% 11%)"
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Foreground</Label>
                      <div className="flex gap-2">
                        <div
                          className="w-12 h-10 rounded border"
                          style={{ backgroundColor: `hsl(${themeColors.foreground})` }}
                        />
                        <Input
                          value={themeColors.foreground}
                          onChange={(e) => updateThemeColor("foreground", e.target.value)}
                          placeholder="hsl(213 31% 91%)"
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Muted</Label>
                      <div className="flex gap-2">
                        <div
                          className="w-12 h-10 rounded border"
                          style={{ backgroundColor: `hsl(${themeColors.muted})` }}
                        />
                        <Input
                          value={themeColors.muted}
                          onChange={(e) => updateThemeColor("muted", e.target.value)}
                          placeholder="hsl(217 32.6% 17.5%)"
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Muted Foreground</Label>
                      <div className="flex gap-2">
                        <div
                          className="w-12 h-10 rounded border"
                          style={{ backgroundColor: `hsl(${themeColors.mutedForeground})` }}
                        />
                        <Input
                          value={themeColors.mutedForeground}
                          onChange={(e) => updateThemeColor("mutedForeground", e.target.value)}
                          placeholder="hsl(215 20.2% 65.1%)"
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Colors */}
              <div className="space-y-2 border rounded-lg">
                <button
                  onClick={() => toggleSection("card")}
                  className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors rounded-lg"
                >
                  <Label className="text-base font-semibold cursor-pointer">
                    Card & Border Colors
                  </Label>
                  <svg
                    className={`w-5 h-5 transition-transform ${expandedSections.card ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {expandedSections.card && (
                  <div className="p-4 space-y-4 border-t">
                    <div className="space-y-2">
                      <Label>Card</Label>
                      <div className="flex gap-2">
                        <div
                          className="w-12 h-10 rounded border"
                          style={{ backgroundColor: `hsl(${themeColors.card})` }}
                        />
                        <Input
                          value={themeColors.card}
                          onChange={(e) => updateThemeColor("card", e.target.value)}
                          placeholder="hsl(217 32.6% 17.5%)"
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Card Foreground</Label>
                      <div className="flex gap-2">
                        <div
                          className="w-12 h-10 rounded border"
                          style={{ backgroundColor: `hsl(${themeColors.cardForeground})` }}
                        />
                        <Input
                          value={themeColors.cardForeground}
                          onChange={(e) => updateThemeColor("cardForeground", e.target.value)}
                          placeholder="hsl(213 31% 91%)"
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Border</Label>
                      <div className="flex gap-2">
                        <div
                          className="w-12 h-10 rounded border"
                          style={{ backgroundColor: `hsl(${themeColors.border})` }}
                        />
                        <Input
                          value={themeColors.border}
                          onChange={(e) => updateThemeColor("border", e.target.value)}
                          placeholder="hsl(217 32.6% 17.5%)"
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Input</Label>
                      <div className="flex gap-2">
                        <div
                          className="w-12 h-10 rounded border"
                          style={{ backgroundColor: `hsl(${themeColors.input})` }}
                        />
                        <Input
                          value={themeColors.input}
                          onChange={(e) => updateThemeColor("input", e.target.value)}
                          placeholder="hsl(217 32.6% 17.5%)"
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Ring</Label>
                      <div className="flex gap-2">
                        <div
                          className="w-12 h-10 rounded border"
                          style={{ backgroundColor: `hsl(${themeColors.ring})` }}
                        />
                        <Input
                          value={themeColors.ring}
                          onChange={(e) => updateThemeColor("ring", e.target.value)}
                          placeholder="hsl(224 71% 4%)"
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>View and manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>GitHub Username</Label>
                  <Input value={user?.githubUsername || "Not connected"} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || "N/A"} readOnly />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Account Type</Label>
                <Input value={user?.role || "User"} readOnly className="capitalize" />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Member Since</Label>
                <Input
                  value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  readOnly
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
