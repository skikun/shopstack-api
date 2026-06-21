import { Router } from "express";
import * as categoriesController from "./categories.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/require-role.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", categoriesController.listCategories);
categoriesRouter.get("/:slug", categoriesController.getCategoryBySlug);
categoriesRouter.post("/", authenticate, requireRole("ADMIN"), categoriesController.createCategory);
categoriesRouter.patch(
  "/:slug",
  authenticate,
  requireRole("ADMIN"),
  categoriesController.updateCategory,
);
categoriesRouter.delete(
  "/:slug",
  authenticate,
  requireRole("ADMIN"),
  categoriesController.deleteCategory,
);
