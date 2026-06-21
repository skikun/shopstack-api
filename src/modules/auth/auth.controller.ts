import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import * as authService from "./auth.service.js";
import { registerSchema, loginSchema } from "./auth.schema.js";
import { unauthorized } from "../../lib/http-error.js";

const REFRESH_COOKIE = "refreshToken";

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/auth",
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, { path: "/auth" });
}

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await authService.register(input);
  setRefreshCookie(res, refreshToken);
  res.status(201).json({ data: { user, accessToken } });
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await authService.login(input);
  setRefreshCookie(res, refreshToken);
  res.json({ data: { user, accessToken } });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies.refreshToken;
  if (!token) throw unauthorized("Missing refresh token");
  const { user, accessToken, refreshToken } = await authService.refresh(token);
  setRefreshCookie(res, refreshToken);
  res.json({ data: { user, accessToken } });
}

export async function me(req: Request, res: Response) {
  if (!req.user) throw unauthorized();
  const user = await authService.getUserById(req.user.id);
  if (!user) throw unauthorized("User no longer exists");
  res.json({ data: { user } });
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies.refreshToken;
  if (token) await authService.logout(token);
  clearRefreshCookie(res);
  res.status(204).send();
}
