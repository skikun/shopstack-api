import { Router } from "express";
import * as productsController from "./products.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/require-role.js";

export const productsRouter = Router();

productsRouter.get("/", productsController.listProducts);
productsRouter.get("/:slug", productsController.getProductBySlug);
productsRouter.post("/", authenticate, requireRole("ADMIN"), productsController.createProduct);
productsRouter.patch(
  "/:slug",
  authenticate,
  requireRole("ADMIN"),
  productsController.updateProduct,
);
productsRouter.delete(
  "/:slug",
  authenticate,
  requireRole("ADMIN"),
  productsController.deleteProduct,
);
