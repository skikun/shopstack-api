import type { Request, Response, NextFunction } from "express";
import { unauthorized, forbidden } from "../lib/http-error.js";
import type { Role } from "../generated/prisma/client.js";

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw unauthorized();
    }
    if (!roles.includes(req.user.role)) {
      throw forbidden("You do not have permission to perform this action");
    }
    next();
  };
}
