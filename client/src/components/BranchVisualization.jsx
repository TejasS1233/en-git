import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, GitBranch, Calendar, User, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const BRANCH_COLORS = [
  "#667eea",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#0ea5e9",
  "#84cc16",
];

export default function BranchVisualization({ commits, branches = [], className }) {
  const [expandedCommits, setExpandedCommits] = useState(new Set());
  const [hoveredCommit, setHoveredCommit] = useState(null);

  // Process commits to assign colors to branches
  const processedCommits = useMemo(() => {
    if (!commits || commits.length === 0) return [];

    // Assign branch colors
    const branchMap = new Map();
    let colorIndex = 0;

    return commits.map((commit, index) => {
      let branchColor = BRANCH_COLORS[0]; // Default main branch color

      if (commit.parents.length > 1) {
        // Merge commit - use a different color
        branchColor = BRANCH_COLORS[colorIndex % BRANCH_COLORS.length];
        colorIndex++;
      } else if (commit.children.length > 1) {
        // Branch point - assign new branch color
        const newColor = BRANCH_COLORS[colorIndex % BRANCH_COLORS.length];
        branchMap.set(commit.sha, newColor);
        branchColor = newColor;
        colorIndex++;
      } else {
        // Try to inherit color from parent
        if (commit.parents.length === 1) {
          const parentColor = branchMap.get(commit.parents[0]);
          if (parentColor) {
            branchColor = parentColor;
          }
        }
        branchMap.set(commit.sha, branchColor);
      }

      return {
        ...commit,
        branchColor,
      };
    });
  }, [commits]);

  const toggleCommit = (sha) => {
    setExpandedCommits((prev) => {
      const next = new Set(prev);
      if (next.has(sha)) {
        next.delete(sha);
      } else {
        next.add(sha);
      }
      return next;
    });
  };

  if (!commits || commits.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Branch Visualization
          </CardTitle>
          <CardDescription>No commits found for this repository</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Branch Visualization
        </CardTitle>
        <CardDescription>
          Visual representation of commit history and branches ({processedCommits.length} commits)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
          {processedCommits.map((commit, index) => {
            const isExpanded = expandedCommits.has(commit.sha);
            const isMergeCommit = commit.parents.length > 1;
            const isBranchPoint = commit.children.length > 1;
            const isHovered = hoveredCommit === commit.sha;

            return (
              <div
                key={commit.sha}
                className="relative group"
                onMouseEnter={() => setHoveredCommit(commit.sha)}
                onMouseLeave={() => setHoveredCommit(null)}
              >
                {/* Branch line */}
                <div className="flex items-start gap-3 pb-2">
                  {/* Left side - branch visualization */}
                  <div className="flex flex-col items-center gap-0">
                    {/* Commit circle */}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full border-2 flex-shrink-0 transition-all duration-200",
                        isHovered && "scale-125",
                        isMergeCommit && "border-yellow-500 bg-yellow-500/20",
                        isBranchPoint && "border-pink-500 bg-pink-500/20",
                        !isMergeCommit && !isBranchPoint && "border-blue-500 bg-blue-500/20"
                      )}
                      style={{
                        borderColor: commit.branchColor,
                        backgroundColor: isHovered ? `${commit.branchColor}40` : `${commit.branchColor}20`,
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded-full m-1"
                        style={{ backgroundColor: commit.branchColor }}
                      />
                    </div>
                    {/* Vertical line */}
                    {index < processedCommits.length - 1 && (
                      <div
                        className="w-0.5 flex-grow min-h-[40px] mt-1"
                        style={{ backgroundColor: commit.branchColor }}
                      />
                    )}
                  </div>

                  {/* Right side - commit info */}
                  <div className="flex-1 min-w-0 pb-4">
                    <div
                      className={cn(
                        "p-3 rounded-lg border transition-all duration-200",
                        isHovered && "bg-accent border-primary",
                        "border-border"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate" title={commit.message}>
                            {commit.message}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span className="truncate">{commit.author}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(commit.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs ml-2">
                          {commit.sha.substring(0, 7)}
                        </Badge>
                      </div>

                      {/* Expand details button */}
                      {(commit.parents.length > 1 || commit.children.length > 1) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-6 text-xs"
                          onClick={() => toggleCommit(commit.sha)}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-3 w-3 mr-1" />
                              Hide details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3 mr-1" />
                              Show details
                            </>
                          )}
                        </Button>
                      )}

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t space-y-2 text-xs">
                          {isMergeCommit && (
                            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                              <GitBranch className="h-3 w-3" />
                              <span>Merge commit with {commit.parents.length} parents</span>
                            </div>
                          )}
                          {isBranchPoint && (
                            <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
                              <GitBranch className="h-3 w-3" />
                              <span>Branch point with {commit.children.length} children</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Branch labels (show on hover) */}
                {isHovered && branches.length > 0 && (
                  <div className="absolute left-12 top-6 flex gap-1 z-10">
                    {branches
                      .filter((branch) => branch.commit === commit.sha)
                      .map((branch) => (
                        <Badge
                          key={branch.name}
                          className="text-xs"
                          style={{ backgroundColor: commit.branchColor, color: "white" }}
                        >
                          {branch.name}
                        </Badge>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
