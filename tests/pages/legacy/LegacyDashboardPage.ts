import type { Locator, Page } from '@playwright/test';
import { BROKEN_LOCATORS } from './brokenLocators';

/** Fail fast: a broken locator should surface in seconds, not after the default timeout. */
const BROKEN_LOCATOR_TIMEOUT_MS = 3_000;

/**
 * Page object written with the deliberately broken locators from brokenLocators.ts.
 * Used only by the @self-healing scenarios. Compare with DashboardPage for the robust version.
 */
export class LegacyDashboardPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto(BROKEN_LOCATORS.loanAmountById.route);
  }

  get loanAmountInput(): Locator {
    return this.page.locator(BROKEN_LOCATORS.loanAmountById.selector);
  }

  get calculateButtonByXPath(): Locator {
    return this.page.locator(BROKEN_LOCATORS.calculateByAbsoluteXPath.selector);
  }

  get emiValue(): Locator {
    return this.page.locator(BROKEN_LOCATORS.emiByPosition.selector);
  }

  get calculateButtonByText(): Locator {
    return this.page.locator(BROKEN_LOCATORS.calculateByStaleText.selector);
  }

  get principalInterestCanvas(): Locator {
    return this.page.locator(BROKEN_LOCATORS.chartCanvasByLibraryClass.selector);
  }

  async enterLoanAmount(amount: string): Promise<void> {
    await this.loanAmountInput.fill(amount, { timeout: BROKEN_LOCATOR_TIMEOUT_MS });
  }

  async clickCalculateByXPath(): Promise<void> {
    await this.calculateButtonByXPath.click({ timeout: BROKEN_LOCATOR_TIMEOUT_MS });
  }

  async clickCalculateByText(): Promise<void> {
    await this.calculateButtonByText.click({ timeout: BROKEN_LOCATOR_TIMEOUT_MS });
  }

  async readEmi(): Promise<string> {
    return this.emiValue.innerText({ timeout: BROKEN_LOCATOR_TIMEOUT_MS });
  }

  readonly timeoutMs = BROKEN_LOCATOR_TIMEOUT_MS;
}
