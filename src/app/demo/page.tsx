import ClientGeminiPostureAnalysis from "@/components/ClientGeminiPostureAnalysis";
import RealtimePostureAnalysis from "@/components/RealtimePostureAnalysis";
import ServerGeminiPostureAnalysis from "@/components/ServerGeminiPostureAnalysis";

export default function DemoPage() {
  return (
    <>
      Client-side Gemini Demo (New, try speaking to it)
      <ClientGeminiPostureAnalysis />
      Server-side Gemini Demo (New, try speaking to it)
      <ServerGeminiPostureAnalysis />
      Skeleton Demo (Old, wait 5-10 seconds to load the skeleton model)
      <RealtimePostureAnalysis />
    </>
  );
}
