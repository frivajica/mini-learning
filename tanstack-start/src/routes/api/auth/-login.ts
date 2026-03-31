import { createServerFn } from "@tanstack/react-start/server";
import { db } from "../../../server/db";
import {
  createAccessToken,
  validateUser,
  hashPassword,
} from "../../../server/auth";
import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

function createRefreshCookie(token: string, maxAge: number): string {
  const secure = isProduction ? "; Secure" : "";
  return `refresh_token=${token}; HttpOnly; SameSite=Lax${secure}; Path=/; Max-Age=${maxAge}`;
}

export const loginFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    const user = await validateUser(data.email, data.password);
    if (!user) {
      return Response.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 },
      );
    }

    await createAccessToken(user);
    const refreshToken = db.refreshTokens.create(user.id);

    const response = Response.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });

    response.headers.set(
      "Set-Cookie",
      createRefreshCookie(refreshToken.token, 7 * 24 * 60 * 60),
    );

    return response;
  });

export const registerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => registerSchema.parse(data))
  .handler(async ({ data }) => {
    if (db.users.existsByEmail(data.email)) {
      return Response.json(
        { success: false, error: "Email already exists" },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(data.password);

    const user = db.users.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: "USER",
    });

    await createAccessToken(user);
    const refreshToken = db.refreshTokens.create(user.id);

    const response = Response.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });

    response.headers.set(
      "Set-Cookie",
      createRefreshCookie(refreshToken.token, 7 * 24 * 60 * 60),
    );

    return response;
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(
  async ({ request }) => {
    const cookieHeader = request.headers.get("Cookie") || "";
    const refreshToken = cookieHeader
      .split("; ")
      .find((c) => c.startsWith("refresh_token="))
      ?.split("=")[1];

    if (refreshToken) {
      db.refreshTokens.revoke(refreshToken);
    }

    const response = Response.json({ success: true });
    response.headers.set(
      "Set-Cookie",
      "refresh_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
    );
    return response;
  },
);

export const meFn = createServerFn({ method: "GET" }).handler(
  async ({ request }) => {
    const cookieHeader = request.headers.get("Cookie") || "";
    const refreshToken = cookieHeader
      .split("; ")
      .find((c) => c.startsWith("refresh_token="))
      ?.split("=")[1];

    if (!refreshToken) {
      return Response.json({ success: false, user: null });
    }

    const user = db.refreshTokens.getUserByToken(refreshToken);
    if (!user) {
      return Response.json({ success: false, user: null });
    }

    return Response.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  },
);
