import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const checks: Record<string, { status: string; latency?: number; error?: string }> = {};
  let isHealthy = true;

  const supabaseStart = Date.now();
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("tasks").select("id").limit(1);
    if (error && error.code !== "PGRST116") {
      throw error;
    }
    checks.supabase = {
      status: "ok",
      latency: Date.now() - supabaseStart,
    };
  } catch (err) {
    isHealthy = false;
    checks.supabase = {
      status: "error",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }

  const status = isHealthy ? 200 : 503;
  return NextResponse.json(
    {
      status: isHealthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status },
  );
}
