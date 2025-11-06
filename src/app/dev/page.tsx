"use client";

import NoThinkingAIStudioMassageTutor from "@/components/models/gemini/NoThinkingAIStudioMassageTutor";
import RealtimePostureAnalysis from "@/components/models/posture-analysis/RealtimePostureAnalysis";
export default function DemoPage() {
  return (
    <>
      {/* Client-side Message Tutor (Press Start Session, and try speaking to it) */}
      {/* <AIStudioMassageTutor /> */}
      {/* Thinking Mode Disabled */}
      {/* Skeleton Demo (Wait 5-10 seconds to load model)*/}
      <NoThinkingAIStudioMassageTutor />
      <RealtimePostureAnalysis />
    </>
  );
}
