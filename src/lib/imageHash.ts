import { Jimp } from "jimp";

const HASH_WIDTH = 9;
const HASH_HEIGHT = 8;

/**
 * Computes a 64-bit perceptual "difference hash" (dHash) for an image.
 * Images that look visually similar produce hashes with a small Hamming
 * distance, which lets us do a rough "search by image" without any
 * external AI/vision API.
 */
export async function computeImageHash(buffer: Buffer): Promise<string | null> {
  try {
    const image = await Jimp.fromBuffer(buffer);
    image.resize({ w: HASH_WIDTH, h: HASH_HEIGHT });
    image.greyscale();

    let bits = "";
    for (let y = 0; y < HASH_HEIGHT; y++) {
      for (let x = 0; x < HASH_WIDTH - 1; x++) {
        const left = image.getPixelColor(x, y) >>> 24;
        const right = image.getPixelColor(x + 1, y) >>> 24;
        bits += left > right ? "1" : "0";
      }
    }

    // 64 bits -> 16 hex chars
    let hex = "";
    for (let i = 0; i < bits.length; i += 4) {
      hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
    }
    return hex;
  } catch (error) {
    console.error("[computeImageHash] failed:", error);
    return null;
  }
}

/** Hamming distance between two same-length hex hash strings (0 = identical). */
export function hashDistance(a: string, b: string): number {
  if (a.length !== b.length) return Number.POSITIVE_INFINITY;
  let distance = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    distance += diff.toString(2).split("1").length - 1;
  }
  return distance;
}
