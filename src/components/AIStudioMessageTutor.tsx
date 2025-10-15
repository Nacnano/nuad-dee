"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { Video, VideoOff, Mic, MicOff, RefreshCw, Bot, User, AlertTriangle } from "lucide-react";
import type { TranscriptEntry } from "@/types/transcript";
import { decode, decodeAudioData, createPcmBlob } from "@/lib/audio-utils";
import { massageTherapistPrompt } from "@/lib/system-prompts";

const FRAME_RATE = 1; // Send 10 frames per second
const JPEG_QUALITY = 1;

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

const ThaiMassageTutor: React.FC = () => {
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

  const stopSession = useCallback(async () => {
    setStatusMessage("Stopping session...");
    setIsSessionActive(false);
    setIsCameraOn(false);

    if (frameIntervalRef.current) {
      window.clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

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
  }, []);

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

      // FIX: Cast window to 'any' to allow 'webkitAudioContext' for browser compatibility.
      audioContextsRef.current.input = new (window.AudioContext ||
        (window as any).webkitAudioContext)({ sampleRate: 16000 });
      // FIX: Cast window to 'any' to allow 'webkitAudioContext' for browser compatibility.
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
              const pcmBlob = createPcmBlob(inputData);
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
          onmessage: async (message: LiveServerMessage) => {
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

            const parts = message.serverContent?.modelTurn?.parts;
            const audioData = parts && parts[0]?.inlineData?.data;
            if (audioData && audioContextsRef.current.output) {
              const outputContext = audioContextsRef.current.output;
              audioPlaybackRef.current.nextStartTime = Math.max(
                audioPlaybackRef.current.nextStartTime,
                outputContext.currentTime
              );

              const audioBuffer = await decodeAudioData(decode(audioData), outputContext, 24000, 1);
              const source = outputContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputContext.destination);
              source.addEventListener("ended", () => {
                audioPlaybackRef.current.sources.delete(source);
              });

              source.start(audioPlaybackRef.current.nextStartTime);
              audioPlaybackRef.current.nextStartTime += audioBuffer.duration;
              audioPlaybackRef.current.sources.add(source);
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

  const switchCamera = () => {
    if (!isSessionActive) {
      setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    }
  };

  useEffect(() => {
    return () => {
      stopSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full flex flex-col md:flex-row gap-6 h-[80vh]">
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
        <div className="flex items-center justify-between mt-4 p-2 bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            {isSessionActive ? (
              <Mic size={16} className="text-green-400" />
            ) : (
              <MicOff size={16} className="text-red-400" />
            )}
            <span>{statusMessage}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={switchCamera}
              disabled={isSessionActive}
              className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw size={20} />
            </button>
            <button
              onClick={toggleSession}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${isSessionActive ? "bg-red-600 hover:bg-red-700" : "bg-teal-600 hover:bg-teal-700"}`}
            >
              {isSessionActive ? <VideoOff size={20} /> : <Video size={20} />}
              {isSessionActive ? "Stop Session" : "Start Session"}
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-2 p-3 bg-red-900 border border-red-700 text-red-200 rounded-lg flex items-center gap-2">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}
      </div>
      <div className="w-full md:w-1/3 flex flex-col bg-gray-900 rounded-lg">
        <h2 className="text-lg font-semibold p-4 border-b border-gray-700 text-teal-300">
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
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                  <Bot size={20} />
                </div>
              )}
              <div
                className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-lg ${entry.speaker === "user" ? "bg-blue-600" : "bg-gray-700"}`}
              >
                <p className="text-sm">{entry.text}</p>
              </div>
              {entry.speaker === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
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

export default ThaiMassageTutor;
