"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Languages, Globe, ArrowRight } from "lucide-react";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className="bg-gradient-to-r from-healing to-primary text-white border-0">
            <Languages className="w-4 h-4 mr-2" />
            Demo Versions
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold">Choose Your Language</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select your preferred language to experience our AI-powered massage training system
          </p>
        </div>

        {/* Language Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Thai Version */}
          <Card className="hover:shadow-lg transition-shadow border-healing/20 hover:border-healing/40">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl text-gradient-healing">Thai Version</CardTitle>
              </div>
              <CardDescription className="text-base">
                ระบบสอนการนวดไทยด้วย AI สำหรับผู้พิการทางสายตา
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✅ Thai language instruction</p>
                <p>✅ Voice guidance in Thai</p>
                <p>✅ Cultural context included</p>
                <p>✅ Real-time posture analysis</p>
              </div>
              <Button asChild className="w-full btn-healing group">
                <Link href="/demo/th">
                  เริ่มต้นใช้งาน
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* English Version */}
          <Card className="hover:shadow-lg transition-shadow border-primary/20 hover:border-primary/40">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl text-gradient-primary">English Version</CardTitle>
              </div>
              <CardDescription className="text-base">
                AI-Powered Thai Massage Training for Visually Impaired Students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✅ English language instruction</p>
                <p>✅ Voice guidance in English</p>
                <p>✅ International accessibility</p>
                <p>✅ Real-time posture analysis</p>
              </div>
              <Button asChild className="w-full btn-primary group">
                <Link href="/demo/en">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-healing" />
              What&apos;s Included in Both Versions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-healing/20 text-healing flex items-center justify-center">
                  🎙️
                </div>
                <div>
                  <h4 className="font-semibold mb-1">AI Voice Instructor</h4>
                  <p className="text-sm text-muted-foreground">
                    Real-time audio guidance through camera feed
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                  📹
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Live Video Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Computer vision tracking your movements
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-wellness/20 text-wellness flex items-center justify-center">
                  🎯
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Posture Detection</h4>
                  <p className="text-sm text-muted-foreground">
                    MediaPipe-based body landmark tracking
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center">
                  ⚠️
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Safety Warnings</h4>
                  <p className="text-sm text-muted-foreground">
                    Instant alerts for dangerous techniques
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold">
                  1
                </span>
                <span>Choose your preferred language version above</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold">
                  2
                </span>
                <span>Click &quot;Start Session&quot; to activate the AI instructor</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold">
                  3
                </span>
                <span>Allow camera and microphone permissions when prompted</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold">
                  4
                </span>
                <span>
                  Follow the AI instructor&apos;s guidance and practice massage techniques
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold">
                  5
                </span>
                <span>View your posture analysis and receive real-time feedback</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
