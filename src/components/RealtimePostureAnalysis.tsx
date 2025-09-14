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

  // Initialize MediaPipe Pose
  useEffect(() => {
    const initializeMediaPipe = async () => {
      try {
        // Create script elements with proper error handling
        const loadScript = (src: string): Promise<void> => {
          return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(script);
          });
        };

        setLoadingError("Loading MediaPipe libraries...");

        // Load MediaPipe scripts in sequence
        await loadScript(
          "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js"
        );

        // Wait a bit for scripts to initialize
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (typeof window !== "undefined" && (window as any).Pose) {
          const pose = new (window as any).Pose({
            locateFile: (file: string) => {
              return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            },
          });

          pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });

          pose.onResults(onPoseResults);
          poseRef.current = pose;
          setIsModelLoaded(true);
          setLoadingError("");
        } else {
          throw new Error("MediaPipe Pose not available");
        }
      } catch (error) {
        console.error("Failed to initialize MediaPipe:", error);
        setLoadingError(`Failed to load MediaPipe: ${error}`);
        // Fallback to basic video display without pose detection
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
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw video frame
      ctx.save();
      ctx.scale(-1, 1); // Mirror the video
      ctx.drawImage(
        videoRef.current,
        -canvas.width,
        0,
        canvas.width,
        canvas.height
      );
      ctx.restore();

      if (results.poseLandmarks && results.poseLandmarks.length > 0) {
        setLandmarks(results.poseLandmarks);

        // Draw pose landmarks
        drawPoseLandmarks(
          ctx,
          results.poseLandmarks,
          canvas.width,
          canvas.height
        );

        if (isAnalyzing) {
          const postureAnalysis = analyzePose(results.poseLandmarks);
          setAnalysis(postureAnalysis);
        }
      }
    },
    [isAnalyzing]
  );

  const drawPoseLandmarks = (
    ctx: CanvasRenderingContext2D,
    landmarks: PoseLandmark[],
    width: number,
    height: number
  ) => {
    // Define pose connections (MediaPipe Pose format)
    const connections = [
      [11, 12],
      [11, 13],
      [13, 15],
      [12, 14],
      [14, 16], // Arms
      [11, 23],
      [12, 24],
      [23, 24], // Torso
      [23, 25],
      [25, 27],
      [27, 29],
      [29, 31], // Left leg
      [24, 26],
      [26, 28],
      [28, 30],
      [30, 32], // Right leg
    ];

    // Draw connections
    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 3;
    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];

      if (
        startPoint &&
        endPoint &&
        (startPoint.visibility || 1) > 0.5 &&
        (endPoint.visibility || 1) > 0.5
      ) {
        ctx.beginPath();
        ctx.moveTo((1 - startPoint.x) * width, startPoint.y * height); // Mirror x coordinate
        ctx.lineTo((1 - endPoint.x) * width, endPoint.y * height);
        ctx.stroke();
      }
    });

    // Draw landmarks
    landmarks.forEach((landmark, index) => {
      if ((landmark.visibility || 1) > 0.5) {
        ctx.fillStyle = getPointColor(index);
        ctx.beginPath();
        ctx.arc(
          (1 - landmark.x) * width,
          landmark.y * height,
          6,
          0,
          2 * Math.PI
        ); // Mirror x coordinate
        ctx.fill();

        // Draw point border
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  };

  const getPointColor = (index: number): string => {
    // Color code different body parts
    if ([11, 12].includes(index)) return "#ff6b6b"; // Shoulders - red
    if ([13, 14, 15, 16].includes(index)) return "#4ecdc4"; // Arms - teal
    if ([23, 24].includes(index)) return "#45b7d1"; // Hips - blue
    if ([25, 26, 27, 28, 29, 30, 31, 32].includes(index)) return "#96ceb4"; // Legs - green
    return "#ffeaa7"; // Other points - yellow
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

    // Key landmark indices for MediaPipe Pose
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    // Calculate shoulder alignment
    const shoulderHeightDiff = Math.abs(leftShoulder.y - rightShoulder.y);
    const shoulderScore = Math.max(0, 100 - shoulderHeightDiff * 1000);

    // Calculate spine alignment (simplified)
    const midShoulder = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2,
    };
    const midHip = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2,
    };

    const spineAngle = Math.abs(
      Math.atan2(midShoulder.y - midHip.y, midShoulder.x - midHip.x) -
        Math.PI / 2
    );
    const spineScore = Math.max(0, 100 - spineAngle * 100);

    // Calculate hip alignment
    const hipHeightDiff = Math.abs(leftHip.y - rightHip.y);
    const hipScore = Math.max(0, 100 - hipHeightDiff * 1000);

    const overallScore = (shoulderScore + spineScore + hipScore) / 3;

    return {
      shoulderAlignment: {
        score: shoulderScore,
        feedback:
          shoulderScore > 80
            ? "Excellent shoulder alignment!"
            : shoulderScore > 60
            ? "Good alignment, minor adjustments needed"
            : "Adjust shoulder position for better alignment",
      },
      spineAlignment: {
        score: spineScore,
        feedback:
          spineScore > 80
            ? "Great spinal posture!"
            : spineScore > 60
            ? "Good posture, keep spine straight"
            : "Focus on keeping your spine neutral",
      },
      hipAlignment: {
        score: hipScore,
        feedback:
          hipScore > 80
            ? "Perfect hip alignment!"
            : hipScore > 60
            ? "Good hip position"
            : "Adjust hip positioning for better balance",
      },
      overallScore: Math.round(overallScore),
    };
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsStreaming(true);

          if (canvasRef.current && videoRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth || 640;
            canvasRef.current.height = videoRef.current.videoHeight || 480;

            // Start processing frames
            processFrame();
          }
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setLoadingError(`Camera access error: ${error}`);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsAnalyzing(false);
    setLandmarks([]);
    setAnalysis(null);
  };

  const processFrame = () => {
    if (!videoRef.current || !isStreaming) return;

    if (poseRef.current) {
      try {
        poseRef.current.send({ image: videoRef.current });
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
    <div className="space-y-6">
      {/* Camera Controls */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center text-gradient-healing">
            <Camera className="h-5 w-5 mr-2" />
            Real-time Posture Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Button
              onClick={isStreaming ? stopCamera : startCamera}
              disabled={!isModelLoaded && !loadingError}
              className={isStreaming ? "btn-destructive" : "btn-healing"}
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
                disabled={!poseRef.current}
              >
                {isAnalyzing ? "Stop Analysis" : "Start Analysis"}
              </Button>
            )}
          </div>

          {/* Loading/Error States */}
          {!isModelLoaded && !loadingError && (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <div className="text-sm text-muted-foreground">
                Loading MediaPipe Pose model...
              </div>
            </div>
          )}

          {loadingError && !isStreaming && (
            <div className="text-center py-4">
              <AlertCircle className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-sm text-muted-foreground mb-2">
                {loadingError}
              </div>
              <div className="text-xs text-muted-foreground">
                You can still use the camera for basic video, but pose detection
                may not work.
              </div>
            </div>
          )}

          {/* Camera Feed Container */}
          <div
            className="relative bg-black rounded-lg overflow-hidden"
            style={{ aspectRatio: "4/3" }}
          >
            {/* Video Element */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }} // Mirror the video
            />

            {/* Canvas Overlay for Pose Detection */}
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
              style={{ pointerEvents: "none" }}
            />

            {/* Placeholder when not streaming */}
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50">
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
            <div className="mt-4 flex items-center justify-center gap-4">
              <Badge
                className={
                  landmarks.length > 0
                    ? "bg-success/10 text-success border-success/20"
                    : "bg-warning/10 text-warning border-warning/20"
                }
              >
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
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  AI Ready
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Analysis Results */}
      {analysis && isAnalyzing && (
        <Card className="border-0 shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center text-gradient-success">
              <AlertCircle className="h-5 w-5 mr-2" />
              Real-time Posture Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Overall Score */}
              <div className="text-center p-4 bg-background-secondary rounded-lg">
                <div className="text-3xl font-bold text-gradient-primary mb-2">
                  {analysis.overallScore}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Overall Posture Score
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-background-secondary rounded-lg">
                  <h4 className="font-medium mb-2">Shoulder Alignment</h4>
                  <div className="text-2xl font-bold mb-1">
                    {Math.round(analysis.shoulderAlignment.score)}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {analysis.shoulderAlignment.feedback}
                  </p>
                </div>

                <div className="p-4 bg-background-secondary rounded-lg">
                  <h4 className="font-medium mb-2">Spine Alignment</h4>
                  <div className="text-2xl font-bold mb-1">
                    {Math.round(analysis.spineAlignment.score)}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {analysis.spineAlignment.feedback}
                  </p>
                </div>

                <div className="p-4 bg-background-secondary rounded-lg">
                  <h4 className="font-medium mb-2">Hip Alignment</h4>
                  <div className="text-2xl font-bold mb-1">
                    {Math.round(analysis.hipAlignment.score)}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {analysis.hipAlignment.feedback}
                  </p>
                </div>
              </div>

              {/* Tips */}
              <div className="p-4 bg-healing/10 border border-healing/20 rounded-lg">
                <h4 className="font-medium mb-2 text-healing">
                  💡 Real-time Tips
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• Stand facing the camera for best detection</li>
                  <li>• Ensure good lighting on your body</li>
                  <li>• Keep your full torso visible in the frame</li>
                  <li>
                    • Analysis updates in real-time as you adjust your posture
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealtimePostureAnalysis;
