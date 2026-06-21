import express from "express";
import { pinoHttp } from "pino-http";
import { logger } from "./lib/logger.js";
import { productsRouter } from "./modules/products/products.routes.js";
import { categoriesRouter } from "./modules/categories/categories.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/error-handler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { openapiDocument } from "./docs/openapi.js";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { apiReference } from "@scalar/express-api-reference";

export const app = express();

app.use(pinoHttp({ logger }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/categories", categoriesRouter);
app.use("/products", productsRouter);
app.use("/auth", authRouter);

app.get("/openapi.json", (_req, res) => {
  res.json(openapiDocument);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));
app.use("/reference", apiReference({ url: "/openapi.json" }));

app.use(notFoundHandler);
app.use(errorHandler);
