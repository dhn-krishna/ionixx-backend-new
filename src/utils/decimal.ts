export function isDecimal(value: unknown): value is string | number {
  if (typeof value !== 'string' && typeof value !== 'number') return false;
  const text = String(value).trim();
  return /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(text);
}

export function decimalToScaledInt(value: string, scale: number): bigint {
  const [whole, fraction = ''] = value.split('.');
  const padded = (fraction + '0'.repeat(scale)).slice(0, scale);
  if (fraction.length > scale && /[1-9]/.test(fraction.slice(scale))) {
    throw new Error(`Too many decimal places: ${value}`);
  }
  return BigInt(whole) * 10n ** BigInt(scale) + BigInt(padded || '0');
}

export function scaledIntToDecimal(value: bigint, scale: number): string {
  const factor = 10n ** BigInt(scale);
  const whole = value / factor;
  const fraction = (value % factor).toString().padStart(scale, '0');
  if (scale === 0) return whole.toString();
  return `${whole}.${fraction}`.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
}

export function roundHalfUp(value: bigint, divisor: bigint): bigint {
  return (value + divisor / 2n) / divisor;
}
