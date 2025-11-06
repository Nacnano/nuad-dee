"use client";

import React, { useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Square,
  Play,
  AlertCircle,
  CheckCircle,
  Loader2,
  RotateCcw,
  Mic,
} from "lucide-react";
import { useMediaCapture } from "@/hooks/useMediaCapture";
import { useGeminiSessionSecure } from "@/hooks/useGeminiSessionSecure";
import { FacingMode } from "@/lib/media-utils";

const ServerGeminiPostureAnalysis: React.FC = () => {
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    videoRef,
    canvasRef,
    audioContextRef,
    isStreaming,
    error: mediaError,
    facingMode,
    startCamera,
    stopCamera,
    captureFrame,
    startAudioProcessing,
    stopAudioProcessing,
    cleanup: cleanupMedia,
  } = useMediaCapture();

  const {
    isAnalyzing,
    isConnecting,
    error: sessionError,
    responseText,
    lastResponseTime,
    responseCount,
    handleTurnsOnce,
    startSession,
    stopSession,
    sendInput,
  } = useGeminiSessionSecure();

  const error = mediaError || sessionError;

  useEffect(() => {
    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
      cleanupMedia();
      stopSession();
    };
  }, [cleanupMedia, stopSession]);

  const startCapturing = useCallback(() => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }

    // Start frame capture interval
    const sendFrameAndHandleTurns = async () => {
      const base64Image = captureFrame();
      if (base64Image) {
        await sendInput({
          image: { data: base64Image, mimeType: "image/jpeg" },
        });
        handleTurnsOnce(audioContextRef.current);
      }
    };

    // Initial capture
    sendFrameAndHandleTurns();

    // Set up interval
    captureIntervalRef.current = setInterval(sendFrameAndHandleTurns, 2000);
  }, [captureFrame, sendInput, handleTurnsOnce, audioContextRef]);

  const stopCapturing = useCallback(() => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
  }, []);

  const handleSessionStart = useCallback(() => {
    startCapturing();
    if (isStreaming) {
      startAudioProcessing((audioData: string) => {
        sendInput({
          audio: { data: audioData, mimeType: "audio/pcm;rate=16000" },
        });
      });
    }
  }, [isStreaming, startAudioProcessing, sendInput, startCapturing]);

  const beginAnalysis = useCallback(async () => {
    await startSession(handleSessionStart);
  }, [startSession, handleSessionStart]);

  const endAnalysis = useCallback(() => {
    stopCapturing();
    stopAudioProcessing();
    stopSession();
  }, [stopCapturing, stopAudioProcessing, stopSession]);

  const switchCamera = useCallback(async () => {
    if (!isStreaming) return;

    try {
      const newMode: FacingMode = facingMode === "user" ? "environment" : "user";
      const wasAnalyzing = isAnalyzing;

      console.log(`🔄 Switching camera from ${facingMode} to ${newMode}`);

      // Completely stop everything if analyzing
      if (wasAnalyzing) {
        console.log("⏹️ Stopping analysis and session...");
        stopCapturing();
        stopAudioProcessing();
        await stopSession();
        // Wait for session to fully close
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      // Stop current camera and all tracks
      console.log("📷 Stopping current camera...");
      stopCamera();

      // Critical delay for mobile devices to release camera hardware
      // Some devices need up to 1 second
      console.log("⏳ Waiting for camera release...");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Start new camera with different facing mode
      console.log(`📷 Starting ${newMode} camera...`);
      const stream = await startCamera(newMode);

      if (!stream) {
        throw new Error("Failed to start camera with new facing mode");
      }

      console.log("✅ Camera switched successfully");

      // Wait for camera to stabilize
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Restart analysis if it was running
      if (wasAnalyzing) {
        console.log("▶️ Restarting analysis...");
        await beginAnalysis();
      }
    } catch (err: any) {
      console.error("❌ Camera switch error:", err);
      console.log(`🔙 Attempting to restart ${facingMode} camera...`);
      // Wait before trying to restart
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Try to restart with original facing mode if switch failed
      await startCamera(facingMode);
    }
  }, [
    facingMode,
    isStreaming,
    isAnalyzing,
    stopCamera,
    startCamera,
    beginAnalysis,
    stopCapturing,
    stopAudioProcessing,
    stopSession,
  ]);

  return (
    <div className="space-y-6 w-full flex flex-col items-center">
      <Card className="border-0 shadow-soft w-full max-w-[500px]">
        <CardHeader>
          <CardTitle className="flex items-center text-gradient-healing">
            <Camera className="h-5 w-5 mr-2" />
            Gemini Posture Analysis
          </CardTitle>
          <CardDescription>Live feedback powered by Gemini</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                onClick={() => (isStreaming ? stopCamera() : startCamera())}
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
                    disabled={isAnalyzing}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Switch Camera
                  </Button>

                  <Button
                    onClick={() => (isAnalyzing ? endAnalysis() : beginAnalysis())}
                    variant={isAnalyzing ? "destructive" : "default"}
                    disabled={isConnecting}
                    style={{ minWidth: 120 }}
                  >
                    {isConnecting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isAnalyzing ? (
                      "Stop Analysis"
                    ) : (
                      "Start Analysis"
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="text-center py-2 text-red-500 text-sm">
              <AlertCircle className="h-5 w-5 inline-block mr-2" />
              {error}
            </div>
          )}

          <div className="relative bg-black rounded-lg overflow-hidden mx-auto w-full max-w-[480px] aspect-[4/3]">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="absolute top-0 left-0 w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50">
                <div className="text-center">
                  <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Camera feed will appear here</p>
                </div>
              </div>
            )}
          </div>

          {isStreaming && isAnalyzing && responseText && (
            <div className="mt-4 p-4 bg-muted/10 rounded-lg border border-muted">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">🤖 Model responding...</span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 text-sm">
                {responseText.split("\n").map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          )}

          {isStreaming && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Badge
                  className={
                    isAnalyzing
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-primary/10 text-primary border-primary/20"
                  }
                >
                  {isAnalyzing ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      AI Analyzing
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 mr-1" />
                      AI Ready
                    </>
                  )}
                </Badge>
                <Badge className="bg-healing/10 text-healing border-healing/20">
                  <Mic className="h-4 w-4 mr-1" />
                  Audio On
                </Badge>
              </div>

              {/* Model Response Status */}
              {responseCount > 0 && (
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">🤖 Model Response Status</div>
                  <div className="flex items-center justify-center gap-4 text-xs">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      📊 Responses: {responseCount}
                    </span>
                    {lastResponseTime && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        🕒 Last: {lastResponseTime.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Check browser console for detailed model responses
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ServerGeminiPostureAnalysis;
