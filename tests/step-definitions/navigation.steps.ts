import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { expectedLoan, type TenureUnit } from '../utils/financialCalculations';
import type { TestWorld } from '../support/world';

Given('I open the loan dashboard', async function (this: TestWorld) {
  await this.dashboardPage.open();
  this.activePage = this.dashboardPage;
  await expect(this.dashboardPage.mainHeading).toBeVisible();
});

Given(
  'I open the amortization report for a loan of {string} at {string}% for {string} {unit}',
  async function (this: TestWorld, amount: string, rate: string, tenure: string, unit: TenureUnit) {
    const query = new URLSearchParams({ amount, rate, tenure, unit });
    await this.reportPage.open(query);
    this.activePage = this.reportPage;
    this.expectedLoan = expectedLoan(Number(amount), Number(rate), Number(tenure), unit);
    this.reportYearRange = undefined;
    await expect(this.reportPage.mainHeading).toHaveText('Amortization report');
  },
);

When('I navigate to {string}', async function (this: TestWorld, linkName: string) {
  const page = this.resultsPage;
  await page.navLink(linkName).click();
  await expect(page.navLink(linkName)).toHaveAttribute('aria-current', 'page');
  this.activePage = linkName === 'Dashboard' ? this.dashboardPage : this.reportPage;
});

Then('the page heading is {string}', async function (this: TestWorld, heading: string) {
  await expect(this.resultsPage.mainHeading).toHaveText(heading);
});
