import { createContext, useContext } from "react";
import type { UserPublic } from "../utils/auth";

interface AuthContextValue {
  user: UserPublic | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoggingOut: boolean;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  isLoggingOut: false,
});

export function useAuth() {
  return useContext(AuthContext);
}
