"use client";

import NoThinkingAIStudioMassageTutorEnglish from "@/components/models/gemini/NoThinkingAIStudioMassageTutorEnglish";
import RealtimePostureAnalysis from "@/components/models/posture-analysis/RealtimePostureAnalysis";
import { Badge } from "@/components/ui/badge";

export default function DemoEnglishPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <Badge className="bg-primary/20 text-primary border-primary/30">
            English Language Version
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient-primary">
            AI Massage Instructor
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI-Powered Thai Massage Training System for Visually Impaired Students
          </p>
        </div>

        {/* AI Tutor Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            AI Massage Tutor (English)
          </h2>
          <NoThinkingAIStudioMassageTutorEnglish />
        </div>

        {/* Posture Analysis Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            Real-time Posture Analysis
          </h2>
          <RealtimePostureAnalysis />
        </div>
      </div>
    </div>
  );
}
