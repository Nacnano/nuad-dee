"use client";

import FixingRealtimePostureAnalysis from "@/components/models/FixingRealtimePostureAnalysis";
import FixingTutor from "@/components/models/FixingTutor";
export default function DemoPage() {
  return (
    <>
      {/* Client-side Message Tutor (Press Start Session, and try speaking to it) */}
      {/* <AIStudioMassageTutor /> */}
      {/* Thinking Mode Disabled */}
      {/* Skeleton Demo (Wait 5-10 seconds to load model)
      <RealtimePostureAnalysis /> */}
      <FixingTutor />
      <FixingRealtimePostureAnalysis />
    </>
  );
}
