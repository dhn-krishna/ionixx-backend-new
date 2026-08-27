import { config } from '../config';

export function getPrice(marketPrice?: string): bigint {
  const value = marketPrice ?? String(config.defaultStockPrice);
  const [whole, fraction = ''] = value.split('.');
  return BigInt(whole) * 100n + BigInt((fraction + '00').slice(0, 2));
}

export function nextExecutionDate(from = new Date()): string {
  const date = new Date(from);
  date.setUTCHours(0, 0, 0, 0);
  do {
    date.setUTCDate(date.getUTCDate() + 1);
  } while (date.getUTCDay() === 0 || date.getUTCDay() === 6);
  return date.toISOString().slice(0, 10);
}
