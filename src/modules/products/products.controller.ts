import { notFound } from "../../lib/http-error.js";
import type { Request, Response } from "express";
import * as productsService from "./products.service.js";
import { productQuerySchema, createProductSchema, updateProductSchema } from "./products.schema.js";

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

export async function getProductBySlug(req: Request<{ slug: string }>, res: Response) {
  const product = await productsService.getProductBySlug(req.params.slug);

  if (!product) {
    throw notFound("Product not found");
  }

  res.json({ data: product });
}

export async function createProduct(req: Request, res: Response) {
  const input = createProductSchema.parse(req.body);
  const product = await productsService.createProduct(input);
  res.status(201).json({ data: product });
}

export async function updateProduct(req: Request<{ slug: string }>, res: Response) {
  const input = updateProductSchema.parse(req.body);
  const product = await productsService.updateProduct(req.params.slug, input);
  res.json({ data: product });
}

export async function deleteProduct(req: Request<{ slug: string }>, res: Response) {
  await productsService.deleteProduct(req.params.slug);
  res.status(204).send();
}
