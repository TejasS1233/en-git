import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Target } from "lucide-react";
import { calculateSkillRadar, getPrimarySkill } from "../lib/skillRadar";

export function SkillRadarChart({ insights }) {
  const skillData = calculateSkillRadar(insights);
  const primarySkill = getPrimarySkill(skillData);

  if (!skillData || skillData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-500" />
          Skill Profile
        </CardTitle>
        <CardDescription>
          Your technical expertise across different domains
          {primarySkill && (
            <span className="ml-2">
              • Primary:{" "}
              <Badge variant="secondary" className="ml-1">
                {primarySkill}
              </Badge>
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full min-h-[400px]">
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={skillData}>
              <PolarGrid className="stroke-foreground/20" strokeWidth={1.5} />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                className="stroke-foreground/30"
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: "hsl(var(--foreground))", fontSize: 10 }}
                className="stroke-foreground/30"
              />
              <Radar
                name="Skill Level"
                dataKey="value"
                stroke="#14b8a6"
                fill="#14b8a6"
                fillOpacity={0.4}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
          {skillData.map((skill) => (
            <div
              key={skill.skill}
              className="flex items-center justify-between p-2 rounded-lg border bg-card"
            >
              <span className="text-xs font-medium">{skill.skill}</span>
              <Badge variant="outline" className="text-xs">
                {skill.value}
              </Badge>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground">
            Skill scores are calculated based on your language usage and project topics. Scores
            range from 0-100 representing expertise level.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
