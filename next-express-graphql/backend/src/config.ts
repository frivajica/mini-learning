const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET environment variable is required");
  process.exit(1);
}

export const config = {
  jwtSecret: JWT_SECRET,
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigins: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"],
};

export type Config = typeof config;
