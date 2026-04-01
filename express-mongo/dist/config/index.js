import { z } from "zod";
const cookieRefreshTokenSchema = z.object({
    name: z.string().default("refreshToken"),
    maxAgeMs: z.number().default(7 * 24 * 60 * 60 * 1000),
    secure: z.boolean().default(true),
    sameSite: z.enum(["strict", "lax", "none"]).default("lax"),
});
const configSchema = z.object({
    port: z.number().default(3000),
    nodeEnv: z.enum(["development", "production", "test"]).default("development"),
    mongoUri: z.string().url(),
    redisUrl: z.string().url(),
    jwt: z.object({
        secret: z.string().min(32),
        refreshSecret: z.string().min(32),
        expiresIn: z.string().default("15m"),
        refreshExpiresIn: z.string().default("7d"),
    }),
    cors: z.object({
        origins: z.array(z.string()).default(["http://localhost:3000"]),
    }),
    rateLimit: z.object({
        windowMs: z.number().default(15 * 60 * 1000),
        max: z.number().default(100),
        authMax: z.number().default(10),
    }),
    cookie: z.object({
        refreshToken: cookieRefreshTokenSchema,
    }),
    bcrypt: z.object({
        rounds: z.number().default(12),
    }),
});
function loadConfig() {
    const nodeEnv = process.env.NODE_ENV || "development";
    const rawJwtSecret = process.env.JWT_SECRET;
    const rawRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (nodeEnv === "production" && (!rawJwtSecret || !rawRefreshSecret)) {
        console.error("JWT_SECRET and JWT_REFRESH_SECRET must be set in production");
        process.exit(1);
    }
    const parsed = configSchema.safeParse({
        port: parseInt(process.env.PORT || "3000"),
        nodeEnv,
        mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/mongo_app",
        redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
        jwt: {
            secret: rawJwtSecret || "dev-secret-min-32-chars-change-in-prod",
            refreshSecret: rawRefreshSecret || "dev-refresh-min-32-chars-change-in-prod",
            expiresIn: process.env.JWT_EXPIRES_IN || "15m",
            refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
        },
        cors: {
            origins: process.env.ALLOWED_ORIGINS?.split(",") || [
                "http://localhost:3000",
            ],
        },
        rateLimit: {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
            max: parseInt(process.env.RATE_LIMIT_MAX || "100"),
            authMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX || "10"),
        },
        cookie: {
            refreshToken: {
                name: process.env.COOKIE_REFRESH_NAME || "refreshToken",
                maxAgeMs: parseInt(process.env.COOKIE_REFRESH_MAX_AGE_MS ||
                    String(7 * 24 * 60 * 60 * 1000)),
                secure: process.env.COOKIE_SECURE !== "false",
                sameSite: (process.env.COOKIE_SAME_SITE || "lax"),
            },
        },
        bcrypt: {
            rounds: parseInt(process.env.BCRYPT_ROUNDS || "12"),
        },
    });
    if (!parsed.success) {
        console.error("Invalid configuration:", parsed.error.flatten().fieldErrors);
        process.exit(1);
    }
    return parsed.data;
}
export const config = loadConfig();
//# sourceMappingURL=index.js.map