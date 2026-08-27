import { AppError } from "../errors/AppError";
import { HTTP_STATUS } from "../constants/status-codes";
import { HistoricOrder, OrderLine, SplitOrderRequest } from "../models/order";
import { config } from "../config";
import {
  decimalToScaledInt,
  roundHalfUp,
  scaledIntToDecimal,
} from "../utils/decimal";
import { moneyString, parseMoney } from "../utils/money";
import { getPrice, nextExecutionDate } from "./market.service";
import { newId } from "../utils/id";

const WEIGHT_SCALE = 6;
const WEIGHT_TOTAL = 100_000_000n;

function validatePortfolio(request: SplitOrderRequest): bigint[] {
  if (!Array.isArray(request.portfolio) || request.portfolio.length === 0) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "portfolio must contain at least one stock",
    );
  }

  const seen = new Set<string>();
  const weights: bigint[] = [];

  for (const item of request.portfolio) {
    if (
      !item ||
      typeof item.symbol !== "string" ||
      !/^[A-Z][A-Z0-9.-]{0,9}$/.test(item.symbol)
    ) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Each portfolio item needs a valid uppercase stock symbol",
      );
    }
    if (seen.has(item.symbol))
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        `Duplicate symbol: ${item.symbol}`,
      );
    seen.add(item.symbol);
    if (
      typeof item.weight !== "string" ||
      !/^(?:0|[1-9]\d*)(?:\.\d{1,6})?$/.test(item.weight)
    ) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        `Invalid weight for ${item.symbol}`,
      );
    }
    const weight = decimalToScaledInt(item.weight, WEIGHT_SCALE);
    if (weight <= 0n)
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        `Weight for ${item.symbol} must be greater than 0`,
      );
    if (
      item.marketPrice !== undefined &&
      !/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(item.marketPrice)
    ) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        `Invalid marketPrice for ${item.symbol}`,
      );
    }
    weights.push(weight);
  }

  const total = weights.reduce((sum, value) => sum + value, 0n);
  if (total !== WEIGHT_TOTAL) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      `Portfolio weights must sum exactly to 100%; received ${scaledIntToDecimal(total, WEIGHT_SCALE)}%`,
    );
  }
  return weights;
}

export function splitOrder(request: SplitOrderRequest): HistoricOrder {
  if (request.type !== "BUY" && request.type !== "SELL") {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "type must be BUY or SELL");
  }
  const totalAmount = parseMoney(request.amount);
  const weights = validatePortfolio(request);

  const lines: OrderLine[] = request.portfolio.map((item, index) => {
    const amountCents = roundHalfUp(totalAmount * weights[index], WEIGHT_TOTAL);
    const priceCents = getPrice(item.marketPrice);
    if (priceCents <= 0n)
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        `Price for ${item.symbol} must be greater than 0`,
      );

    // Quantity is rounded to the configured precision. Money allocation remains exact.
    const quantityScale = 10n ** BigInt(config.quantityDecimals);
    const rawQuantityScaled = (amountCents * quantityScale) / priceCents;
    const quantity = scaledIntToDecimal(
      rawQuantityScaled,
      config.quantityDecimals,
    );

    return {
      symbol: item.symbol,
      weight: item.weight,
      price: moneyString(priceCents),
      amount: moneyString(amountCents),
      quantity,
    };
  });

  // Correct the final money line so rounded allocations always equal the requested total.
  const allocated = lines
    .slice(0, -1)
    .reduce((sum, line) => sum + parseMoney(line.amount), 0n);
  const finalAmount = totalAmount - allocated;
  const last = lines[lines.length - 1];
  const finalPrice = getPrice(
    request.portfolio[request.portfolio.length - 1].marketPrice,
  );
  const quantityScale = 10n ** BigInt(config.quantityDecimals);
  const finalQuantity = (finalAmount * quantityScale) / finalPrice;
  last.amount = moneyString(finalAmount);
  last.quantity = scaledIntToDecimal(finalQuantity, config.quantityDecimals);

  return {
    ...request,
    id: newId(),
    createdAt: new Date().toISOString(),
    executionDate: nextExecutionDate(),
    orders: lines,
  };
}
