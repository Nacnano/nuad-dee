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
import {
  GoogleGenAI,
  LiveServerMessage,
  MediaResolution,
  Modality,
  Session,
} from "@google/genai";
import { Buffer } from "buffer";
import { geminiConfig } from "@/lib/config";
import { massageTherapistPrompt } from "@/lib/system-prompts";

// This is needed for the browser environment
if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

interface WavConversionOptions {
  numChannels: number;
  sampleRate: number;
  bitsPerSample: number;
}

function convertToWav(rawData: string[], mimeType: string) {
  const options = parseMimeType(mimeType);
  const dataLength = rawData.reduce((a, b) => a + b.length, 0);
  const wavHeader = createWavHeader(dataLength, options);
  const buffer = Buffer.concat(
    rawData.map((data) => Buffer.from(data, "base64"))
  );

  return Buffer.concat([wavHeader, buffer]);
}

function parseMimeType(mimeType: string) {
  const [fileType, ...params] = mimeType.split(";").map((s) => s.trim());
  const [_, format] = fileType.split("/");

  const options: Partial<WavConversionOptions> = {
    numChannels: 1,
    bitsPerSample: 16,
  };

  if (format && format.startsWith("L")) {
    const bits = parseInt(format.slice(1), 10);
    if (!isNaN(bits)) {
      options.bitsPerSample = bits;
    }
  }

  for (const param of params) {
    const [key, value] = param.split("=").map((s) => s.trim());
    if (key === "rate") {
      options.sampleRate = parseInt(value, 10);
    }
  }

  return options as WavConversionOptions;
}

function createWavHeader(dataLength: number, options: WavConversionOptions) {
  const { numChannels, sampleRate, bitsPerSample } = options;

  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const buffer = Buffer.alloc(44);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataLength, 40);

  return buffer;
}

const GeminiPostureAnalysis: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [responseText, setResponseText] = useState<string>("");
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const audioQueue = useRef<Buffer[]>([]);
  const isPlaying = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const responseQueue = useRef<LiveServerMessage[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const currentTurnAudioParts = useRef<string[]>([]);
  const processingTurn = useRef(false);

  useEffect(() => {
    if (!geminiConfig.apiKey) {
      setError(
        "Gemini API key is not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables."
      );
    }
    return () => {
      if (sessionRef.current) {
        sessionRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playNextAudio = useCallback(async () => {
    if (isPlaying.current || audioQueue.current.length === 0) {
      return;
    }
    isPlaying.current = true;
    const buffer = audioQueue.current.shift();
    if (buffer && audioContextRef.current) {
      try {
        const audioBuffer = await audioContextRef.current.decodeAudioData(
          Uint8Array.from(buffer).buffer
        );
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => {
          isPlaying.current = false;
          playNextAudio();
        };
        source.start(0);
      } catch (e) {
        console.error("Error playing audio:", e);
        isPlaying.current = false;
        playNextAudio();
      }
    } else {
      isPlaying.current = false;
    }
  }, []);

  const handleModelTurn = useCallback(
    (message: LiveServerMessage) => {
      if (message.serverContent?.modelTurn?.parts) {
        const part = message.serverContent?.modelTurn?.parts?.[0];

        if (part?.fileData) {
          console.log(`File: ${part?.fileData.fileUri}`);
        }

        if (part?.inlineData) {
          // Accumulate audio parts for the current turn
          currentTurnAudioParts.current.push(part.inlineData.data ?? "");
        }

        if (part?.text) {
          console.log(`Text: ${part.text}`);
          setResponseText((prev) => prev + part.text);
        }
      }

      // Check if turn is complete
      if (message.serverContent?.turnComplete) {
        // Process all accumulated audio parts as one complete audio file
        if (currentTurnAudioParts.current.length > 0) {
          const mimeType =
            message.serverContent?.modelTurn?.parts?.[0]?.inlineData
              ?.mimeType ?? "audio/pcm;rate=24000";
          const buffer = convertToWav(currentTurnAudioParts.current, mimeType);
          audioQueue.current.push(buffer);
          playNextAudio();
          // Clear for next turn
          currentTurnAudioParts.current = [];
        }
      }
    },
    [playNextAudio]
  );

  const waitMessage = useCallback(async (): Promise<LiveServerMessage> => {
    while (true) {
      const message = responseQueue.current.shift();
      if (message) {
        return message;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }, []);

  const handleTurn = useCallback(async () => {
    if (processingTurn.current) return;
    processingTurn.current = true;

    try {
      let done = false;
      while (!done && sessionRef.current) {
        const message = await waitMessage();
        handleModelTurn(message);
        if (message.serverContent && message.serverContent.turnComplete) {
          done = true;
        }
      }
    } finally {
      processingTurn.current = false;
    }
  }, [waitMessage, handleModelTurn]);

  const startSession = async () => {
    if (!geminiConfig.apiKey) {
      setError(
        "Gemini API key not found. Please configure it in your environment variables."
      );
      return;
    }
    setIsConnecting(true);
    setError("");
    currentTurnAudioParts.current = [];

    try {
      const ai = new GoogleGenAI({ apiKey: geminiConfig.apiKey });
      const model = geminiConfig.model;
      const config = {
        responseModalities: [Modality.AUDIO],
        mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Zephyr",
            },
          },
        },
        contextWindowCompression: {
          triggerTokens: "25600",
          slidingWindow: { targetTokens: "12800" },
        },
        systemInstruction: {
          parts: [
            {
              text: massageTherapistPrompt,
            },
          ],
        },
      };

      const session = await ai.live.connect({
        model,
        config,
        callbacks: {
          onopen: async () => {
            console.debug("Session Opened");
            // DON'T set sessionRef.current here
            setIsAnalyzing(true);
            setIsConnecting(false);
            await new Promise((resolve) => setTimeout(resolve, 500));
            if (streamRef.current && sessionRef.current) {
              startSendingMedia(streamRef.current);
            }
          },
          onmessage: (message: LiveServerMessage) => {
            responseQueue.current.push(message);
            handleTurn();
          },
          onerror: (e: ErrorEvent) => {
            console.error("Session Error:", e);
            setError(`Session error: ${e.message}`);
            stopSession();
          },
          onclose: (e: CloseEvent) => {
            console.debug("Session Close:", e.reason);
            stopSession();
          },
        },
      });

      // Set the session ref AFTER the connection is established
      sessionRef.current = session;
    } catch (e: any) {
      setError(`Failed to start session: ${e.message}`);
      setIsConnecting(false);
      setIsAnalyzing(false);
    }
  };
  const stopSession = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsAnalyzing(false);
    setIsConnecting(false);
    setResponseText("");
    currentTurnAudioParts.current = [];
    audioQueue.current = [];
    responseQueue.current = [];
  };

  const startSendingMedia = (stream: MediaStream) => {
    try {
      if (!sessionRef.current) {
        throw new Error("Session not started. Cannot send media.");
      }

      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }

      const mimeType = MediaRecorder.isTypeSupported(
        "video/webm;codecs=vp9,opus"
      )
        ? "video/webm;codecs=vp9,opus"
        : "video/webm";

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType,
      });

      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (event.data.size > 0 && sessionRef.current) {
          try {
            const chunk = await event.data.arrayBuffer();
            const base64Chunk = Buffer.from(chunk).toString("base64");
            sessionRef.current.sendClientContent({
              turns: [
                {
                  parts: [
                    {
                      inlineData: {
                        mimeType: event.data.type,
                        data: base64Chunk,
                      },
                    },
                  ],
                },
              ],
            });
          } catch (error) {
            console.error("Error sending media chunk:", error);
          }
        }
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        stopSession();
      };

      // Send chunks every 2 seconds instead of 1
      mediaRecorderRef.current.start(2000);
    } catch (error) {
      console.error("Error starting media recorder:", error);
      stopSession();
    }
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
          (window as any).webkitAudioContext)();
      }
    } catch (err: any) {
      console.error("Error accessing media devices.", err);
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
      // Restart analysis if it was running
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
                disabled={!geminiConfig.apiKey}
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
