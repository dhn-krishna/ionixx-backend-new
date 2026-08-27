function boundedInt(
  value: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    return fallback;
  }
  return parsed;
}

export const config = {
  port: boundedInt(process.env.PORT, 3000, 1, 65535),
  defaultStockPrice: 100,
  quantityDecimals: boundedInt(process.env.QUANTITY_DECIMALS, 3, 0, 6),
};
