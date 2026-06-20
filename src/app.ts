import express from "express";
import { pinoHttp } from "pino-http";
import { logger } from "./lib/logger.js";
import { productsRouter } from "./modules/products/products.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/error-handler.js";

export const app = express();

app.use(pinoHttp({ logger }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/products", productsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
