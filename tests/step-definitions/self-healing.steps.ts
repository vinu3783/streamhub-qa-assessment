import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { expectMoney } from '../utils/assertions';
import { expectedLoan } from '../utils/financialCalculations';
import { parseCurrency } from '../utils/parsing';
import type { TestWorld } from '../support/world';

Given('I open the dashboard with the legacy page object', async function (this: TestWorld) {
  await this.legacyDashboardPage.open();
});

When(
  'I enter {string} as the loan amount using the legacy locator',
  async function (this: TestWorld, amount: string) {
    await this.legacyDashboardPage.enterLoanAmount(amount);
  },
);

When('I click calculate using the legacy absolute XPath', async function (this: TestWorld) {
  await this.legacyDashboardPage.clickCalculateByXPath();
});

When('I click calculate using the legacy button text', async function (this: TestWorld) {
  await this.legacyDashboardPage.clickCalculateByText();
});

Then(
  'the legacy EMI locator shows the EMI for the default loan of {int} at {int}% for {int} years',
  async function (this: TestWorld, amount: number, rate: number, years: number) {
    const displayed = await this.legacyDashboardPage.readEmi();
    expectMoney(
      parseCurrency(displayed),
      expectedLoan(amount, rate, years, 'years').emi,
      'Monthly EMI',
    );
  },
);

Then('the legacy chart canvas locator finds a visible chart', async function (this: TestWorld) {
  const legacy = this.legacyDashboardPage;
  await expect(legacy.principalInterestCanvas).toBeVisible({ timeout: legacy.timeoutMs });
});
