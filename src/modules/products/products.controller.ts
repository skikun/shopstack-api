import type { Request, Response } from "express";
import * as productsService from "./products.service.js";
import { productQuerySchema } from "./products.schema.js";

export async function listProducts(req: Request, res: Response) {
  const query = productQuerySchema.parse(req.query);
  const { items, total } = await productsService.listProducts(query);

  res.json({
    data: items,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  });
}
