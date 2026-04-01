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

    const {
      page = 1,
      limit = 10,
      ...filters
    } = Object.fromEntries(req.nextUrl.searchParams);

    const data = await payload.find({
      collection: slug,
      page: Number(page),
      limit: Math.min(Number(limit), 100),
      where: Object.keys(filters).length > 0 ? filters : undefined,
    });

    if (data.docs.length === 0 && page > 1) {
      return NextResponse.json({ error: "No more results" }, { status: 404 });
    }

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

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 },
      );
    }

    const data = await payload.create({
      collection: slug,
      data: body,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("API POST error:", error);

    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
