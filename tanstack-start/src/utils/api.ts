import type { UserPublic } from "../utils/auth";

export async function getCurrentUser(): Promise<UserPublic | null> {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.data;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}
