// Audio conversion utilities
export const float32ToInt16 = (input: Float32Array) => {
  const l = input.length;
  const out = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    let s = Math.max(-1, Math.min(1, input[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
};

export const uint8ToBase64 = (uint8: Uint8Array) => {
  const CHUNK_SIZE = 0x8000;
  let index = 0;
  let result = "";
  while (index < uint8.length) {
    const chunk = uint8.subarray(
      index,
      Math.min(index + CHUNK_SIZE, uint8.length)
    );
    result += String.fromCharCode.apply(null, Array.from(chunk));
    index += CHUNK_SIZE;
  }
  return btoa(result);
};

export const base64ToUint8 = (b64: string) => {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

// Types
export type FacingMode = "user" | "environment";

// Media configuration constants
export const VIDEO_CONFIG = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
};

export const AUDIO_CONFIG = {
  sampleRate: 16000,
  processorBufferSize: 4096,
};
