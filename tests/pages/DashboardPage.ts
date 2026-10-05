import type { Locator, Page } from '@playwright/test';
import { parseCurrency } from '../utils/parsing';
import { BasePage } from './BasePage';
import { ChartComponent } from './components/ChartComponent';
import { LoanFormComponent } from './components/LoanFormComponent';

export type SummaryMetric =
  | 'monthly EMI'
  | 'loan amount'
  | 'total interest'
  | 'total payment'
  | 'interest-to-principal ratio';

const METRIC_TEST_IDS: Record<SummaryMetric, string> = {
  'monthly EMI': 'emi-value',
  'loan amount': 'principal-amount',
  'total interest': 'total-interest',
  'total payment': 'total-payment',
  'interest-to-principal ratio': 'interest-ratio',
};

/** Summary cards are shared by the dashboard and the report, so both pages extend this. */
export abstract class LoanResultsPage extends BasePage {
  readonly form: LoanFormComponent;
  readonly summary: Locator;

  protected constructor(page: Page) {
    super(page);
    this.form = new LoanFormComponent(page);
    this.summary = page.getByRole('region', { name: 'Loan summary' });
  }

  metric(name: SummaryMetric): Locator {
    return this.summary.getByTestId(METRIC_TEST_IDS[name]);
  }

  async metricText(name: SummaryMetric): Promise<string> {
    return (await this.metric(name).innerText()).trim();
  }

  async metricAmount(name: Exclude<SummaryMetric, 'interest-to-principal ratio'>): Promise<number> {
    return parseCurrency(await this.metricText(name));
  }
}

export class DashboardPage extends LoanResultsPage {
  readonly principalInterestChart: ChartComponent;
  readonly yearlyPaymentChart: ChartComponent;

  constructor(page: Page) {
    super(page);
    this.principalInterestChart = new ChartComponent(page, 'principal-interest-chart');
    this.yearlyPaymentChart = new ChartComponent(page, 'yearly-payment-chart');
  }

  async open(): Promise<void> {
    await this.goto('/');
  }
}
