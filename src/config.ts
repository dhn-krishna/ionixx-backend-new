function nonNegativeInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < 0) return fallback;
  return parsed;
}

export const config = {
  port: nonNegativeInt(process.env.PORT, 3000),
  defaultStockPrice: 100,
  quantityDecimals: nonNegativeInt(process.env.QUANTITY_DECIMALS, 3)
};
