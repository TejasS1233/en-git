import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileDown, Calendar } from "lucide-react";
import { format } from "date-fns";

export function ProgressReport({ report }) {
  console.log("ProgressReport received:", report);
  
  if (!report) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Report</CardTitle>
          <CardDescription>
            No progress data available. Create a snapshot to track your progress over time.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { period, username, current, changes, generatedAt } = report;

  if (!current || !current.userData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Report</CardTitle>
          <CardDescription>
            No progress data available. Create a snapshot to track your progress over time.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Safely format the date
  let formattedDate = "Unknown date";
  try {
    if (generatedAt) {
      const date = new Date(generatedAt);
      if (!isNaN(date.getTime())) {
        formattedDate = format(date, "MMMM dd, yyyy");
      }
    }
  } catch (err) {
    console.error("Error formatting date:", err);
  }

  const achievements = [];
  
  // Follower milestones
  if (changes?.followers >= 50) {
    achievements.push({ icon: "🌟", text: `Gained ${changes.followers} followers! Rising Star!`, type: "major" });
  } else if (changes?.followers >= 25) {
    achievements.push({ icon: "🚀", text: `Gained ${changes.followers} followers! Growing Fast!`, type: "medium" });
  } else if (changes?.followers >= 10) {
    achievements.push({ icon: "👥", text: `Gained ${changes.followers} followers!`, type: "minor" });
  } else if (changes?.followers > 0) {
    achievements.push({ icon: "✨", text: `+${changes.followers} new follower${changes.followers > 1 ? 's' : ''}`, type: "minor" });
  }
  
  // Repository achievements
  if (changes?.repos >= 5) {
    achievements.push({ icon: "🏗️", text: `Created ${changes.repos} new repositories! Productive!`, type: "medium" });
  } else if (changes?.repos > 0) {
    achievements.push({ icon: "📦", text: `Created ${changes.repos} new repositor${changes.repos > 1 ? 'ies' : 'y'}`, type: "minor" });
  }
  
  // Stars achievements
  if (changes?.stars >= 50) {
    achievements.push({ icon: "⭐", text: `Earned ${changes.stars} more stars! Popular Project!`, type: "major" });
  } else if (changes?.stars >= 20) {
    achievements.push({ icon: "🌟", text: `Earned ${changes.stars} more stars! Great Work!`, type: "medium" });
  } else if (changes?.stars >= 5) {
    achievements.push({ icon: "✨", text: `Earned ${changes.stars} more stars!`, type: "minor" });
  } else if (changes?.stars > 0) {
    achievements.push({ icon: "⭐", text: `+${changes.stars} star${changes.stars > 1 ? 's' : ''}`, type: "minor" });
  }
  
  // Forks achievements
  if (changes?.forks >= 10) {
    achievements.push({ icon: "🔱", text: `${changes.forks} new forks! Developers love your code!`, type: "medium" });
  } else if (changes?.forks >= 5) {
    achievements.push({ icon: "🔀", text: `${changes.forks} new forks!`, type: "minor" });
  } else if (changes?.forks > 0) {
    achievements.push({ icon: "🍴", text: `+${changes.forks} fork${changes.forks > 1 ? 's' : ''}`, type: "minor" });
  }
  
  // Activity achievements based on current stats
  const totalStars = current?.totalStars || 0;
  const totalRepos = current?.userData?.public_repos || 0;
  const followers = current?.userData?.followers || 0;
  
  if (totalStars >= 100) {
    achievements.push({ icon: "🏆", text: "Century Club - 100+ total stars!", type: "major" });
  } else if (totalStars >= 50) {
    achievements.push({ icon: "💫", text: "Half Century - 50+ stars!", type: "medium" });
  }
  
  if (totalRepos >= 50) {
    achievements.push({ icon: "🎯", text: "Prolific Creator - 50+ repositories!", type: "major" });
  } else if (totalRepos >= 25) {
    achievements.push({ icon: "📚", text: "Active Builder - 25+ repositories!", type: "medium" });
  }
  
  if (followers >= 100) {
    achievements.push({ icon: "👑", text: "Influencer - 100+ followers!", type: "major" });
  } else if (followers >= 50) {
    achievements.push({ icon: "🌐", text: "Community Leader - 50+ followers!", type: "medium" });
  }
  
  // Consistency achievement (if no negative changes)
  if (changes && Object.values(changes).every(val => val >= 0)) {
    achievements.push({ icon: "📈", text: "Steady Growth - All metrics improving!", type: "medium" });
  }
  
  // Special: Big improvements
  const totalChange = (changes?.followers || 0) + (changes?.repos || 0) + (changes?.stars || 0);
  if (totalChange >= 50) {
    achievements.push({ icon: "💥", text: "Explosive Growth! Major improvements!", type: "major" });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Progress Report</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4" />
              {formattedDate}
            </CardDescription>
          </div>
          <Badge variant="secondary">{period}ly Report</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{current?.userData?.followers || 0}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{current?.userData?.public_repos || 0}</div>
              <div className="text-xs text-muted-foreground">Repositories</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{current?.totalStars || 0}</div>
              <div className="text-xs text-muted-foreground">Total Stars</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{current?.domain?.domain || "N/A"}</div>
              <div className="text-xs text-muted-foreground">Domain</div>
            </div>
          </div>
        </div>

        {achievements.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Achievements This {period}</h3>
            <div className="space-y-2">
              {achievements.map((achievement, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    achievement.type === 'major' 
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border border-yellow-200 dark:border-yellow-800' 
                      : achievement.type === 'medium'
                      ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border border-blue-200 dark:border-blue-800'
                      : 'bg-muted/50'
                  }`}
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <span className={`text-sm ${achievement.type === 'major' ? 'font-semibold' : ''}`}>
                    {achievement.text}
                  </span>
                  {achievement.type === 'major' && (
                    <Badge variant="secondary" className="ml-auto">Epic!</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="font-semibold mb-3">Top Languages</h3>
          <div className="flex flex-wrap gap-2">
            {current.languages?.top3?.map(([lang, pct], i) => (
              <Badge key={i} variant="outline">
                {lang}: {pct}%
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
