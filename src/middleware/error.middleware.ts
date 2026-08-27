import { ErrorRequestHandler } from "express";
import { AppError } from "../errors/AppError";
import { logger } from "../utils/logger";
import { HTTP_STATUS } from "../constants/status-codes";

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  logger.error("Request failed", {
    method: req.method,
    path: req.originalUrl,
    err,
  });

  if (err instanceof AppError) {
    res.failure(err.message, err.statusCode);
    return;
  }
  if (err instanceof SyntaxError && "body" in err) {
    res.failure("Invalid JSON body", HTTP_STATUS.BAD_REQUEST);
    return;
  }
  res.failure("Internal server error", HTTP_STATUS.INTERNAL_SERVER_ERROR);
};
