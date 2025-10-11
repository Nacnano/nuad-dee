import ClientGeminiPostureAnalysis from "@/components/ClientGeminiPostureAnalysis";
import RealtimePostureAnalysis from "@/components/RealtimePostureAnalysis";

export default function DemoPage() {
  return (
    <>
      Gemini Demo (New, try speaking to it)
      <ClientGeminiPostureAnalysis />
      Skeleton Demo (Old, wait 5-10 seconds to load the skeleton model)
      <RealtimePostureAnalysis />
    </>
  );
}
