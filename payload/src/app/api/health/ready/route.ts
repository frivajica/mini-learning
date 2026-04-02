import { NextResponse } from "next/server";
import { getPayload } from "@/lib/payload";

export async function GET() {
  try {
    const payload = await getPayload();
    await payload.find({
      collection: "posts",
      limit: 1,
    });

    return NextResponse.json(
      { status: "ok", timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Service unavailable" },
      { status: 503 }
    );
  }
}
