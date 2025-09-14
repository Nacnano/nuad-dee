"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Square,
  Play,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface PostureAnalysis {
  shoulderAlignment: { score: number; feedback: string };
  spineAlignment: { score: number; feedback: string };
  hipAlignment: { score: number; feedback: string };
  overallScore: number;
}

const RealtimePostureAnalysis: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [landmarks, setLandmarks] = useState<PoseLandmark[]>([]);
  const [analysis, setAnalysis] = useState<PostureAnalysis | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string>("");
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  const poseRef = useRef<any>(null);

  // Initialize MediaPipe Pose with proper error handling
  useEffect(() => {
    const initializeMediaPipe = async () => {
      try {
        setLoadingError("Loading MediaPipe libraries...");

        // Load MediaPipe Pose from CDN
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js";

        script.onload = async () => {
          try {
            // Wait for script to initialize
            await new Promise((resolve) => setTimeout(resolve, 500));

            if (typeof (window as any).Pose !== "undefined") {
              const pose = new (window as any).Pose({
                locateFile: (file: string) => {
                  return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`;
                },
              });

              await pose.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                enableSegmentation: false,
                smoothSegmentation: false,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
              });

              pose.onResults(onPoseResults);
              await pose.initialize();

              poseRef.current = pose;
              setIsModelLoaded(true);
              setLoadingError("");
              console.log("MediaPipe Pose initialized successfully");
            } else {
              throw new Error("MediaPipe Pose constructor not available");
            }
          } catch (initError) {
            console.error("MediaPipe initialization error:", initError);
            setLoadingError(`Initialization failed: ${initError}`);
            // Enable basic camera functionality without pose detection
            setIsModelLoaded(true);
          }
        };

        script.onerror = () => {
          console.error("Failed to load MediaPipe script");
          setLoadingError("Failed to load MediaPipe library from CDN");
          // Enable basic camera functionality
          setIsModelLoaded(true);
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error("Failed to initialize MediaPipe:", error);
        setLoadingError(`Setup failed: ${error}`);
        setIsModelLoaded(true);
      }
    };

    initializeMediaPipe();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const onPoseResults = useCallback(
    (results: any) => {
      if (!canvasRef.current || !videoRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size to match video
      const video = videoRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Check if we have pose landmarks
      if (results.poseLandmarks && results.poseLandmarks.length > 0) {
        console.log("Pose landmarks detected:", results.poseLandmarks.length);
        setLandmarks(results.poseLandmarks);

        // Draw pose landmarks and connections
        drawPoseVisualization(
          ctx,
          results.poseLandmarks,
          canvas.width,
          canvas.height
        );

        // Perform analysis if enabled
        if (isAnalyzing) {
          const postureAnalysis = analyzePose(results.poseLandmarks);
          setAnalysis(postureAnalysis);
        }
      } else {
        // Clear landmarks if no pose detected
        setLandmarks([]);
      }
    },
    [isAnalyzing]
  );

  const drawPoseVisualization = (
    ctx: CanvasRenderingContext2D,
    landmarks: PoseLandmark[],
    width: number,
    height: number
  ) => {
    // MediaPipe Pose connections
    const connections = [
      // Face
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 7],
      [0, 4],
      [4, 5],
      [5, 6],
      [6, 8],
      // Arms
      [9, 10],
      [11, 12],
      [11, 13],
      [13, 15],
      [15, 17],
      [15, 19],
      [15, 21],
      [17, 19],
      [12, 14],
      [14, 16],
      [16, 18],
      [16, 20],
      [16, 22],
      [18, 20],
      // Body
      [11, 23],
      [12, 24],
      [23, 24],
      // Legs
      [23, 25],
      [24, 26],
      [25, 27],
      [26, 28],
      [27, 29],
      [28, 30],
      [29, 31],
      [30, 32],
    ];

    // Draw connections first
    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    connections.forEach(([start, end]) => {
      if (start >= landmarks.length || end >= landmarks.length) return;

      const startPoint = landmarks[start];
      const endPoint = landmarks[end];

      if (
        startPoint &&
        endPoint &&
        (startPoint.visibility || 1) > 0.5 &&
        (endPoint.visibility || 1) > 0.5
      ) {
        ctx.beginPath();
        // Mirror x coordinate for selfie view
        ctx.moveTo((1 - startPoint.x) * width, startPoint.y * height);
        ctx.lineTo((1 - endPoint.x) * width, endPoint.y * height);
        ctx.stroke();
      }
    });

    // Draw landmark points
    landmarks.forEach((landmark, index) => {
      if ((landmark.visibility || 1) > 0.5) {
        const x = (1 - landmark.x) * width; // Mirror x coordinate
        const y = landmark.y * height;

        // Draw point with color coding
        ctx.fillStyle = getPointColor(index);
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();

        // Draw border
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw landmark number for debugging (optional)
        if (index % 5 === 0) {
          // Only show every 5th number to avoid clutter
          ctx.fillStyle = "#ffffff";
          ctx.font = "10px Arial";
          ctx.fillText(index.toString(), x + 8, y - 8);
        }
      }
    });
  };

  const getPointColor = (index: number): string => {
    // Color code different body parts based on MediaPipe Pose landmark indices
    if (index >= 0 && index <= 10) return "#ff6b6b"; // Face/head - red
    if ([11, 12].includes(index)) return "#e74c3c"; // Shoulders - dark red
    if ([13, 14, 15, 16, 17, 18, 19, 20, 21, 22].includes(index))
      return "#3498db"; // Arms - blue
    if ([23, 24].includes(index)) return "#9b59b6"; // Hips - purple
    if (index >= 25 && index <= 32) return "#2ecc71"; // Legs - green
    return "#f39c12"; // Other points - orange
  };

  const analyzePose = (landmarks: PoseLandmark[]): PostureAnalysis => {
    if (!landmarks || landmarks.length < 33) {
      return {
        shoulderAlignment: { score: 0, feedback: "Unable to detect pose" },
        spineAlignment: { score: 0, feedback: "Unable to detect pose" },
        hipAlignment: { score: 0, feedback: "Unable to detect pose" },
        overallScore: 0,
      };
    }

    try {
      // MediaPipe Pose landmark indices
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftHip = landmarks[23];
      const rightHip = landmarks[24];

      // Verify landmarks exist and have valid visibility
      if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
        throw new Error("Missing key landmarks");
      }

      // Calculate shoulder alignment
      const shoulderHeightDiff = Math.abs(leftShoulder.y - rightShoulder.y);
      const shoulderScore = Math.max(0, 100 - shoulderHeightDiff * 2000);

      // Calculate spine alignment
      const shoulderMidpoint = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2,
      };
      const hipMidpoint = {
        x: (leftHip.x + rightHip.x) / 2,
        y: (leftHip.y + rightHip.y) / 2,
      };

      const spineVector = {
        x: shoulderMidpoint.x - hipMidpoint.x,
        y: shoulderMidpoint.y - hipMidpoint.y,
      };

      // Calculate deviation from vertical (ideal spine should be vertical)
      const spineAngle = Math.abs(Math.atan2(spineVector.x, spineVector.y));
      const spineScore = Math.max(0, 100 - ((spineAngle * 180) / Math.PI) * 2);

      // Calculate hip alignment
      const hipHeightDiff = Math.abs(leftHip.y - rightHip.y);
      const hipScore = Math.max(0, 100 - hipHeightDiff * 2000);

      const overallScore = (shoulderScore + spineScore + hipScore) / 3;

      return {
        shoulderAlignment: {
          score: shoulderScore,
          feedback:
            shoulderScore > 80
              ? "Excellent shoulder alignment!"
              : shoulderScore > 60
              ? "Good alignment, minor adjustments needed"
              : "Try to level your shoulders",
        },
        spineAlignment: {
          score: spineScore,
          feedback:
            spineScore > 80
              ? "Great spinal posture!"
              : spineScore > 60
              ? "Good posture, keep spine straight"
              : "Focus on keeping your spine vertical",
        },
        hipAlignment: {
          score: hipScore,
          feedback:
            hipScore > 80
              ? "Perfect hip alignment!"
              : hipScore > 60
              ? "Good hip position"
              : "Try to level your hips",
        },
        overallScore: Math.round(overallScore),
      };
    } catch (error) {
      console.error("Analysis error:", error);
      return {
        shoulderAlignment: { score: 0, feedback: "Analysis error" },
        spineAlignment: { score: 0, feedback: "Analysis error" },
        hipAlignment: { score: 0, feedback: "Analysis error" },
        overallScore: 0,
      };
    }
  };

  const startCamera = async () => {
    try {
      setLoadingError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
            setIsStreaming(true);

            // Set canvas size to match video
            if (canvasRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth || 640;
              canvasRef.current.height = videoRef.current.videoHeight || 480;
            }

            // Start processing frames
            processFrame();
          }
        };
      }
    } catch (error) {
      console.error("Camera access error:", error);
      setLoadingError(`Camera access denied: ${error}`);
    }
  };

  const stopCamera = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsStreaming(false);
    setIsAnalyzing(false);
    setLandmarks([]);
    setAnalysis(null);

    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const processFrame = async () => {
    if (!videoRef.current || !isStreaming || !videoRef.current.readyState) {
      animationRef.current = requestAnimationFrame(processFrame);
      return;
    }

    if (poseRef.current && videoRef.current.videoWidth > 0) {
      try {
        await poseRef.current.send({ image: videoRef.current });
      } catch (error) {
        console.error("Pose processing error:", error);
      }
    }

    animationRef.current = requestAnimationFrame(processFrame);
  };

  const toggleAnalysis = () => {
    setIsAnalyzing(!isAnalyzing);
    if (!isAnalyzing) {
      setAnalysis(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Camera Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Real-time Posture Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Button
              onClick={isStreaming ? stopCamera : startCamera}
              disabled={!isModelLoaded && !loadingError}
            >
              {isStreaming ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Stop Camera
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Camera
                </>
              )}
            </Button>

            {isStreaming && (
              <Button
                onClick={toggleAnalysis}
                variant={isAnalyzing ? "destructive" : "default"}
              >
                {isAnalyzing ? "Stop Analysis" : "Start Analysis"}
              </Button>
            )}
          </div>

          {/* Loading/Error States */}
          {!isModelLoaded && !loadingError && (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <div className="text-sm text-gray-600">
                Loading MediaPipe Pose model...
              </div>
            </div>
          )}

          {loadingError && (
            <div className="text-center py-4">
              <AlertCircle className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-sm text-gray-600 mb-2">{loadingError}</div>
              {isStreaming && (
                <div className="text-xs text-gray-500">
                  Camera is working, but pose detection may not be available.
                </div>
              )}
            </div>
          )}

          {/* Camera Feed Container */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            {/* Video Element (hidden, used for processing) */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-50"
              style={{ transform: "scaleX(-1)" }}
            />

            {/* Canvas Overlay for Pose Visualization */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Placeholder when not streaming */}
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Camera feed will appear here</p>
                  <p className="text-sm opacity-75 mt-2">
                    Click "Start Camera" to begin
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Status Indicators */}
          {isStreaming && (
            <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
              <Badge variant={landmarks.length > 0 ? "default" : "secondary"}>
                {landmarks.length > 0 ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Pose Detected ({landmarks.length} points)
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 mr-1" />
                    No Pose Detected
                  </>
                )}
              </Badge>

              {poseRef.current && (
                <Badge variant="outline">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  AI Model Ready
                </Badge>
              )}

              {isAnalyzing && (
                <Badge variant="destructive">
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Analyzing...
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Analysis Results */}
      {analysis && isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Real-time Posture Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Overall Score */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold mb-2 text-blue-600">
                  {analysis.overallScore}%
                </div>
                <div className="text-sm text-gray-600">
                  Overall Posture Score
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Shoulder Alignment</h4>
                  <div className="text-2xl font-bold mb-1 text-blue-600">
                    {Math.round(analysis.shoulderAlignment.score)}%
                  </div>
                  <p className="text-sm text-gray-600">
                    {analysis.shoulderAlignment.feedback}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Spine Alignment</h4>
                  <div className="text-2xl font-bold mb-1 text-blue-600">
                    {Math.round(analysis.spineAlignment.score)}%
                  </div>
                  <p className="text-sm text-gray-600">
                    {analysis.spineAlignment.feedback}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Hip Alignment</h4>
                  <div className="text-2xl font-bold mb-1 text-blue-600">
                    {Math.round(analysis.hipAlignment.score)}%
                  </div>
                  <p className="text-sm text-gray-600">
                    {analysis.hipAlignment.feedback}
                  </p>
                </div>
              </div>

              {/* Tips */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-800">
                  💡 Real-time Tips
                </h4>
                <ul className="text-sm space-y-1 text-blue-700">
                  <li>• Stand 3-6 feet away from the camera</li>
                  <li>• Ensure good lighting on your body</li>
                  <li>• Keep your full body visible in the frame</li>
                  <li>• Stand naturally and let the AI analyze your posture</li>
                  <li>• Green lines show detected pose skeleton</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Info (for development) */}
      {landmarks.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-600">
              <p>Landmarks detected: {landmarks.length}</p>
              <p>Model loaded: {poseRef.current ? "Yes" : "No"}</p>
              <p>Stream active: {isStreaming ? "Yes" : "No"}</p>
              <p>Analysis active: {isAnalyzing ? "Yes" : "No"}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealtimePostureAnalysis;
