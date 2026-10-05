import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { LoanFormField } from '../pages/components/LoanFormComponent';
import type { SummaryMetric } from '../pages/DashboardPage';
import { expectMoneyEventually } from '../utils/assertions';
import { expectedLoan, type TenureUnit } from '../utils/financialCalculations';
import { parsePercent } from '../utils/parsing';
import type { TestWorld } from '../support/world';

/** The app records a submitted loan in the URL; an invalid one raises an alert instead. */
async function waitUntilApplied(
  world: TestWorld,
  loan: Record<'amount' | 'rate' | 'tenure' | 'unit', string>,
) {
  const page = world.resultsPage;
  const isApplied = () => {
    const params = page.currentUrl().searchParams;
    return (
      params.get('amount') === String(Number(loan.amount)) &&
      params.get('rate') === String(Number(loan.rate)) &&
      params.get('tenure') === String(Number(loan.tenure)) &&
      params.get('unit') === loan.unit
    );
  };
  await expect
    .poll(async () => isApplied() || (await page.form.errors.count()) > 0, {
      message: 'submitted loan should be applied or rejected',
    })
    .toBe(true);
}

const ALL_METRICS: SummaryMetric[] = [
  'monthly EMI',
  'loan amount',
  'total interest',
  'total payment',
  'interest-to-principal ratio',
];

When(
  'I calculate a loan of {string} at {string}% for {string} {unit}',
  async function (this: TestWorld, amount: string, rate: string, tenure: string, unit: TenureUnit) {
    const page = this.resultsPage;
    await page.form.fill({ amount, rate, tenure, unit });
    await page.form.submit();
    // Expectations come from the test oracle, never from the application under test.
    this.expectedLoan = expectedLoan(Number(amount), Number(rate), Number(tenure), unit);
    this.reportYearRange = undefined;
    await waitUntilApplied(this, { amount, rate, tenure, unit });
  },
);

When(
  'I set the {field} to {string}',
  async function (this: TestWorld, field: LoanFormField, value: string) {
    await this.resultsPage.form.setField(field, value);
  },
);

When('I submit the loan form', async function (this: TestWorld) {
  await this.resultsPage.form.submit();
});

When('I note the currently displayed monthly EMI', async function (this: TestWorld) {
  this.displayedEmiBeforeAction = await this.resultsPage.metricText('monthly EMI');
});

Then('the loan calculator form is displayed', async function (this: TestWorld) {
  const { form } = this.resultsPage;
  await expect(form.root).toBeVisible();
  for (const field of ['loan amount', 'interest rate', 'loan tenure'] as const) {
    await expect(form.input(field)).toBeEditable();
  }
  await expect(form.calculateButton).toBeEnabled();
});

Then(
  'the loan summary shows the monthly EMI, loan amount, total interest, total payment and interest ratio',
  async function (this: TestWorld) {
    for (const metric of ALL_METRICS) {
      await expect(this.resultsPage.metric(metric), `${metric} card`).toBeVisible();
      await expect(this.resultsPage.metric(metric), `${metric} value`).toHaveText(/\d/);
    }
  },
);

Then(
  'the displayed monthly EMI matches the independently calculated EMI',
  async function (this: TestWorld) {
    const expected = this.loanExpectation;
    const page = this.resultsPage;
    await expectMoneyEventually(
      () => page.metricAmount('monthly EMI'),
      expected.emi,
      'Monthly EMI',
    );
    this.attach(`Independently expected EMI: ${expected.emi.toFixed(6)}`, 'text/plain');
  },
);

Then(
  'the displayed loan amount, total interest and total payment match the independent calculation',
  async function (this: TestWorld) {
    const expected = this.loanExpectation;
    const page = this.resultsPage;
    await expectMoneyEventually(
      () => page.metricAmount('loan amount'),
      expected.principal,
      'Loan amount',
    );
    await expectMoneyEventually(
      () => page.metricAmount('total interest'),
      expected.totalInterest,
      'Total interest',
    );
    await expectMoneyEventually(
      () => page.metricAmount('total payment'),
      expected.totalPayment,
      'Total payment',
    );
  },
);

Then(
  'the displayed interest-to-principal ratio matches the independent calculation',
  async function (this: TestWorld) {
    const page = this.resultsPage;
    // Shown as a percentage with 2 decimals, i.e. a fraction rounded to 4 decimals.
    await expect
      .poll(async () => parsePercent(await page.metricText('interest-to-principal ratio')))
      .toBeCloseTo(this.loanExpectation.interestToPrincipalRatio, 4);
  },
);

Then(
  'the {field} field shows the error {string}',
  async function (this: TestWorld, field: LoanFormField, message: string) {
    const error = this.resultsPage.form.error(field);
    await expect(error).toBeVisible();
    await expect(error).toHaveRole('alert');
    await expect(error).toHaveText(message);
  },
);

Then(
  'the {field} field is marked as invalid',
  async function (this: TestWorld, field: LoanFormField) {
    await expect(this.resultsPage.form.input(field)).toHaveAttribute('aria-invalid', 'true');
  },
);

Then('the displayed monthly EMI is unchanged', async function (this: TestWorld) {
  const before = this.displayedEmiBeforeAction;
  if (before === undefined) throw new Error('Note the displayed EMI before acting.');
  await expect(this.resultsPage.metric('monthly EMI')).toHaveText(before);
});

Then('{int} validation errors are displayed', async function (this: TestWorld, count: number) {
  await expect(this.resultsPage.form.errors).toHaveCount(count);
});

Then('no validation errors are displayed', async function (this: TestWorld) {
  await expect(this.resultsPage.form.errors).toHaveCount(0);
});
