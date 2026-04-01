import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/login", "/register"];
const publicApiRoutes = ["/api/auth", "/api/health"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isPublicApiRoute = publicApiRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  const supabaseAuthCookie = request.cookies.get("sb-access-token");
  const supabaseSessionCookie = request.cookies.get("supabase-session");

  if (!supabaseAuthCookie && !supabaseSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
