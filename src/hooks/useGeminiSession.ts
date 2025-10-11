import { useCallback, useRef, useState } from "react";
import { GoogleGenAI, Modality } from "@google/genai";
import { geminiConfig } from "@/lib/config";
import { massageTherapistPrompt } from "@/lib/system-prompts";
import { base64ToUint8 } from "@/lib/media-utils";

export const useGeminiSession = () => {
  const sessionRef = useRef<any | null>(null);
  const responseQueue = useRef<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");
  const [responseText, setResponseText] = useState("");

  const enqueueMessage = useCallback((msg: any) => {
    responseQueue.current.push(msg);
  }, []);

  const waitForMessage = useCallback(async () => {
    while (responseQueue.current.length === 0 && sessionRef.current) {
      await new Promise((r) => setTimeout(r, 100));
    }
    return responseQueue.current.shift();
  }, []);

  const handleTurnsOnce = useCallback(
    async (audioContext: AudioContext | null) => {
      if (!sessionRef.current) return;
      try {
        let done = false;
        while (!done && sessionRef.current) {
          const message = await waitForMessage();
          if (!message) break;

          // Handle text response
          if (message.text) {
            setResponseText((prev) => prev + message.text);
          }

          // Handle audio response
          if (message.data && audioContext) {
            try {
              const bytes = base64ToUint8(message.data);
              const audioData = new Int16Array(bytes.buffer);
              const audioBuffer = audioContext.createBuffer(
                1,
                audioData.length,
                24000
              );
              const channel = audioBuffer.getChannelData(0);
              for (let i = 0; i < audioData.length; i++) {
                channel[i] = audioData[i] / 32768.0;
              }
              const src = audioContext.createBufferSource();
              src.buffer = audioBuffer;
              src.connect(audioContext.destination);
              src.start();
            } catch (err) {
              console.warn("Audio playback error:", err);
            }
          }

          if (message.serverContent?.turnComplete) {
            done = true;
          }
        }
      } catch (err) {
        console.error("Turn handling error:", err);
      }
    },
    [waitForMessage]
  );

  const startSession = useCallback(
    async (onSessionStarted: () => void) => {
      if (!geminiConfig.apiKey) {
        setError("Gemini API key not found");
        return;
      }

      setIsConnecting(true);
      setError("");
      responseQueue.current = [];

      try {
        const ai = new GoogleGenAI({ apiKey: geminiConfig.apiKey });
        const model = geminiConfig.model;
        const config = {
          responseModalities: [Modality.AUDIO],
          systemInstruction: massageTherapistPrompt,
        };

        const session = await ai.live.connect({
          model,
          config,
          callbacks: {
            onopen: () => {
              setIsAnalyzing(true);
              setIsConnecting(false);
              onSessionStarted();
            },
            onmessage: (m: any) => enqueueMessage(m),
            onerror: (e: ErrorEvent) => {
              console.error("Session error:", e);
              setError(e.message || "Session error");
              stopSession();
            },
            onclose: () => {
              stopSession();
            },
          },
        });

        sessionRef.current = session;
      } catch (e: any) {
        console.error("Session start failed:", e);
        setError(e?.message || String(e));
        setIsConnecting(false);
        setIsAnalyzing(false);
      }
    },
    [enqueueMessage]
  );

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch (e) {
        // Ignore close errors
      }
      sessionRef.current = null;
    }

    setIsAnalyzing(false);
    setIsConnecting(false);
    setResponseText("");
    responseQueue.current = [];
  }, []);

  const sendInput = useCallback(
    async (input: {
      image?: { data: string; mimeType: string };
      audio?: { data: string; mimeType: string };
    }) => {
      if (!sessionRef.current) return;
      try {
        await sessionRef.current.sendRealtimeInput(input);
      } catch (err) {
        console.error("Send input error:", err);
      }
    },
    []
  );

  return {
    isAnalyzing,
    isConnecting,
    error,
    responseText,
    handleTurnsOnce,
    startSession,
    stopSession,
    sendInput,
  };
};
