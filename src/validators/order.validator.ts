import { AppError } from "../errors/AppError";
import { HTTP_STATUS } from "../constants/status-codes";
import { SplitOrderRequest } from "../models/order";

export function parseJsonBody(body: unknown): SplitOrderRequest {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Request body must be a JSON object",
    );
  }
  return body as SplitOrderRequest;
}
