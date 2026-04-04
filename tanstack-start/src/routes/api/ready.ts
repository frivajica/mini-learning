import { createServerFn } from "@tanstack/react-start/server";
import { db } from "../../server/db";

export const readinessFn = createServerFn({ method: "GET" }).handler(async () => {
  const checks: Record<string, { status: string; error?: string }> = {};
  let isReady = true;

  try {
    db.users.findAll();
    checks.database = { status: "ok" };
  } catch (err) {
    isReady = false;
    checks.database = { 
      status: "error", 
      error: err instanceof Error ? err.message : "Unknown error" 
    };
  }

  return Response.json({
    status: isReady ? "ready" : "not ready",
    timestamp: new Date().toISOString(),
    checks,
  }, { status: isReady ? 200 : 503 });
});
