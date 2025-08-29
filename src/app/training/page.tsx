"use client";

import { useState, useEffect } from "react";
import { mockTrainingModules, User } from "@/utils/mockData";
import { getFromLocalStorage, setToLocalStorage } from "@/utils/localStorage";

export default function TrainingPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeModule, setActiveModule] = useState(mockTrainingModules[0]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [postureFeedback, setPostureFeedback] = useState<string | null>(null);

  useEffect(() => {
    const user = getFromLocalStorage("currentUser");
    setCurrentUser(user);

    if (user?.role === "trainee") {
      const traineeProgress = getFromLocalStorage(
        `trainee_progress_${user.id}`
      ) || {
        completedLessons: [],
      };
      setCompletedLessons(traineeProgress.completedLessons);
    }
  }, []);

  const handleLessonComplete = (lessonId: string) => {
    if (!currentUser) return;

    const newCompletedLessons = [...completedLessons, lessonId];
    setCompletedLessons(newCompletedLessons);

    // Save progress to localStorage
    setToLocalStorage(`trainee_progress_${currentUser.id}`, {
      completedLessons: newCompletedLessons,
    });
  };

  const simulatePostureAnalysis = () => {
    // Mock AI posture analysis
    const feedbacks = [
      "✅ Excellent posture! Your alignment is perfect.",
      "⚠️ Slightly adjust your right arm position.",
      "✅ Good balance and pressure application.",
      "⚠️ Remember to keep your back straight.",
    ];
    setPostureFeedback(feedbacks[Math.floor(Math.random() * feedbacks.length)]);
  };

  const getProgress = () => {
    const totalLessons = mockTrainingModules.reduce(
      (acc, module) => acc + module.lessons.length,
      0
    );
    return Math.round((completedLessons.length / totalLessons) * 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
        Massage Therapy Training
      </h1>

      {currentUser?.role !== "trainee" ? (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Join Our Training Program</h2>
          <p className="text-gray-600 mb-6">
            Our comprehensive training program is designed specifically for
            visually impaired individuals who want to become professional
            massage therapists. The program combines theory, practical training,
            and real-world experience.
          </p>
          <a
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Login to Access Training
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Module List */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Training Modules</h2>
              <div className="space-y-4">
                {mockTrainingModules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => setActiveModule(module)}
                    className={`w-full text-left p-4 rounded-lg ${
                      activeModule.id === module.id
                        ? "bg-blue-50 border-blue-500"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <h3 className="font-medium">{module.title}</h3>
                    <p className="text-sm text-gray-500">{module.duration}</p>
                  </button>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Overall Progress: {getProgress()}%
                </h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${getProgress()}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Module Content */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">{activeModule.title}</h2>
              <p className="text-gray-600 mb-6">{activeModule.description}</p>

              <div className="space-y-6">
                {activeModule.lessons.map((lesson) => (
                  <div key={lesson.id} className="border rounded-lg p-4">
                    <h3 className="font-medium">{lesson.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Duration: {lesson.duration}
                    </p>

                    {lesson.type === "video" ? (
                      <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">
                          Video Content Placeholder
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500">
                            Interactive Exercise Area
                          </span>
                        </div>
                        <button
                          onClick={simulatePostureAnalysis}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                          Analyze Posture
                        </button>
                        {postureFeedback && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-700">{postureFeedback}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {!completedLessons.includes(lesson.id) && (
                      <button
                        onClick={() => handleLessonComplete(lesson.id)}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Mark as Complete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
