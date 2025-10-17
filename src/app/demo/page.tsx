"use client";

import AIStudioMassageTutor from "@/components/AIStudioMassageTutor";
import ClientGeminiPostureAnalysis from "@/components/ClientGeminiPostureAnalysis";
import FixingTutor from "@/components/FixingTutor";
import NoThinkingAIStudioMassageTutor from "@/components/NoThinkingAIStudioMassageTutor";
import RealtimePostureAnalysis from "@/components/RealtimePostureAnalysis";
import ServerGeminiPostureAnalysis from "@/components/ServerGeminiPostureAnalysis";

export default function DemoPage() {
  return (
    <>
      {/* Client-side Message Tutor (Press Start Session, and try speaking to it) */}
      {/* <AIStudioMassageTutor /> */}
      {/* Thinking Mode Disabled */}
      <NoThinkingAIStudioMassageTutor />
      <RealtimePostureAnalysis />
    </>
  );
}
