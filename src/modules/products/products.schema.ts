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

const productFields = {
  name: z.string().trim().min(1),
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase words separated by hyphens"),
  description: z.string().trim().min(1),
  priceCents: z.number().int().nonnegative(),
  currency: z.string().trim().length(3),
  stock: z.number().int().nonnegative(),
  imageUrl: z.string().url().optional(),
  categorySlugs: z.array(z.string().trim().min(1)).optional(),
};

export const createProductSchema = z.object({
  ...productFields,
  currency: productFields.currency.default("usd"),
  stock: productFields.stock.default(0),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object(productFields).partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
