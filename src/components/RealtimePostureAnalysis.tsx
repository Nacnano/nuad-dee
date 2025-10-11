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
  RotateCcw,
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

// Helper to get device screen size (not browser window size)
function getDeviceScreenSize() {
  if (typeof window === "undefined") {
    return { width: 360, height: 640 };
  }
  // Use screen.width/height for device, fallback to window.innerWidth/Height
  const width =
    window.screen && window.screen.width
      ? window.screen.width
      : window.innerWidth;
  const height =
    window.screen && window.screen.height
      ? window.screen.height
      : window.innerHeight;
  return { width, height };
}

// Fixed camera area size for the component (responsive, but not overflowing)
const CAMERA_MAX_WIDTH = 480;
const CAMERA_ASPECT_RATIO = 4 / 3; // 4:3 aspect ratio for camera

const getCameraDimensions = () => {
  // Use device width, but cap to CAMERA_MAX_WIDTH
  const device = getDeviceScreenSize();
  let width = Math.min(device.width, CAMERA_MAX_WIDTH);
  let height = Math.round(width / CAMERA_ASPECT_RATIO);
  // If device is very short, adjust height
  if (height > device.height * 0.6) {
    height = Math.round(device.height * 0.6);
    width = Math.round(height * CAMERA_ASPECT_RATIO);
  }
  return { width, height };
};

const RealtimePostureAnalysis: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [landmarks, setLandmarks] = useState<PoseLandmark[]>([]);
  const [analysis, setAnalysis] = useState<PostureAnalysis | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string>("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  const poseRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  // Use fixed camera area size for the component
  const [cameraSize, setCameraSize] = useState(getCameraDimensions());

  useEffect(() => {
    // On mount, set to device screen size and listen for orientation changes
    const updateCameraSize = () => {
      setCameraSize(getCameraDimensions());
    };

    updateCameraSize();

    window.addEventListener("orientationchange", updateCameraSize);
    window.addEventListener("resize", updateCameraSize);

    return () => {
      window.removeEventListener("orientationchange", updateCameraSize);
      window.removeEventListener("resize", updateCameraSize);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeMediaPipe = async () => {
      try {
        const loadScript = (src: string): Promise<void> => {
          return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
              resolve();
              return;
            }
            const script = document.createElement("script");
            script.src = src;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(script);
          });
        };

        setLoadingError("Loading MediaPipe libraries...");

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

        await new Promise((resolve) => setTimeout(resolve, 500));

        if (
          typeof window !== "undefined" &&
          (window as any).Pose &&
          (window as any).Camera
        ) {
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
          throw new Error("MediaPipe Pose or Camera not available");
        }
      } catch (error) {
        console.error("Failed to initialize MediaPipe:", error);
        setLoadingError(`Failed to load MediaPipe: ${error}`);
        setIsModelLoaded(true);
      }
    };

    initializeMediaPipe();

    return () => {
      isMounted = false;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const animationFrameId = animationRef.current;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async (requestedFacingMode?: "user" | "environment") => {
    try {
      if (!videoRef.current) return;
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }

      const currentFacingMode = requestedFacingMode || facingMode;

      // Use cameraSize for camera constraints
      let { width, height } = cameraSize;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: width, max: width },
          height: { ideal: height, max: height },
          facingMode: currentFacingMode,
        },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      await new Promise<void>((resolve) => {
        videoRef.current!.onloadedmetadata = () => {
          videoRef.current?.play();
          resolve();
        };
      });

      setIsStreaming(true);
      setFacingMode(currentFacingMode);

      if (
        (window as any).Camera &&
        poseRef.current &&
        videoRef.current &&
        canvasRef.current
      ) {
        cameraRef.current = new (window as any).Camera(videoRef.current, {
          onFrame: async () => {
            if (poseRef.current && videoRef.current) {
              await poseRef.current.send({ image: videoRef.current });
            }
          },
          width: width,
          height: height,
        });
        cameraRef.current.start();
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
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    setIsStreaming(false);
    setIsAnalyzing(false);
    setLandmarks([]);
    setAnalysis(null);
  };

  const switchCamera = async () => {
    if (!isStreaming) return;

    const newFacingMode = facingMode === "user" ? "environment" : "user";

    // Stop current camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }

    // Start camera with new facing mode
    await startCamera(newFacingMode);
  };

  const drawPoseLandmarks = (
    ctx: CanvasRenderingContext2D,
    landmarks: PoseLandmark[],
    width: number,
    height: number
  ) => {
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

    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 3;
    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];

      if (
        startPoint &&
        endPoint &&
        (startPoint.visibility ?? 1) > 0.5 &&
        (endPoint.visibility ?? 1) > 0.5
      ) {
        ctx.beginPath();
        ctx.moveTo((1 - startPoint.x) * width, startPoint.y * height); // Mirror x coordinate
        ctx.lineTo((1 - endPoint.x) * width, endPoint.y * height);
        ctx.stroke();
      }
    });

    landmarks.forEach((landmark, index) => {
      if ((landmark.visibility ?? 1) > 0.5) {
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

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  };

  const onPoseResults = useCallback(
    (results: any) => {
      if (!canvasRef.current || !videoRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Always use the current cameraSize for canvas
      canvas.width = cameraSize.width;
      canvas.height = cameraSize.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(-1, 1);
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
      } else {
        setLandmarks([]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAnalyzing, cameraSize]
  );

  const getPointColor = (index: number): string => {
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

    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    const shoulderHeightDiff = Math.abs(leftShoulder.y - rightShoulder.y);
    const shoulderScore = Math.max(0, 100 - shoulderHeightDiff * 1000);

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

  const toggleAnalysis = () => {
    setIsAnalyzing((prev) => {
      if (!prev) setAnalysis(null);
      return !prev;
    });
  };

  return (
    <div className="space-y-6 w-full flex flex-col items-center">
      {/* Camera Controls */}
      <Card className="border-0 shadow-soft w-full max-w-[500px]">
        <CardHeader>
          <CardTitle className="flex items-center text-gradient-healing">
            <Camera className="h-5 w-5 mr-2" />
            Real-time Posture Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            <Button
              onClick={() => {
                if (isStreaming) {
                  stopCamera();
                } else {
                  startCamera();
                }
              }}
              disabled={!isModelLoaded && !loadingError}
              className={isStreaming ? "btn-destructive" : "btn-healing"}
              style={{ minWidth: 120 }}
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
              <>
                <Button
                  onClick={switchCamera}
                  variant="outline"
                  className="flex items-center"
                  style={{ minWidth: 120 }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Switch Camera
                </Button>

                <Button
                  onClick={toggleAnalysis}
                  variant={isAnalyzing ? "destructive" : "default"}
                  disabled={!poseRef.current}
                  style={{ minWidth: 120 }}
                >
                  {isAnalyzing ? "Stop Analysis" : "Start Analysis"}
                </Button>
              </>
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
            className="relative bg-black rounded-lg overflow-hidden mx-auto"
            style={{
              width: `${cameraSize.width}px`,
              height: `${cameraSize.height}px`,
              maxWidth: "100%",
              maxHeight: "70vw",
              minWidth: 200,
              minHeight: 150,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
            }}
          >
            {/* Video Element */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="absolute top-0 left-0 w-full h-full object-cover"
              style={{
                transform: "scaleX(-1)",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "0.5rem",
                zIndex: 1,
              }} // Mirror the video
              width={cameraSize.width}
              height={cameraSize.height}
            />

            {/* Canvas Overlay for Pose Detection */}
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
              style={{
                pointerEvents: "none",
                width: "100%",
                height: "100%",
                zIndex: 2,
              }}
              width={cameraSize.width}
              height={cameraSize.height}
            />

            {/* Placeholder when not streaming */}
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50 z-10">
                <div className="text-center">
                  <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Camera feed will appear here</p>
                  <p className="text-sm opacity-75 mt-2">
                    Click &quot;Start Camera&quot; to begin
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Status Indicators */}
          {isStreaming && (
            <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
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
        <Card className="border-0 shadow-medium w-full max-w-[500px]">
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
