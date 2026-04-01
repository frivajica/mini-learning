import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { User, IUser } from "../models/index.js";
import { UnauthorizedError, ConflictError } from "../utils/AppError.js";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export class AuthService {
  async register(data: { email: string; name: string; password: string }) {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new ConflictError("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      config.bcrypt.rounds,
    );
    const user = await User.create({
      email: data.email.toLowerCase(),
      name: data.name,
      password: hashedPassword,
    });

    const tokens = await this.generateTokens(user);

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(data: { email: string; password: string }) {
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

  async refresh(refreshToken: string) {
    try {
      const payload = jwt.verify(
        refreshToken,
        config.jwt.refreshSecret,
      ) as TokenPayload;
      const user = await User.findById(payload.userId);
      if (!user || !user.isActive) {
        throw new UnauthorizedError("User not found or inactive");
      }

      const tokens = await this.generateTokens(user);

      return tokens;
    } catch {
      throw new UnauthorizedError("Invalid refresh token");
    }
  }

  async logout(_refreshToken?: string) {}

  private async generateTokens(user: IUser) {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"],
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions["expiresIn"],
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: IUser) {
    const { password: _, ...sanitized } = user.toObject();
    return sanitized;
  }
}
