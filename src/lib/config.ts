// lib/config.ts

export const geminiConfig = {
  // API key is now handled server-side for security
  model: "models/gemini-2.5-flash-native-audio-preview-09-2025",
  apiEndpoint: "/api/gemini/live", // Secure server-side endpoint
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "", // Loaded from environment variables
};
