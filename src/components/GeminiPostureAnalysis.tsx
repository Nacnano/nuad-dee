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

  // http://soundfile.sapp.org/doc/WaveFormat
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const buffer = Buffer.alloc(44);

  buffer.write("RIFF", 0); // ChunkID
  buffer.writeUInt32LE(36 + dataLength, 4); // ChunkSize
  buffer.write("WAVE", 8); // Format
  buffer.write("fmt ", 12); // Subchunk1ID
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22); // NumChannels
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(byteRate, 28); // ByteRate
  buffer.writeUInt16LE(blockAlign, 32); // BlockAlign
  buffer.writeUInt16LE(bitsPerSample, 34); // BitsPerSample
  buffer.write("data", 36); // Subchunk2ID
  buffer.writeUInt32LE(dataLength, 40); // Subchunk2Size

  return buffer;
}

const GeminiPostureAnalysis: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const audioQueue = useRef<Buffer[]>([]);
  const isPlaying = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const responseQueue = useRef<LiveServerMessage[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

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
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
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
          const audioParts: string[] = [part.inlineData.data ?? ""];
          const buffer = convertToWav(
            audioParts,
            part.inlineData.mimeType ?? ""
          );
          audioQueue.current.push(buffer);
          playNextAudio();
        }

        if (part?.text) {
          console.log(part?.text);
        }
      }
    },
    [playNextAudio]
  );

  const waitMessage = useCallback(async (): Promise<LiveServerMessage> => {
    let done = false;
    let message: LiveServerMessage | undefined = undefined;
    while (!done) {
      message = responseQueue.current.shift();
      if (message) {
        handleModelTurn(message);
        done = true;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    return message!;
  }, [handleModelTurn]);

  const handleTurn = useCallback(async (): Promise<LiveServerMessage[]> => {
    const turn: LiveServerMessage[] = [];
    let done = false;
    while (!done) {
      const message = await waitMessage();
      turn.push(message);
      if (message.serverContent && message.serverContent.turnComplete) {
        done = true;
      }
    }
    return turn;
  }, [waitMessage]);

  const startSession = async () => {
    if (!geminiConfig.apiKey) {
      setError(
        "Gemini API key not found. Please configure it in your environment variables."
      );
      return;
    }
    setIsConnecting(true);
    setError("");

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
              text: `คุณคือผู้ช่วย AI ที่ทำหน้าที่ตรวจสอบการนวดบ่าแบบสดผ่านวิดีโอ และคอยแนะนำผู้ที่กำลังนวด โดยเป้าหมายคือ **ให้ผู้ที่ไม่มีพื้นฐานสามารถนวดบ่าได้ถูกต้อง ปลอดภัย และบรรเทาความตึงล้า**

### 1. อธิบายโครงสร้างบ่าแบบง่าย

* **กล้ามเนื้อหลักที่เกี่ยวข้อง**

  * กล้ามเนื้อ **ทราพีเซียส (Trapezius)**: กล้ามเนื้อใหญ่รูปสามเหลี่ยมคลุมจากต้นคอถึงบ่าและกลางหลัง
  * กล้ามเนื้อ **เดลทอยด์ (Deltoid)**: กล้ามเนื้อหัวไหล่ที่ปกคลุมด้านข้าง
  * กล้ามเนื้อ **Levator Scapulae**: อยู่ด้านข้างของคอ เชื่อมคอกับสะบัก มักเป็นจุดตึงเมื่อเครียด
* **เส้นเอ็นและจุดที่มักตึง**

  * บริเวณ **ฐานคอถึงไหล่** มักเป็นจุดปวดตึง
  * บริเวณ **กระดูกสะบัก** (Scapula) ด้านในเป็นจุดกดเจ็บบ่อย

### 2. หลักการนวดบ่า

* ใช้ **แรงกดปานกลาง** ไม่กดแรงจนเจ็บ
* เน้นการ **กด คลึง บีบ และลูบ** เพื่อลดตึงของกล้ามเนื้อ
* หลีกเลี่ยงการกดตรง **กระดูกหรือเส้นประสาทคอ**

### 3. ขั้นตอนการนวดบ่า (Guideline)

1. **เตรียมท่าทาง**

   * ให้ผู้ถูกนวดนั่งหลังตรง หรือเอนเก้าอี้สบาย
   * ผู้ที่นวดควรยืนหรือย่อให้อยู่ในตำแหน่งถนัด

2. **เริ่มอุ่นกล้ามเนื้อ**

   * ใช้ฝ่ามือลูบจากคอลงมาที่บ่าเบาๆ 3–5 ครั้ง เพื่อให้เลือดไหลเวียน

3. **การบีบและคลึงบ่า**

   * ใช้นิ้วโป้งและโคนนิ้วอีก 4 นิ้ว บีบกล้ามเนื้อบ่า (Trapezius) แล้วคลึงเบาๆ
   * ทำซ้ำทั้งซ้ายและขวา 1–2 นาที

4. **การกดจุดคลายเส้น**

   * ใช้นิ้วโป้งกดเบาๆ บริเวณโคนคอ–บ่า และด้านในสะบัก
   * กดค้างไว้ 5–8 วินาที แล้วปล่อย

5. **การลูบปิดท้าย**

   * ใช้ฝ่ามือลูบจากคอลงบ่าเบาๆ อีก 3–5 ครั้ง เพื่อให้กล้ามเนื้อคลาย

### 4. สิ่งที่ AI ต้องตรวจเช็คระหว่าง Live Video

* ตรวจว่าผู้ที่นวด **กดถูกตำแหน่งกล้ามเนื้อ** (ไม่กดที่กระดูกหรือเส้นประสาทคอโดยตรง)
* แนะนำให้ปรับ **แรงกด** หากผู้ถูกนวดมีอาการเจ็บเกินไป
* แนะนำ **ท่ามือที่ถูกต้อง** (ใช้ฝ่ามือ/นิ้วโป้ง/นิ้วทั้ง 4 อย่างเหมาะสม)
* เตือนเรื่อง **ท่าทางการยืน/นั่งของผู้ที่นวด** เพื่อป้องกันอาการเจ็บหลัง
* แนะนำให้ **หยุดพัก** หากผู้ถูกนวดมีอาการเวียนหัว ชา หรือปวดมาก

### 5. สิ่งที่ไม่ควรทำ

* ห้ามกดแรงบริเวณกระดูกสันหลังหรือท้ายทอย
* ห้ามนวดต่อเนื่องเกิน 15 นาทีโดยไม่พัก
* ห้ามนวดถ้ามีการบาดเจ็บ กล้ามเนื้อฉีก หรือโรคกระดูกคอ`,
            },
          ],
        },
      };

      const session = await ai.live.connect({
        model,
        config,
        callbacks: {
          onopen: () => {
            console.debug("Session Opened");
            setIsAnalyzing(true);
            setIsConnecting(false);
            // Start sending media after session is open
            if (streamRef.current) {
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

      sessionRef.current = session;
    } catch (e: any) {
      setError(`Failed to start session: ${e.message}`);
      setIsConnecting(false);
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
  };

  const startSendingMedia = (stream: MediaStream) => {
    if (!sessionRef.current) {
      console.error("Session not started. Cannot send media.");
      return;
    }

    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = async (event) => {
      if (event.data.size > 0 && sessionRef.current) {
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
      }
    };

    mediaRecorderRef.current.start(1000); // Send data every 1 second
  };

  const startCamera = async (requestedFacingMode?: "user" | "environment") => {
    try {
      if (!videoRef.current) return;

      const currentFacingMode = requestedFacingMode || facingMode;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentFacingMode,
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
    stopCamera();
    await startCamera(newFacingMode);
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
