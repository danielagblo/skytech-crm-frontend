import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/home",
  "/pipeline",
  "/tasks",
  "/leads",
  "/calendar",
  "/settings",
];

const hasValidAccessToken = (token?: string) => {
  if (!token) return false;
  if (token.startsWith("demo-"))
    return process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === "true";
  try {
    const encodedPayload = token.split(".")[1];
    if (!encodedPayload) return false;
    const payload = JSON.parse(
      atob(encodedPayload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as { exp?: number };
    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export function proxy(request: NextRequest) {
  const token = request.cookies.get("skytech_access")?.value;
  const authenticated = hasValidAccessToken(token);
  const { pathname } = request.nextUrl;
  const guarded = protectedRoutes.some((route) => pathname.startsWith(route));
  const demoEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === "true";

  // The explicit development flag provides a preview workspace without
  // weakening production route protection (the documented default is false).
  if (guarded && demoEnabled) return NextResponse.next();

  if (guarded && !authenticated)
    return NextResponse.redirect(new URL("/login", request.url));
  if ((pathname === "/login" || pathname === "/verify-otp") && authenticated)
    return NextResponse.redirect(new URL("/home", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home/:path*",
    "/pipeline/:path*",
    "/tasks/:path*",
    "/leads/:path*",
    "/calendar/:path*",
    "/settings/:path*",
    "/login",
    "/verify-otp",
  ],
};
