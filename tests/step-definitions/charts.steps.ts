import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { ChartComponent } from '../pages/components/ChartComponent';
import { expectMoney, expectMoneyEventually } from '../utils/assertions';
import type { TestWorld } from '../support/world';

type ChartName = 'principal vs interest' | 'yearly payment' | 'outstanding balance';

function chartFor(world: TestWorld, name: ChartName): ChartComponent {
  switch (name) {
    case 'principal vs interest':
      return world.dashboardPage.principalInterestChart;
    case 'yearly payment':
      return world.dashboardPage.yearlyPaymentChart;
    case 'outstanding balance':
      return world.reportPage.balanceChart;
  }
}

Then('the {chart} chart is visible', async function (this: TestWorld, name: ChartName) {
  const chart = chartFor(this, name);
  await expect(chart.root).toBeVisible();
  await expect(chart.title).toBeVisible();
  await expect(chart.canvas).toBeVisible();
  const box = await chart.canvas.boundingBox();
  expect(box?.width ?? 0, 'canvas width').toBeGreaterThan(0);
  expect(box?.height ?? 0, 'canvas height').toBeGreaterThan(0);
});

Then('the {chart} chart canvas has been drawn', async function (this: TestWorld, name: ChartName) {
  const chart = chartFor(this, name);
  // A blank canvas is 0% painted; any real chart paints a few percent of its pixels at least.
  await expect
    .poll(() => chart.paintedPixelRatio(), { message: `${name} chart should be painted` })
    .toBeGreaterThan(0.02);
});

Then(
  'the {chart} chart shows a non-zero {string} value equal to the loan amount',
  async function (this: TestWorld, name: ChartName, series: string) {
    const chart = chartFor(this, name);
    await expectMoneyEventually(
      () => chart.legendValue(series),
      this.loanExpectation.principal,
      `${series} slice`,
    );
    expect(await chart.legendValue(series), `${series} slice`).toBeGreaterThan(0);
  },
);

Then(
  'the {chart} chart shows a non-zero {string} value equal to the expected total interest',
  async function (this: TestWorld, name: ChartName, series: string) {
    const chart = chartFor(this, name);
    await expectMoneyEventually(
      () => chart.legendValue(series),
      this.loanExpectation.totalInterest,
      `${series} slice`,
    );
    expect(await chart.legendValue(series), `${series} slice`).toBeGreaterThan(0);
  },
);

Then(
  'the {chart} chart has {int} yearly bars',
  async function (this: TestWorld, name: ChartName, bars: number) {
    const chart = chartFor(this, name);
    await expect
      .poll(async () => (await chart.readDataTable()).map((row) => row.label))
      .toEqual(Array.from({ length: bars }, (_, i) => `Year ${i + 1}`));
  },
);

Then(
  'every yearly bar has a non-zero principal and interest matching the independent schedule',
  async function (this: TestWorld) {
    const rows = await this.dashboardPage.yearlyPaymentChart.readDataTable();
    const expectedYears = this.loanExpectation.years;
    expect(rows).toHaveLength(expectedYears.length);
    rows.forEach((row, index) => {
      const expected = expectedYears[index];
      const [principal = 0, interest = 0, total = 0] = row.values;
      if (!expected) throw new Error(`No expected values for ${row.label}`);
      expect(principal, `${row.label} principal`).toBeGreaterThan(0);
      expect(interest, `${row.label} interest`).toBeGreaterThan(0);
      expectMoney(principal, expected.principal, `${row.label} principal`);
      expectMoney(interest, expected.interest, `${row.label} interest`);
      expectMoney(total, expected.principal + expected.interest, `${row.label} total`);
    });
  },
);

Then('the yearly principal amounts add up to the loan amount', async function (this: TestWorld) {
  const rows = await this.dashboardPage.yearlyPaymentChart.readDataTable();
  const principalSum = rows.reduce((sum, row) => sum + (row.values[0] ?? 0), 0);
  // Each row is rounded to paise for display, so allow one paisa of drift per row.
  expect(Math.abs(principalSum - this.loanExpectation.principal)).toBeLessThanOrEqual(
    0.01 * rows.length,
  );
});

Then(
  'the {chart} chart plots {int} periods with a positive balance in each',
  async function (this: TestWorld, name: ChartName, periods: number) {
    const chart = chartFor(this, name);
    await expect.poll(async () => (await chart.readDataTable()).length).toBe(periods);
    for (const row of await chart.readDataTable()) {
      expect(row.values[0] ?? 0, `${row.label} balance`).toBeGreaterThan(0);
    }
  },
);
