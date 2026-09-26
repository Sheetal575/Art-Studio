import { NextResponse, type NextRequest } from "next/server";
import { STUDIO_SESSION_COOKIE, verifySessionToken } from "@/lib/studio-auth";

const PUBLIC_PATHS = new Set(["/studio/login", "/api/studio/login"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(STUDIO_SESSION_COOKIE)?.value;
  const valid = await verifySessionToken(token);

  if (valid) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/studio/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/studio", "/studio/:path*", "/api/studio/:path*"],
};
