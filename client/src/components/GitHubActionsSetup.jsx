import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Copy, Download, Check, ExternalLink } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const GitHubActionsSetup = () => {
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState(false);

  const generateWorkflow = () => {
    return `name: Update en-git Stats

on:
  push:
    branches:
      - main
      - master
  pull_request:
    types: [opened, closed]
  workflow_dispatch:

jobs:
  update-stats:
    runs-on: ubuntu-latest
    
    steps:
      - name: Update en-git Stats
        run: |
          curl -X POST https://en-git.vercel.app/api/v1/webhook/refresh-stats \\
            -H "Content-Type: application/json" \\
            -d '{"username": "\${{ github.actor }}", "token": "\${{ secrets.ENGIT_TOKEN }}"}'
        continue-on-error: true

      - name: Notify completion
        if: success()
        run: |
          echo "✅ Stats updated successfully"
          echo "🔗 View at: https://en-git.vercel.app/stats/\${{ github.actor }}"`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateWorkflow());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generateWorkflow()], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "engit-stats.yml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateToken = () => {
    // Generate a random token
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const hex = Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
    setToken(hex);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub Actions Integration
          </CardTitle>
          <CardDescription>
            Automatically update your en-git stats after every push
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Generate Token */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Step 1: Generate Your Token</Label>
            <p className="text-sm text-muted-foreground">
              This token will be used to authenticate your stats updates.
            </p>
            <div className="flex gap-2">
              <Input
                value={token}
                placeholder="Click 'Generate Token' to create one"
                readOnly
                className="font-mono text-sm"
              />
              <Button onClick={generateToken} variant="outline">
                Generate Token
              </Button>
            </div>
            {token && (
              <p className="text-sm text-yellow-600 dark:text-yellow-500">
                ⚠️ Save this token securely! You'll need it for Step 3.
              </p>
            )}
          </div>

          {/* Step 2: Download Workflow */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Step 2: Add Workflow to Repository</Label>
            <p className="text-sm text-muted-foreground">
              Create <code className="bg-muted px-1 rounded">.github/workflows/engit-stats.yml</code> in your repository with this content:
            </p>
            <div className="relative">
              <SyntaxHighlighter
                language="yaml"
                style={vscDarkPlus}
                customStyle={{
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  maxHeight: "400px",
                }}
              >
                {generateWorkflow()}
              </SyntaxHighlighter>
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCopy}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>

          {/* Step 3: Add Secret */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Step 3: Add Secret to GitHub</Label>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Go to your repository's <strong>Settings</strong> → <strong>Secrets and variables</strong> → <strong>Actions</strong></li>
              <li>Click <strong>New repository secret</strong></li>
              <li>
                Name: <code className="bg-muted px-1 rounded">ENGIT_TOKEN</code>
              </li>
              <li>Value: Paste the token from Step 1</li>
              <li>Click <strong>Add secret</strong></li>
            </ol>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => window.open("https://github.com/settings/tokens", "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              Manage GitHub Secrets
            </Button>
          </div>

          {/* Step 4: Test */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Step 4: Push and Test</Label>
            <div className="bg-muted p-4 rounded-lg">
              <code className="text-sm">
                git add .github/workflows/engit-stats.yml<br />
                git commit -m "Add en-git stats tracking"<br />
                git push
              </code>
            </div>
            <p className="text-sm text-green-600 dark:text-green-500">
              ✅ Your stats will update automatically on every push!
            </p>
          </div>

          {/* Documentation Link */}
          <div className="border-t pt-4">
            <Button
              variant="link"
              className="gap-2 p-0"
              onClick={() => window.open("https://github.com/TejasS1233/en-git/blob/main/.github/GITHUB_ACTIONS_INTEGRATION.md", "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              View Full Documentation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Card */}
      <Card>
        <CardHeader>
          <CardTitle>What Gets Tracked</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📝</div>
              <div>
                <h4 className="font-semibold">Commits & Contributions</h4>
                <p className="text-sm text-muted-foreground">Track every commit you make</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎯</div>
              <div>
                <h4 className="font-semibold">Challenge Progress</h4>
                <p className="text-sm text-muted-foreground">Auto-update your challenges</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">📊</div>
              <div>
                <h4 className="font-semibold">Profile Score</h4>
                <p className="text-sm text-muted-foreground">Real-time score updates</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔥</div>
              <div>
                <h4 className="font-semibold">Coding Streaks</h4>
                <p className="text-sm text-muted-foreground">Maintain your streaks</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GitHubActionsSetup;
