import { Router } from "express";
import * as productsController from "./products.controller.js";

export const productsRouter = Router();

productsRouter.get("/", productsController.listProducts);
productsRouter.get("/:slug", productsController.getProductBySlug);
productsRouter.post("/", productsController.createProduct);
productsRouter.patch("/:slug", productsController.updateProduct);
productsRouter.delete("/:slug", productsController.deleteProduct);
