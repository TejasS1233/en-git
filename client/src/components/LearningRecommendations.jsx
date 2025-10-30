import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { BookOpen, ExternalLink, Award, TrendingUp, Loader2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { analyzeSkillGaps } from "@/lib/learningRecommendations";
import { Checkbox } from "./ui/checkbox";

export function LearningRecommendations({ insights }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hiddenCategories, setHiddenCategories] = useState(new Set());
  const [hiddenCourses, setHiddenCourses] = useState(new Set());
  const [fadingCategories, setFadingCategories] = useState(new Set());
  const [fadingCourses, setFadingCourses] = useState(new Set());

  useEffect(() => {
    async function loadRecommendations() {
      if (!insights) return;

      setLoading(true);
      try {
        const recs = await analyzeSkillGaps(insights);
        setRecommendations(recs);
      } catch (error) {
        console.error("Error loading recommendations:", error);
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, [insights]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "medium":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return <TrendingUp className="h-3 w-3" />;
      case "medium":
        return <BookOpen className="h-3 w-3" />;
      default:
        return <Award className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading recommendations...</span>
        </CardContent>
      </Card>
    );
  }

  const toggleCategory = (categoryIndex) => {
    setHiddenCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryIndex)) {
        // Unhiding - remove immediately
        newSet.delete(categoryIndex);
        setFadingCategories((f) => {
          const newFading = new Set(f);
          newFading.delete(categoryIndex);
          return newFading;
        });
      } else {
        // Hiding - add fade animation first
        setFadingCategories((f) => new Set(f).add(categoryIndex));
        setTimeout(() => {
          newSet.add(categoryIndex);
          setHiddenCategories(new Set(newSet));
        }, 300);
        return prev;
      }
      return newSet;
    });
  };

  const toggleCourse = (categoryIndex, courseIndex) => {
    const courseId = `${categoryIndex}-${courseIndex}`;
    setHiddenCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        // Unhiding - remove immediately
        newSet.delete(courseId);
        setFadingCourses((f) => {
          const newFading = new Set(f);
          newFading.delete(courseId);
          return newFading;
        });
      } else {
        // Hiding - add fade animation first
        setFadingCourses((f) => new Set(f).add(courseId));
        setTimeout(() => {
          newSet.add(courseId);
          setHiddenCourses(new Set(newSet));
        }, 300);
        return prev;
      }
      return newSet;
    });
  };

  const visibleRecommendations = recommendations.filter((_, index) => !hiddenCategories.has(index));

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  if (visibleRecommendations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground mb-4">All recommendations hidden.</p>
          <Button
            variant="outline"
            onClick={() => {
              setHiddenCategories(new Set());
              setHiddenCourses(new Set());
              setFadingCategories(new Set());
              setFadingCourses(new Set());
            }}
          >
            Show All
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Learning Recommendations</CardTitle>
              <CardDescription>
                Personalized courses from YouTube, Udemy, Coursera, NPTEL & more
              </CardDescription>
            </div>
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">Check to hide</p>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {visibleRecommendations.map((rec, displayIndex) => {
            const actualIndex = recommendations.indexOf(rec);
            const visibleCourses = rec.courses.filter(
              (_, courseIndex) => !hiddenCourses.has(`${actualIndex}-${courseIndex}`)
            );

            const isFading = fadingCategories.has(actualIndex);

            return (
              <AccordionItem
                key={actualIndex}
                value={`item-${actualIndex}`}
                className={`transition-all duration-300 ${isFading ? "opacity-0 scale-95" : "opacity-100 scale-100"
                  }`}
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left w-full">
                    <Checkbox
                      checked={hiddenCategories.has(actualIndex)}
                      onCheckedChange={() => toggleCategory(actualIndex)}
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0"
                      aria-label="Hide this category"
                    />
                    <Badge
                      className={`${getPriorityColor(rec.priority)} shrink-0`}
                      variant="outline"
                    >
                      {getPriorityIcon(rec.priority)}
                      <span className="ml-1 capitalize text-xs">{rec.priority}</span>
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{rec.category}</p>
                      <p className="text-xs text-muted-foreground truncate">{rec.reason}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {visibleCourses.length} courses
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    {visibleCourses.map((course) => {
                      const actualCourseIndex = rec.courses.indexOf(course);
                      const courseId = `${actualIndex}-${actualCourseIndex}`;
                      const isCourseFading = fadingCourses.has(courseId);

                      return (
                        <div
                          key={actualCourseIndex}
                          className={`flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-all duration-300 ${isCourseFading ? "opacity-0 scale-95" : "opacity-100 scale-100"
                            }`}
                        >
                          <Checkbox
                            checked={hiddenCourses.has(`${actualIndex}-${actualCourseIndex}`)}
                            onCheckedChange={() => toggleCourse(actualIndex, actualCourseIndex)}
                            className="shrink-0"
                            aria-label="Hide this course"
                          />
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm truncate">{course.title}</h4>
                              {course.free && (
                                <Badge className="bg-green-500/10 text-green-600 text-xs shrink-0">
                                  FREE
                                </Badge>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Award className="h-3 w-3" />
                                {course.platform}
                              </span>
                              {course.level && (
                                <>
                                  <span>•</span>
                                  <span>{course.level}</span>
                                </>
                              )}
                              {course.duration && (
                                <>
                                  <span>•</span>
                                  <span>{course.duration}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0 h-8 px-3"
                            onClick={() => window.open(course.url, "_blank")}
                          >
                            <ExternalLink className="h-3 w-3 sm:mr-1" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        <Card className="mt-4 bg-linear-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-sm">💡 Pro Tip</p>
                <p className="text-xs text-muted-foreground">
                  Focus on high-priority recommendations first. Build projects while learning to
                  reinforce your skills!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
