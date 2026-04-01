import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { User } from "../models/index.js";
import { UnauthorizedError, ConflictError } from "../utils/AppError.js";
export class AuthService {
    async register(data) {
        const existing = await User.findOne({ email: data.email.toLowerCase() });
        if (existing) {
            throw new ConflictError("Email already exists");
        }
        const hashedPassword = await bcrypt.hash(data.password, config.bcrypt.rounds);
        const user = await User.create({
            email: data.email.toLowerCase(),
            name: data.name,
            password: hashedPassword,
        });
        const tokens = await this.generateTokens(user);
        return { user: this.sanitizeUser(user), ...tokens };
    }
    async login(data) {
        const user = await User.findOne({ email: data.email.toLowerCase() });
        if (!user || !user.isActive) {
            throw new UnauthorizedError("Invalid credentials");
        }
        const isValid = await bcrypt.compare(data.password, user.password);
        if (!isValid) {
            throw new UnauthorizedError("Invalid credentials");
        }
        const tokens = await this.generateTokens(user);
        return { user: this.sanitizeUser(user), ...tokens };
    }
    async refresh(refreshToken) {
        try {
            const payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
            const user = await User.findById(payload.userId);
            if (!user || !user.isActive) {
                throw new UnauthorizedError("User not found or inactive");
            }
            const tokens = await this.generateTokens(user);
            return tokens;
        }
        catch {
            throw new UnauthorizedError("Invalid refresh token");
        }
    }
    async logout(_refreshToken) { }
    async generateTokens(user) {
        const payload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        const accessToken = jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn,
        });
        const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
            expiresIn: config.jwt.refreshExpiresIn,
        });
        return { accessToken, refreshToken };
    }
    sanitizeUser(user) {
        const { password: _, ...sanitized } = user.toObject();
        return sanitized;
    }
}
//# sourceMappingURL=authService.js.map