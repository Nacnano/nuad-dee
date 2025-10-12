"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { BookOpen, GraduationCap, PlayCircle, Users } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  modules: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  type: "theory" | "practice";
  moduleNumber: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Load courses and progress from localStorage
    const courses = JSON.parse(localStorage.getItem("courses") || "[]");
    const traineeProgress = JSON.parse(localStorage.getItem("traineeProgress") || "{}");
    const userProgress = traineeProgress[user.id] || {};

    // Filter enrolled courses
    const enrolled = courses.filter((course: Course) =>
      Object.keys(userProgress).includes(course.id)
    );

    setEnrolledCourses(enrolled);
    setProgress(userProgress);
  }, [user, router]);

  const calculateProgress = (course: Course) => {
    const completedLessons = progress[course.id] || [];
    return Math.round((completedLessons.length / course.lessons.length) * 100);
  };

  const getCompletedModules = (course: Course) => {
    const completedLessons = progress[course.id] || [];
    const completedModuleNumbers = new Set(
      course.lessons
        .filter((lesson) => completedLessons.includes(lesson.id))
        .map((lesson) => lesson.moduleNumber)
    );
    return completedModuleNumbers.size;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient-primary mb-4">Learning Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Welcome back, {user.name}! Continue your massage therapy journey.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-soft">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-primary p-3 rounded-2xl w-fit mx-auto mb-3">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="text-2xl font-bold text-gradient-primary mb-1">
                {enrolledCourses.length}
              </div>
              <p className="text-sm text-muted-foreground">Enrolled Courses</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-healing p-3 rounded-2xl w-fit mx-auto mb-3">
                <GraduationCap className="h-6 w-6 text-healing-foreground" />
              </div>
              <div className="text-2xl font-bold text-gradient-healing mb-1">
                {enrolledCourses.reduce((acc, course) => acc + getCompletedModules(course), 0)}
              </div>
              <p className="text-sm text-muted-foreground">Modules Completed</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-success p-3 rounded-2xl w-fit mx-auto mb-3">
                <Users className="h-6 w-6 text-success-foreground" />
              </div>
              <div className="text-2xl font-bold text-gradient-success mb-1">
                {Math.round(
                  enrolledCourses.reduce((acc, course) => acc + calculateProgress(course), 0) /
                    Math.max(enrolledCourses.length, 1)
                )}
                %
              </div>
              <p className="text-sm text-muted-foreground">Average Progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Courses */}
        <div>
          <h2 className="text-2xl font-bold text-gradient-healing mb-6">Your Courses</h2>

          {enrolledCourses.length === 0 ? (
            <Card className="border-0 shadow-soft">
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Courses Enrolled</h3>
                <p className="text-muted-foreground mb-4">
                  Start your learning journey by enrolling in a course.
                </p>
                <Button onClick={() => router.push("/training")} className="btn-healing">
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {enrolledCourses.map((course) => {
                const progressPercentage = calculateProgress(course);
                const completedLessons = progress[course.id] || [];

                return (
                  <Card key={course.id} className="card-hover border-0 shadow-medium">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{course.title}</CardTitle>
                          <CardDescription className="text-base">
                            {course.description}
                          </CardDescription>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div>{course.duration}</div>
                          <div>
                            {getCompletedModules(course)} of {course.modules} modules
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span>Overall Progress</span>
                            <span className="font-medium">{progressPercentage}%</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>
                            {completedLessons.length} of {course.lessons.length} lessons completed
                          </span>
                        </div>

                        <Button
                          onClick={() => router.push(`/training/${course.id}`)}
                          className="w-full btn-healing"
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Continue Learning
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
