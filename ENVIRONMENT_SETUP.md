# Environment Variables Setup

## Secure Server-Side Implementation

This project now uses a **secure server-side API key handling** approach for maximum security and best practices.

## Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Gemini API Configuration (REQUIRED)
# This is a server-side environment variable that is NOT exposed to the browser
GEMINI_API_KEY=your_gemini_api_key_here
```

### Getting Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to your `.env.local` file

## Security Implementation

### ✅ **Secure Architecture**

- **Server-Side Only**: API key never leaves the server
- **Proxy Pattern**: Client communicates with our secure API route
- **Live API Access**: Still uses `gemini-2.5-flash-native-audio-preview-09-2025` model
- **Real-time Features**: Maintains audio feedback and live posture analysis

### 🔒 **Security Benefits**

1. **API Key Protection**: Never exposed to browser JavaScript
2. **Rate Limiting**: Can implement per-user limits on server
3. **Monitoring**: Server-side logging and analytics
4. **Compliance**: Meets enterprise security requirements
5. **Abuse Prevention**: Prevents unauthorized API usage

## How It Works

1. **Client Side**: Components call our secure `/api/gemini/live` route
2. **Server Side**: API route handles all Gemini API communication
3. **Polling**: Client polls for responses (100ms intervals)
4. **Session Management**: Server maintains WebSocket sessions securely

## Important Notes

- **Never commit** your `.env.local` file to version control
- The `GEMINI_API_KEY` variable is **server-side only** and secure
- All client-server communication goes through our API route
- This prevents API key exposure and unauthorized usage

## Development vs Production

- **Development**: Use `.env.local` file with `GEMINI_API_KEY`
- **Production**: Set `GEMINI_API_KEY` environment variable in your hosting platform
- **Security**: API key is never visible to end users

## Dependencies Required

The secure implementation requires these server-side dependencies:

```bash
npm install ws buffer
```

These are needed for WebSocket support in the Node.js server environment.
