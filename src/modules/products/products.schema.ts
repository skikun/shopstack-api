import { z } from "zod";

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  category: z.string().trim().optional(), // category slug
  sort: z.enum(["name", "priceCents", "createdAt"]).default("name"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export type ProductQuery = z.infer<typeof productQuerySchema>;
