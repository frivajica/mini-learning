import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  if (path.startsWith("/admin") && !path.includes("/login")) {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader || !cookieHeader.includes("payload-token")) {
      return NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|uploads|.*\\.png$).*)",
  ],
};
