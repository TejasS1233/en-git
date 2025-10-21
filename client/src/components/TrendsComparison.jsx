import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function TrendsComparison({ comparison, period }) {
  console.log("TrendsComparison received:", comparison);
  
  if (!comparison || !comparison.current) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Then vs Now</CardTitle>
          <CardDescription>No historical data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { current, past, changes } = comparison;

  const getTrendIcon = (value) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (value) => {
    if (value > 0) return "text-green-500";
    if (value < 0) return "text-red-500";
    return "text-gray-500";
  };

  const metrics = [
    { label: "Followers", current: current.userData.followers, change: changes?.followers },
    { label: "Following", current: current.userData.following, change: changes?.following },
    { label: "Repositories", current: current.userData.public_repos, change: changes?.repos },
    { label: "Total Stars", current: current.totalStars, change: changes?.stars },
    { label: "Total Forks", current: current.totalForks, change: changes?.forks },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Then vs Now</CardTitle>
        <CardDescription>Changes over the past {period}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">{metric.label}</div>
              <div className="text-2xl font-bold">{metric.current}</div>
              {metric.change !== undefined && past && (
                <div className={`flex items-center gap-1 mt-2 ${getTrendColor(metric.change)}`}>
                  {getTrendIcon(metric.change)}
                  <span className="text-sm font-medium">
                    {metric.change > 0 && "+"}
                    {metric.change}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    from {metric.current - metric.change}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
