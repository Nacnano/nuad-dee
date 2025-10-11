// lib/config.ts

const isServer = typeof window === "undefined";

export const geminiConfig = {
  // Server-side: use GEMINI_API_KEY
  // Client-side: return empty string (API key should never be on client)
  apiKey: isServer ? process.env.GEMINI_API_KEY || "" : "",
  model: "models/gemini-2.5-flash-native-audio-preview-09-2025",

  // Helper to check if API key is configured (server-side only)
  isConfigured: (): boolean => {
    return isServer && !!process.env.GEMINI_API_KEY;
  },

  // Runtime environment
  isServer,
};

// Type for API endpoints
export const apiEndpoints = {
  geminiSession: "/api/gemini-session",
} as const;
