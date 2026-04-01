import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "@/lib/payload";

const ALLOWED_COLLECTIONS = ["posts", "categories", "tags", "media"] as const;
type CollectionSlug = (typeof ALLOWED_COLLECTIONS)[number];

function isValidCollection(slug: string): slug is CollectionSlug {
  return ALLOWED_COLLECTIONS.includes(slug as CollectionSlug);
}

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload();
    const pathname = req.nextUrl.pathname;
    const slug = pathname.replace("/api/", "");

    if (!isValidCollection(slug)) {
      return NextResponse.json(
        { error: "Invalid collection" },
        { status: 400 },
      );
    }

    const data = await payload.find({
      collection: slug,
      limit: 10,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("API GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload();
    const pathname = req.nextUrl.pathname;
    const slug = pathname.replace("/api/", "");

    if (!isValidCollection(slug)) {
      return NextResponse.json(
        { error: "Invalid collection" },
        { status: 400 },
      );
    }

    const body = await req.json();

    const data = await payload.create({
      collection: slug,
      data: body,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("API POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
