"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  Award,
  Users,
  Clock,
  CheckCircle,
  Star,
  Briefcase,
  GraduationCap,
  Heart,
  Eye,
  FileText,
} from "lucide-react";
import trainingImage from "@/assets/training-class.jpg";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
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

export default function TrainingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);

  useEffect(() => {
    // Initialize mock courses with lessons
    const mockCourses: Course[] = [
      {
        id: "1",
        title: "Foundation Massage Therapy",
        description:
          "Complete introduction to massage therapy fundamentals, anatomy, and basic techniques.",
        duration: "12 weeks",
        level: "Beginner",
        modules: 3,
        instructor: "Dr. Sarah Mitchell",
        lessons: [
          {
            id: "1-1",
            title: "Introduction to Massage Therapy",
            type: "theory",
            moduleNumber: 1,
            duration: "45 min",
            description: "Overview of massage therapy history and principles",
          },
          {
            id: "1-2",
            title: "Basic Anatomy and Physiology",
            type: "theory",
            moduleNumber: 1,
            duration: "60 min",
            description: "Understanding muscle groups and body systems",
          },
          {
            id: "1-3",
            title: "Posture Assessment Practice",
            type: "practice",
            moduleNumber: 1,
            duration: "30 min",
            description: "Practice proper massage therapy posture",
          },
          {
            id: "1-4",
            title: "Swedish Massage Techniques",
            type: "theory",
            moduleNumber: 2,
            duration: "90 min",
            description: "Learn fundamental Swedish massage strokes",
          },
          {
            id: "1-5",
            title: "Swedish Massage Posture Practice",
            type: "practice",
            moduleNumber: 2,
            duration: "45 min",
            description: "Practice Swedish massage postures and hand positions",
          },
          {
            id: "1-6",
            title: "Client Communication",
            type: "theory",
            moduleNumber: 3,
            duration: "30 min",
            description: "Professional client interaction and consultation",
          },
        ],
      },
      {
        id: "2",
        title: "Therapeutic Deep Tissue",
        description:
          "Advanced techniques for therapeutic deep tissue massage and injury treatment.",
        duration: "8 weeks",
        level: "Intermediate",
        modules: 2,
        instructor: "Michael Rodriguez, LMT",
        lessons: [
          {
            id: "2-1",
            title: "Deep Tissue Theory",
            type: "theory",
            moduleNumber: 1,
            duration: "75 min",
            description: "Understanding deep tissue massage principles",
          },
          {
            id: "2-2",
            title: "Deep Tissue Posture Assessment",
            type: "practice",
            moduleNumber: 1,
            duration: "60 min",
            description: "Proper posture for deep tissue techniques",
          },
          {
            id: "2-3",
            title: "Injury Assessment",
            type: "theory",
            moduleNumber: 2,
            duration: "45 min",
            description: "Identifying and treating common injuries",
          },
          {
            id: "2-4",
            title: "Treatment Posture Practice",
            type: "practice",
            moduleNumber: 2,
            duration: "90 min",
            description: "Advanced posture techniques for injury treatment",
          },
        ],
      },
      {
        id: "3",
        title: "Adaptive Techniques for VI",
        description:
          "Specialized methods and adaptations for visually impaired massage therapists.",
        duration: "6 weeks",
        level: "Intermediate",
        modules: 2,
        instructor: "Lisa Chen, VI Specialist",
        lessons: [
          {
            id: "3-1",
            title: "Adaptive Equipment Overview",
            type: "theory",
            moduleNumber: 1,
            duration: "30 min",
            description: "Tools and equipment for VI therapists",
          },
          {
            id: "3-2",
            title: "Spatial Awareness Techniques",
            type: "practice",
            moduleNumber: 1,
            duration: "60 min",
            description: "Practice spatial awareness and positioning",
          },
          {
            id: "3-3",
            title: "Client Safety Protocols",
            type: "theory",
            moduleNumber: 2,
            duration: "45 min",
            description: "Safety considerations for VI practitioners",
          },
          {
            id: "3-4",
            title: "Safety Posture Assessment",
            type: "practice",
            moduleNumber: 2,
            duration: "45 min",
            description: "Practice safe positioning techniques",
          },
        ],
      },
      {
        id: "4",
        title: "Business & Practice Management",
        description:
          "Learn to start and manage your own massage therapy practice.",
        duration: "4 weeks",
        level: "Advanced",
        modules: 2,
        instructor: "James Wilson, MBA",
        lessons: [
          {
            id: "4-1",
            title: "Starting Your Practice",
            type: "theory",
            moduleNumber: 1,
            duration: "60 min",
            description: "Legal and business considerations",
          },
          {
            id: "4-2",
            title: "Marketing and Client Relations",
            type: "theory",
            moduleNumber: 2,
            duration: "45 min",
            description: "Building and maintaining your client base",
          },
        ],
      },
    ];

    setCourses(mockCourses);

    // Store courses in localStorage
    localStorage.setItem("courses", JSON.stringify(mockCourses));

    // Load user's enrolled courses
    if (user) {
      const traineeProgress = JSON.parse(
        localStorage.getItem("traineeProgress") || "{}"
      );
      const userProgress = traineeProgress[user.id] || {};
      setEnrolledCourses(Object.keys(userProgress));
    }
  }, [user]);

  const handleEnrollment = (courseId: string, courseTitle: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to enroll in courses",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    // Add course to user's progress
    const traineeProgress = JSON.parse(
      localStorage.getItem("traineeProgress") || "{}"
    );
    if (!traineeProgress[user.id]) {
      traineeProgress[user.id] = {};
    }
    traineeProgress[user.id][courseId] = [];

    localStorage.setItem("traineeProgress", JSON.stringify(traineeProgress));
    setEnrolledCourses([...enrolledCourses, courseId]);

    toast({
      title: "Enrollment Successful",
      description: `You've been enrolled in ${courseTitle}`,
      variant: "default",
    });
  };

  const isEnrolled = (courseId: string) => enrolledCourses.includes(courseId);

  const getProgress = (courseId: string) => {
    if (!user) return 0;
    const traineeProgress = JSON.parse(
      localStorage.getItem("traineeProgress") || "{}"
    );
    const userProgress = traineeProgress[user.id] || {};
    const courseProgress = userProgress[courseId] || [];
    const course = courses.find((c) => c.id === courseId);
    if (!course) return 0;
    return Math.round((courseProgress.length / course.lessons.length) * 100);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "Advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const stats = [
    { label: "Graduates Employed", value: "95%", icon: Briefcase },
    { label: "Course Completion Rate", value: "87%", icon: GraduationCap },
    { label: "Student Satisfaction", value: "4.8/5", icon: Star },
    { label: "Average Salary Increase", value: "65%", icon: Award },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gradient-primary mb-4">
            Professional Training Programs
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive massage therapy education designed specifically for
            visually impaired learners, with adaptive techniques and
            personalized support.
          </p>
        </div>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gradient-healing mb-6">
              Transform Your Future
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Our specialized training programs combine traditional massage
              therapy education with adaptive learning techniques, ensuring
              every student can excel in their career.
            </p>

            <div className="space-y-4 mb-8">
              {[
                "Hands-on learning with certified instructors",
                "Adaptive equipment and techniques",
                "Job placement assistance",
                "Continuing education support",
                "Industry certification preparation",
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="bg-gradient-healing p-1 rounded-full">
                    <CheckCircle className="h-4 w-4 text-healing-foreground" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Button className="btn-hero text-lg px-6 py-3">Apply Now</Button>
          </div>

          <div>
            <img
              src={trainingImage.src}
              alt="Students learning massage therapy techniques"
              className="rounded-2xl shadow-strong w-full h-96 object-cover"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-0 shadow-soft">
              <CardContent className="p-6">
                <div className="bg-gradient-primary p-3 rounded-2xl w-fit mx-auto mb-3">
                  <stat.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="text-2xl font-bold text-gradient-primary mb-1">
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Course Catalog */}
        <div>
          <h2 className="text-2xl font-bold text-gradient-healing mb-6">
            Available Courses
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {courses.map((course) => {
              const enrolled = isEnrolled(course.id);
              const progress = getProgress(course.id);

              return (
                <Card
                  key={course.id}
                  className="card-hover border-0 shadow-medium"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getLevelColor(course.level)}>
                        {course.level}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {course.duration}
                      </div>
                    </div>
                    <CardTitle className="text-xl mb-2">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {course.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between mb-4 text-sm">
                      <span className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1 text-healing" />
                        {course.lessons.length} lessons • {course.modules}{" "}
                        modules
                      </span>
                      <span className="text-muted-foreground">
                        by {course.instructor}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-primary" />
                        <span>
                          {
                            course.lessons.filter((l) => l.type === "theory")
                              .length
                          }{" "}
                          Theory Lessons
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-2 text-healing" />
                        <span>
                          {
                            course.lessons.filter((l) => l.type === "practice")
                              .length
                          }{" "}
                          Practical Exercises
                        </span>
                      </div>
                    </div>

                    {enrolled ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-healing transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <Button
                          onClick={() => router.push(`/training/${course.id}`)}
                          className="w-full btn-healing"
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Continue Learning
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() =>
                          handleEnrollment(course.id, course.title)
                        }
                        className="w-full btn-healing"
                      >
                        Enroll Now
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="border-0 shadow-medium bg-gradient-hero text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-3xl font-bold mb-4">
              Ready to Start Your Journey?
            </h3>
            <p className="text-xl mb-6 opacity-90 max-w-2xl mx-auto">
              Join hundreds of graduates who have transformed their lives
              through professional massage therapy training.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-4"
              >
                Apply Today
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 text-lg px-8 py-4"
              >
                Schedule Info Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
