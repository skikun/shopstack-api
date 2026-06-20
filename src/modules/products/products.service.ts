import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type { ProductQuery, CreateProductInput, UpdateProductInput } from "./products.schema.js";

export async function listProducts(query: ProductQuery) {
  const { page, limit, search, category, sort, order } = query;

  const where: Prisma.ProductWhereInput = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (category) where.categories = { some: { slug: category } };

  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: { categories: true },
      orderBy: { [sort]: order } as Prisma.ProductOrderByWithRelationInput,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total };
}

export function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { categories: true },
  });
}

export function createProduct(input: CreateProductInput) {
  const { categorySlugs, ...data } = input;
  return prisma.product.create({
    data: {
      ...data,
      categories: categorySlugs?.length
        ? { connect: categorySlugs.map((slug) => ({ slug })) }
        : undefined,
    },
    include: { categories: true },
  });
}

export function updateProduct(slug: string, input: UpdateProductInput) {
  const { categorySlugs, ...data } = input;
  return prisma.product.update({
    where: { slug },
    data: {
      ...data,
      categories: categorySlugs ? { set: categorySlugs.map((s) => ({ slug: s })) } : undefined,
    },
    include: { categories: true },
  });
}

export function deleteProduct(slug: string) {
  return prisma.product.delete({ where: { slug } });
}
