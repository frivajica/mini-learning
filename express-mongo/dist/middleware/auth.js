import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { UnauthorizedError } from "../utils/AppError.js";
export function authenticate(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new UnauthorizedError("No token provided"));
    }
    const token = authHeader.slice(7);
    try {
        const payload = jwt.verify(token, config.jwt.secret);
        req.user = {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
        };
        next();
    }
    catch {
        next(new UnauthorizedError("Invalid token"));
    }
}
//# sourceMappingURL=auth.js.map