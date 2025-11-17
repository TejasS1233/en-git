import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Code2, Copy, Check } from "lucide-react";
import {
  generateTechStackBadges,
  generateMarkdownBadges,
  generateHTMLBadges,
} from "../lib/techStackBadges";
import { toast } from "sonner";

export function TechStackBadges({ insights }) {
  const [copiedType, setCopiedType] = useState(null);
  const badges = generateTechStackBadges(insights);
  const markdownBadges = generateMarkdownBadges(badges);
  const htmlBadges = generateHTMLBadges(badges);

  if (!badges || badges.length === 0) {
    return null;
  }

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    toast.success(`${type} copied to clipboard!`);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          Tech Stack Badges
        </CardTitle>
        <CardDescription>Auto-generated badges for your README or website</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            <div className="flex flex-wrap gap-2 p-4 rounded-lg border bg-muted/30">
              {badges.map((badge, idx) => (
                <img key={idx} src={badge.url} alt={badge.name} className="h-5" loading="lazy" />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{badges.length} badges generated</Badge>
              <span className="text-xs text-muted-foreground">
                Based on your most-used languages and technologies
              </span>
            </div>
          </TabsContent>

          <TabsContent value="markdown" className="space-y-4">
            <div className="relative">
              <pre className="p-4 rounded-lg border bg-muted/30 text-xs overflow-x-auto">
                <code>{markdownBadges}</code>
              </pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(markdownBadges, "Markdown")}
              >
                {copiedType === "Markdown" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Copy and paste this into your README.md file
            </p>
          </TabsContent>

          <TabsContent value="html" className="space-y-4">
            <div className="relative">
              <pre className="p-4 rounded-lg border bg-muted/30 text-xs overflow-x-auto">
                <code>{htmlBadges}</code>
              </pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(htmlBadges, "HTML")}
              >
                {copiedType === "HTML" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Copy and paste this into your HTML file or portfolio website
            </p>
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            💡 These badges are powered by{" "}
            <a
              href="https://shields.io"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              shields.io
            </a>{" "}
            and will always show live stats
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
