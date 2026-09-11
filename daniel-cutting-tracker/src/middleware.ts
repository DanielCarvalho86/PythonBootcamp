import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/authConstants";

// Lightweight, edge-safe gate: redirects to /login when the session cookie
// is simply absent. This is a UX shortcut only — the authoritative check
// (signature + expiry verification) happens server-side in
// src/app/(app)/layout.tsx via requireUserId(), which is what actually
// protects the data.
export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
