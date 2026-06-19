import { prisma } from "../../lib/prisma.js";

export function listProducts() {
  return prisma.product.findMany({
    include: { categories: true },
    orderBy: { name: "asc" },
  });
}
