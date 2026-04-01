import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { config } from "./config/index.js";
import { requestId, globalRateLimiter, errorHandler, } from "./middleware/index.js";
import routes from "./routes/index.js";
const app = express();
app.use(requestId);
app.use(helmet());
app.use(cors({
    origin: config.cors.origins,
    credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(globalRateLimiter);
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.use("/api/v1", routes);
app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
});
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map