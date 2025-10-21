import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

export function HistoricalChart({ data, metricName, color = "#8884d8" }) {
  console.log(`HistoricalChart ${metricName} received data:`, data);
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{metricName} Over Time</CardTitle>
          <CardDescription>No historical data available</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground">
          No data available yet. Create more snapshots over time to see trends.
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    date: format(new Date(item.date), "MMM dd"),
    fullDate: format(new Date(item.date), "MMM dd, yyyy"),
    value: typeof item.value === 'number' ? item.value : parseInt(item.value) || 0,
  }));

  // Check if all values are the same
  const allSameValue = chartData.every(d => d.value === chartData[0].value);
  const hasOnlyOneDataPoint = chartData.length === 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{metricName} Over Time</CardTitle>
        <CardDescription>
          {hasOnlyOneDataPoint 
            ? "Only one data point. Create more snapshots to see trends." 
            : allSameValue
            ? "No change detected. Values remain constant."
            : "Historical trend data"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ChartContainer
            config={{
              value: { label: metricName, color },
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={hasOnlyOneDataPoint ? ['auto', 'auto'] : undefined} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [value, metricName]}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={color} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
