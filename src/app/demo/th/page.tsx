"use client";

import NoThinkingAIStudioMassageTutor from "@/components/models/gemini/NoThinkingAIStudioMassageTutor";
import RealtimePostureAnalysis from "@/components/models/posture-analysis/RealtimePostureAnalysis";
import { Badge } from "@/components/ui/badge";

export default function DemoThaiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <Badge className="bg-healing/20 text-healing border-healing/30">
            Thai Language Version
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient-healing">ครูนวดไทย AI</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ระบบสอนการนวดไทยด้วย AI สำหรับผู้พิการทางสายตา
          </p>
        </div>

        {/* AI Tutor Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">ครูนวด AI (Thai)</h2>
          <NoThinkingAIStudioMassageTutor />
        </div>

        {/* Posture Analysis Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            การวิเคราะห์ท่าทางแบบเรียลไทม์
          </h2>
          <RealtimePostureAnalysis />
        </div>
      </div>
    </div>
  );
}
