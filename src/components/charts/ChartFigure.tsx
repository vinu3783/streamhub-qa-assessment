import type { ReactNode } from 'react';
import { formatCurrency } from '../../utils/format';

export interface LegendItem {
  label: string;
  value: number;
  color: string;
}

export interface DataTable {
  caption: string;
  columns: string[];
  rows: Array<{ label: string; values: number[] }>;
}

interface ChartFigureProps {
  testId: string;
  title: string;
  description: string;
  legend: LegendItem[];
  table: DataTable;
  children: ReactNode;
}

/**
 * Wraps a canvas chart with a title, an HTML legend carrying the plotted values and a
 * data-table view, so the numbers behind the chart are accessible to people and to tests.
 */
export function ChartFigure({
  testId,
  title,
  description,
  legend,
  table,
  children,
}: ChartFigureProps) {
  const titleId = `${testId}-title`;
  return (
    <figure className="card chart-card" data-testid={testId} aria-labelledby={titleId}>
      <figcaption>
        <h2 id={titleId} className="card-title">
          {title}
        </h2>
        <p className="muted">{description}</p>
      </figcaption>

      {legend.length > 1 && (
        <ul className="legend" aria-label={`${title} legend`} data-testid={`${testId}-legend`}>
          {legend.map((item) => (
            <li key={item.label} className="legend-item" data-series={item.label}>
              <span className="swatch" style={{ background: item.color }} aria-hidden="true" />
              <span className="legend-label">{item.label}</span>
              <span className="legend-value" data-testid={`${testId}-legend-value`}>
                {formatCurrency(item.value)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="chart-canvas">{children}</div>

      <details className="data-table">
        <summary>Show data table</summary>
        <div className="table-scroll">
          <table data-testid={`${testId}-data`}>
            <caption>{table.caption}</caption>
            <thead>
              <tr>
                {table.columns.map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {row.values.map((value, index) => (
                    <td key={table.columns[index + 1]}>{formatCurrency(value)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
