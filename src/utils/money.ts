import { AppError } from "../errors/AppError";
import { HTTP_STATUS } from "../constants/status-codes";
import { decimalToScaledInt, scaledIntToDecimal } from "./decimal";

export const MONEY_SCALE = 2;

export function parseMoney(value: unknown, field = "amount"): bigint {
  if (typeof value !== "string" && typeof value !== "number") {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      `${field} must be a decimal number`,
    );
  }
  const text = String(value).trim();
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(text)) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      `${field} must be a non-negative amount with at most 2 decimal places`,
    );
  }
  const cents = decimalToScaledInt(text, MONEY_SCALE);
  if (cents <= 0n)
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      `${field} must be greater than 0`,
    );
  return cents;
}

export function moneyString(cents: bigint): string {
  return scaledIntToDecimal(cents, MONEY_SCALE).padStart(1, "0");
}
