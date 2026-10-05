import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { Granularity } from '../pages/ReportPage';
import { expectMoney } from '../utils/assertions';
import type { TestWorld } from '../support/world';

When(
  'I filter the report to years {int} to {int}',
  async function (this: TestWorld, from: number, to: number) {
    await this.reportPage.selectYearRange(from, to);
    this.reportYearRange = { from, to };
  },
);

When('I group the report by {string}', async function (this: TestWorld, granularity: Granularity) {
  await this.reportPage.groupBy(granularity);
});

Then(
  'the schedule shows {int} rows from {string} to {string}',
  async function (this: TestWorld, count: number, first: string, last: string) {
    const report = this.reportPage;
    await expect(report.scheduleRows).toHaveCount(count);
    await expect(report.rowCount).toHaveText(String(count));
    const periods = await report.schedulePeriods();
    expect(periods[0]).toBe(first);
    expect(periods.at(-1)).toBe(last);
  },
);

Then(
  'the report totals for the selected years match the independent calculation',
  async function (this: TestWorld) {
    const expected = this.loanExpectation;
    const range = this.reportYearRange ?? { from: 1, to: expected.years.length };
    const years = expected.years.filter((y) => y.year >= range.from && y.year <= range.to);
    const principal = years.reduce((sum, y) => sum + y.principal, 0);
    const interest = years.reduce((sum, y) => sum + y.interest, 0);

    const report = this.reportPage;
    expectMoney(await report.periodTotal('principal paid'), principal, 'Principal paid');
    expectMoney(await report.periodTotal('interest paid'), interest, 'Interest paid');
    expectMoney(await report.periodTotal('total paid'), principal + interest, 'Total paid');
  },
);

Then('the final closing balance is zero', async function (this: TestWorld) {
  expect(await this.reportPage.lastClosingBalance()).toBe(0);
});
