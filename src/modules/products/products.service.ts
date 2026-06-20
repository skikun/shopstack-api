import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type { ProductQuery } from "./products.schema.js";

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
