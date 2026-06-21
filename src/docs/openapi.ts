import { z } from "zod";
import { createDocument } from "zod-openapi";
import { registerSchema, loginSchema } from "../modules/auth/auth.schema.js";

const publicUserSchema = z
  .object({
    id: z.string(),
    email: z.string(),
    name: z.string().nullable(),
    role: z.enum(["CUSTOMER", "ADMIN"]),
    createdAt: z.string(),
  })
  .meta({ id: "PublicUser" });

const authResponseSchema = z
  .object({ data: z.object({ user: publicUserSchema, accessToken: z.string() }) })
  .meta({ id: "AuthResponse" });

const errorSchema = z
  .object({ error: z.object({ message: z.string(), details: z.array(z.unknown()).optional() }) })
  .meta({ id: "Error" });

const json = (schema: z.ZodType) => ({ content: { "application/json": { schema } } });

export const openapiDocument = createDocument({
  openapi: "3.1.0",
  info: {
    title: "ShopStack API",
    version: "0.1.0",
    description: "REST API for the ShopStack e-commerce project.",
  },
  servers: [{ url: "http://localhost:4000", description: "Local dev" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Paste an access token returned by POST /auth/login.",
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new account",
        requestBody: json(registerSchema),
        responses: {
          "201": {
            description: "Account created; refresh-token cookie set",
            ...json(authResponseSchema),
          },
          "400": { description: "Validation failed", ...json(errorSchema) },
          "409": { description: "Email already in use", ...json(errorSchema) },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in with email and password",
        requestBody: json(loginSchema),
        responses: {
          "200": {
            description: "Logged in; refresh-token cookie set",
            ...json(authResponseSchema),
          },
          "401": { description: "Invalid email or password", ...json(errorSchema) },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get the currently authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "The current user",
            ...json(z.object({ data: z.object({ user: publicUserSchema }) })),
          },
          "401": { description: "Missing or invalid access token", ...json(errorSchema) },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Exchange the refresh-token cookie for a new access token",
        responses: {
          "200": {
            description: "New access token; refresh cookie rotated",
            ...json(authResponseSchema),
          },
          "401": {
            description: "Missing, invalid, expired, or reused refresh token",
            ...json(errorSchema),
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Revoke the refresh token and clear the cookie",
        responses: { "204": { description: "Logged out" } },
      },
    },
  },
});
