import type { Request, Response, NextFunction } from "express";
import { unauthorized } from "../lib/http-error.js";
import { verifyAccessToken } from "../lib/tokens.js";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw unauthorized("Missing or malformed Authorization header");
  }
  const token = header.slice("Bearer ".length);
  try {
    const { sub, role } = verifyAccessToken(token);
    req.user = { id: sub, role };
  } catch {
    throw unauthorized("Invalid or expired token");
  }
  next();
}
