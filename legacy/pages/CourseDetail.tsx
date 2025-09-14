import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import {
  BookOpen,
  PlayCircle,
  CheckCircle,
  Lock,
  Clock,
  Award,
  ArrowLeft,
  Eye,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  modules: number;
  instructor: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  type: "theory" | "practice";
  moduleNumber: number;
  duration: string;
  description: string;
}

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    // Load course data and progress
    const courses = JSON.parse(localStorage.getItem("courses") || "[]");
    const foundCourse = courses.find((c: Course) => c.id === courseId);

    if (!foundCourse) {
      navigate("/training");
      return;
    }

    setCourse(foundCourse);

    if (user) {
      const traineeProgress = JSON.parse(
        localStorage.getItem("traineeProgress") || "{}"
      );
      const userProgress = traineeProgress[user.id] || {};
      const courseProgress = userProgress[courseId!] || [];

      setCompletedLessons(courseProgress);
      setIsEnrolled(Object.keys(userProgress).includes(courseId!));
    }
  }, [courseId, navigate, user]);

  const handleEnroll = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    const traineeProgress = JSON.parse(
      localStorage.getItem("traineeProgress") || "{}"
    );
    if (!traineeProgress[user.id]) {
      traineeProgress[user.id] = {};
    }
    traineeProgress[user.id][courseId!] = [];

    localStorage.setItem("traineeProgress", JSON.stringify(traineeProgress));
    setIsEnrolled(true);
    setCompletedLessons([]);
  };

  const calculateProgress = () => {
    if (!course) return 0;
    return Math.round((completedLessons.length / course.lessons.length) * 100);
  };

  const getLessonIcon = (lesson: Lesson) => {
    if (completedLessons.includes(lesson.id)) {
      return <CheckCircle className="h-5 w-5 text-success" />;
    }

    if (lesson.type === "theory") {
      return <BookOpen className="h-5 w-5 text-primary" />;
    } else {
      return <Eye className="h-5 w-5 text-healing" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-success/10 text-success border-success/20";
      case "Intermediate":
        return "bg-warning/10 text-warning border-warning/20";
      case "Advanced":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (!course) {
    return <div>Loading...</div>;
  }

  // Group lessons by module
  const moduleGroups = course.lessons.reduce((acc, lesson) => {
    const moduleKey = `Module ${lesson.moduleNumber}`;
    if (!acc[moduleKey]) {
      acc[moduleKey] = [];
    }
    acc[moduleKey].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/training")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>

        {/* Course Header */}
        <Card className="border-0 shadow-medium mb-8">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <Badge className={getLevelColor(course.level)}>
                {course.level}
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                {course.duration}
              </div>
            </div>

            <CardTitle className="text-3xl text-gradient-primary mb-4">
              {course.title}
            </CardTitle>

            <CardDescription className="text-lg leading-relaxed">
              {course.description}
            </CardDescription>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center text-muted-foreground">
                <Award className="h-4 w-4 mr-2" />
                <span>Instructor: {course.instructor}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {course.modules} modules • {course.lessons.length} lessons
              </div>
            </div>
          </CardHeader>

          {isEnrolled && (
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Course Progress</span>
                  <span className="font-medium">{calculateProgress()}%</span>
                </div>
                <Progress value={calculateProgress()} className="h-2" />
                <div className="text-sm text-muted-foreground">
                  {completedLessons.length} of {course.lessons.length} lessons
                  completed
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Enrollment Section */}
        {!isEnrolled && (
          <Card className="border-0 shadow-soft mb-8 bg-gradient-hero text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-2">
                Ready to start learning?
              </h3>
              <p className="mb-4 opacity-90">
                Enroll now to access all lessons and track your progress.
              </p>
              <Button
                onClick={handleEnroll}
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
              >
                Enroll in Course
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Lesson Modules */}
        <div className="space-y-6">
          {Object.entries(moduleGroups).map(([moduleTitle, lessons]) => (
            <Card key={moduleTitle} className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-xl text-gradient-healing">
                  {moduleTitle}
                </CardTitle>
                <CardDescription>
                  {lessons.length} lessons in this module
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {lessons.map((lesson, index) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    const canAccess = isEnrolled;

                    return (
                      <div
                        key={lesson.id}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                          canAccess
                            ? "bg-background-secondary hover:bg-muted/50 cursor-pointer"
                            : "bg-muted/30 cursor-not-allowed"
                        }`}
                        onClick={() => {
                          if (canAccess) {
                            navigate(`/training/${courseId}/${lesson.id}`);
                          }
                        }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {canAccess ? (
                              getLessonIcon(lesson)
                            ) : (
                              <Lock className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4
                                className={`font-medium ${
                                  canAccess ? "" : "text-muted-foreground"
                                }`}
                              >
                                {lesson.title}
                              </h4>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  lesson.type === "theory"
                                    ? "border-primary/20 text-primary"
                                    : "border-healing/20 text-healing"
                                }`}
                              >
                                {lesson.type === "theory"
                                  ? "Theory"
                                  : "Practice"}
                              </Badge>
                              {isCompleted && (
                                <Badge className="bg-success/10 text-success border-success/20 text-xs">
                                  Completed
                                </Badge>
                              )}
                            </div>
                            <p
                              className={`text-sm ${
                                canAccess
                                  ? "text-muted-foreground"
                                  : "text-muted-foreground/70"
                              }`}
                            >
                              {lesson.description}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`text-sm ${
                            canAccess
                              ? "text-muted-foreground"
                              : "text-muted-foreground/70"
                          }`}
                        >
                          <Clock className="h-4 w-4 inline mr-1" />
                          {lesson.duration}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
