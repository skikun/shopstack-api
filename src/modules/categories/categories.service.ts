import { prisma } from "../../lib/prisma.js";
import type { CreateCategoryInput, UpdateCategoryInput } from "./categories.schema.js";

export async function listCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
  });
}

export function createCategory(input: CreateCategoryInput) {
  return prisma.category.create({ data: input });
}

export function updateCategory(slug: string, input: UpdateCategoryInput) {
  return prisma.category.update({ where: { slug }, data: input });
}

export function deleteCategory(slug: string) {
  return prisma.category.delete({ where: { slug } });
}
