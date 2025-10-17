"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Video, VideoOff, Mic, MicOff, RefreshCw, Bot, User, AlertTriangle } from "lucide-react";
import { GoogleGenAI, Modality } from "@google/genai";
import { massageTherapistPrompt } from "@/lib/system-prompts";

const FRAME_RATE = 1;
const JPEG_QUALITY = 1;

// Mock types for demonstration
interface TranscriptEntry {
  speaker: "user" | "model";
  text: string;
}

// Helper to convert a blob to a base64 string
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result.split(",")[1]);
      } else {
        reject(new Error("Failed to convert blob to base64."));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const FixingTutor: React.FC = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [statusMessage, setStatusMessage] = useState("Ready to start");
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const frameIntervalRef = useRef<number | null>(null);

  const currentInputTranscriptionRef = useRef("");
  const currentOutputTranscriptionRef = useRef("");
  const audioContextsRef = useRef<{
    input: AudioContext | null;
    output: AudioContext | null;
    scriptProcessor: ScriptProcessorNode | null;
    mediaStreamSource: MediaStreamAudioSourceNode | null;
  }>({ input: null, output: null, scriptProcessor: null, mediaStreamSource: null });
  const audioPlaybackRef = useRef<{
    nextStartTime: number;
    sources: Set<AudioBufferSourceNode>;
  }>({ nextStartTime: 0, sources: new Set() });

  const stopMediaStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const stopSession = useCallback(async () => {
    setStatusMessage("Stopping session...");
    setIsSessionActive(false);
    setIsCameraOn(false);

    if (frameIntervalRef.current) {
      window.clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }

    stopMediaStream();

    if (sessionPromiseRef.current) {
      try {
        const session = await sessionPromiseRef.current;
        session.close();
      } catch (e) {
        console.error("Error closing session:", e);
      }
      sessionPromiseRef.current = null;
    }

    if (audioContextsRef.current.input) {
      audioContextsRef.current.scriptProcessor?.disconnect();
      audioContextsRef.current.mediaStreamSource?.disconnect();
      await audioContextsRef.current.input.close();
      audioContextsRef.current.input = null;
    }
    if (audioContextsRef.current.output) {
      await audioContextsRef.current.output.close();
      audioContextsRef.current.output = null;
    }

    audioPlaybackRef.current.sources.forEach((source) => source.stop());
    audioPlaybackRef.current.sources.clear();
    audioPlaybackRef.current.nextStartTime = 0;

    setTranscripts([]);
    setStatusMessage("Ready to start");
  }, [stopMediaStream]);

  const startSession = useCallback(async () => {
    setError(null);
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      setError("API_KEY environment variable not set.");
      return;
    }

    setStatusMessage("Requesting permissions...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { facingMode: facingMode },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
      setStatusMessage("Initializing AI Tutor...");

      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

      audioContextsRef.current.input = new (window.AudioContext ||
        (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextsRef.current.output = new (window.AudioContext ||
        (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioPlaybackRef.current.nextStartTime = 0;
      audioPlaybackRef.current.sources.clear();

      sessionPromiseRef.current = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          systemInstruction: massageTherapistPrompt,
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          thinkingConfig: { thinkingBudget: 0 },
        },
        callbacks: {
          onopen: () => {
            setStatusMessage("Connection open. Streaming media...");
            if (!mediaStreamRef.current || !audioContextsRef.current.input) return;

            // Audio Streaming
            const source = audioContextsRef.current.input.createMediaStreamSource(
              mediaStreamRef.current
            );
            audioContextsRef.current.mediaStreamSource = source;
            const scriptProcessor = audioContextsRef.current.input.createScriptProcessor(
              4096,
              1,
              1
            );
            audioContextsRef.current.scriptProcessor = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              // Mock PCM blob creation
              const pcmBlob = new Blob([inputData], { type: "audio/pcm" });
              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextsRef.current.input.destination);

            // Video Streaming
            if (videoRef.current && canvasRef.current) {
              const video = videoRef.current;
              const canvas = canvasRef.current;
              const ctx = canvas.getContext("2d");

              frameIntervalRef.current = window.setInterval(() => {
                if (ctx && video.readyState >= 2) {
                  canvas.width = video.videoWidth;
                  canvas.height = video.videoHeight;
                  ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                  canvas.toBlob(
                    async (blob) => {
                      if (blob) {
                        const base64Data = await blobToBase64(blob);
                        sessionPromiseRef.current?.then((session) => {
                          session.sendRealtimeInput({
                            media: { data: base64Data, mimeType: "image/jpeg" },
                          });
                        });
                      }
                    },
                    "image/jpeg",
                    JPEG_QUALITY
                  );
                }
              }, 1000 / FRAME_RATE);
            }
          },
          onmessage: async (message: any) => {
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscriptionRef.current +=
                message.serverContent.outputTranscription.text;
            }
            if (message.serverContent?.inputTranscription) {
              currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.turnComplete) {
              const fullInput = currentInputTranscriptionRef.current.trim();
              const fullOutput = currentOutputTranscriptionRef.current.trim();
              if (fullInput)
                setTranscripts((prev) => [...prev, { speaker: "user", text: fullInput }]);
              if (fullOutput)
                setTranscripts((prev) => [...prev, { speaker: "model", text: fullOutput }]);
              currentInputTranscriptionRef.current = "";
              currentOutputTranscriptionRef.current = "";
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error("Session error:", e);
            setError(`Session error: ${e.message}`);
            stopSession();
          },
          onclose: () => {
            setStatusMessage("Session closed.");
            if (isSessionActive) {
              stopSession();
            }
          },
        },
      });
      setIsSessionActive(true);
    } catch (err) {
      console.error("Failed to start session:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to get media devices: ${errorMessage}`);
      setStatusMessage("Error starting session");
      stopSession();
    }
  }, [facingMode, stopSession, isSessionActive]);

  const toggleSession = () => {
    if (isSessionActive) {
      stopSession();
    } else {
      startSession();
    }
  };

  const switchCamera = async () => {
    if (isSessionActive) {
      setStatusMessage("Switching camera...");
      setError(null);

      // Stop the current media stream first
      stopMediaStream();

      // Wait a brief moment for the camera to be fully released
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Toggle facing mode
      const newFacingMode = facingMode === "user" ? "environment" : "user";
      setFacingMode(newFacingMode);

      try {
        // Request new stream with new camera
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { facingMode: newFacingMode },
        });

        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Reconnect audio processing to new stream
        if (audioContextsRef.current.input) {
          // Disconnect old audio source
          audioContextsRef.current.scriptProcessor?.disconnect();
          audioContextsRef.current.mediaStreamSource?.disconnect();

          // Create new audio source from new stream
          const source = audioContextsRef.current.input.createMediaStreamSource(stream);
          audioContextsRef.current.mediaStreamSource = source;
          const scriptProcessor = audioContextsRef.current.scriptProcessor;

          if (scriptProcessor) {
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextsRef.current.input.destination);
          }
        }

        setStatusMessage("Connection open. Streaming media...");
      } catch (err) {
        console.error("Failed to switch camera:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Failed to switch camera: ${errorMessage}`);
        setStatusMessage("Camera switch failed");
      }
    } else {
      // Just toggle the preference when not active
      setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    }
  };

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  return (
    <div className="bg-gray-50 rounded-lg shadow-lg p-6 w-full flex flex-col md:flex-row gap-6 h-[80vh] border border-gray-200">
      <div className="w-full md:w-2/3 flex flex-col relative">
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
          ></video>
          <canvas ref={canvasRef} className="hidden"></canvas>
          {!isCameraOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 text-gray-400">
              <VideoOff size={64} />
              <p className="mt-2">Camera is off</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-4 p-2 bg-gray-100 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {isSessionActive ? (
              <Mic size={16} className="text-green-500" />
            ) : (
              <MicOff size={16} className="text-red-500" />
            )}
            <span>{statusMessage}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={switchCamera}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
              title={isSessionActive ? "Switch camera during session" : "Toggle camera preference"}
            >
              <RefreshCw size={20} />
            </button>
            <button
              onClick={toggleSession}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                isSessionActive
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {isSessionActive ? <VideoOff size={20} /> : <Video size={20} />}
              {isSessionActive ? "Stop Session" : "Start Session"}
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}
      </div>
      <div className="w-full md:w-1/3 flex flex-col bg-white rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold p-4 border-b border-gray-200 text-blue-600">
          Live Transcript
        </h2>
        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {transcripts.length === 0 && (
            <div className="text-center text-gray-500 pt-10">Transcript will appear here...</div>
          )}
          {transcripts.map((entry, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${entry.speaker === "user" ? "justify-end" : ""}`}
            >
              {entry.speaker === "model" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Bot size={20} />
                </div>
              )}
              <div
                className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-lg ${
                  entry.speaker === "user" ? "bg-blue-500 text-white" : "bg-gray-100"
                }`}
              >
                <p className="text-sm">{entry.text}</p>
              </div>
              {entry.speaker === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                  <User size={20} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FixingTutor;
