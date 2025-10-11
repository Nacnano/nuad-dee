import ClientGeminiPostureAnalysis from "@/components/ClientGeminiPostureAnalysis";
import RealtimePostureAnalysis from "@/components/RealtimePostureAnalysis";

export default function DemoPage() {
  return (
    <>
      Gemini Demo (New)
      <ClientGeminiPostureAnalysis />
      Skeleton Demo (Old)
      <RealtimePostureAnalysis />
    </>
  );
}
