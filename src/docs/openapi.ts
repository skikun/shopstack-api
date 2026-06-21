import { z } from "zod";
import { createDocument } from "zod-openapi";
import { registerSchema, loginSchema } from "../modules/auth/auth.schema.js";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from "../modules/products/products.schema.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../modules/categories/categories.schema.js";

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

const categorySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
  })
  .meta({
    id: "Category",
    example: { id: "clc1a2b3c0000aud0", name: "Audio", slug: "audio" },
  });

const productSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    priceCents: z.number().int(),
    currency: z.string(),
    stock: z.number().int(),
    imageUrl: z.string().nullable(),
    categories: z.array(categorySchema),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .meta({
    id: "Product",
    example: {
      id: "clp1a2b3c0000hdp0",
      name: "Wireless Headphones",
      slug: "wireless-headphones",
      description: "Over-ear Bluetooth headphones with active noise cancellation.",
      priceCents: 19999,
      currency: "usd",
      stock: 42,
      imageUrl: "https://cdn.shopstack.dev/img/wireless-headphones.png",
      categories: [{ id: "clc1a2b3c0000aud0", name: "Audio", slug: "audio" }],
      createdAt: "2026-06-21T10:00:00.000Z",
      updatedAt: "2026-06-21T10:00:00.000Z",
    },
  });

const pageMetaSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
});

const errorSchema = z
  .object({ error: z.object({ message: z.string(), details: z.array(z.unknown()).optional() }) })
  .meta({ id: "Error" });

const json = (schema: z.ZodType, example?: unknown) => ({
  content: { "application/json": { schema, ...(example === undefined ? {} : { example }) } },
});

const slugPath = (example: string) => ({
  path: z.object({
    slug: z.string().meta({ description: "URL slug identifying the resource", example }),
  }),
});

const productCreateExample = {
  name: "Wireless Headphones",
  slug: "wireless-headphones",
  description: "Over-ear Bluetooth headphones with active noise cancellation.",
  priceCents: 19999,
  currency: "usd",
  stock: 42,
  imageUrl: "https://cdn.shopstack.dev/img/wireless-headphones.png",
  categorySlugs: ["audio"],
};
const productUpdateExample = { priceCents: 17999, stock: 30 };
const categoryCreateExample = { name: "Audio", slug: "audio" };
const categoryUpdateExample = { name: "Home Audio" };

const unauthorized = { description: "Missing or invalid access token", ...json(errorSchema) };
const forbidden = { description: "Authenticated but not an admin", ...json(errorSchema) };
const validationFailed = { description: "Validation failed", ...json(errorSchema) };

export const openapiDocument = createDocument({
  openapi: "3.1.0",
  info: {
    title: "ShopStack API",
    version: "0.1.0",
    description: "REST API for the ShopStack e-commerce project.",
  },
  servers: [{ url: "http://localhost:4000", description: "Local dev" }],
  tags: [
    { name: "Auth", description: "Registration, login, sessions, and the current user." },
    { name: "Products", description: "Product catalog. Reads are public; writes are admin-only." },
    {
      name: "Categories",
      description: "Product categories. Reads are public; writes are admin-only.",
    },
  ],
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
    "/products": {
      get: {
        tags: ["Products"],
        summary: "List products",
        description: "Public. Supports pagination, text search, category filter, and sorting.",
        requestParams: { query: productQuerySchema },
        responses: {
          "200": {
            description: "A page of products",
            ...json(z.object({ data: z.array(productSchema), meta: pageMetaSchema })),
          },
          "400": { description: "Invalid query parameters", ...json(errorSchema) },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Create a product",
        description: "Admin only.",
        security: [{ bearerAuth: [] }],
        requestBody: json(createProductSchema, productCreateExample),
        responses: {
          "201": { description: "Product created", ...json(z.object({ data: productSchema })) },
          "400": validationFailed,
          "401": unauthorized,
          "403": forbidden,
          "409": { description: "A product with that slug already exists", ...json(errorSchema) },
        },
      },
    },
    "/products/{slug}": {
      get: {
        tags: ["Products"],
        summary: "Get a product by slug",
        description: "Public.",
        requestParams: slugPath("wireless-headphones"),
        responses: {
          "200": { description: "The product", ...json(z.object({ data: productSchema })) },
          "404": { description: "Product not found", ...json(errorSchema) },
        },
      },
      patch: {
        tags: ["Products"],
        summary: "Update a product",
        description: "Admin only. Partial update — send only the fields you want to change.",
        security: [{ bearerAuth: [] }],
        requestParams: slugPath("wireless-headphones"),
        requestBody: json(updateProductSchema, productUpdateExample),
        responses: {
          "200": { description: "Updated product", ...json(z.object({ data: productSchema })) },
          "400": validationFailed,
          "401": unauthorized,
          "403": forbidden,
          "404": { description: "Product not found", ...json(errorSchema) },
          "409": { description: "A product with that slug already exists", ...json(errorSchema) },
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Delete a product",
        description: "Admin only.",
        security: [{ bearerAuth: [] }],
        requestParams: slugPath("wireless-headphones"),
        responses: {
          "204": { description: "Product deleted" },
          "401": unauthorized,
          "403": forbidden,
          "404": { description: "Product not found", ...json(errorSchema) },
        },
      },
    },
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "List categories",
        description: "Public. Returns every category, sorted by name.",
        responses: {
          "200": {
            description: "All categories",
            ...json(z.object({ data: z.array(categorySchema) })),
          },
        },
      },
      post: {
        tags: ["Categories"],
        summary: "Create a category",
        description: "Admin only.",
        security: [{ bearerAuth: [] }],
        requestBody: json(createCategorySchema, categoryCreateExample),
        responses: {
          "201": { description: "Category created", ...json(z.object({ data: categorySchema })) },
          "400": validationFailed,
          "401": unauthorized,
          "403": forbidden,
          "409": {
            description: "A category with that name or slug already exists",
            ...json(errorSchema),
          },
        },
      },
    },
    "/categories/{slug}": {
      get: {
        tags: ["Categories"],
        summary: "Get a category by slug",
        description: "Public.",
        requestParams: slugPath("audio"),
        responses: {
          "200": { description: "The category", ...json(z.object({ data: categorySchema })) },
          "404": { description: "Category not found", ...json(errorSchema) },
        },
      },
      patch: {
        tags: ["Categories"],
        summary: "Update a category",
        description: "Admin only. Partial update.",
        security: [{ bearerAuth: [] }],
        requestParams: slugPath("audio"),
        requestBody: json(updateCategorySchema, categoryUpdateExample),
        responses: {
          "200": { description: "Updated category", ...json(z.object({ data: categorySchema })) },
          "400": validationFailed,
          "401": unauthorized,
          "403": forbidden,
          "404": { description: "Category not found", ...json(errorSchema) },
          "409": {
            description: "A category with that name or slug already exists",
            ...json(errorSchema),
          },
        },
      },
      delete: {
        tags: ["Categories"],
        summary: "Delete a category",
        description: "Admin only.",
        security: [{ bearerAuth: [] }],
        requestParams: slugPath("audio"),
        responses: {
          "204": { description: "Category deleted" },
          "401": unauthorized,
          "403": forbidden,
          "404": { description: "Category not found", ...json(errorSchema) },
        },
      },
    },
  },
});
