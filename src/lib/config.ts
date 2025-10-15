// lib/config.ts

export const geminiConfig = {
  model: "models/gemini-2.5-flash-native-audio-preview-09-2025",
  apiEndpoint: "/api/gemini/live", // Secure server-side endpoint
  // TODO: Migrate the API key to server side. (API key should be handled in the server-side for security)
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
};
