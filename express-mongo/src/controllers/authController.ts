import { Response } from "express";
import { AuthService } from "../services/index.js";
import { config } from "../config/index.js";

const authService = new AuthService();

export const register = async (req: any, res: Response) => {
  const result = await authService.register(req.body);

  setRefreshCookie(res, result.refreshToken);
  const { refreshToken: _, ...safeResult } = result;

  res.status(201).json(safeResult);
};

export const login = async (req: any, res: Response) => {
  const result = await authService.login(req.body);

  setRefreshCookie(res, result.refreshToken);
  const { refreshToken: _, ...safeResult } = result;

  res.status(200).json(safeResult);
};

export const refresh = async (req: any, res: Response) => {
  const refreshToken = req.cookies?.[config.cookie.refreshToken.name];

  if (!refreshToken) {
    res.status(401).json({ message: "Refresh token required" });
    return;
  }

  const tokens = await authService.refresh(refreshToken);

  setRefreshCookie(res, tokens.refreshToken);
  const { refreshToken: _, ...safeTokens } = tokens;

  res.status(200).json(safeTokens);
};

export const logout = async (req: any, res: Response) => {
  const refreshToken = req.cookies?.[config.cookie.refreshToken.name];

  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  clearRefreshCookie(res);

  res.status(204).send();
};

function setRefreshCookie(res: Response, token: string) {
  const { name, maxAgeMs, secure, sameSite } = config.cookie.refreshToken;

  res.cookie(name, token, {
    maxAge: maxAgeMs,
    httpOnly: true,
    secure,
    sameSite,
  });
}

function clearRefreshCookie(res: Response) {
  const { name } = config.cookie.refreshToken;
  res.clearCookie(name);
}
