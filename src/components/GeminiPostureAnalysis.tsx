"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { apiEndpoints } from "@/lib/config";

const GeminiPostureAnalysis: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [responseText, setResponseText] = useState<string>("");
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const responseQueue = useRef<any[]>([]);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
      if (processorRef.current) {
        processorRef.current.disconnect();
      }
      if (audioSourceRef.current) {
        audioSourceRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const waitMessage = useCallback(async () => {
    let done = false;
    let message = undefined;
    while (!done) {
      message = responseQueue.current.shift();
      if (message) {
        done = true;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    return message;
  }, []);

  const handleTurn = useCallback(async () => {
    const turns = [];
    let done = false;
    while (!done && sessionRef.current) {
      const message = await waitMessage();
      turns.push(message);

      // Handle text response
      if (message.text) {
        console.log("📝 Text:", message.text);
        setResponseText((prev) => prev + message.text);
      }

      // Handle audio response
      if (message.data && audioContextRef.current) {
        console.log("🔊 Audio data received");
        try {
          const buffer = Uint8Array.from(atob(message.data), (c) =>
            c.charCodeAt(0)
          );
          const audioData = new Int16Array(buffer.buffer);

          // Convert Int16Array to AudioBuffer
          const audioBuffer = audioContextRef.current.createBuffer(
            1,
            audioData.length,
            24000
          );
          const channelData = audioBuffer.getChannelData(0);
          for (let i = 0; i < audioData.length; i++) {
            channelData[i] = audioData[i] / 32768.0;
          }

          // Play audio
          const source = audioContextRef.current.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContextRef.current.destination);
          source.start(0);
        } catch (e) {
          console.error("Error playing audio:", e);
        }
      }

      if (message.serverContent && message.serverContent.turnComplete) {
        console.log("✅ Turn complete");
        done = true;
      }
    }
    return turns;
  }, [waitMessage]);

  const parseSSE = async (
    response: Response,
    onMessage: (msg: any) => void
  ) => {
    if (!response.body) return;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });

      let doubleNewline;
      while ((doubleNewline = buf.indexOf("\n\n")) !== -1) {
        const chunk = buf.slice(0, doubleNewline).trim();
        buf = buf.slice(doubleNewline + 2);
        if (!chunk) continue;

        // lines like: data: {"..."}
        const lines = chunk.split("\n").filter(Boolean);
        const dataLines = lines
          .filter((l) => l.startsWith("data:"))
          .map((l) => l.replace(/^data:\s?/, ""));
        const dataText = dataLines.join("\n").trim();

        if (!dataText) continue;
        if (dataText === "[DONE]") {
          onMessage({ serverContent: { turnComplete: true } });
          continue;
        }
        try {
          const parsed = JSON.parse(dataText);
          onMessage(parsed);
        } catch (e) {
          console.warn("SSE JSON parse failed:", e, dataText);
        }
      }
    }
  };

  const captureAndSendFrameHTTP = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const base64Image = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];

    try {
      console.log("📸 POSTing frame to streaming endpoint");
      const resp = await fetch(apiEndpoints.geminiSession, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "image",
          data: base64Image,
          mimeType: "image/jpeg",
        }),
      });

      if (!resp.ok) {
        console.error("Frame POST failed:", resp.status, await resp.text());
        setError("Server returned error while sending frame");
        return;
      }

      // Parse SSE and push messages into responseQueue
      parseSSE(resp, (msg) => {
        responseQueue.current.push(msg);
      });
    } catch (err) {
      console.error("Error sending frame (HTTP):", err);
      setError("Failed to send frame");
    }
  }, []);

  const startSession = async () => {
    setIsConnecting(true);
    setError("");
    responseQueue.current = [];

    try {
      console.log("🔵 Starting HTTP-streaming based session...");

      // mark connected/analyzing immediately
      setIsAnalyzing(true);
      setIsConnecting(false);

      // Start sending frames every 2 seconds (each frame POST creates its own streaming response)
      captureIntervalRef.current = setInterval(() => {
        captureAndSendFrameHTTP();
        handleTurn(); // drains responseQueue
      }, 2000);

      // Send an initial frame shortly after starting
      setTimeout(() => captureAndSendFrameHTTP(), 500);

      // Start audio processing if stream exists
      if (streamRef.current && audioContextRef.current) {
        startAudioProcessing(streamRef.current); // null because we are using fetch inside audio processor
      }
    } catch (e: any) {
      console.error("❌ Failed to start session:", e);
      setError(`Failed to start session: ${e?.message || e}`);
      setIsConnecting(false);
      setIsAnalyzing(false);
    }
  };

  const sendAudioChunkHTTP = async (base64Audio: string) => {
    try {
      const resp = await fetch(apiEndpoints.geminiSession, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "audio",
          data: base64Audio,
          mimeType: "audio/pcm;rate=16000",
        }),
      });
      if (!resp.ok) {
        console.warn("Audio POST error:", resp.status, await resp.text());
        return;
      }
      parseSSE(resp, (msg) => {
        responseQueue.current.push(msg);
      });
    } catch (e) {
      console.error("sendAudioChunkHTTP error:", e);
    }
  };

  const startAudioProcessing = (stream: MediaStream) => {
    if (!audioContextRef.current) return;

    try {
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) {
        console.warn("No audio track found");
        return;
      }
      const audioStream = new MediaStream([audioTrack]);
      audioSourceRef.current =
        audioContextRef.current.createMediaStreamSource(audioStream);

      processorRef.current = audioContextRef.current.createScriptProcessor(
        4096,
        1,
        1
      );

      processorRef.current.onaudioprocess = (e) => {
        // convert float32 to int16
        const inputData = e.inputBuffer.getChannelData(0);
        const int16Data = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        const buffer = new Uint8Array(int16Data.buffer);
        const base64Audio = btoa(String.fromCharCode(...buffer));

        // fire-and-forget POST for this chunk
        sendAudioChunkHTTP(base64Audio);
      };

      audioSourceRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      console.log("✅ Audio processing started (HTTP chunks)");
    } catch (error) {
      console.error("Error starting audio processing:", error);
    }
  };

  const stopSession = () => {
    console.log("🛑 Stopping session...");

    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioSourceRef.current) {
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }

    setIsAnalyzing(false);
    setIsConnecting(false);
    setResponseText("");
    responseQueue.current = [];
  };

  const startCamera = async (requestedFacingMode?: "user" | "environment") => {
    try {
      if (!videoRef.current) return;

      const currentFacingMode = requestedFacingMode || facingMode;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setIsStreaming(true);
      setFacingMode(currentFacingMode);

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)({ sampleRate: 16000 });
      }

      console.log("✅ Camera started successfully");
    } catch (err: any) {
      console.error("❌ Error accessing media devices:", err);
      setError(`Camera/Mic access error: ${err.message}`);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    stopSession();
  };

  const switchCamera = async () => {
    if (!isStreaming) return;
    const newFacingMode = facingMode === "user" ? "environment" : "user";
    const wasAnalyzing = isAnalyzing;
    stopCamera();
    await startCamera(newFacingMode);
    if (wasAnalyzing) {
      setTimeout(() => startSession(), 500);
    }
  };

  const toggleAnalysis = () => {
    if (isAnalyzing) {
      stopSession();
    } else {
      startSession();
    }
  };

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
                    onClick={toggleAnalysis}
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
              <div className="max-h-48 overflow-y-auto space-y-2 text-sm">
                {responseText.split("\n").map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          )}

          {isStreaming && (
            <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GeminiPostureAnalysis;
