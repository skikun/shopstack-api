import { Router } from "express";
import * as categoriesController from "./categories.controller.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", categoriesController.listCategories);
categoriesRouter.get("/:slug", categoriesController.getCategoryBySlug);
categoriesRouter.post("/", categoriesController.createCategory);
categoriesRouter.patch("/:slug", categoriesController.updateCategory);
categoriesRouter.delete("/:slug", categoriesController.deleteCategory);
