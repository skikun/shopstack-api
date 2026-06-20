import { z } from "zod";

const categoryFields = {
  name: z.string().trim().min(1),
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase words separated by hyphens"),
};

export const createCategorySchema = z.object(categoryFields);

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object(categoryFields).partial();
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
