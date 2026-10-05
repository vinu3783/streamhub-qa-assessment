import type { Locator, Page } from '@playwright/test';
import { parseCurrency } from '../utils/parsing';
import { ChartComponent } from './components/ChartComponent';
import { LoanResultsPage } from './DashboardPage';

export type Granularity = 'Yearly' | 'Monthly';
export type PeriodTotal = 'principal paid' | 'interest paid' | 'total paid';

const TOTAL_TEST_IDS: Record<PeriodTotal, string> = {
  'principal paid': 'report-principal-paid',
  'interest paid': 'report-interest-paid',
  'total paid': 'report-total-paid',
};

export class ReportPage extends LoanResultsPage {
  readonly balanceChart: ChartComponent;
  readonly scheduleTable: Locator;
  readonly scheduleRows: Locator;
  readonly rowCount: Locator;

  constructor(page: Page) {
    super(page);
    this.balanceChart = new ChartComponent(page, 'balance-chart');
    this.scheduleTable = page.getByTestId('amortization-table');
    this.scheduleRows = this.scheduleTable.getByTestId('amortization-row');
    this.rowCount = page.getByTestId('report-row-count');
  }

  async open(query?: URLSearchParams): Promise<void> {
    await this.goto(query ? `/report?${query.toString()}` : '/report');
  }

  async selectYearRange(fromYear: number, toYear: number): Promise<void> {
    await this.page.getByLabel('From year').selectOption({ label: `Year ${fromYear}` });
    await this.page.getByLabel('To year').selectOption({ label: `Year ${toYear}` });
  }

  async groupBy(granularity: Granularity): Promise<void> {
    await this.page.getByRole('radio', { name: granularity }).check();
  }

  async periodTotal(name: PeriodTotal): Promise<number> {
    return parseCurrency(await this.page.getByTestId(TOTAL_TEST_IDS[name]).innerText());
  }

  async schedulePeriods(): Promise<string[]> {
    return (await this.scheduleRows.getByRole('rowheader').allInnerTexts()).map((t) => t.trim());
  }

  async lastClosingBalance(): Promise<number> {
    const balances = await this.scheduleRows.getByTestId('closing-balance').allInnerTexts();
    const last = balances.at(-1);
    if (last === undefined) throw new Error('The amortization table has no rows.');
    return parseCurrency(last);
  }
}
