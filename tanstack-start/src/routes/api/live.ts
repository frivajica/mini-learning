import { createServerFn } from "@tanstack/react-start/server";

export const livenessFn = createServerFn({ method: "GET" }).handler(async () => {
  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});
