import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { HttpError } from "../lib/http-error.js";
import { logger } from "../lib/logger.js";
import { Prisma } from "../generated/prisma/client.js";

// Runs when no route matched the request → a clean 404.
export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: { message: "Route not found" } });
}

// The central error handler. MUST take 4 params — that's how Express
// recognizes it as error-handling middleware (vs. a normal one).
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // 1. Validation errors (from Zod, coming next step) → 400 + which fields failed
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: { message: "Validation failed", details: err.issues },
    });
  }

  // 2. Errors we threw on purpose → use their status code
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ error: { message: err.message } });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res
        .status(409)
        .json({ error: { message: "A record with that value already exists" } });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: { message: "Resource not found" } });
    }
  }

  // 3. Anything else is unexpected: log the real error, but never leak it to the client
  logger.error({ err }, "Unhandled error");
  return res.status(500).json({ error: { message: "Internal server error" } });
}
