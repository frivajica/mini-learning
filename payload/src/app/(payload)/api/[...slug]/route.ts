import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "@/lib/payload";

export async function GET(req: NextRequest) {
  const payload = await getPayload();
  const slug = req.nextUrl.pathname.replace("/api/", "");

  const data = await payload.find({
    collection: slug as "posts" | "categories" | "tags" | "media" | "users",
    limit: 10,
  });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const payload = await getPayload();
  const slug = req.nextUrl.pathname.replace("/api/", "");
  const body = await req.json();

  const data = await payload.create({
    collection: slug as "posts" | "categories" | "tags" | "media" | "users",
    data: body,
  });

  return NextResponse.json(data);
}
