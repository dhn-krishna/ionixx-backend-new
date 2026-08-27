import { config } from "../config";
import { AppError } from "../errors/AppError";
import { HTTP_STATUS } from "../constants/status-codes";

export function getPrice(marketPrice?: unknown): bigint {
  const value = marketPrice ?? String(config.defaultStockPrice);
  if (
    typeof value !== "string" ||
    !/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(value)
  ) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Invalid market price");
  }
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * 100n + BigInt((fraction + "00").slice(0, 2));
}

export function nextExecutionDate(from = new Date()): string {
  const date = new Date(from);
  date.setUTCHours(0, 0, 0, 0);
  do {
    date.setUTCDate(date.getUTCDate() + 1);
  } while (date.getUTCDay() === 0 || date.getUTCDay() === 6);
  return date.toISOString().slice(0, 10);
}
