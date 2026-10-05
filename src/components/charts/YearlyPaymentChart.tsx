import { Bar } from 'react-chartjs-2';
import type { YearlySummary } from '../../types/loan';
import { useChartTheme } from '../../hooks/useChartTheme';
import { formatCurrency } from '../../utils/format';
import { ChartFigure } from './ChartFigure';
import { compactRupees } from './chartSetup';

export function YearlyPaymentChart({ yearly }: { yearly: YearlySummary[] }) {
  const theme = useChartTheme();
  const labels = yearly.map((y) => `Year ${y.year}`);
  const totals = {
    principal: yearly.reduce((sum, y) => sum + y.principalPaid, 0),
    interest: yearly.reduce((sum, y) => sum + y.interestPaid, 0),
  };

  return (
    <ChartFigure
      testId="yearly-payment-chart"
      title="Year-wise payment distribution"
      description={`Principal and interest paid in each of the ${yearly.length} loan years.`}
      legend={[
        { label: 'Principal', value: totals.principal, color: theme.principal },
        { label: 'Interest', value: totals.interest, color: theme.interest },
      ]}
      table={{
        caption: 'Principal and interest paid per loan year',
        columns: ['Loan year', 'Principal', 'Interest', 'Total'],
        rows: yearly.map((y, i) => ({
          label: labels[i] ?? `Year ${y.year}`,
          values: [y.principalPaid, y.interestPaid, y.totalPaid],
        })),
      }}
    >
      <Bar
        role="img"
        aria-label={`Stacked bar chart of principal and interest paid across ${yearly.length} years`}
        data={{
          labels,
          datasets: [
            {
              label: 'Principal',
              data: yearly.map((y) => y.principalPaid),
              backgroundColor: theme.principal,
              borderColor: theme.surface,
              borderWidth: { top: 2 },
              borderRadius: 4,
              borderSkipped: 'bottom',
            },
            {
              label: 'Interest',
              data: yearly.map((y) => y.interestPaid),
              backgroundColor: theme.interest,
              borderColor: theme.surface,
              borderWidth: { top: 2 },
              borderRadius: 4,
              borderSkipped: 'bottom',
            },
          ],
        }}
        options={{
          interaction: { mode: 'index', intersect: false },
          scales: {
            x: { stacked: true, grid: { display: false }, ticks: { color: theme.textSecondary } },
            y: {
              stacked: true,
              grid: { color: theme.grid },
              border: { display: false },
              ticks: {
                color: theme.textSecondary,
                callback: (v) => compactRupees.format(Number(v)),
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (item) => ` ${item.dataset.label}: ${formatCurrency(item.parsed.y ?? 0)}`,
              },
            },
          },
        }}
      />
    </ChartFigure>
  );
}
