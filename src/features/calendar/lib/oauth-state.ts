// HMAC-signed state for the per-location Google OAuth flow.
// Bound to `locationId` so the callback can only set up the integration for the
// location that initiated the request.

interface StatePayload {
  locationId: string;
  nonce: string;
  exp: number;
}

async function hmacKey(): Promise<CryptoKey> {
  const secret = process.env.OAUTH_STATE_SECRET;
  if (!secret) throw new Error("OAUTH_STATE_SECRET not configured");
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function signOAuthState(
  locationId: string,
  ttlSeconds = 600,
): Promise<string> {
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const payload: StatePayload = {
    locationId,
    nonce: b64urlEncode(nonceBytes),
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
  const key = await hmacKey();
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, payloadBytes));
  return `${b64urlEncode(payloadBytes)}.${b64urlEncode(sig)}`;
}

export async function verifyOAuthState(state: string): Promise<StatePayload> {
  const [payloadPart, sigPart] = state.split(".");
  if (!payloadPart || !sigPart) throw new Error("Malformed state");

  const payloadBytes = b64urlDecode(payloadPart);
  const sigBytes = b64urlDecode(sigPart);

  const key = await hmacKey();
  const ok = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes as BufferSource,
    payloadBytes as BufferSource,
  );
  if (!ok) throw new Error("Bad state signature");

  const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as StatePayload;
  if (typeof payload.locationId !== "string" || !payload.locationId) {
    throw new Error("State missing locationId");
  }
  if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("State expired");
  }
  return payload;
}
