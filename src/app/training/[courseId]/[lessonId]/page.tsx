"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle, PlayCircle, AlertCircle, FileText, Eye } from "lucide-react";
import ClientGeminiPostureAnalysis from "@/components/models/ServerGeminiPostureAnalysis";

interface Lesson {
  id: string;
  title: string;
  type: "theory" | "practice";
  moduleNumber: number;
  duration: string;
  description: string;
  content?: {
    videoUrl?: string;
    text?: string;
    practiceInstructions?: string;
  };
}

interface Course {
  id: string;
  title: string;
  lessons: Lesson[];
}

export default function LessonDetailPage() {
  const params = useParams();
  const courseId = params?.courseId as string;
  const lessonId = params?.lessonId as string;
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Load course and lesson data
    const courses = JSON.parse(localStorage.getItem("courses") || "[]");
    const foundCourse = courses.find((c: Course) => c.id === courseId);

    if (!foundCourse) {
      router.push("/training");
      return;
    }

    const foundLesson = foundCourse.lessons.find((l: Lesson) => l.id === lessonId);

    if (!foundLesson) {
      router.push(`/training/${courseId}`);
      return;
    }

    setCourse(foundCourse);
    setLesson(foundLesson);

    // Check if lesson is completed
    const traineeProgress = JSON.parse(localStorage.getItem("traineeProgress") || "{}");
    const userProgress = traineeProgress[user.id] || {};
    const courseProgress = userProgress[courseId] || [];

    setIsCompleted(courseProgress.includes(lessonId));
  }, [courseId, lessonId, router, user]);

  const markAsComplete = () => {
    if (!user || !courseId || !lessonId) return;

    const traineeProgress = JSON.parse(localStorage.getItem("traineeProgress") || "{}");
    if (!traineeProgress[user.id]) {
      traineeProgress[user.id] = {};
    }
    if (!traineeProgress[user.id][courseId]) {
      traineeProgress[user.id][courseId] = [];
    }

    if (!traineeProgress[user.id][courseId].includes(lessonId)) {
      traineeProgress[user.id][courseId].push(lessonId);
      localStorage.setItem("traineeProgress", JSON.stringify(traineeProgress));
      setIsCompleted(true);

      toast({
        title: "Lesson Completed!",
        description: "Great job! Keep up the good work.",
        variant: "default",
      });
    }
  };

  if (!lesson || !course) {
    return <div>Loading...</div>;
  }

  const renderTheoryContent = () => (
    <div className="space-y-6">
      {/* Mock Video Player */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-0">
          <div className="bg-gradient-hero rounded-lg aspect-video flex items-center justify-center text-white">
            <div className="text-center">
              <PlayCircle className="h-16 w-16 mx-auto mb-4 opacity-80" />
              <p className="text-lg font-medium">Mock Video: {lesson.title}</p>
              <p className="text-sm opacity-80">Duration: {lesson.duration}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theory Content */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center text-gradient-primary">
            <FileText className="h-5 w-5 mr-2" />
            Lesson Content
          </CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <p className="text-muted-foreground leading-relaxed">
            {lesson.content?.text ||
              `This theory lesson covers the fundamental concepts of ${lesson.title.toLowerCase()}. 
            You'll learn about proper techniques, safety considerations, and best practices. 
            The content includes detailed explanations, visual aids, and practical examples 
            to help you understand and apply these concepts in real massage therapy sessions.`}
          </p>
        </CardContent>
      </Card>

      {/* Completion Button */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.push(`/training/${courseId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>

        <Button
          onClick={markAsComplete}
          disabled={isCompleted}
          className={isCompleted ? "btn-success" : "btn-healing"}
        >
          {isCompleted ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Completed
            </>
          ) : (
            "Mark as Complete"
          )}
        </Button>
      </div>
    </div>
  );

  const renderPracticeContent = () => (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center text-gradient-healing">
            <Eye className="h-5 w-5 mr-2" />
            Real-time Posture Analysis
          </CardTitle>
          <CardDescription>
            Use your camera for real-time posture detection and feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-background-secondary p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-2">Instructions:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Position yourself in your massage stance</li>
              <li>• Ensure good lighting and clear visibility</li>
              <li>• Stand facing the camera with your full torso visible</li>
              <li>• Our AI will analyze your posture in real-time</li>
              <li>• Adjust your posture based on live feedback</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Posture Analysis Component */}
      <ClientGeminiPostureAnalysis />

      {/* Auto-completion notice */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-4">
          <div className="bg-healing/10 border border-healing/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-healing mt-0.5" />
              <div>
                <h4 className="font-medium text-healing mb-1">Auto-completion</h4>
                <p className="text-sm text-muted-foreground">
                  This practical lesson will be automatically marked as complete once you achieve a
                  posture score of 80% or higher during real-time analysis.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.push(`/training/${courseId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>

        {isCompleted && (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle className="h-4 w-4 mr-2" />
            Completed
          </Badge>
        )}

        {!isCompleted && (
          <Button onClick={markAsComplete} className="btn-healing">
            Mark as Complete
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Lesson Header */}
        <Card className="border-0 shadow-medium mb-8">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge
                className={
                  lesson.type === "theory"
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-healing/10 text-healing border-healing/20"
                }
              >
                {lesson.type === "theory" ? "Theory Lesson" : "Practical Exercise"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Module {lesson.moduleNumber} • {lesson.duration}
              </span>
            </div>

            <CardTitle className="text-3xl text-gradient-primary mb-2">{lesson.title}</CardTitle>

            <CardDescription className="text-lg">{lesson.description}</CardDescription>

            <div className="pt-4 text-sm text-muted-foreground">
              <span>Course: {course.title}</span>
            </div>
          </CardHeader>
        </Card>

        {/* Lesson Content */}
        {lesson.type === "theory" ? renderTheoryContent() : renderPracticeContent()}
      </div>
    </div>
  );
}
