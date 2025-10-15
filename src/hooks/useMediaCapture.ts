import { useCallback, useRef, useState } from "react";
import {
  FacingMode,
  VIDEO_CONFIG,
  AUDIO_CONFIG,
  float32ToInt16,
  uint8ToBase64,
} from "@/lib/media-utils";

export const useMediaCapture = () => {
  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // State
  const [isStreaming, setIsStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState<FacingMode>("user");
  const [error, setError] = useState<string>("");

  const startCamera = useCallback(
    async (requestedFacing?: FacingMode) => {
      try {
        setError(""); // Clear any previous errors
        const targetFacing = requestedFacing || facingMode;
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: targetFacing, ...VIDEO_CONFIG },
          audio: true,
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setIsStreaming(true);
        setFacingMode(targetFacing);

        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)(
            {
              sampleRate: AUDIO_CONFIG.sampleRate,
            }
          );
        }

        return stream;
      } catch (err: any) {
        console.error("Camera start error:", err);
        setError(`Camera/Mic access error: ${err?.message || err}`);
        return null;
      }
    },
    [facingMode]
  );

  const stopCamera = useCallback(() => {
    // Stop all tracks individually
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => {
        track.stop();
        console.log(`Stopped ${track.kind} track`);
      });
      streamRef.current = null;
    }

    // Properly clean up video element
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      // Force a load to clear any pending operations
      videoRef.current.load();
    }

    setIsStreaming(false);
    setError(""); // Clear any previous errors
  }, []);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
  }, []);

  const startAudioProcessing = useCallback((onAudioData: (data: string) => void) => {
    if (!audioContextRef.current || !streamRef.current) return;

    try {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (!audioTrack) return;

      const singleStream = new MediaStream([audioTrack]);
      audioSourceRef.current = audioContextRef.current.createMediaStreamSource(singleStream);
      processorRef.current = audioContextRef.current.createScriptProcessor(
        AUDIO_CONFIG.processorBufferSize,
        1,
        1
      );

      processorRef.current.onaudioprocess = (e: AudioProcessingEvent) => {
        const input = e.inputBuffer.getChannelData(0);
        const int16 = float32ToInt16(input);
        const uint8 = new Uint8Array(int16.buffer);
        const base64 = uint8ToBase64(uint8);
        onAudioData(base64);
      };

      audioSourceRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);
    } catch (err) {
      console.error("Audio processing error:", err);
    }
  }, []);

  const stopAudioProcessing = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioSourceRef.current) {
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    stopAudioProcessing();
    stopCamera();
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => null);
      audioContextRef.current = null;
    }
  }, [stopAudioProcessing, stopCamera]);

  return {
    videoRef,
    canvasRef,
    audioContextRef,
    isStreaming,
    error,
    facingMode,
    startCamera,
    stopCamera,
    captureFrame,
    startAudioProcessing,
    stopAudioProcessing,
    cleanup,
  };
};
