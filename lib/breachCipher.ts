export const BREACH_REASSURANCE =
  "This is standard metadata any website can see — nothing was compromised or stored.";

/** Recovery commands concatenated (normalized) — the XOR decryption key. */
export const CIPHER_KEY = "identifytracestoprestore";

export const ENCRYPTED_NOTICE =
  "> encrypted payload intercepted — this message is for YOU";

export const DECRYPT_INSTRUCTION =
  "> you must decrypt this message to verify your session and continue";

export const CIPHER_HINT =
  "hint: the decryption key is the three-step recovery protocol — run each command in order (identify → trace --stop → restore)";

function xorCipher(text: string, key: string): Uint8Array {
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) {
    bytes[i] = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function formatHexBlocks(hex: string, blockSize = 32): string[] {
  const lines: string[] = [];
  for (let i = 0; i < hex.length; i += blockSize) {
    lines.push(hex.slice(i, i + blockSize));
  }
  return lines;
}

/** XOR-encrypt the reassurance message for display during the breach phase. */
export function encryptBreachMessage(plaintext = BREACH_REASSURANCE): string[] {
  const hex = bytesToHex(xorCipher(plaintext, CIPHER_KEY));
  return formatHexBlocks(hex);
}

export function decryptBreachMessage(
  encryptedHex: string,
  key = CIPHER_KEY
): string {
  const bytes = new Uint8Array(encryptedHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(encryptedHex.slice(i * 2, i * 2 + 2), 16);
  }
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += String.fromCharCode(bytes[i] ^ key.charCodeAt(i % key.length));
  }
  return out;
}

/** Pre-computed encrypted lines for static display (build-time constant). */
export const ENCRYPTED_MESSAGE_LINES = encryptBreachMessage();
