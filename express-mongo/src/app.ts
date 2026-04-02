import express, { Express, RequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import { config } from "./config/index.js";
import { redis } from "./config/redis.js";
import {
  requestId,
  globalRateLimiter,
  errorHandler,
} from "./middleware/index.js";
import routes from "./routes/index.js";

const app: Express = express();

app.use(requestId);
app.use(helmet());
app.use(
  cors({
    origin: config.cors.origins,
    credentials: true,
  }),
);
app.use(compression() as unknown as RequestHandler);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(globalRateLimiter);

app.get("/health/live", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/health/ready", async (_req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  const mongoOk = mongoStatus === "connected";

  let redisOk: boolean;
  try {
    await redis.ping();
    redisOk = true;
  } catch {
    redisOk = false;
  }

  const ok = mongoOk && redisOk;

  res.status(ok ? 200 : 503).json({
    status: ok ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    checks: {
      mongodb: mongoStatus,
      redis: redisOk ? "connected" : "disconnected",
    },
  });
});

app.use("/api/v1", routes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

export default app;
