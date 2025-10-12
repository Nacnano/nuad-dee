#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const envExample = `# Environment Variables Configuration
# Copy this file to .env.local and fill in your actual values

# Gemini API Configuration (REQUIRED)
# This is a server-side environment variable that is NOT exposed to the browser
# Get your API key from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Note: The API key is handled server-side for security
# This enables real-time posture analysis with audio feedback through our secure API route
# The gemini-2.5-flash-native-audio-preview-09-2025 model is accessed securely via server proxy

# Other environment variables can be added here as needed
# NEXT_PUBLIC_* variables are exposed to the browser
# Variables without NEXT_PUBLIC_ prefix are server-side only`;

const envLocalPath = path.join(process.cwd(), ".env.local");
const envExamplePath = path.join(process.cwd(), ".env.example");

// Create .env.example file
fs.writeFileSync(envExamplePath, envExample);
console.log("✅ Created .env.example file");

// Check if .env.local already exists
if (fs.existsSync(envLocalPath)) {
  console.log("⚠️  .env.local already exists. Please update it manually if needed.");
} else {
  // Create .env.local file with placeholder
  fs.writeFileSync(envLocalPath, envExample);
  console.log("✅ Created .env.local file");
  console.log("🔑 Please update .env.local with your actual Gemini API key");
}

console.log("\n📖 See ENVIRONMENT_SETUP.md for detailed instructions");
console.log("🔗 Get your API key from: https://aistudio.google.com/app/apikey");
