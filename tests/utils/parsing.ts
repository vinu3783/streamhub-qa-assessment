/** Parses a displayed rupee amount such as "₹39,64,522.11" into a number. */
export function parseCurrency(text: string): number {
  const cleaned = text.replace(/[₹,\s]/g, '');
  const value = Number(cleaned);
  if (cleaned === '' || !Number.isFinite(value)) {
    throw new Error(`Cannot parse "${text}" as a currency amount.`);
  }
  return value;
}

/** Parses a displayed percentage such as "58.58%" into a fraction (0.5858). */
export function parsePercent(text: string): number {
  const match = /^\s*(-?\d+(?:\.\d+)?)\s*%\s*$/.exec(text);
  if (!match?.[1]) {
    throw new Error(`Cannot parse "${text}" as a percentage.`);
  }
  return Number(match[1]) / 100;
}
