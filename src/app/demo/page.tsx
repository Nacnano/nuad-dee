import ClientGeminiPostureAnalysis from "@/components/ServerGeminiPostureAnalysis";
import RealtimePostureAnalysis from "@/components/RealtimePostureAnalysis";
import ServerGeminiPostureAnalysis from "@/components/ServerGeminiPostureAnalysis";

export default function DemoPage() {
  return (
    <>
      Server-side Gemini Demo (New, try speaking to it)
      <ServerGeminiPostureAnalysis />
      Client-side Gemini Demo (New, try speaking to it)
      <ClientGeminiPostureAnalysis />
      Skeleton Demo (Old, wait 5-10 seconds to load the skeleton model)
      <RealtimePostureAnalysis />
    </>
  );
}
