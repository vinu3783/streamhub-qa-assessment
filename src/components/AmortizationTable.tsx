import { formatCurrency } from '../utils/format';

export interface ScheduleRow {
  period: string;
  principalPaid: number;
  interestPaid: number;
  totalPaid: number;
  closingBalance: number;
}

export function AmortizationTable({ rows, caption }: { rows: ScheduleRow[]; caption: string }) {
  return (
    <section className="card" aria-labelledby="schedule-title">
      <h2 id="schedule-title" className="card-title">
        Amortization schedule
      </h2>
      <div className="table-scroll schedule-scroll">
        <table data-testid="amortization-table">
          <caption className="visually-hidden">{caption}</caption>
          <thead>
            <tr>
              <th scope="col">Period</th>
              <th scope="col">Principal</th>
              <th scope="col">Interest</th>
              <th scope="col">Total paid</th>
              <th scope="col">Balance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.period} data-testid="amortization-row">
                <th scope="row">{row.period}</th>
                <td>{formatCurrency(row.principalPaid)}</td>
                <td>{formatCurrency(row.interestPaid)}</td>
                <td>{formatCurrency(row.totalPaid)}</td>
                <td data-testid="closing-balance">{formatCurrency(row.closingBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
