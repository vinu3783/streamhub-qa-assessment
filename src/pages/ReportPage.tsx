import { useMemo, useState } from 'react';
import { AmortizationTable, type ScheduleRow } from '../components/AmortizationTable';
import { LoanForm } from '../components/LoanForm';
import { SummaryCards } from '../components/SummaryCards';
import { BalanceChart } from '../components/charts/BalanceChart';
import { useLoan } from '../hooks/useLoan';
import type { AmortizationRow, YearlySummary } from '../types/loan';
import { formatCurrency } from '../utils/format';

type Granularity = 'yearly' | 'monthly';

interface ReportFilters {
  fromYear: number;
  toYear: number;
  granularity: Granularity;
}

function toScheduleRows(
  filters: ReportFilters,
  schedule: AmortizationRow[],
  yearly: YearlySummary[],
): ScheduleRow[] {
  const inRange = (year: number) => year >= filters.fromYear && year <= filters.toYear;
  if (filters.granularity === 'monthly') {
    return schedule
      .filter((row) => inRange(row.year))
      .map((row) => ({
        period: `Month ${row.month}`,
        principalPaid: row.principalPaid,
        interestPaid: row.interestPaid,
        totalPaid: row.emi,
        closingBalance: row.closingBalance,
      }));
  }
  return yearly
    .filter((row) => inRange(row.year))
    .map((row) => ({
      period: `Year ${row.year}`,
      principalPaid: row.principalPaid,
      interestPaid: row.interestPaid,
      totalPaid: row.totalPaid,
      closingBalance: row.closingBalance,
    }));
}

function ReportView({
  yearCount,
  schedule,
  yearly,
}: {
  yearCount: number;
  schedule: AmortizationRow[];
  yearly: YearlySummary[];
}) {
  const [filters, setFilters] = useState<ReportFilters>({
    fromYear: 1,
    toYear: yearCount,
    granularity: 'yearly',
  });
  const years = Array.from({ length: yearCount }, (_, i) => i + 1);

  const rows = useMemo(
    () => toScheduleRows(filters, schedule, yearly),
    [filters, schedule, yearly],
  );
  const totals = rows.reduce(
    (acc, row) => ({
      principal: acc.principal + row.principalPaid,
      interest: acc.interest + row.interestPaid,
      paid: acc.paid + row.totalPaid,
    }),
    { principal: 0, interest: 0, paid: 0 },
  );

  const setYearRange = (key: 'fromYear' | 'toYear', year: number) =>
    setFilters((current) => {
      const next = { ...current, [key]: year };
      // Keep the range valid by pulling the other end along with the changed one.
      if (next.fromYear > next.toYear) {
        return key === 'fromYear' ? { ...next, toYear: year } : { ...next, fromYear: year };
      }
      return next;
    });

  const rangeLabel = `years ${filters.fromYear}–${filters.toYear}`;

  return (
    <>
      <section className="card filters" aria-labelledby="filters-title">
        <h2 id="filters-title" className="card-title">
          Report filters
        </h2>
        <div className="filter-row">
          <div className="field">
            <label htmlFor="from-year">From year</label>
            <select
              id="from-year"
              value={filters.fromYear}
              onChange={(e) => setYearRange('fromYear', Number(e.target.value))}
              data-testid="report-from-year"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="to-year">To year</label>
            <select
              id="to-year"
              value={filters.toYear}
              onChange={(e) => setYearRange('toYear', Number(e.target.value))}
              data-testid="report-to-year"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </select>
          </div>
          <fieldset className="segmented">
            <legend>Group by</legend>
            {(['yearly', 'monthly'] as const).map((granularity) => (
              <label key={granularity}>
                <input
                  type="radio"
                  name="granularity"
                  value={granularity}
                  checked={filters.granularity === granularity}
                  onChange={() => setFilters((current) => ({ ...current, granularity }))}
                />
                {granularity === 'yearly' ? 'Yearly' : 'Monthly'}
              </label>
            ))}
          </fieldset>
        </div>
        <dl className="period-totals" aria-live="polite" data-testid="report-period-totals">
          <div>
            <dt>Principal paid ({rangeLabel})</dt>
            <dd data-testid="report-principal-paid">{formatCurrency(totals.principal)}</dd>
          </div>
          <div>
            <dt>Interest paid ({rangeLabel})</dt>
            <dd data-testid="report-interest-paid">{formatCurrency(totals.interest)}</dd>
          </div>
          <div>
            <dt>Total paid ({rangeLabel})</dt>
            <dd data-testid="report-total-paid">{formatCurrency(totals.paid)}</dd>
          </div>
          <div>
            <dt>Rows shown</dt>
            <dd data-testid="report-row-count">{rows.length}</dd>
          </div>
        </dl>
      </section>

      <BalanceChart
        points={rows.map((row) => ({ label: row.period, balance: row.closingBalance }))}
      />
      <AmortizationTable
        rows={rows}
        caption={`Amortization schedule, ${filters.granularity}, ${rangeLabel}`}
      />
    </>
  );
}

export function ReportPage() {
  const { loan, summary, schedule, yearly, submitLoan, query } = useLoan();

  return (
    <div className="page-grid">
      <aside>
        <LoanForm key={query} loan={loan} onSubmit={submitLoan} />
      </aside>
      <div className="page-content">
        <header className="page-header">
          <h1>Amortization report</h1>
          <p className="muted">Filter the repayment schedule by loan year and grouping.</p>
        </header>
        <SummaryCards loan={loan} summary={summary} />
        {/* Re-key on the loan so filters reset when a different loan is calculated. */}
        <ReportView key={query} yearCount={yearly.length} schedule={schedule} yearly={yearly} />
      </div>
    </div>
  );
}
