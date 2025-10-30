import { Card, CardContent } from "@/components/ui/card";
import {
  User,
  FolderGit2,
  Code2,
  Users,
  FileText,
  Heart,
  FolderTree,
  MessageSquare,
} from "lucide-react";

export function ProfileAnalysisTips() {
  const tips = [
    {
      title: "Complete Profile",
      icon: User,
      gradient: "from-cyan-500 to-blue-500",
      items: ["Add bio & location", "Link your website", "Connect social accounts"],
    },
    {
      title: "Quality Repos",
      icon: FolderGit2,
      gradient: "from-purple-500 to-pink-500",
      items: ["Write detailed READMEs", "Add descriptions", "Use topics/tags"],
    },
    {
      title: "Diverse Skills",
      icon: Code2,
      gradient: "from-orange-500 to-red-500",
      items: ["Use 5+ languages", "Add 10+ topics", "Contribute to different stacks"],
    },
    {
      title: "Build Community",
      icon: Users,
      gradient: "from-green-500 to-teal-500",
      items: ["Follow developers", "Share code snippets", "Star & fork projects"],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black mb-3 bg-linear-to-r from-cyan-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
          Level Up Your Profile
        </h2>
        <p className="text-lg text-muted-foreground">Quick wins to boost your GitHub score</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tips.map((tip, index) => {
          const Icon = tip.icon;
          return (
            <Card
              key={tip.title}
              className="group relative overflow-hidden border-2 hover:border-transparent transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient background on hover */}
              <div
                className={`absolute inset-0 bg-linear-to-br ${tip.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              />

              <CardContent className="p-6 relative">
                {/* Icon with gradient background */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-linear-to-br ${tip.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <Icon className="h-8 w-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-4 group-hover:text-transparent group-hover:bg-linear-to-r group-hover:bg-clip-text group-hover:from-cyan-600 group-hover:to-purple-600 transition-all duration-300">
                  {tip.title}
                </h3>

                {/* Items */}
                <ul className="space-y-2">
                  {tip.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors"
                    >
                      <div
                        className={`h-1.5 w-1.5 rounded-full bg-linear-to-r ${tip.gradient}`}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function RepositoryAnalysisTips() {
  const tips = [
    {
      title: "Documentation",
      icon: FileText,
      gradient: "from-blue-500 to-cyan-500",
      items: ["Comprehensive README", "Code comments", "Usage examples"],
    },
    {
      title: "Health & Quality",
      icon: Heart,
      gradient: "from-pink-500 to-rose-500",
      items: ["Respond to issues", "Update dependencies", "Add CI/CD"],
    },
    {
      title: "Organization",
      icon: FolderTree,
      gradient: "from-emerald-500 to-green-500",
      items: ["Clear commit messages", "Semantic versioning", "Clean structure"],
    },
    {
      title: "Engagement",
      icon: MessageSquare,
      gradient: "from-violet-500 to-purple-500",
      items: ["Good first issues", "Status badges", "Social sharing"],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black mb-3 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Boost Your Repository
        </h2>
        <p className="text-lg text-muted-foreground">Essential practices for a healthy repo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tips.map((tip, index) => {
          const Icon = tip.icon;
          return (
            <Card
              key={tip.title}
              className="group relative overflow-hidden border-2 hover:border-transparent transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient background on hover */}
              <div
                className={`absolute inset-0 bg-linear-to-br ${tip.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              />

              <CardContent className="p-6 relative">
                {/* Icon with gradient background */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-linear-to-br ${tip.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <Icon className="h-8 w-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-4 group-hover:text-transparent group-hover:bg-linear-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                  {tip.title}
                </h3>

                {/* Items */}
                <ul className="space-y-2">
                  {tip.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors"
                    >
                      <div
                        className={`h-1.5 w-1.5 rounded-full bg-linear-to-r ${tip.gradient}`}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
