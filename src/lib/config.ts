// lib/config.ts

export const geminiConfig = {
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
  model: "models/gemini-2.5-flash-native-audio-preview-09-2025",
};
