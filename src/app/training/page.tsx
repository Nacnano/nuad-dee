"use client";

import { useState, useEffect, useRef } from "react";
import { mockTrainingModules, User } from "@/utils/mockData";
import { getFromLocalStorage, setToLocalStorage } from "@/utils/localStorage";

export default function TrainingPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeModule, setActiveModule] = useState(mockTrainingModules[0]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [postureFeedback, setPostureFeedback] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<string[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize camera
  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Please allow camera access to use this feature");
      }
    }
    setupCamera();

    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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

  const startRecording = () => {
    if (!stream) return;

    setIsRecording(true);
    setRecordingTime(0);
    setShowAnalysis(false);
    setAnalysisResults([]);

    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);

    recorder.start();

    const timer = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= 10) {
          clearInterval(timer);
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (!mediaRecorder || !stream) return;

    setIsRecording(false);
    mediaRecorder.stop();

    // Stop all tracks in the stream
    stream.getTracks().forEach((track) => track.stop());
    setStream(null);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    analyzeRecording();
  };

  const analyzeRecording = () => {
    // Mock AI analysis results
    const mockAnalysis = [
      {
        timestamp: "0:02",
        feedback: "✅ Good starting position",
        confidence: 0.92,
      },
      {
        timestamp: "0:04",
        feedback: "⚠️ Adjust hand pressure - too strong",
        confidence: 0.85,
      },
      {
        timestamp: "0:06",
        feedback: "✅ Excellent flowing movement",
        confidence: 0.95,
      },
      {
        timestamp: "0:08",
        feedback: "⚠️ Maintain straight back posture",
        confidence: 0.88,
      },
      {
        timestamp: "0:10",
        feedback: "✅ Good rhythm and technique",
        confidence: 0.9,
      },
    ];

    const results = mockAnalysis.map(
      (a) =>
        `[${a.timestamp}] ${a.feedback} (Confidence: ${Math.round(
          a.confidence * 100
        )}%)`
    );

    setAnalysisResults(results);
    setShowAnalysis(true);
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
                        {/* Camera View */}
                        <div className="relative">
                          <div className="aspect-w-16 aspect-h-9 bg-gray-900 rounded-lg overflow-hidden">
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-full object-cover"
                            />
                            {isRecording && (
                              <div className="absolute top-4 right-4 flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
                                <span className="text-white font-mono bg-black/50 px-2 py-1 rounded">
                                  Recording: {recordingTime}s
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Camera Controls */}
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                            {!showAnalysis && (
                              <button
                                onClick={
                                  isRecording ? stopRecording : startRecording
                                }
                                className={`${
                                  isRecording ? "bg-yellow-500" : "bg-red-600"
                                } text-white px-6 py-2 rounded-full hover:${
                                  isRecording ? "bg-yellow-600" : "bg-red-700"
                                } flex items-center gap-2`}
                              >
                                <span className="w-2 h-2 bg-white rounded-full"></span>
                                {isRecording
                                  ? "Stop Recording"
                                  : "Start Recording"}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Analysis Area */}
                        {showAnalysis && (
                          <div className="bg-white border rounded-lg p-4">
                            <h4 className="font-semibold text-lg mb-3">
                              Movement Analysis
                            </h4>
                            <div className="space-y-2">
                              {analysisResults.map((result, index) => (
                                <div
                                  key={index}
                                  className={`p-2 rounded ${
                                    result.includes("✅")
                                      ? "bg-green-50 text-green-700"
                                      : "bg-yellow-50 text-yellow-700"
                                  }`}
                                >
                                  {result}
                                </div>
                              ))}
                            </div>
                            <div className="mt-6 flex justify-between">
                              <button
                                onClick={startRecording}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                              >
                                Record Again
                              </button>
                              <button
                                onClick={() => {
                                  alert(
                                    "Video saved to your progress records!"
                                  );
                                }}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                              >
                                Save to Progress
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Traditional Posture Analysis */}
                        <button
                          onClick={simulatePostureAnalysis}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                          Quick Posture Check
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
