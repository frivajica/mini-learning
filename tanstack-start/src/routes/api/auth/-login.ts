import { fetchRequestHandler } from "@tanstack/react-start/server";
import { createServerFn } from "@tanstack/react-start/server";
import { db } from "../server/db";
import { createAccessToken, validateUser } from "../server/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

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

    const token = await createAccessToken(user);
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
      `refresh_token=${refreshToken.token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`,
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

    const user = db.users.create({
      email: data.email,
      name: data.name,
      password: data.password,
      role: "USER",
    });

    const token = await createAccessToken(user);
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
      `refresh_token=${refreshToken.token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`,
    );

    return response;
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const response = Response.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    "refresh_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
  );
  return response;
});

export const meFn = createServerFn({ method: "GET" }).handler(async () => {
  const response = await fetch("http://localhost:3000/api/auth/me", {
    credentials: "include",
  });
  return response.json();
});

export default {
  fetchRequestHandler,
};
