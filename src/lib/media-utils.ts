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
    const chunk = uint8.subarray(index, Math.min(index + CHUNK_SIZE, uint8.length));
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

// WAV conversion utilities for audio output
export interface WavConversionOptions {
  numChannels: number;
  sampleRate: number;
  bitsPerSample: number;
}

export function convertToWav(rawData: string[], mimeType: string): ArrayBuffer {
  const options = parseMimeType(mimeType);

  // Calculate total data length from base64 strings
  const buffers = rawData.map((data) => {
    const binary = atob(data);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  });

  const dataLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
  const wavHeader = createWavHeader(dataLength, options);

  // Concatenate all buffers
  const result = new Uint8Array(wavHeader.length + dataLength);
  result.set(wavHeader, 0);
  let offset = wavHeader.length;
  for (const buffer of buffers) {
    result.set(buffer, offset);
    offset += buffer.length;
  }

  return result.buffer;
}

export function parseMimeType(mimeType: string): WavConversionOptions {
  const [fileType, ...params] = mimeType.split(";").map((s) => s.trim());
  const [_, format] = fileType.split("/");

  const options: Partial<WavConversionOptions> = {
    numChannels: 1,
    bitsPerSample: 16,
    sampleRate: 24000, // Default sample rate
  };

  // Parse format (e.g., "L16" means 16-bit linear PCM)
  if (format && format.startsWith("L")) {
    const bits = parseInt(format.slice(1), 10);
    if (!isNaN(bits)) {
      options.bitsPerSample = bits;
    }
  }

  // Parse parameters (e.g., "rate=24000")
  for (const param of params) {
    const [key, value] = param.split("=").map((s) => s.trim());
    if (key === "rate") {
      options.sampleRate = parseInt(value, 10);
    }
  }

  return options as WavConversionOptions;
}

export function createWavHeader(dataLength: number, options: WavConversionOptions): Uint8Array {
  const { numChannels, sampleRate, bitsPerSample } = options;

  // http://soundfile.sapp.org/doc/WaveFormat
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true); // ChunkSize
  writeString(view, 8, "WAVE");

  // fmt sub-chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size (PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true); // Subchunk2Size

  return new Uint8Array(buffer);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
