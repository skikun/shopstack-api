import express from "express";
import { pinoHttp } from "pino-http";
import { productsRouter } from "./modules/products/products.routes.js";
import { logger } from "./lib/logger.js";

export const app = express();

app.use(pinoHttp({ logger }));
app.use(express.json());
app.use("/products", productsRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/hello", (_req, res) => {
  res.json("world!");
});
