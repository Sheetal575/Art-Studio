import { NextResponse } from "next/server";
import { checkPassword, createSessionToken, STUDIO_SESSION_COOKIE, STUDIO_SESSION_MAX_AGE } from "@/lib/studio-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = body?.password;

  if (typeof password !== "string" || password.length === 0) {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }

  let expectedConfigured = true;
  try {
    if (!checkPassword(password)) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }
  } catch {
    expectedConfigured = false;
  }

  if (!expectedConfigured) {
    return NextResponse.json(
      { error: "STUDIO_PASSWORD is not set on the server. Add it to .env.local and restart." },
      { status: 500 }
    );
  }

  // Only mark the cookie Secure on real HTTPS. On http://localhost (including a
  // production `next start`), a Secure cookie is silently dropped by the browser,
  // which would make login appear to fail and bounce straight back to /login.
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const isHttps = forwardedProto
    ? forwardedProto.split(",")[0].trim() === "https"
    : new URL(request.url).protocol === "https:";

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(STUDIO_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
    maxAge: STUDIO_SESSION_MAX_AGE,
  });
  return res;
}
