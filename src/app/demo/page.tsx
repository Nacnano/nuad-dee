"use client";

import AIStudioMassageTutor from "@/components/AIStudioMassageTutor";
import ClientGeminiPostureAnalysis from "@/components/ClientGeminiPostureAnalysis";
import RealtimePostureAnalysis from "@/components/RealtimePostureAnalysis";
import ServerGeminiPostureAnalysis from "@/components/ServerGeminiPostureAnalysis";

export default function DemoPage() {
  return (
    <>
      Client-side Message Tutor (Press Start Session, and try speaking to it)
      <AIStudioMassageTutor />
      Skeleton Demo (Old, wait 5-10 seconds to load the skeleton model)
      <RealtimePostureAnalysis />
    </>
  );
}
