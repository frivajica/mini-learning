import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const identifier = req.headers.get("x-forwarded-for") || "anonymous";
  const { rateLimited, remaining, resetTime } = await checkRateLimit(identifier);

  const response = new NextResponse();

  if (rateLimited) {
    return NextResponse.json(
      { error: "Too many requests", retryAfter: Math.ceil((resetTime - Date.now()) / 1000) },
      { status: 429, headers: { "Retry-After": String(Math.ceil((resetTime - Date.now()) / 1000)) } }
    );
  }

  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set("X-RateLimit-Reset", String(resetTime));

  return NextResponse.json({ data: { status: "ok" } });
}
