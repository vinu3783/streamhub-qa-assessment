import type { Locator, Page } from '@playwright/test';
import { parseCurrency } from '../../utils/parsing';

export interface ChartDataRow {
  label: string;
  values: number[];
}

/**
 * A chart rendered by the app's ChartFigure: a canvas plus an HTML legend and data table
 * generated from the same dataset. Tests read the numbers from the legend/table and use
 * the canvas pixels to prove something was actually drawn.
 */
export class ChartComponent {
  readonly root: Locator;
  readonly title: Locator;
  readonly canvas: Locator;
  private readonly legend: Locator;
  private readonly dataTable: Locator;
  private readonly dataTableToggle: Locator;

  constructor(
    page: Page,
    private readonly testId: string,
  ) {
    this.root = page.getByTestId(testId);
    this.title = this.root.getByRole('heading');
    this.canvas = this.root.getByRole('img');
    this.legend = this.root.getByTestId(`${testId}-legend`);
    this.dataTable = this.root.getByTestId(`${testId}-data`);
    this.dataTableToggle = this.root.getByText('Show data table');
  }

  async legendValue(series: string): Promise<number> {
    const value = this.legend
      .getByRole('listitem')
      .filter({ hasText: series })
      .getByTestId(`${this.testId}-legend-value`);
    return parseCurrency(await value.innerText());
  }

  async readDataTable(): Promise<ChartDataRow[]> {
    if (!(await this.dataTable.isVisible())) {
      await this.dataTableToggle.click();
    }
    const rows = this.dataTable.locator('tbody').getByRole('row');
    const result: ChartDataRow[] = [];
    for (const row of await rows.all()) {
      const label = await row.getByRole('rowheader').innerText();
      const cells = await row.getByRole('cell').allInnerTexts();
      result.push({ label: label.trim(), values: cells.map(parseCurrency) });
    }
    return result;
  }

  /** Fraction of canvas pixels that are not fully transparent (0 for a blank canvas). */
  async paintedPixelRatio(): Promise<number> {
    return this.canvas.evaluate((element) => {
      const canvas = element as HTMLCanvasElement;
      const context = canvas.getContext('2d');
      if (!context || canvas.width === 0 || canvas.height === 0) return 0;
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      let painted = 0;
      for (let alpha = 3; alpha < data.length; alpha += 4) {
        if ((data[alpha] ?? 0) > 0) painted += 1;
      }
      return painted / (canvas.width * canvas.height);
    });
  }
}
