import type { Request, Response } from "express";
import * as productsService from "./products.service.js";

export async function listProducts(_req: Request, res: Response) {
  const products = await productsService.listProducts();
  res.json({ data: products });
}
