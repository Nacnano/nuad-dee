// src/app/api/gemini-session/route.ts
import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { geminiConfig } from "@/lib/config";

export const runtime = "nodejs";

/**
 * GET handler: inform user that live WebSocket upgrades aren't supported here.
 * (Your frontend should POST frames to this endpoint and read SSE.)
 */
export async function GET(req: NextRequest) {
  return new Response(
    JSON.stringify({
      error:
        "WebSocket not supported in this runtime. Use POST /api/gemini-session (SSE streaming) instead.",
      useEndpoint: "/api/gemini-session",
    }),
    {
      status: 501,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * POST handler: accept an image/audio/text payload, call Google GenAI SDK
 * using generateContentStream and stream SSE back to client.
 */
export async function POST(req: NextRequest) {
  if (!geminiConfig.apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json().catch(() => ({}));
    const { type, data, mimeType, config } = payload as {
      type?: string;
      data?: string;
      mimeType?: string;
      config?: any;
    };

    // Build contents for the GenAI SDK based on incoming type
    let contents: any;
    if (type === "image") {
      contents = [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: data,
              },
            },
          ],
        },
      ];
    } else if (type === "audio") {
      contents = [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || "audio/pcm",
                data: data,
              },
            },
          ],
        },
      ];
    } else if (type === "text" || typeof data === "string") {
      // allow plain text bodies
      contents = [
        {
          parts: [
            {
              text: data || "",
            },
          ],
        },
      ];
    } else {
      // fallback: empty text content to keep API stable
      contents = [
        {
          parts: [{ text: "" }],
        },
      ];
    }

    // Initialize Google GenAI SDK using server-side API key
    const ai = new GoogleGenAI({ apiKey: geminiConfig.apiKey });

    // Validate model presence
    const model = geminiConfig.model;
    if (!model) {
      return new Response(
        JSON.stringify({
          error:
            "Model not configured on server. Set geminiConfig.model to a valid model name.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create a web ReadableStream that iterates the SDK async generator
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Call SDK streaming generator
          const genStream = await ai.models.generateContentStream({
            model,
            // SDK accepts 'contents' array (or string); we use the array created above
            contents,
            // forward any generation config the user sent (optional)
            config: config || {},
          });

          // For each chunk yielded by the SDK, push it as an SSE "data: ..." event
          for await (const chunk of genStream) {
            // chunk may have .text , .serverContent, .data (base64 audio), etc.
            // We serialize the chunk as JSON and send it in an SSE data frame.
            const json = JSON.stringify(chunk);
            const ssePayload = `data: ${json}\n\n`;
            controller.enqueue(encoder.encode(ssePayload));
          }

          // signal done
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err: any) {
          // send error as SSE, then close
          const errObj = {
            error: err?.message || String(err),
            name: err?.name,
            status: err?.status,
          };
          const ssePayload = `data: ${JSON.stringify(errObj)}\n\n`;
          controller.enqueue(encoder.encode(ssePayload));
          controller.close();
        }
      },

      cancel(reason) {
        // nothing special on cancel, GC will clean up
        console.log("SSE stream cancelled:", reason);
      },
    });

    // Return SSE stream to client
    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || String(error) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
