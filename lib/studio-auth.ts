export const STUDIO_SESSION_COOKIE = "studio_session";
export const STUDIO_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getPassword(): string {
  const password = process.env.STUDIO_PASSWORD;
  if (!password) {
    throw new Error("STUDIO_PASSWORD environment variable is not set.");
  }
  return password;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getPassword()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toHex(signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export function checkPassword(candidate: string): boolean {
  const expected = getPassword();
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export async function createSessionToken(): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + STUDIO_SESSION_MAX_AGE;
  const signature = await sign(String(expires));
  return `${expires}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [expiresStr, signature] = token.split(".");
  if (!expiresStr || !signature) return false;
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) return false;
  const expected = await sign(expiresStr);
  return timingSafeEqual(signature, expected);
}
