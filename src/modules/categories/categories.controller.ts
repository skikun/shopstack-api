import { notFound } from "../../lib/http-error.js";
import type { Request, Response } from "express";
import * as categoriesService from "./categories.service.js";
import { createCategorySchema, updateCategorySchema } from "./categories.schema.js";

export async function listCategories(_req: Request, res: Response) {
  const categories = await categoriesService.listCategories();

  res.json({
    data: categories,
  });
}

export async function getCategoryBySlug(req: Request<{ slug: string }>, res: Response) {
  const category = await categoriesService.getCategoryBySlug(req.params.slug);

  if (!category) {
    throw notFound("Category not found");
  }

  res.json({ data: category });
}

export async function createCategory(req: Request, res: Response) {
  const input = createCategorySchema.parse(req.body);
  const category = await categoriesService.createCategory(input);
  res.status(201).json({ data: category });
}

export async function updateCategory(req: Request<{ slug: string }>, res: Response) {
  const input = updateCategorySchema.parse(req.body);
  const category = await categoriesService.updateCategory(req.params.slug, input);
  res.json({ data: category });
}

export async function deleteCategory(req: Request<{ slug: string }>, res: Response) {
  await categoriesService.deleteCategory(req.params.slug);
  res.status(204).send();
}
