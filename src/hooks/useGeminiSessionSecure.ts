import { useCallback, useRef, useState, useEffect } from "react";
import { LiveServerMessage } from "@google/genai";
import { geminiConfig } from "@/lib/config";
import { massageTherapistPrompt } from "@/lib/system-prompts";
import { base64ToUint8, convertToWav } from "@/lib/media-utils";

export const useGeminiSessionSecure = () => {
  const sessionIdRef = useRef<string | null>(null);
  const responseQueue = useRef<LiveServerMessage[]>([]);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioPartsRef = useRef<{ data: string; mimeType: string }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");
  const [responseText, setResponseText] = useState("");
  const [lastResponseTime, setLastResponseTime] = useState<Date | null>(null);
  const [responseCount, setResponseCount] = useState(0);

  const enqueueMessage = useCallback((msg: LiveServerMessage) => {
    responseQueue.current.push(msg);
  }, []);

  const waitForMessage =
    useCallback(async (): Promise<LiveServerMessage | null> => {
      while (responseQueue.current.length === 0 && sessionIdRef.current) {
        await new Promise((r) => setTimeout(r, 100));
      }
      return responseQueue.current.shift() || null;
    }, []);

  const playAudio = useCallback((audioParts: { data: string; mimeType: string }[]) => {
    if (audioParts.length === 0) return;

    try {
      // Use the mimeType from the first audio part
      const mimeType = audioParts[0].mimeType;
      const audioDataArray = audioParts.map(part => part.data);
      
      console.log("🎵 Converting audio to WAV format...");
      console.log("🎵 Audio parts count:", audioDataArray.length);
      console.log("🎵 MIME type:", mimeType);
      
      // Convert to WAV format
      const wavBuffer = convertToWav(audioDataArray, mimeType);
      
      // Create blob and play
      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        console.log("🎵 Audio playback finished");
      };
      
      audio.onerror = (e) => {
        console.error("🔴 Audio playback error:", e);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.play().then(() => {
        console.log("🎵 Audio playback started successfully!");
      }).catch((err) => {
        console.error("🔴 Failed to play audio:", err);
      });
    } catch (err) {
      console.error("🔴 Audio conversion error:", err);
    }
  }, []);

  const handleModelTurn = useCallback((message: LiveServerMessage) => {
    if (message.serverContent?.modelTurn?.parts) {
      const parts = message.serverContent.modelTurn.parts;

      parts.forEach((part) => {
        // Handle text response
        if (part.text) {
          console.log("📝 Text response:", part.text);
          setResponseText((prev) => prev + part.text);
        }

        // Handle audio response - accumulate audio parts
        if (part.inlineData && part.inlineData.data) {
          console.log("🔊 Audio response received");
          console.log("🎵 MIME type:", part.inlineData.mimeType);
          console.log(
            "📊 Data size:",
            Math.round(part.inlineData.data.length / 1024),
            "KB"
          );

          // Accumulate audio parts
          audioPartsRef.current.push({
            data: part.inlineData.data,
            mimeType: part.inlineData.mimeType || 'audio/pcm;rate=24000'
          });
          console.log("📦 Accumulated audio parts:", audioPartsRef.current.length);
        }

        // Handle file data response
        if (part.fileData) {
          console.log("📁 File response:", part.fileData.fileUri);
        }
      });
    }

    // Play accumulated audio when turn is complete
    if (message.serverContent?.turnComplete && audioPartsRef.current.length > 0) {
      console.log("✅ Turn complete - playing accumulated audio");
      playAudio([...audioPartsRef.current]);
      // Clear audio parts for next turn
      audioPartsRef.current = [];
    }
  }, [playAudio]);

  const handleTurnsOnce = useCallback(
    async (audioContext: AudioContext | null) => {
      if (!sessionIdRef.current) return;
      try {
        let done = false;
        while (!done && sessionIdRef.current) {
          const message = await waitForMessage();
          if (!message) break;

          // Handle the message using the proper LiveServerMessage format
          handleModelTurn(message);

          // Check if turn is complete
          if (message.serverContent?.turnComplete) {
            done = true;
          }
        }
      } catch (err) {
        console.error("Turn handling error:", err);
      }
    },
    [waitForMessage, handleModelTurn]
  );

  const startSession = useCallback(
    async (onSessionStarted: () => void) => {
      setIsConnecting(true);
      setError("");
      responseQueue.current = [];

      try {
        // Create session via secure API route
        const response = await fetch("/api/gemini/live", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "create_session",
            model: geminiConfig.model,
            responseModalities: ["AUDIO"],
            systemInstruction: massageTherapistPrompt,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create session");
        }

        const data = await response.json();
        sessionIdRef.current = data.sessionId;

        // Start polling for messages
        pollingIntervalRef.current = setInterval(async () => {
          if (sessionIdRef.current) {
            try {
              const msgResponse = await fetch("/api/gemini/live", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  action: "get_messages",
                  sessionId: sessionIdRef.current,
                }),
              });

              if (msgResponse.ok) {
                const msgData = await msgResponse.json();
                if (
                  msgData.success &&
                  msgData.messages &&
                  msgData.messages.length > 0
                ) {
                  console.log(
                    "🎯 Received",
                    msgData.messages.length,
                    "LiveServerMessage(s) from model"
                  );

                  msgData.messages.forEach(
                    (msg: LiveServerMessage, index: number) => {
                      console.log(`📨 LiveServerMessage ${index + 1}:`, {
                        hasServerContent: !!msg.serverContent,
                        hasModelTurn: !!msg.serverContent?.modelTurn,
                        hasParts: !!msg.serverContent?.modelTurn?.parts,
                        turnComplete: msg.serverContent?.turnComplete,
                        partsCount:
                          msg.serverContent?.modelTurn?.parts?.length || 0,
                      });

                      // Process the message using proper LiveServerMessage format
                      if (msg.serverContent?.modelTurn?.parts) {
                        msg.serverContent.modelTurn.parts.forEach(
                          (part, partIndex) => {
                            if (part.text) {
                              console.log(
                                `📝 Part ${partIndex + 1} Text:`,
                                part.text.substring(0, 100) + "..."
                              );
                            }
                            if (part.inlineData && part.inlineData.data) {
                              console.log(`🔊 Part ${partIndex + 1} Audio:`, {
                                mimeType: part.inlineData.mimeType,
                                size: `${Math.round(
                                  part.inlineData.data.length / 1024
                                )}KB`,
                              });
                            }
                          }
                        );
                      }

                      enqueueMessage(msg);
                    }
                  );
                  setResponseCount((prev) => prev + msgData.messages.length);
                  setLastResponseTime(new Date());
                }
              }
            } catch (err) {
              console.warn("Error polling messages:", err);
            }
          }
        }, 100); // Poll every 100ms

        setIsAnalyzing(true);
        setIsConnecting(false);
        onSessionStarted();

        console.log("🚀 Secure session created successfully!");
        console.log("🆔 Session ID:", data.sessionId);
        console.log("🔗 Model:", geminiConfig.model);
        console.log("📡 Polling for responses every 100ms");
      } catch (e: any) {
        console.error("Session start failed:", e);
        setError(e?.message || String(e));
        setIsConnecting(false);
        setIsAnalyzing(false);
      }
    },
    [enqueueMessage]
  );

  const stopSession = useCallback(async () => {
    if (sessionIdRef.current) {
      try {
        // Close session via secure API route
        await fetch("/api/gemini/live", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "close_session",
            sessionId: sessionIdRef.current,
          }),
        });
      } catch (e) {
        console.warn("Error closing session:", e);
      }
      sessionIdRef.current = null;
    }

    // Clear polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
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
      if (!sessionIdRef.current) return;
      try {
        // Log what we're sending
        console.log("📤 Sending input to model:", {
          sessionId: sessionIdRef.current,
          hasImage: !!input.image,
          hasAudio: !!input.audio,
          imageSize: input.image?.data
            ? `${Math.round(input.image.data.length / 1024)}KB`
            : "N/A",
          audioSize: input.audio?.data
            ? `${Math.round(input.audio.data.length / 1024)}KB`
            : "N/A",
        });

        // Send input via secure API route
        const response = await fetch("/api/gemini/live", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "send_input",
            sessionId: sessionIdRef.current,
            input,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to send input");
        }

        console.log("✅ Input sent successfully to model");
      } catch (err) {
        console.error("❌ Send input error:", err);
      }
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      stopSession();
    };
  }, [stopSession]);

  return {
    isAnalyzing,
    isConnecting,
    error,
    responseText,
    lastResponseTime,
    responseCount,
    handleTurnsOnce,
    startSession,
    stopSession,
    sendInput,
  };
};
