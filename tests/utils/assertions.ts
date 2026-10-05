import { expect } from '@playwright/test';
import { roundToPaise } from './financialCalculations';

/** One paisa: the UI shows money to 2 decimals, so it can differ from the oracle by rounding only. */
export const MONEY_TOLERANCE = 0.01;

export function expectMoney(actual: number, expected: number, what: string): void {
  const difference = Math.abs(actual - roundToPaise(expected));
  expect(
    difference,
    `${what}: displayed ₹${actual} but independently expected ₹${roundToPaise(expected)}`,
  ).toBeLessThanOrEqual(MONEY_TOLERANCE);
}

/**
 * Web-first money assertion: re-reads the displayed value until it matches the oracle or the
 * assertion times out. The app renders a new calculation asynchronously (React Router runs
 * navigations as transitions), so a single read straight after submitting can see the
 * previous result.
 */
export async function expectMoneyEventually(
  readDisplayed: () => Promise<number>,
  expected: number,
  what: string,
): Promise<void> {
  let lastDisplayed: number | undefined;
  await expect
    .poll(
      async () => {
        lastDisplayed = await readDisplayed();
        return Math.abs(lastDisplayed - roundToPaise(expected));
      },
      {
        message: `${what} should equal the independently expected ₹${roundToPaise(expected)}`,
      },
    )
    .toBeLessThanOrEqual(MONEY_TOLERANCE)
    .catch((error: unknown) => {
      throw new Error(
        `${what}: displayed ₹${lastDisplayed} but independently expected ₹${roundToPaise(expected)}`,
        { cause: error },
      );
    });
}
