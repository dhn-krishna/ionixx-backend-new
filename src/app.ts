import express from "express";
import cors from "cors";
import helmet from "helmet";
import { orderRouter } from "./routes/order.routes";
import { errorHandler } from "./middleware/error.middleware";
import { requestTimer } from "./middleware/request-timer.middleware";
import { responseHandler } from "./middleware/response-handler.middleware";
import { HTTP_STATUS } from "./constants/status-codes";

export const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
app.use(requestTimer);
app.use(responseHandler);
app.use(express.json({ limit: "50kb" }));

app.get("/health", (_req, res) => res.success({ status: "ok" }));
app.use("/api/v1", orderRouter);

app.use((_req, res) => res.failure("Route not found", HTTP_STATUS.NOT_FOUND));
app.use(errorHandler);
