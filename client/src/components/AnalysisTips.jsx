import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, CheckCircle2 } from "lucide-react";

export function ProfileAnalysisTips() {
  const tips = [
    {
      title: "Complete Your Profile",
      items: [
        "Add a bio, location, and company information",
        "Link your website or blog",
        "Connect your Twitter/X account",
      ],
    },
    {
      title: "Improve Repository Quality",
      items: [
        "Add detailed README files to your repositories",
        "Include repository descriptions",
        "Add topics/tags to your repositories (e.g., react, typescript, api)",
        "Keep your repositories well-documented",
      ],
    },
    {
      title: "Boost Your Skills Score",
      items: [
        "Work with diverse programming languages (aim for 5+)",
        "Add relevant topics to your repositories (aim for 10+)",
        "Contribute to projects in different tech stacks",
        "Tag repositories with industry-standard topics",
      ],
    },
    {
      title: "Grow Your Community",
      items: [
        "Follow other developers and engage with their work",
        "Share code snippets via GitHub Gists",
        "Contribute to open-source projects",
        "Star and fork interesting repositories",
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Tips for Better Profile Analysis
          </CardTitle>
          <CardDescription>
            Maximize your GitHub profile score by following these recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tips.map((section) => (
            <div key={section.title} className="space-y-3 p-3 rounded-lg bg-background/50 border">
              <h3 className="font-semibold text-sm">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary/70 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function RepositoryAnalysisTips() {
  const tips = [
    {
      title: "Documentation",
      items: [
        "Write a comprehensive README with setup instructions",
        "Add inline code comments for complex logic",
        "Include API documentation if applicable",
        "Provide usage examples and demos",
      ],
    },
    {
      title: "Repository Health",
      items: [
        "Respond to issues and pull requests promptly",
        "Keep dependencies up to date",
        "Add CI/CD workflows for automated testing",
        "Include a LICENSE and CONTRIBUTING guide",
      ],
    },
    {
      title: "Organization",
      items: [
        "Use clear and descriptive commit messages",
        "Tag releases with semantic versioning",
        "Add topics/tags relevant to your repository",
        "Organize code with a clear folder structure",
      ],
    },
    {
      title: "Engagement",
      items: [
        "Encourage contributions with good first issues",
        "Add shields/badges to show project status",
        "Create a discussion forum or wiki",
        "Share your project on social media",
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Tips for Better Repository Analysis
          </CardTitle>
          <CardDescription>
            Improve your repository health score with these best practices
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tips.map((section) => (
            <div key={section.title} className="space-y-3 p-3 rounded-lg bg-background/50 border">
              <h3 className="font-semibold text-sm">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary/70 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
