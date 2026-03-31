import { createServerFn } from "@tanstack/react-start/server";

export const healthFn = createServerFn({ method: "GET" }).handler(async () => {
  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});
