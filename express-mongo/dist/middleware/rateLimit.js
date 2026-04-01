import rateLimit from "express-rate-limit";
import { config } from "../config/index.js";
export const globalRateLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: { message: "Too many requests" },
    standardHeaders: true,
    legacyHeaders: false,
});
export const authRateLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.authMax,
    message: { message: "Too many authentication attempts" },
    standardHeaders: true,
    legacyHeaders: false,
});
//# sourceMappingURL=rateLimit.js.map