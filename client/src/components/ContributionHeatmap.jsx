import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar } from "lucide-react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export function ContributionHeatmap({ insights }) {
  if (!insights?.weekly || insights.weekly.length === 0) {
    return null;
  }

  // Filter out invalid weeks
  const validWeeks = insights.weekly.filter((week) => {
    const date = new Date(week.week);
    return !isNaN(date.getTime());
  });

  if (validWeeks.length === 0) {
    return null;
  }

  // Convert weekly data to daily format for heatmap
  const heatmapData = validWeeks.flatMap((week) => {
    // Create 7 days of data for each week
    const weekStart = new Date(week.week);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      return {
        date: date.toISOString().split("T")[0],
        count: Math.floor(week.commits / 7), // Distribute commits across the week
      };
    });
  });

  // Calculate date range (last year)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  // Calculate total contributions
  const totalContributions = validWeeks.reduce((sum, week) => sum + week.commits, 0);
  const maxWeekContributions = Math.max(...validWeeks.map((w) => w.commits));

  // Calculate streak (consecutive weeks with commits)
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;

  const sortedWeeks = [...validWeeks].sort((a, b) => new Date(b.week) - new Date(a.week));

  for (const week of sortedWeeks) {
    if (week.commits > 0) {
      tempStreak++;
      if (tempStreak === sortedWeeks.indexOf(week) + 1) {
        currentStreak = tempStreak;
      }
      maxStreak = Math.max(maxStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-500" />
          Contribution Calendar
        </CardTitle>
        <CardDescription>Your coding activity over the past year</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-lg border bg-card">
            <p className="text-xs text-muted-foreground mb-1">Total Contributions</p>
            <p className="text-2xl font-bold text-green-600">{totalContributions}</p>
          </div>
          <div className="p-3 rounded-lg border bg-card">
            <p className="text-xs text-muted-foreground mb-1">Current Streak</p>
            <p className="text-2xl font-bold text-orange-600">{currentStreak} weeks</p>
          </div>
          <div className="p-3 rounded-lg border bg-card">
            <p className="text-xs text-muted-foreground mb-1">Best Week</p>
            <p className="text-2xl font-bold text-blue-600">{maxWeekContributions}</p>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-muted/30 overflow-x-auto">
          <style>{`
            .react-calendar-heatmap {
              width: 100%;
            }
            .react-calendar-heatmap text {
              font-size: 10px;
              fill: hsl(var(--muted-foreground));
            }
            .react-calendar-heatmap .color-empty {
              fill: hsl(var(--muted));
            }
            .react-calendar-heatmap .color-scale-1 {
              fill: #9be9a8;
            }
            .react-calendar-heatmap .color-scale-2 {
              fill: #40c463;
            }
            .react-calendar-heatmap .color-scale-3 {
              fill: #30a14e;
            }
            .react-calendar-heatmap .color-scale-4 {
              fill: #216e39;
            }
            .react-calendar-heatmap rect:hover {
              stroke: hsl(var(--primary));
              stroke-width: 2;
            }
          `}</style>
          <TooltipProvider>
            <CalendarHeatmap
              startDate={startDate}
              endDate={endDate}
              values={heatmapData}
              classForValue={(value) => {
                if (!value || value.count === 0) {
                  return "color-empty";
                }
                // Scale based on count
                if (value.count < 5) return "color-scale-1";
                if (value.count < 10) return "color-scale-2";
                if (value.count < 15) return "color-scale-3";
                return "color-scale-4";
              }}
              tooltipDataAttrs={(value) => {
                if (!value || !value.date) {
                  return null;
                }
                return {
                  "data-tip": `${value.date}: ${value.count || 0} contributions`,
                };
              }}
              showWeekdayLabels
            />
          </TooltipProvider>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(var(--muted))" }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#9be9a8" }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#40c463" }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#30a14e" }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#216e39" }} />
          </div>
          <span>More</span>
        </div>

        {currentStreak >= 4 && (
          <div className="p-3 rounded-lg bg-linear-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <p className="text-sm flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <span>Amazing {currentStreak}-week streak! Keep the momentum going!</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
