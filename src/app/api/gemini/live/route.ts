import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";

// Force Node.js runtime (required for ws and buffer packages)
export const runtime = 'nodejs';
// Prevent static optimization
export const dynamic = 'force-dynamic';
// Keep instance alive longer for session persistence (max 300s on Vercel Pro)
export const maxDuration = 300;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY environment variable is not set");
}

if (typeof globalThis.WebSocket === "undefined") {
  const { WebSocket } = require("ws");
  globalThis.WebSocket = WebSocket;
}

if (typeof globalThis.Buffer === "undefined") {
  globalThis.Buffer = require("buffer").Buffer;
}

// In-memory session storage (in production, use Redis or database)
const sessions = new Map<string, any>();
const sessionMessages = new Map<string, LiveServerMessage[]>();

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured on server" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case "create_session":
        return handleCreateSession(data);
      case "send_input":
        return handleSendInput(data);
      case "get_messages":
        return handleGetMessages(data);
      case "close_session":
        return handleCloseSession(data);
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Gemini API route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleCreateSession(data: any) {
  try {
    const { model, systemInstruction, responseModalities } = data;

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const sessionId = "session-" + Date.now();

    const session = await ai.live.connect({
      model,
      config: {
        responseModalities,
        systemInstruction,
      },
      callbacks: {
        onopen: () => {
          console.log("Session opened:", sessionId);
        },
        onmessage: (message: LiveServerMessage) => {
          // Store messages for client polling
          if (!sessionMessages.has(sessionId)) {
            sessionMessages.set(sessionId, []);
          }
          sessionMessages.get(sessionId)!.push(message);

          // Enhanced logging for LiveServerMessage responses
          console.log("🤖 LiveServerMessage received for session:", sessionId);
          console.log("📊 Message structure:", {
            hasServerContent: !!message.serverContent,
            hasModelTurn: !!message.serverContent?.modelTurn,
            hasParts: !!message.serverContent?.modelTurn?.parts,
            turnComplete: message.serverContent?.turnComplete,
            partsCount: message.serverContent?.modelTurn?.parts?.length || 0,
          });

          // Log detailed content
          if (message.serverContent?.modelTurn?.parts) {
            message.serverContent.modelTurn.parts.forEach((part, index) => {
              if (part.text) {
                console.log(
                  `💬 Part ${index + 1} Text:`,
                  part.text.substring(0, 100) + (part.text.length > 100 ? "..." : "")
                );
              }
              if (part.inlineData && part.inlineData.data) {
                console.log(`🔊 Part ${index + 1} Audio:`, {
                  mimeType: part.inlineData.mimeType,
                  size: `${Math.round(part.inlineData.data.length / 1024)}KB`,
                });
              }
              if (part.fileData) {
                console.log(`📁 Part ${index + 1} File:`, part.fileData.fileUri);
              }
            });
          }
        },
        onerror: (error: any) => {
          console.error("Session error:", error);
        },
        onclose: () => {
          console.log("Session closed:", sessionId);
        },
      },
    });

    sessions.set(sessionId, session);
    sessionMessages.set(sessionId, []);

    return NextResponse.json({
      success: true,
      sessionId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create session" },
      { status: 500 }
    );
  }
}

async function handleSendInput(data: any) {
  try {
    const { sessionId, input } = data;

    const session = sessions.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: `Session ${sessionId} not found. Please create a new session or check the session ID.` }, { status: 404 });
    }

    await session.sendRealtimeInput(input);

    return NextResponse.json({
      success: true,
      message: "Input sent successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to send input" }, { status: 500 });
  }
}

async function handleGetMessages(data: any) {
  try {
    const { sessionId } = data;

    const messages = sessionMessages.get(sessionId) || [];

    // Clear messages after retrieving them
    sessionMessages.set(sessionId, []);

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to get messages" }, { status: 500 });
  }
}

async function handleCloseSession(data: any) {
  try {
    const { sessionId } = data;

    const session = sessions.get(sessionId);
    if (session) {
      await session.close();
      sessions.delete(sessionId);
      sessionMessages.delete(sessionId);
    }

    return NextResponse.json({
      success: true,
      message: "Session closed successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to close session" },
      { status: 500 }
    );
  }
}
